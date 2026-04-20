const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { city } = JSON.parse(event.body);
        const apiKey = process.env.QWEN_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: "后端未配置 API Key" })
            };
        }

        const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "qwen-plus",
                messages: [
                    { role: "system", content: "你是一个专业的云南美食推荐专家，擅长介绍云南省各州市的特色美食。" },
                    { role: "user", content: `请为云南省${city}推荐3-5种本地特色美食，每种美食请包含：美食名称、特色介绍（30字内）。请用简洁的列表格式返回。` }
                ]
            })
        });

        const data = await response.json();
        if (data.choices) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, text: data.choices[0].message.content, city })
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: `AI服务返回异常: ${JSON.stringify(data)}` })
            };
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: err.message })
        };
    }
};
