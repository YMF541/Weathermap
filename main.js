// ==========================================
// 1. 基础配置与工具函数
// ==========================================
function updateDate() {
    const now = new Date();
    document.getElementById('currentDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
}

function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "春季";
    if (month >= 6 && month <= 8) return "夏季";
    if (month >= 9 && month <= 11) return "秋季";
    return "冬季";
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 2. 核心数据字典：降维匹配与当季景点
// ==========================================
const yunnanConfig = [
    { geoNames: ["昆明市", "昆明"], queryAdcode: "530100", standardName: "昆明市", center: [25.0389, 102.7183] },
    { geoNames: ["曲靖市", "曲靖"], queryAdcode: "530302", standardName: "曲靖市", center: [25.5984, 103.7918] },
    { geoNames: ["玉溪市", "玉溪"], queryAdcode: "530402", standardName: "玉溪市", center: [24.3522, 102.5487] },
    { geoNames: ["保山市", "保山"], queryAdcode: "530502", standardName: "保山市", center: [25.1167, 99.1333] },
    { geoNames: ["昭通市", "昭通"], queryAdcode: "530602", standardName: "昭通市", center: [27.3372, 103.7228] },
    { geoNames: ["丽江市", "丽江"], queryAdcode: "530702", standardName: "丽江市", center: [26.8679, 100.2202] },
    { geoNames: ["普洱市", "普洱"], queryAdcode: "530802", standardName: "普洱市", center: [22.7974, 100.9736] },
    { geoNames: ["临沧市", "临沧"], queryAdcode: "530902", standardName: "临沧市", center: [23.8766, 100.0998] },
    { geoNames: ["楚雄州", "楚雄彝族自治州", "楚雄"], queryAdcode: "532301", standardName: "楚雄彝族自治州", center: [25.0208, 101.5300] },
    { geoNames: ["红河州", "红河哈尼族彝族自治州", "红河"], queryAdcode: "532502", standardName: "红河哈尼族彝族自治州", center: [23.3789, 103.1939] },
    { geoNames: ["文山州", "文山壮族苗族自治州", "文山"], queryAdcode: "532601", standardName: "文山壮族苗族自治州", center: [23.3901, 104.2482] },
    { geoNames: ["西双版纳", "西双版纳州", "西双版纳傣族自治州"], queryAdcode: "532801", standardName: "西双版纳傣族自治州", center: [22.0085, 100.8133] },
    { geoNames: ["大理州", "大理白族自治州", "大理"], queryAdcode: "532901", standardName: "大理白族自治州", center: [25.6977, 100.1996] },
    { geoNames: ["德宏州", "德宏傣族景颇族自治州", "德宏"], queryAdcode: "533103", standardName: "德宏傣族景颇族自治州", center: [24.4432, 97.9500] },
    { geoNames: ["怒江州", "怒江傈僳族自治州", "怒江"], queryAdcode: "533301", standardName: "怒江傈僳族自治州", center: [26.9402, 98.7855] },
    { geoNames: ["迪庆州", "迪庆藏族自治州", "迪庆"], queryAdcode: "533401", standardName: "迪庆藏族自治州", center: [27.8373, 99.7078] }
];

const travelSpotsConfig = {
    "昆明市": {"春季": ["圆通山赏樱花", "金殿风景区", "翠湖公园"], "夏季": ["石林风景区避暑", "九乡溶洞", "云南民族村"], "秋季": ["东川红土地", "捞鱼河湿地公园", "植物园赏枫"], "冬季": ["滇池喂红嘴鸥", "轿子雪山赏雪", "安宁泡温泉"]},
    "大理白族自治州": {"春季": ["大理古城", "苍山洗马潭杜鹃", "喜洲古镇"], "夏季": ["洱海游船", "双廊古镇", "蝴蝶泉"], "秋季": ["喜洲看金黄麦浪", "沙溪古镇", "苍山玉带云"], "冬季": ["无量山樱花谷", "小普陀看海鸥", "南诏风情岛"]},
    "丽江市": {"春季": ["拉市海赏花", "丽江古城", "蓝月谷"], "夏季": ["泸沽湖避暑", "虎跳峡观壮阔水流", "老君山"], "秋季": ["玉龙雪山秋景", "束河古镇闲逛", "白沙古镇"], "冬季": ["玉龙雪山赏雪", "清溪水库看雪山倒影", "黑龙潭"]},
    "西双版纳傣族自治州": {"春季": ["曼听公园", "泼水节广场"], "夏季": ["中科院热带植物园", "南腊河漂流"], "秋季": ["野象谷看大象", "原始森林公园"], "冬季": ["星光夜市", "告庄西双景", "傣族园"]},
    "迪庆藏族自治州": {"春季": ["普达措高山杜鹃", "白水台"], "夏季": ["纳帕海草原", "巴拉格宗"], "秋季": ["梅里雪山日照金山", "狼毒花海"], "冬季": ["松赞林寺", "哈巴雪山攀登", "独克宗古城"]},
    "保山市": {"春季": ["和顺古镇", "高黎贡山茶花"], "夏季": ["北海湿地泛舟", "火山地质公园"], "秋季": ["固东银杏村", "高黎贡山徒步"], "冬季": ["腾冲热海泡温泉", "和顺古镇晒太阳"]},
    "红河哈尼族彝族自治州": {"春季": ["元阳梯田", "建水古城"], "夏季": ["弥勒锦屏山", "建水团山民居"], "秋季": ["元阳梯田", "阿庐古洞"], "冬季": ["弥勒泡温泉", "石屏异龙湖"]},
    "文山壮族苗族自治州": {"春季": ["坝美世外桃源", "英雄老山"], "夏季": ["普者黑(万亩荷花)", "仙人洞村"], "秋季": ["普者黑湿地秋色", "八宝风景区"], "冬季": ["老山神炮", "文山三七交易市场"]},
    "曲靖市": {"春季": ["罗平油菜花海", "九龙瀑布群"], "夏季": ["珠江源风景区", "多依河"], "秋季": ["尼珠河大峡谷", "陆良彩色沙林"], "冬季": ["会泽大桥乡看黑颈鹤", "马龙温泉"]},
    "玉溪市": {"春季": ["抚仙湖春游", "澄江化石地"], "夏季": ["抚仙湖避暑潜水", "哀牢山寻凉"], "秋季": ["红塔山", "易门龙泉公园"], "冬季": ["秀山历史文化公园", "华宁温泉"]},
    "昭通市": {"春季": ["西部大峡谷温泉", "豆沙关"], "夏季": ["黄连河瀑布群避暑", "扎西古镇"], "秋季": ["铜锣坝国家森林公园"], "冬季": ["大山包看黑颈鹤", "大山包雾凇"]},
    "普洱市": {"春季": ["茶马古道寻春", "娜允古镇"], "夏季": ["普洱国家公园", "北回归线标志园"], "秋季": ["梅子湖公园", "孟连大金塔"], "冬季": ["中华普洱茶博览苑", "景迈山茶林"]},
    "临沧市": {"春季": ["翁丁佤族原始群落", "沧源崖画"], "夏季": ["南滚河自然保护区", "五老山"], "秋季": ["鲁史古镇", "冰岛茶山"], "冬季": ["大雪山", "沧源司岗里"]},
    "楚雄彝族自治州": {"春季": ["武定狮子山赏牡丹", "紫溪山"], "夏季": ["世界恐龙谷", "彝人古镇"], "秋季": ["元谋人博物馆", "咪依噜风情谷"], "冬季": ["元谋土林", "黑井古镇"]},
    "德宏傣族景颇族自治州": {"春季": ["景颇族目瑙纵歌节", "勐焕大金塔"], "夏季": ["莫里热带雨林", "大盈江"], "秋季": ["瑞丽一寨两国", "畹町桥"], "冬季": ["芒市遮放树洞温泉", "瑞丽边贸街"]},
    "怒江傈僳族自治州": {"春季": ["怒江第一湾", "丙中洛"], "夏季": ["怒江大峡谷", "石月亮"], "秋季": ["老姆登村", "秋那桶"], "冬季": ["独龙江探秘", "澡堂会"]}
};

let weatherData = {}; 
let geoJsonLayer = null;
let currentMapType = 'standard';
let routeLayers = [];
let cityLabelsLayer = null; // 自定义地名标注图层

// 修改为请求我们自己的 Python 后端
async function getAIOutfit(city, weather, temp) {
    const outfitContent = document.getElementById('aiOutfitContent');
    outfitContent.innerHTML = `<div style="text-align:center; padding:15px; color:#3b82f6;">⏳ 正在呼叫 Python 后端，请求 AI 穿搭...</div>`;
    
    try {
        // 向你刚刚写的 Python 接口发请求 (Vercel会自动路由到 api/outfit.py)
        const response = await fetch('/api/outfit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                city: city,
                season: getCurrentSeason(),
                weather: weather,
                temp: temp
            })
        });
        
        const data = await response.json();
        
        if(data.success) {
            const formattedText = data.text.replace(/\n/g, '<br>');
            outfitContent.innerHTML = `<div class="ai-bubble"><span class="ai-tag">✨ AI 穿搭建议：</span>${formattedText}</div>`;
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        console.error(err);
        outfitContent.innerHTML = `<p style="color:#ef4444;">后端请求失败，请稍后重试。</p>`;
    }
}

