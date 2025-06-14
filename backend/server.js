const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const TronWeb = require('tronweb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// TRON 网络配置
const TRON_RECEIVE_ADDRESS = 'TX7gsS6tF4SVKjG6afjmxp9DZmieS88afj';
const USDT_CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // TRC20-USDT 合约地址

// 初始化 TronWeb
const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY }
});

// 存储订单信息
const orders = new Map();

// 中间件
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());

// 创建支付订单
app.post('/create-tron-order', async (req, res) => {
    try {
        const { orderId, amount, userEmail, plan } = req.body;

        if (!orderId || !amount || !userEmail || !plan) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        // 生成支付二维码
        const paymentInfo = {
            address: TRON_RECEIVE_ADDRESS,
            amount: amount,
            token: 'USDT',
            protocol: 'tron'
        };

        const qrCodeData = `tron:${TRON_RECEIVE_ADDRESS}?contractAddress=${USDT_CONTRACT_ADDRESS}&amount=${amount}`;
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

        // 存储订单信息
        orders.set(orderId, {
            amount,
            userEmail,
            plan,
            status: 'pending',
            createdAt: Date.now(),
            lastChecked: Date.now()
        });

        res.json({
            orderId,
            tronAddress: TRON_RECEIVE_ADDRESS,
            qrCodeUrl,
            amount
        });
    } catch (error) {
        console.error('创建订单错误:', error);
        res.status(500).json({ error: '创建订单失败' });
    }
});

// 检查支付状态
app.get('/check-tron-payment/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = orders.get(orderId);

        if (!order) {
            return res.status(404).json({ error: '订单不存在' });
        }

        // 防止频繁检查
        const now = Date.now();
        if (now - order.lastChecked < 10000) { // 10秒内不重复检查
            return res.json({ status: 'pending' });
        }
        order.lastChecked = now;

        // 检查是否超时（30分钟）
        if (now - order.createdAt > 30 * 60 * 1000) {
            orders.delete(orderId);
            return res.status(400).json({ error: '订单已过期' });
        }

        // 查询 USDT 转账记录
        const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
        const events = await tronWeb.getEventResult(USDT_CONTRACT_ADDRESS, {
            eventName: 'Transfer',
            size: 50,
            onlyConfirmed: true
        });

        // 查找匹配的转账记录
        const matchingTransfer = events.find(event => {
            const transferAmount = new tronWeb.BigNumber(event.result.value).div(10**6).toString(); // USDT 有 6 位小数
            return event.result.to === TRON_RECEIVE_ADDRESS &&
                   Math.abs(transferAmount - parseFloat(order.amount)) < 0.01 && // 允许 0.01 USDT 的误差
                   (now - event.timestamp) < 30 * 60 * 1000; // 30分钟内的转账
        });

        if (matchingTransfer) {
            order.status = 'success';
            order.txId = matchingTransfer.transaction;
            res.json({ status: 'success', txId: matchingTransfer.transaction });
        } else {
            res.json({ status: 'pending' });
        }
    } catch (error) {
        console.error('检查支付状态错误:', error);
        res.status(500).json({ error: '检查支付状态失败' });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`支付服务器运行在端口 ${port}`);
}); 