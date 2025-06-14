# 水印去除工具支付后端

这是水印去除工具的 TRC20-USDT 支付处理后端服务。

## 功能特点

- 支持 TRC20-USDT 支付
- 自动生成支付二维码
- 实时监控支付状态
- 支持订单超时处理
- 防重复支付检查

## 环境要求

- Node.js >= 14
- npm >= 6

## 安装步骤

1. 安装依赖：
   ```bash
   npm install
   ```

2. 创建 `.env` 文件并配置以下环境变量：
   ```
   PORT=3000
   TRON_API_KEY=你的_TRON_API_密钥
   ALLOWED_ORIGINS=http://localhost:8080,https://your-frontend-domain.com
   ```

   > 注意：你需要在 [TRON GRID](https://www.trongrid.io/) 注册并获取 API 密钥

3. 启动服务：
   ```bash
   # 开发环境
   npm run dev

   # 生产环境
   npm start
   ```

## API 端点

### 创建支付订单

```
POST /create-tron-order

请求体：
{
    "orderId": "订单ID",
    "amount": "支付金额",
    "userEmail": "用户邮箱",
    "plan": "购买的套餐类型"
}

响应：
{
    "orderId": "订单ID",
    "tronAddress": "收款地址",
    "qrCodeUrl": "支付二维码URL",
    "amount": "支付金额"
}
```

### 检查支付状态

```
GET /check-tron-payment/:orderId

响应：
{
    "status": "success" | "pending",
    "txId": "交易哈希（仅在支付成功时返回）"
}
```

## 注意事项

1. 生产环境部署时请确保：
   - 使用 HTTPS
   - 设置适当的 CORS 策略
   - 配置反向代理（如 Nginx）
   - 使用 PM2 等进程管理工具

2. 安全建议：
   - 定期清理过期订单
   - 监控异常支付行为
   - 备份订单数据
   - 设置适当的请求频率限制

## 错误处理

服务会返回适当的 HTTP 状态码和错误信息：

- 400: 请求参数错误
- 404: 订单不存在
- 500: 服务器内部错误

## 开发计划

- [ ] 添加数据库持久化存储
- [ ] 实现订单管理后台
- [ ] 添加更多支付统计功能
- [ ] 支持更多代币类型 