// /**
//  * 飞书 API 使用示例
//  * 演示如何获取 user_access_token
//  */

// import { LarkApiClient, LarkOAuthHelper } from '../src/index.js';
// import { getLarkConfig } from '../src/config.js';

// // 从 .env 文件加载配置
// // 请确保已创建 .env 文件并配置了相应的环境变量
// const config = getLarkConfig();

// // 创建 OAuth 助手和 API 客户端
// const oauthHelper = new LarkOAuthHelper(config);
// const apiClient = new LarkApiClient(config);

// /**
//  * 示例 1: 生成授权链接
//  */
// function generateAuthUrl() {
//   const authUrl = oauthHelper.generateAuthUrl('random_state');
//   console.log('请访问以下链接进行授权:');
//   console.log(authUrl);
//   return authUrl;
// }

// /**
//  * 示例 2: 处理授权回调并获取 user_access_token
//  */
// async function handleAuthCallback(callbackUrl: string) {
//   try {
//     // 验证回调 URL
//     oauthHelper.validateCallback(callbackUrl);

//     // 解析授权码
//     const { code } = oauthHelper.parseAuthorizationCode(callbackUrl);
//     console.log('获取到授权码:', code);

//     // 使用授权码获取 user_access_token
//     const tokenResponse = await apiClient.getUserAccessToken(code);
//     console.log('获取到 user_access_token:', tokenResponse);

//     return tokenResponse;
//   } catch (error) {
//     console.error('处理授权回调失败:', error);
//     throw error;
//   }
// }

// /**
//  * 示例 3: 获取用户信息
//  */
// async function getUserInfo(accessToken: string) {
//   try {
//     const userInfo = await apiClient.getUserInfo(accessToken);
//     console.log('用户信息:', userInfo);
//     return userInfo;
//   } catch (error) {
//     console.error('获取用户信息失败:', error);
//     throw error;
//   }
// }

// /**
//  * 示例 4: 刷新访问令牌
//  */
// async function refreshAccessToken(refreshToken: string) {
//   try {
//     const tokenResponse = await apiClient.refreshUserAccessToken(refreshToken);
//     console.log('刷新后的 user_access_token:', tokenResponse);
//     return tokenResponse;
//   } catch (error) {
//     console.error('刷新访问令牌失败:', error);
//     throw error;
//   }
// }

// /**
//  * 示例 5: 验证访问令牌
//  */
// async function validateToken(accessToken: string) {
//   try {
//     const isValid = await apiClient.validateAccessToken(accessToken);
//     console.log('访问令牌是否有效:', isValid);
//     return isValid;
//   } catch (error) {
//     console.error('验证访问令牌失败:', error);
//     throw error;
//   }
// }

// /**
//  * 完整的使用流程示例
//  */
// async function completeFlow() {
//   try {
//     // 1. 生成授权链接
//     generateAuthUrl();

//     // 2. 模拟用户点击授权链接后的回调
//     // 在实际应用中，这会是用户浏览器重定向到您的回调地址
//     const mockCallbackUrl = 'http://localhost:3000/callback?code=mock_auth_code&state=random_state';

//     // 3. 处理回调并获取 token
//     const tokenResponse = await handleAuthCallback(mockCallbackUrl);

//     // 4. 获取用户信息
//     await getUserInfo(tokenResponse.access_token);

//     // 5. 验证令牌
//     await validateToken(tokenResponse.access_token);

//     console.log('完整流程执行成功！');
//   } catch (error) {
//     console.error('完整流程执行失败:', error);
//   }
// }

// // 导出示例函数
// export {
//   generateAuthUrl,
//   handleAuthCallback,
//   getUserInfo,
//   refreshAccessToken,
//   validateToken,
//   completeFlow,
// };

import { LoginHandler } from '../src/core/login-handler.js';
import { getLarkConfig } from '../src/config.js';
import { larkClient, LarkDoc } from '../src/core/index.js';
import { getTokenOnly } from '../src/index.js';

const config = getLarkConfig();