// ==========================================
// 4. 数据获取与面板更新逻辑
// ==========================================
// 获取全省天气（带排队延迟，防拦截）
async function fetchAllWeather() {
    const apiKey = config.amapApiKey;
    let alertMessages = [];
    
    // 内部帮助函数：带重试机制的请求
    async function fetchWithRetry(adcode, standardName, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                // 发起请求
                const res = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${apiKey}&city=${adcode}&extensions=base`);
                const data = await res.json();
                
                // 如果成功拿到数据，直接返回
                if (data.status === '1' && data.lives.length > 0) {
                    return data.lives[0]; 
                } else {
                    throw new Error("接口返回状态异常");
                }
            } catch (err) {
                // 如果失败，打印警告，并等待 500 毫秒后进行下一次重试
                console.warn(`[${standardName}] 第 ${i + 1} 次请求失败，正在准备重试...`);
                if (i < maxRetries - 1) {
                    await sleep(500); // 失败后的喘息时间
                }
            }
        }
        // 如果 3 次全都失败了，才真正放弃
        console.error(`[${standardName}] 连续 ${maxRetries} 次请求彻底失败。`);
        return null; 
    }

    // 主循环：依次获取16州市
    for (const item of yunnanConfig) {
        await sleep(100); // 基础排队间隔，增加到 100 毫秒更稳妥
        
        // 调用我们刚刚写的带重试的函数
        const w = await fetchWithRetry(item.queryAdcode, item.standardName);
        
        if (w) {
            // 请求成功，存入全局数据
            weatherData[item.standardName] = {
                adcode: item.queryAdcode, 
                standardName: item.standardName,
                temp: w.temperature,
                text: w.weather,
                humidity: w.humidity,
                windDir: w.winddirection,
                windScale: w.windpower
            };
            
            // 预警检测
            const alertKeywords = ["大雨", "暴雨", "阵雨", "雷", "大风", "冰雹", "雪"];
            if (alertKeywords.some(key => w.weather.includes(key))) {
                alertMessages.push(`【${item.standardName}】${w.weather}`);
            }
        }
    }
    
    // 更新预警条
    if (alertMessages.length > 0) {
        document.getElementById('alertBar').style.display = 'flex';
        document.getElementById('alertText').innerText = alertMessages.join(" ｜ ") + "，请注意防范！";
    }
}

// 双重模糊安全匹配
function getSafeWeatherData(geoName) {
    const shortName = geoName.replace(/(市|州|自治州|地区|傣族|景颇族|傈僳族|藏族|白族|壮族|苗族|哈尼族|彝族)/g, '');
    const configItem = yunnanConfig.find(item => item.geoNames.some(n => n.includes(shortName)));
    return configItem ? weatherData[configItem.standardName] : null;
}

// 获取7天预报
function updateForecast(adcode) {
    const container = document.getElementById('forecastContainer');
    container.innerHTML = '<p style="font-size:12px;opacity:0.8;">加载预报中...</p>';
    
    fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${config.amapApiKey}&city=${adcode}&extensions=all`)
        .then(res => res.json())
        .then(data => {
            if (data.status === '1' && data.forecasts.length > 0) {
                container.innerHTML = '';
                const casts = data.forecasts[0].casts; 
                document.getElementById('tempRangeDisplay').textContent = `今日气温：${casts[0].nighttemp}℃ ~ ${casts[0].daytemp}℃`;
                
                casts.forEach(f => {
                    const dateShort = f.date.split('-').slice(1).join('/'); 
                    container.innerHTML += `
                        <div class="forecast-card">
                            <div style="opacity:0.8; font-size: 11px;">${dateShort}</div>
                            <div style="font-size: 16px; margin: 5px 0;">
                                ${f.dayweather.includes('晴') ? '☀️' : f.dayweather.includes('雨') ? '🌧️' : '☁️'}
                            </div>
                            <div style="font-weight:bold; font-size:11px;">${f.dayweather}</div>
                            <div style="font-size:11px; margin-top:4px;">${f.nighttemp}~${f.daytemp}℃</div>
                        </div>
                    `;
                });
            }
        });
}

