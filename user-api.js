// Cloudflare Worker处理用户数据API
// 创建KV命名空间: USER_DATA

const API_VERSION = "1.2.0"; // 包含了所有修复的版本

export default {
  async fetch(request, env) {
    // 定义通用的CORS响应头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 预检请求的特殊处理
    if (request.method === 'OPTIONS') {
      console.log('处理OPTIONS预检请求');
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;
      
      // 新增：版本号接口
      if (path === '/api/version') {
        return new Response(JSON.stringify({ version: API_VERSION }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      console.log(`收到请求: ${request.method} ${url.pathname}${url.search}`);
      
      // 用户数据API路由
      if (path.startsWith('/api/user')) {
        const userId = url.searchParams.get('id');
        console.log(`用户ID: ${userId}`);
        
        if (!userId) {
          console.error('请求缺少用户ID');
          return new Response(JSON.stringify({ error: '缺少用户ID' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // 获取用户数据
        if (request.method === 'GET') {
          console.log(`尝试获取用户ID为 ${userId} 的数据`);
          const userData = await env.USER_DATA.get(userId);
          
          if (userData) {
            console.log(`找到用户数据: ${userData}`);
            return new Response(userData, {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else {
            console.log(`未找到用户ID为 ${userId} 的数据`);
            return new Response(JSON.stringify({ error: '未找到用户数据' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        
        // 保存用户数据
        if (request.method === 'POST') {
          let data;
          try {
            data = await request.json();
            console.log(`接收到的用户数据: ${JSON.stringify(data)}`);
          } catch (error) {
            console.error(`解析请求JSON数据失败: ${error.message}`);
            return new Response(JSON.stringify({ error: '无效的JSON数据' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          const membershipData = {
            membershipType: data.membershipType || 'none',
            membershipEnd: data.membershipEnd || null,
            hasPurchasedTrial: data.hasPurchasedTrial || false,
            lastUpdated: new Date().toISOString()
          };
          
          try {
            console.log(`保存用户ID为 ${userId} 的数据: ${JSON.stringify(membershipData)}`);
            await env.USER_DATA.put(userId, JSON.stringify(membershipData));
            console.log(`用户数据保存成功`);
            
            return new Response(JSON.stringify({ 
              success: true,
              message: '用户数据已保存',
              data: membershipData
            }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (putError) {
            console.error(`保存用户数据失败: ${putError.message}`);
            return new Response(JSON.stringify({ error: `保存数据失败: ${putError.message}` }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      }
      
      // 默认返回404
      console.log(`未找到API端点: ${path}`);
      return new Response(JSON.stringify({ error: '未找到API端点' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (error) {
      console.error(`处理请求时出错: ${error.message}`);
      return new Response(JSON.stringify({ error: `未预期的服务器错误: ${error.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
} 