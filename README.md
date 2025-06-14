# 水印去除工具网站

一个基于AI的在线水印去除工具，支持用户登录和会员系统。

## 功能特点

- 在线去除图片水印
- 用户登录系统（Google登录）
- 会员付费系统
- 云端存储用户付费信息

## 部署指南

### 前端部署

1. 安装依赖：
   ```bash
   npm install
   ```

2. 本地开发：
   ```bash
   npm run dev
   ```

3. 构建生产版本：
   ```bash
   npm run build
   ```

4. 部署到服务器：
   ```bash
   npm run deploy
   ```

### Cloudflare Worker部署

1. 创建Cloudflare KV命名空间：
   ```bash
   npx wrangler kv:namespace create USER_DATA
   ```

2. 使用返回的ID更新`wrangler.toml`文件：
   ```toml
   kv_namespaces = [
     { binding = "USER_DATA", id = "返回的ID", preview_id = "预览ID" }
   ]
   ```

3. 部署Worker：
   ```bash
   npm run deploy-worker
   ```

4. 获取Worker URL并更新`index.html`中的`API_BASE_URL`：
   ```javascript
   const API_BASE_URL = 'https://watermark-remover-user-api.你的域名.workers.dev';
   ```

## 使用说明

1. 用户可以使用Google账号登录
2. 付费信息会保存在云端，用户在任何设备登录都能使用付费权限
3. 支持三种会员类型：7天体验版、包月专业版和终身免费版

## 技术栈

- 前端：HTML, CSS, JavaScript, TailwindCSS
- 后端：Cloudflare Workers, Cloudflare KV
- 支付：Creem支付

## 注意事项

- 确保在Cloudflare Dashboard中启用了Workers和KV
- 配置正确的CORS策略以允许前端访问Worker API
- 在生产环境中，应该使用更安全的用户认证方式 