// 更新当季景点
function updateTouristSpots(standardName) {
    const seasonData = travelSpotsConfig[standardName];
    const contentDiv = document.getElementById('spotsContent');
    
    if (seasonData) {
        const currentSeason = getCurrentSeason(); 
        const currentSpots = seasonData[currentSeason] || [];

        let html = ``;
        html += `<div style="background: #dbeafe; padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3b82f6;">`;
        html += `<div style="font-weight: bold; color: #1d4ed8; margin-bottom: 10px;">✨ ${currentSeason}最适宜</div>`;
        
        if (currentSpots.length > 0) {
            currentSpots.forEach(spot => {
                html += `<div class="spots-item"><span style="margin-right:8px; color:#ef4444;">📍</span><span style="font-weight:bold; color:#1f2937;">${spot}</span></div>`;
            });
        }
        html += `</div>`;

        const seasonsIcon = {"春季": "🌸", "夏季": "🍃", "秋季": "🍁", "冬季": "❄️"};
        html += `<div style="font-size:13px; font-weight:bold; color:#6b7280; margin-bottom:8px;">💡 其他季节参考：</div>`;
        
        for (let season in seasonData) {
            if (season !== currentSeason && seasonData[season].length > 0) {
                html += `<div style="margin-bottom: 10px;"><div style="font-size: 12px; color: #4b5563; margin-bottom: 5px;">${seasonsIcon[season]} ${season}</div><div style="display: flex; flex-wrap: wrap; gap: 6px;">`;
                seasonData[season].forEach(spot => {
                    html += `<span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #4b5563; border: 1px solid #e5e7eb;">${spot}</span>`;
                });
                html += `</div></div>`;
            }
        }
        contentDiv.innerHTML = html;
    } else {
        contentDiv.innerHTML = `<p style="text-align:center; color:#9ca3af; padding:20px;">暂无景点数据</p>`;
    }
}

// 更新右侧主面板数据
function updateMainPanel(standardName, w) {
    document.getElementById('cityNameDisplay').textContent = standardName;
    document.getElementById('currentTempDisplay').textContent = `${w.temp}℃`;
    
    const icon = document.getElementById('weatherIconDisplay');
    if (w.text.includes('晴')) icon.textContent = '☀️';
    else if (w.text.includes('云')) icon.textContent = '☁️';
    else if (w.text.includes('雨')) icon.textContent = '🌧️';
    else if (w.text.includes('雪')) icon.textContent = '❄️';
    else icon.textContent = '🌤️';
    
    document.getElementById('humidity').textContent = w.humidity;
    document.getElementById('windSpeed').textContent = w.windScale;
    document.getElementById('windDir').textContent = w.windDir.includes('风') ? w.windDir : w.windDir + '风';
    
    // 触发子组件更新
    updateForecast(w.adcode);
    updateTouristSpots(standardName);
    getAIOutfit(standardName, w.text, w.temp); // 触发 Qwen AI！
    getAIFood(standardName); // 触发美食推荐
}

// 获取AI美食推荐
async function getAIFood(city) {
    const foodContent = document.getElementById('foodContent');
    if (!foodContent) return;

    foodContent.innerHTML = `<div style="text-align:center; padding:15px; color:#3b82f6;">⏳ 正在呼叫 AI 获取美食推荐...</div>`;

    try {
        const cityName = city.replace(/市|区|县/g, '');
        const response = await fetch('/api/food', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ city: cityName })
        });

        const data = await response.json();

        if (data.success) {
            // ... 原有的成功渲染代码 ...
        } else {
            // 显示后端返回的具体错误
            foodContent.innerHTML = `<p style="color:#ef4444; text-align:center; padding:15px;">获取失败：${data.error || '未知错误'}</p>`;
        }
    } catch (err) {
        // 网络错误或解析 JSON 失败
        foodContent.innerHTML = `<p style="color:#ef4444; text-align:center; padding:15px;">网络请求失败：${err.message}</p>`;
        console.error('美食请求错误：', err);
    }
}

// ==========================================
// 5. 地图初始化与渲染交互
// ==========================================
const leafletMap = L.map('map', { center: [25.0, 102.7], zoom: 7, minZoom: 6, maxZoom: 10, zoomControl: true, attributionControl: false });
L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', { subdomains: ['1', '2', '3', '4'] }).addTo(leafletMap);

window.changeMapLayer = function(type) {
    currentMapType = type;
    const url = type === 'standard' 
        ? 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
        : 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
    
    leafletMap.eachLayer(l => { if(l._url) leafletMap.removeLayer(l); });
    L.tileLayer(url, { subdomains: ['1', '2', '3', '4'] }).addTo(leafletMap);
    
    if (geoJsonLayer) {
        geoJsonLayer.eachLayer(layer => {
            const w = getSafeWeatherData(layer.feature.properties.name);
            layer.setStyle(getFeatureStyle(w ? w.temp : 20, false));
            // 将GeoJSON图层移到所有图层的后面，确保底图上的地名显示在温度图层上方
            layer.bringToBack();
        });
    }
    
    // 确保自定义地名标注图层在最顶层
    if (cityLabelsLayer) {
        // layerGroup没有bringToFront方法，通过重新添加到地图来确保在顶层
        leafletMap.addLayer(cityLabelsLayer);
    }
};