/**
 * 示例：演示如何使用基于飞书官方 SDK 的知识库文档 API
 */
async function demoLarkDocWithOfficialSDK() {
  console.log('=== 飞书知识库文档 API 示例（基于官方 SDK）===\n');

  // 创建 LarkDoc 实例
  const larkDoc = new LarkDoc(larkClient);

  // 知识库 URL
  const wikiUrl = 'https://trip.larkenterprise.com/wiki/RtO9wg4x8ijGYdkCSpicrxUenWd';

  try {
    // 步骤二：获取节点信息（包含 space_id）
    console.log('1️⃣  获取节点信息...');
    const { space_id, node_token,parent_node_token, has_child, title } = (await larkDoc.getSpaceNodeByUrl(wikiUrl))!;

    // //   // 步骤三：获取子节点列表
    // //   console.log('2️⃣  获取子节点列表（使用官方 SDK 迭代器）...');
    // const childNodes = await larkDoc.listSpaceNodes(
    //   space_id!,
    //   node_token!,
    // );
    // console.log("wjs: childNodes", childNodes);

    // (childNodes?.items || []).forEach((node: any, index: number) => {
    //   console.log(`  [${index + 1}] ${node.title} (${node.obj_type})`);
    //   console.log(`      Token: ${node.node_token}`);
    //   console.log(`      有子节点: ${node.has_child ? '是' : '否'}`);
    // });

    // console.log("wjs: childNodes", childNodes);
    // await larkDoc.updateSpaceNodeTitle(space_id!, node_token!, "新标题123");
    // await larkDoc.copySpaceNode(space_id!, node_token!, parent_node_token!, space_id!, "新标题222");
    await larkDoc.createSpaceNode(space_id!, "sheet", parent_node_token!, "origin", "aaa");


    //   if (childNodes.length > 5) {
    //     console.log(`  ... 还有 ${childNodes.length - 5} 个节点`);
    //   }
    //   console.log();

    //   步骤四：递归获取所有文档
    //   console.log('3️⃣  递归获取所有文档结构...');
    //   const allDocs = await larkDoc.getAllDocuments(
    //     nodeToken,
    //     userAccessToken,
    //     3 // 最大递归深度为 3
    //   );

    //   console.log(`总共找到 ${allDocs.length} 个文档:`);

    //   // 递归打印文档树
    //   function printDocTree(docs: any[], indent: string = '') {
    //     docs.forEach(doc => {
    //       console.log(`${indent}📄 ${doc.title} (${doc.obj_type})`);
    //       if (doc.children && doc.children.length > 0) {
    //         printDocTree(doc.children, indent + '  ');
    //       }
    //     });
    //   }

    //   printDocTree(allDocs);
    //   console.log();

    //   console.log('✅ 飞书知识库文档 API 示例执行完成');
    // } else {
    //   console.error('❌ 获取节点信息失败:', nodeInfo.msg);
  } catch (error) {
    console.error('❌ 执行失败:', error);
  }
}

const main = async () => {
  try {
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('=== 飞书 OAuth 登录示例 ===\n');

    // 可选：自定义存储路径
    // authStore.setStoragePath('./custom-auth.json');

    // 执行登录（会自动检查本地是否有有效 token）
    const authInfo = await LoginHandler.handleLogin(config);

    if (authInfo) {
      console.log('\n=== 认证信息 ===');
      console.log('Access Token:', authInfo.token);
      console.log('Client ID:', authInfo.clientId);
      console.log('过期时间:', authInfo.expiresAt ? new Date(authInfo.expiresAt).toLocaleString('zh-CN') : '未知');
      console.log('Refresh Token:', authInfo.extra?.refreshToken?.substring(0, 30) + '...');

      // 演示飞书知识库文档 API（基于官方 SDK）
      console.log('\n' + '='.repeat(50) + '\n');
      await demoLarkDocWithOfficialSDK();

      console.log('\n✅ 程序执行完成');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ 登录失败:', error);
    process.exit(1);
  }
}

main();
