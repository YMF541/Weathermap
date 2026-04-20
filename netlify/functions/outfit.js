const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { city, weather, temp } = JSON.parse(event.body);
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
                    { role: "system", content: "你是一个专业的旅游穿搭专家。" },
                    { role: "user", content: `城市：${city}，天气：${weather}，气温：${temp}℃。请简短地给出男女穿搭建议（50字内）。` }
                ]
            })
        });

        const data = await response.json();
        if (data.choices) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, text: data.choices[0].message.content })
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