// 添加地图缩放事件监听器，实现地名标注的缩放适配
leafletMap.on('zoomend', updateCityLabelsSize);

// 地名显示开关点击事件
document.getElementById('cityLabelsToggle').addEventListener('change', function() {
    cityLabelsEnabled = this.checked;
    saveCityLabelsState();
    createCityLabels();
});

function getColorByTemperature(temp) {
    const t = parseInt(temp);
    if (isNaN(t)) return '#60a5fa'; 
    if (t > 30) return '#ef4444'; 
    if (t > 25) return '#f97316'; 
    if (t > 18) return '#fcd34d'; 
    if (t > 10) return '#60a5fa'; 
    return '#93c5fd';
}

function getFeatureStyle(temp, isHover = false) {
    const color = getColorByTemperature(temp);
    if (currentMapType === 'satellite') {
        return { color: isHover ? '#ffffff' : color, weight: isHover ? 3 : 2.5, fillColor: color, fillOpacity: isHover ? 0.3 : 0.1 };
    } else {
        return { color: isHover ? '#1e40af' : '#ffffff', weight: isHover ? 3 : 1.5, fillColor: color, fillOpacity: isHover ? 0.9 : 0.7 };
    }
}

// 核心城市列表
const coreCities = ['昆明市', '玉溪市', '曲靖市'];

// 地名显示开关状态
let cityLabelsEnabled = true;

// 从localStorage加载地名显示开关状态
function loadCityLabelsState() {
    const savedState = localStorage.getItem('cityLabelsEnabled');
    if (savedState !== null) {
        cityLabelsEnabled = savedState === 'true';
        // 更新开关按钮状态
        const toggleBtn = document.getElementById('cityLabelsToggle');
        if (toggleBtn) {
            toggleBtn.checked = cityLabelsEnabled;
        }
    }
}

// 保存地名显示开关状态到localStorage
function saveCityLabelsState() {
    localStorage.setItem('cityLabelsEnabled', cityLabelsEnabled.toString());
}

// 创建自定义地名标注图层
function createCityLabels() {
    // 清除现有的地名标注图层
    if (cityLabelsLayer) {
        leafletMap.removeLayer(cityLabelsLayer);
    }
    
    // 如果地名显示开关关闭，直接返回
    if (!cityLabelsEnabled) {
        return;
    }
    
    // 创建新的图层组
    cityLabelsLayer = L.layerGroup();
    
    const zoom = leafletMap.getZoom();
    
    // 遍历云南配置中的每个州市
    yunnanConfig.forEach(item => {
        if (item.center) {
            const [lat, lng] = item.center;
            const cityName = item.standardName;
            
            // 放大时只显示核心城市
            if (zoom > 10 && !coreCities.includes(cityName)) {
                return;
            }
            
            // 创建自定义标注
            const label = L.divIcon({
                html: `<div class="city-label" style="font-size: 14px; font-weight: bold; color: #000000; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); -webkit-text-stroke: 0.5px #333; white-space: nowrap; padding: 2px 8px; border-radius: 4px;">${cityName}</div>`,
                className: 'city-label-icon',
                iconSize: [0, 0], // 自动调整大小
                iconAnchor: [0, 0]
            });
            
            // 创建标记并添加到图层组
            const marker = L.marker([lat, lng], {
                icon: label,
                zIndexOffset: 300 // 设置z-index为300，确保在最顶层
            }).addTo(cityLabelsLayer);
        }
    });
    
    // 将地名标注图层添加到地图
    cityLabelsLayer.addTo(leafletMap);
    
    // 确保地名标注图层在最顶层
    // layerGroup没有bringToFront方法，通过重新添加到地图来确保在顶层
    leafletMap.addLayer(cityLabelsLayer);
}

// 实现地名标注的缩放适配
function updateCityLabelsSize() {
    const zoom = leafletMap.getZoom();
    
    // 重新创建地名标注，实现自动隐藏机制
    createCityLabels();
    
    // 调整字体大小
    const labels = document.querySelectorAll('.city-label');
    labels.forEach(label => {
        // 根据缩放级别调整字体大小
        const fontSize = Math.max(12, Math.min(20, 12 + (zoom - 6) * 2));
        label.style.fontSize = `${fontSize}px`;
    });
}

function loadGeo() {
    fetch('yunnan_geo.json')
        .then(res => res.json())
        .then(data => {
            geoJsonLayer = L.geoJSON(data, {
                style: function(feature) {
                    const w = getSafeWeatherData(feature.properties.name);
                    return getFeatureStyle(w ? w.temp : 20, false);
                },
                onEachFeature: function(feature, layer) {
                    layer.on({
                        mouseover: function(e) {
                            const w = getSafeWeatherData(feature.properties.name);
                            layer.setStyle(getFeatureStyle(w ? w.temp : 20, true));
                            
                            if (w) {
                                // 恢复美观的弹窗 UI
                                L.popup({ className: 'city-popup' })
                                    .setLatLng(e.latlng)
                                    .setContent(`
                                        <div style="text-align:center;">
                                            <h4 style="color: #1e40af; margin-bottom: 5px;">${w.standardName}</h4>
                                            <div style="font-size: 20px; font-weight: bold;">${w.temp}°C</div>
                                            <div style="color: #6b7280; font-size:12px;">${w.text}</div>
                                            <div style="color: #3b82f6; font-size:12px; margin-top:5px; font-weight:bold;">点击获取 AI 穿搭与景点 👉</div>
                                        </div>
                                    `).openOn(leafletMap);
                            }
                        },
                        mouseout: function(e) {
                            const w = getSafeWeatherData(feature.properties.name);
                            layer.setStyle(getFeatureStyle(w ? w.temp : 20, false));
                            leafletMap.closePopup();
                        },
                        click: function(e) {
                            const w = getSafeWeatherData(feature.properties.name);
                            if (w) updateMainPanel(w.standardName, w);
                        }
                    });
                }
            }).addTo(leafletMap);
            
            // 将GeoJSON图层移到所有图层的后面，确保底图上的地名显示在温度图层上方
            geoJsonLayer.eachLayer(layer => {
                layer.bringToBack();
            });
            
            // 创建自定义地名标注图层
            createCityLabels();
        }).catch(err => console.error("GeoJSON加载失败:", err));
}

