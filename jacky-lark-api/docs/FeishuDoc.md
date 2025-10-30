要获取位于 `https://trip.larkenterprise.com/wiki/N3yNwV4oMicO0UkIpk7crQ2wndg` 下的所有文档，需按以下步骤操作：

## 步骤一：获取节点标识 `node_token`
从 URL 中提取节点标识 `node_token`，即 `N3yNwV4oMicO0UkIpk7crQ2wndg`。

## 步骤二：获取知识空间 ID `space_id`
调用 [获取知识空间节点信息](https://go.feishu.cn/s/65W4PEw1g04) 接口，传入 `node_token` 参数，从响应结果中获取 `space_id`。

示例代码 
// node-sdk使用说明：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/nodejs-sdk/preparation-before-development
// 以下示例代码默认根据文档示例值填充，如果存在代码问题，请在 API 调试台填上相关必要参数后再复制代码使用
const lark = require('@larksuiteoapi/node-sdk');

// 开发者复制该Demo后，需要修改Demo里面的"app id", "app secret"为自己应用的appId, appSecret
const client = new lark.Client({
	appId: 'app id',
	appSecret: 'app secret',
});

client.wiki.v2.space.getNode({
		params: {
			token: 'N3yNwV4oMicO0UkIpk7crQ2wndg',
			obj_type: 'wiki',
		},
	},
	lark.withUserAccessToken("u-d93EillgR4ZFR8nFkca2G1gl4RRk00iXqq2050208H85")
).then(res => {
	console.log(res);
}).catch(e => {
	console.error(JSON.stringify(e.response.data, null, 4));
});



## 步骤三：获取子节点列表
调用 [获取知识空间子节点列表](https://go.feishu.cn/s/65W4PEw0I04) 接口，传入 `space_id` 和 `parent_node_token`（即步骤一中的 `node_token`），获取该节点下的所有子节点信息。
// node-sdk使用说明：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/nodejs-sdk/preparation-before-development
// 以下示例代码默认根据文档示例值填充，如果存在代码问题，请在 API 调试台填上相关必要参数后再复制代码使用
const lark = require('@larksuiteoapi/node-sdk');

// 开发者复制该Demo后，需要修改Demo里面的"app id", "app secret"为自己应用的appId, appSecret
const client = new lark.Client({
	appId: 'app id',
	appSecret: 'app secret',
});

client.wiki.v2.spaceNode.list({
		path: {
			space_id: '7520655084628394003',
		},
		params: {
			parent_node_token: 'N3yNwV4oMicO0UkIpk7crQ2wndg',
		},
	},
	lark.withUserAccessToken("u-d93EillgR4ZFR8nFkca2G1gl4RRk00iXqq2050208H85")
).then(res => {
	console.log(res);
}).catch(e => {
	console.error(JSON.stringify(e.response.data, null, 4));
});

// 还可以使用迭代器的方式便捷的获取数据，无需手动维护page_token
(async () => {
	for await (const item of await client.wiki.v2.spaceNode.listWithIterator({
			path: {
				space_id: '7520655084628394003',
			},
			params: {
				parent_node_token: 'N3yNwV4oMicO0UkIpk7crQ2wndg',
			},
		},
		lark.withUserAccessToken("u-d93EillgR4ZFR8nFkca2G1gl4RRk00iXqq2050208H85")
	)) {
		console.log(item);
	}
})();


## 步骤四：获取文档内容
对于每个子节点：
1. 通过 [获取知识空间节点信息](https://go.feishu.cn/s/65W4PEw1g04) 接口获取 `obj_token`（文档实际 token）和 `obj_type`（文档类型）。
2. 根据文档类型调用对应接口获取内容：
   - **文档（docx）**：调用 [获取文档纯文本内容](https://go.feishu.cn/s/6919WhqBs02) 或 [获取文档所有块](https://go.feishu.cn/s/68niwzFig0s)
   - **电子表格（sheet）**：调用 [读取多个范围](https://go.feishu.cn/s/5_sDxlNPw02)
   - **多维表格（bitable）**：调用 [查询记录](https://go.feishu.cn/s/6lY28723A04)

## 权限说明
确保应用已获得以下权限：
1. 应用权限：`wiki:wiki` 或 `wiki:wiki.readonly`
2. 文档权限：通过添加应用为知识库成员或文档协作者获取访问权限，具体方法参考 [如何给应用授权访问知识库文档资源](https://go.feishu.cn/s/65_Jtrxmc03#a40ad4ca)

## 注意事项
- 若节点包含多层子节点，需递归调用 [获取知识空间子节点列表](https://go.feishu.cn/s/65W4PEw0I04) 接口
- 对于异步操作（如批量迁移文档），需使用 [获取任务结果](https://go.feishu.cn/s/66UCUic0g02) 接口查询状态

通过以上步骤，即可获取指定知识库节点下的所有文档内容。