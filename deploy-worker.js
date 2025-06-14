// 部署脚本 - 使用wrangler部署Cloudflare Worker
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查wrangler是否已安装
try {
  execSync('npx wrangler --version', { stdio: 'ignore' });
  console.log('✅ Wrangler已安装');
} catch (error) {
  console.error('❌ Wrangler未安装，正在安装...');
  try {
    execSync('npm install -g wrangler', { stdio: 'inherit' });
    console.log('✅ Wrangler安装成功');
  } catch (installError) {
    console.error('❌ Wrangler安装失败:', installError.message);
    process.exit(1);
  }
}

// 检查wrangler.toml文件是否存在
const wranglerConfigPath = path.join(__dirname, 'wrangler.toml');
if (!fs.existsSync(wranglerConfigPath)) {
  console.error('❌ wrangler.toml文件不存在');
  process.exit(1);
}

// 检查KV命名空间ID是否已配置
const wranglerConfig = fs.readFileSync(wranglerConfigPath, 'utf8');
if (wranglerConfig.includes('YOUR_KV_NAMESPACE_ID')) {
  console.error('❌ 请先在wrangler.toml中配置您的KV命名空间ID');
  console.log('提示: 使用以下命令创建KV命名空间:');
  console.log('npx wrangler kv:namespace create USER_DATA');
  console.log('然后用返回的ID更新wrangler.toml文件');
  process.exit(1);
}

// 部署Worker
console.log('🚀 开始部署Cloudflare Worker...');
try {
  execSync('npx wrangler deploy', { stdio: 'inherit' });
  console.log('✅ Worker部署成功');
} catch (deployError) {
  console.error('❌ Worker部署失败:', deployError.message);
  process.exit(1);
}

// 提示更新API_BASE_URL
console.log('\n📝 请确保在index.html中更新API_BASE_URL为您的Worker URL');
console.log('例如: const API_BASE_URL = \'https://watermark-remover-user-api.您的域名.workers.dev\';'); 