// ==========================================
// 6. 路线规划与分析 (完整恢复红线绘制)
// ==========================================
document.getElementById('routeBtn').onclick = () => {
    document.getElementById('routePanel').classList.toggle('show');
};

document.getElementById('recommendBtn').onclick = () => {
    if (Object.keys(weatherData).length === 0) return alert("数据仍在加载中，请稍候...");
    const cityList = Object.keys(weatherData);
    let i = Math.floor(Math.random() * cityList.length), j;
    do { j = Math.floor(Math.random() * cityList.length); } while (i === j);
    
    document.getElementById('origin').value = cityList[i];
    document.getElementById('destination').value = cityList[j];
    document.getElementById('routePanel').classList.add('show');
    document.getElementById('searchRoute').click(); 
};

// 路径天气图层
let weatherPathLayers = [];

// 行政级别状态
let currentAdminLevel = 'city'; // 默认市级

// 路径天气开关状态
let weatherPathEnabled = true;

// 从localStorage加载状态
function loadRouteStates() {
    const savedLevel = localStorage.getItem('adminLevel');
    const savedWeatherPath = localStorage.getItem('weatherPathEnabled');
    
    if (savedLevel) {
        currentAdminLevel = savedLevel;
    }
    
    if (savedWeatherPath !== null) {
        weatherPathEnabled = savedWeatherPath === 'true';
        document.getElementById('weatherPathToggle').checked = weatherPathEnabled;
    }
}

// 保存状态到localStorage
function saveRouteStates() {
    localStorage.setItem('adminLevel', currentAdminLevel);
    localStorage.setItem('weatherPathEnabled', weatherPathEnabled.toString());
}

// 清除所有路径天气图层
function clearWeatherPathLayers() {
    weatherPathLayers.forEach(layer => {
        if (leafletMap.hasLayer(layer)) {
            leafletMap.removeLayer(layer);
        }
    });
    weatherPathLayers = [];
}

// 路径天气开关点击事件
document.getElementById('weatherPathToggle').addEventListener('change', function() {
    weatherPathEnabled = this.checked;
    saveRouteStates();
    
    // 如果关闭路径天气，移除所有路径天气图层
    if (!weatherPathEnabled) {
        clearWeatherPathLayers();
    }
});

async function getCoordinatesInfo(address) {
    const res = await fetch(`https://restapi.amap.com/v3/geocode/geo?address=${address}&key=${config.amapApiKey}`);
    const data = await res.json();
    if(data.status === '1' && data.geocodes.length > 0) {
        return { 
            location: data.geocodes[0].location, 
            adcode: data.geocodes[0].adcode,
            level: data.geocodes[0].level // 行政级别
        };
    }
    return null;
}

// 获取天气图标
function getWeatherIcon(weather) {
    if (weather.includes('晴')) return '☀️';
    if (weather.includes('雨')) return '🌧️';
    if (weather.includes('云')) return '☁️';
    if (weather.includes('雪')) return '❄️';
    if (weather.includes('雾')) return '🌫️';
    if (weather.includes('霾')) return '😷';
    return '🌤️';
}

// 获取途经区域的天气数据
async function getWeatherAlongRoute(steps) {
    const weatherData = [];
    const processedDistricts = new Set();
    
    // 限制最大标签数量
    const maxLabels = 8;
    let labelCount = 0;
    
    for (const step of steps) {
        // 限制标签数量
        if (labelCount >= maxLabels) break;
        
        // 提取路段的中心点
        const polyline = step.polyline.split(';');
        const centerIndex = Math.floor(polyline.length / 2);
        const centerPoint = polyline[centerIndex];
        const [lng, lat] = centerPoint.split(',');
        
        // 反向地理编码获取行政区域
        try {
            const geoRes = await fetch(`https://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&key=${config.amapApiKey}`);
            const geoData = await geoRes.json();
            
            if (geoData.status === '1' && geoData.regeocode.addressComponent) {
                const addressComponent = geoData.regeocode.addressComponent;
                const adcode = addressComponent.adcode;
                const district = addressComponent.district || addressComponent.city || addressComponent.province;
                
                // 避免重复区域
                if (processedDistricts.has(district)) continue;
                processedDistricts.add(district);
                
                // 获取该区域的天气
                const weatherRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${config.amapApiKey}&city=${adcode}&extensions=base`);
                const weatherInfo = await weatherRes.json();
                
                if (weatherInfo.status === '1' && weatherInfo.lives.length > 0) {
                    const weather = weatherInfo.lives[0];
                    weatherData.push({
                        location: [parseFloat(lat), parseFloat(lng)],
                        district: district,
                        adcode: adcode,
                        weather: weather.weather,
                        temperature: weather.temperature,
                        humidity: weather.humidity,
                        windDirection: weather.winddirection,
                        windPower: weather.windpower
                    });
                    labelCount++;
                }
            }
        } catch (err) {
            console.error('获取途经区域天气失败:', err);
        }
        
        // 避免请求过快被限制
        await sleep(100);
    }
    
    return weatherData;
}

// 显示路径天气
function showWeatherAlongRoute(weatherData) {
    // 移除现有的路径天气图层
    clearWeatherPathLayers();
    
    if (!weatherPathEnabled) return;
    
    // 延迟显示，实现懒加载
    setTimeout(() => {
        weatherData.forEach((item, index) => {
            const icon = getWeatherIcon(item.weather);
            
            // 创建天气标记
            const weatherMarker = L.divIcon({
                html: `<div class="weather-path-marker" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); padding: 5px 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 5px; transition: all 0.3s ease; z-index: 150;">
                        <span>${icon}</span>
                        <span style="font-size: 12px; font-weight: bold;">${item.weather}</span>
                      </div>`,
                className: 'weather-path-marker',
                iconSize: [80, 30],
                iconAnchor: [40, 15],
                popupAnchor: [0, -15]
            });
            
            // 计算标签位置，避免堆叠
            const offsetX = (index % 2 === 0) ? 30 : -30;
            const offsetY = (index % 3 === 0) ? 20 : (index % 3 === 1) ? -20 : 0;
            
            // 创建带偏移的标记
            const marker = L.marker(item.location, { 
                icon: weatherMarker,
                zIndexOffset: 220 // 设置z-index为220，在导航路线上方，自定义地名下方
            })
            .bindPopup(`
                <div style="padding: 10px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${item.district}</div>
                    <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 3px;">
                        <span>${icon}</span>
                        <span>${item.weather}</span>
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">温度: ${item.temperature}℃</div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">湿度: ${item.humidity}%</div>
                    <div style="font-size: 12px; color: #6b7280;">风向: ${item.windDirection} ${item.windPower}级</div>
                </div>
            `)
            .addTo(leafletMap);
            
            // 添加悬停效果
            marker.on('mouseover', function() {
                const icon = this._icon;
                if (icon) {
                    icon.style.transform = 'scale(1.1)';
                    icon.style.zIndex = 180; // 悬停时提高z-index
                }
            });
            
            marker.on('mouseout', function() {
                const icon = this._icon;
                if (icon) {
                    icon.style.transform = 'scale(1)';
                    icon.style.zIndex = 150;
                }
            });
            
            // 添加点击隐藏功能
            marker.on('click', function(e) {
                e.originalEvent.stopPropagation(); // 阻止冒泡，避免触发地图点击
                leafletMap.removeLayer(this);
                // 从数组中移除
                const index = weatherPathLayers.indexOf(this);
                if (index > -1) {
                    weatherPathLayers.splice(index, 1);
                }
            });
            
            weatherPathLayers.push(marker);
        });
    }, 500); // 500ms延迟，确保路线完全渲染
}

document.getElementById('searchRoute').onclick = async () => {
    const origin = document.getElementById('origin').value;
    const dest = document.getElementById('destination').value;
    const optionsPanel = document.getElementById('routeOptions');
    
    if(!origin || !dest) return alert("请输入起终点");
    
    // 清除旧的路线和天气标签
    routeLayers.forEach(layer => leafletMap.removeLayer(layer));
    routeLayers = [];
    clearWeatherPathLayers();
    
    optionsPanel.innerHTML = '<p style="text-align:center; padding:10px; color:#6b7280;">🔍 正在智能规划与拉取天气...</p>';
    
    const originInfo = await getCoordinatesInfo(origin);
    const destInfo = await getCoordinatesInfo(dest);
    if(!originInfo || !destInfo) {
        optionsPanel.innerHTML = '<p style="color:#ef4444;">解析失败，请输入更具体的地址(如:大理古城)</p>';
        return;
    }

    try {
        const res = await fetch(`https://restapi.amap.com/v3/direction/driving?origin=${originInfo.location}&destination=${destInfo.location}&key=${config.amapApiKey}`);
        const data = await res.json();
        
        if(data.status === '1' && data.route.paths.length > 0) {
            const path = data.route.paths[0];
            const distance = (path.distance / 1000).toFixed(1);
            
            const durationMins = Math.floor(path.duration / 60);
            const hours = Math.floor(durationMins / 60);
            const mins = durationMins % 60;
            const timeStr = hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
            
            const arrivalTime = new Date(new Date().getTime() + path.duration * 1000);
            const arrivalStr = `${arrivalTime.getHours().toString().padStart(2,'0')}:${arrivalTime.getMinutes().toString().padStart(2,'0')}`;
            
            let highways = new Set();
            let latlngs = [];
            path.steps.forEach(step => {
                if(step.road && step.road.includes("高速")) highways.add(step.road);
                const polyline = step.polyline.split(';');
                polyline.forEach(point => {
                    const [lng, lat] = point.split(',');
                    latlngs.push([parseFloat(lat), parseFloat(lng)]);
                });
            });

            const weatherRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${config.amapApiKey}&city=${destInfo.adcode}&extensions=all`);
            const weatherData = await weatherRes.json();
            let destWeatherHtml = "目的地天气暂无数据";
            if(weatherData.status === '1' && weatherData.forecasts.length > 0) {
                const destWeather = weatherData.forecasts[0].casts[0];
                destWeatherHtml = `目的地今日预计：<span style="color:#f97316; font-weight:bold;">${destWeather.dayweather} (${destWeather.nighttemp}~${destWeather.daytemp}℃)</span>`;
            }

            optionsPanel.innerHTML = `
                <div style="background:#eff6ff; padding:15px; border-radius:8px; margin-top:15px;">
                    <div style="font-weight:bold; color:#1e40af; margin-bottom:10px;">✅ 路线规划成功</div>
                    <div style="font-size:14px; margin-bottom:5px;">📏 总里程：${distance} km</div>
                    <div style="font-size:14px; margin-bottom:5px;">⏱️ 预计驾车：${timeStr}</div>
                    <div class="arrival-info">
                        <strong>🕒 预计 ${arrivalStr} 到达</strong><br>
                        ${destWeatherHtml}
                    </div>
                    <div style="margin-top:12px; font-size:13px;">
                        <p style="color:#6b7280; margin-bottom:5px;">🛣️ 途径主要高速：</p>
                        ${Array.from(highways).map(h => `<span class="highway-tag">${h}</span>`).join('') || '暂无高速路段'}
                    </div>
                </div>
            `;
            
            // 恢复核心逻辑：在 Leaflet 画出炫酷的红线和起点终点标记！
            routeLayers.forEach(layer => leafletMap.removeLayer(layer));
            routeLayers = [];
            
            const polylineLayer = L.polyline(latlngs, {color: '#ef4444', weight: 5, opacity: 0.8, zIndexOffset: 200}).addTo(leafletMap);
            const startMarker = L.circleMarker(latlngs[0], {color: 'white', weight: 2, fillColor: '#059669', radius: 6, fillOpacity: 1}).bindPopup("起点: " + origin).addTo(leafletMap);
            const endMarker = L.circleMarker(latlngs[latlngs.length - 1], {color: 'white', weight: 2, fillColor: '#ef4444', radius: 6, fillOpacity: 1}).bindPopup("终点: " + dest).addTo(leafletMap);
            
            routeLayers.push(polylineLayer, startMarker, endMarker);
            leafletMap.fitBounds(polylineLayer.getBounds(), {padding: [50, 50]});
            
            // 获取并显示路径天气
            if (weatherPathEnabled) {
                const weatherAlongRoute = await getWeatherAlongRoute(path.steps);
                showWeatherAlongRoute(weatherAlongRoute);
            }
            
            // 自动识别行政级别
            if (originInfo.level === 'district' || destInfo.level === 'district') {
                currentAdminLevel = 'district';
            } else {
                currentAdminLevel = 'city';
            }
            saveRouteStates();
            
        } else {
            optionsPanel.innerHTML = '<p style="color:#ef4444;">路线规划异常，可能无法驾车到达</p>';
        }
    } catch (err) {
        optionsPanel.innerHTML = '<p style="color:#ef4444;">请求失败，请检查网络</p>';
    }
};

// ==========================================
// 7. 程序启动入口
// ==========================================
window.onload = async () => {
    updateDate();
    loadGeo(); 
    
    // 加载导航状态
    loadRouteStates();
    
    // 加载地名显示开关状态
    loadCityLabelsState();
    
    await fetchAllWeather();
    
    // 渲染地图颜色
    if (geoJsonLayer) {
        geoJsonLayer.eachLayer(layer => {
            const w = getSafeWeatherData(layer.feature.properties.name);
            layer.setStyle(getFeatureStyle(w ? w.temp : 20, false));
        });
    }
    
    document.getElementById('dataStatus').textContent = "数据已同步";
    document.getElementById('dataStatus').style.color = "#a7f3d0"; 
    
    // 初始化主题和壁纸
    initTheme();
    initWallpaper();
};

// ==========================================
// 8. 主题切换功能
// ==========================================

// 面板透明度设置
let panelOpacity = 0.8; // 默认80%透明度

// 从localStorage加载透明度设置
function loadPanelOpacity() {
    const savedOpacity = localStorage.getItem('panelOpacity');
    if (savedOpacity !== null) {
        panelOpacity = parseFloat(savedOpacity);
    } else {
        // 默认值
        panelOpacity = 0.8;
        savePanelOpacity(panelOpacity);
    }
    
    // 更新滑块值
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    if (opacitySlider && opacityValue) {
        opacitySlider.value = Math.round(panelOpacity * 100);
        opacityValue.textContent = `${Math.round(panelOpacity * 100)}%`;
    }
    
    // 应用透明度
    setPanelOpacity(panelOpacity);
}

// 保存透明度设置到localStorage
function savePanelOpacity(opacity) {
    localStorage.setItem('panelOpacity', opacity.toString());
}

// 设置面板透明度
function setPanelOpacity(opacity) {
    // 获取左右面板中的所有卡片
    const leftPanels = document.querySelectorAll('.left-panel .card');
    const rightPanels = document.querySelectorAll('.right-panel .card');
    const panels = [...leftPanels, ...rightPanels];
    
    panels.forEach(panel => {
        // 仅调整面板的背景透明度，不影响内部元素
        // 直接设置背景色，使用默认的白色背景
        panel.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        
        // 对于不同主题，使用不同的背景色
        const body = document.body;
        if (body.classList.contains('theme-girl')) {
            panel.style.backgroundColor = `rgba(255, 182, 193, ${opacity})`;
        } else if (body.classList.contains('theme-hard')) {
            panel.style.backgroundColor = `rgba(30, 30, 46, ${opacity})`;
        }
    });
}

function initTheme() {
    // 从localStorage加载主题
    const savedTheme = localStorage.getItem('theme') || 'normal';
    setTheme(savedTheme);
    
    // 主题按钮点击事件
    const themeBtn = document.getElementById('themeBtn');
    const themeMenu = document.getElementById('themeMenu');
    
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.style.display = themeMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    // 点击其他地方关闭主题菜单
    document.addEventListener('click', () => {
        themeMenu.style.display = 'none';
    });
    
    // 主题选项点击事件
    const themeOptions = document.querySelectorAll('.theme-option[data-theme]');
    themeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = option.getAttribute('data-theme');
            setTheme(theme);
            // 应用透明度设置
            setPanelOpacity(panelOpacity);
            themeMenu.style.display = 'none';
        });
    });
    
    // 透明度滑块事件
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    
    if (opacitySlider && opacityValue) {
        // 初始化滑块值
        opacitySlider.value = Math.round(panelOpacity * 100);
        opacityValue.textContent = `${Math.round(panelOpacity * 100)}%`;
        
        // 绑定input事件
        opacitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            panelOpacity = value / 100;
            opacityValue.textContent = `${value}%`;
            setPanelOpacity(panelOpacity);
            savePanelOpacity(panelOpacity);
        });
        
        // 绑定change事件，确保值变化时也能触发
        opacitySlider.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            panelOpacity = value / 100;
            opacityValue.textContent = `${value}%`;
            setPanelOpacity(panelOpacity);
            savePanelOpacity(panelOpacity);
        });
    }
    
    // 加载面板透明度设置
    loadPanelOpacity();
}

function setTheme(theme) {
    // 移除所有主题类
    document.body.classList.remove('theme-girl', 'theme-hard');
    
    // 添加选中的主题类
    if (theme !== 'normal') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // 保存到localStorage
    localStorage.setItem('theme', theme);
}

// ==========================================
// 9. 自定义壁纸功能
// ==========================================
function initWallpaper() {
    // 从localStorage加载壁纸
    const savedWallpaper = localStorage.getItem('wallpaper');
    const savedDynamicWallpaper = localStorage.getItem('dynamicWallpaper');
    
    if (savedWallpaper) {
        createWallpaper(savedWallpaper);
    } else if (savedDynamicWallpaper) {
        createDynamicWallpaper(JSON.parse(savedDynamicWallpaper));
    }
    
    // 静态壁纸按钮点击事件
    const customWallpaperBtn = document.getElementById('customWallpaperBtn');
    const wallpaperInput = document.getElementById('wallpaperInput');
    
    customWallpaperBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        wallpaperInput.click();
    });
    
    // 静态壁纸文件选择事件
    wallpaperInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                createWallpaper(imageData);
                localStorage.setItem('wallpaper', imageData);
                // 清除动态壁纸数据
                localStorage.removeItem('dynamicWallpaper');
                // 隐藏控制按钮
                document.getElementById('wallpaperControls').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 动态壁纸按钮点击事件
    const dynamicWallpaperBtn = document.getElementById('dynamicWallpaperBtn');
    const dynamicWallpaperInput = document.getElementById('dynamicWallpaperInput');
    
    dynamicWallpaperBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dynamicWallpaperInput.click();
    });
    
    // 动态壁纸文件选择事件
    dynamicWallpaperInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const mediaData = event.target.result;
                const isVideo = file.type.startsWith('video/');
                
                const dynamicWallpaperData = {
                    data: mediaData,
                    type: isVideo ? 'video' : 'gif',
                    isPlaying: true,
                    isMuted: true
                };
                
                createDynamicWallpaper(dynamicWallpaperData);
                localStorage.setItem('dynamicWallpaper', JSON.stringify(dynamicWallpaperData));
                // 清除静态壁纸数据
                localStorage.removeItem('wallpaper');
                // 显示控制按钮
                document.getElementById('wallpaperControls').style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 播放/暂停按钮点击事件
    const playPauseBtn = document.getElementById('playPauseBtn');
    playPauseBtn.addEventListener('click', () => {
        const dynamicWallpaper = document.querySelector('.dynamic-wallpaper-container video') || document.querySelector('.dynamic-wallpaper-container img');
        if (dynamicWallpaper) {
            if (dynamicWallpaper.paused || dynamicWallpaper.ended) {
                dynamicWallpaper.play();
                playPauseBtn.textContent = '⏸️';
                // 更新localStorage
                updateDynamicWallpaperState(true);
            } else {
                dynamicWallpaper.pause();
                playPauseBtn.textContent = '▶️';
                // 更新localStorage
                updateDynamicWallpaperState(false);
            }
        }
    });
    
    // 静音按钮点击事件
    const muteBtn = document.getElementById('muteBtn');
    muteBtn.addEventListener('click', () => {
        const video = document.querySelector('.dynamic-wallpaper-container video');
        if (video) {
            video.muted = !video.muted;
            muteBtn.textContent = video.muted ? '🔇' : '🔊';
            // 更新localStorage
            updateDynamicWallpaperMute(video.muted);
        }
    });
    
    // 重置壁纸按钮点击事件
    const resetWallpaperBtn = document.getElementById('resetWallpaperBtn');
    resetWallpaperBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeWallpaper();
        localStorage.removeItem('wallpaper');
        localStorage.removeItem('dynamicWallpaper');
        document.getElementById('wallpaperControls').style.display = 'none';
    });
}

// 创建静态壁纸
function createWallpaper(imageData) {
    // 移除现有的壁纸
    removeWallpaper();
    
    // 创建壁纸容器
    const wallpaperContainer = document.createElement('div');
    wallpaperContainer.className = 'wallpaper-container';
    wallpaperContainer.style.backgroundImage = `url(${imageData})`;
    
    // 添加到页面
    document.body.insertBefore(wallpaperContainer, document.body.firstChild);
}

// 创建动态壁纸
function createDynamicWallpaper(data) {
    // 移除现有的壁纸
    removeWallpaper();
    
    // 创建动态壁纸容器
    const dynamicWallpaperContainer = document.createElement('div');
    dynamicWallpaperContainer.className = 'dynamic-wallpaper-container';
    
    if (data.type === 'video') {
        // 创建视频元素
        const video = document.createElement('video');
        video.src = data.data;
        video.loop = true;
        video.autoplay = data.isPlaying;
        video.muted = data.isMuted;
        video.playsInline = true;
        dynamicWallpaperContainer.appendChild(video);
        
        // 更新控制按钮状态
        document.getElementById('playPauseBtn').textContent = data.isPlaying ? '⏸️' : '▶️';
        document.getElementById('muteBtn').textContent = data.isMuted ? '🔇' : '🔊';
    } else {
        // 创建GIF元素
        const img = document.createElement('img');
        img.src = data.data;
        dynamicWallpaperContainer.appendChild(img);
        
        // 更新控制按钮状态
        document.getElementById('playPauseBtn').textContent = '⏸️';
        document.getElementById('muteBtn').textContent = '🔇';
    }
    
    // 添加到页面
    document.body.insertBefore(dynamicWallpaperContainer, document.body.firstChild);
    
    // 显示控制按钮
    document.getElementById('wallpaperControls').style.display = 'flex';
}

// 移除所有壁纸
function removeWallpaper() {
    const existingWallpaper = document.querySelector('.wallpaper-container');
    if (existingWallpaper) {
        existingWallpaper.remove();
    }
    
    const existingDynamicWallpaper = document.querySelector('.dynamic-wallpaper-container');
    if (existingDynamicWallpaper) {
        existingDynamicWallpaper.remove();
    }
}

// 更新动态壁纸播放状态
function updateDynamicWallpaperState(isPlaying) {
    const savedDynamicWallpaper = localStorage.getItem('dynamicWallpaper');
    if (savedDynamicWallpaper) {
        const dynamicWallpaperData = JSON.parse(savedDynamicWallpaper);
        dynamicWallpaperData.isPlaying = isPlaying;
        localStorage.setItem('dynamicWallpaper', JSON.stringify(dynamicWallpaperData));
    }
}

// 更新动态壁纸静音状态
function updateDynamicWallpaperMute(isMuted) {
    const savedDynamicWallpaper = localStorage.getItem('dynamicWallpaper');
    if (savedDynamicWallpaper) {
        const dynamicWallpaperData = JSON.parse(savedDynamicWallpaper);
        dynamicWallpaperData.isMuted = isMuted;
        localStorage.setItem('dynamicWallpaper', JSON.stringify(dynamicWallpaperData));
    }
}
