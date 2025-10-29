// 天气服务相关API

// 高德地图API配置
const AMAP_API_KEY_BACKEND = 'c8ae43cd1a3d45906068ed336af840b7'; // 后端使用的key
const AMAP_API_KEY_FRONTEND = '137212e1ae950ef42f679cf1887e2d7c'; // 前端使用的key

// 封装fetch请求，添加错误处理
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

// 城市搜索和地理编码接口
export const searchCity = async (keyword: string) => {
  if (!keyword.trim()) {
    return [];
  }
  
  // 使用高德地图地理编码API
  const url = `https://restapi.amap.com/v3/geocode/geo?key=${AMAP_API_KEY_BACKEND}&address=${encodeURIComponent(keyword)}&city=&output=JSON`;
  
  try {
    const response = await fetchWithErrorHandling(url);
    
    if (response.status === '1' && response.geocodes && response.geocodes.length > 0) {
      // 格式转换，适配前端需要的结构
      return response.geocodes.map((item: any) => ({
        name: item.formatted_address.split('').pop() === '市' 
          ? item.formatted_address.slice(0, -1) 
          : item.formatted_address.split('市').pop() || item.district,
        address: item.formatted_address,
        location: item.location,
        adcode: item.adcode
      }));
    }
    
    // 如果API没有返回结果，尝试使用POI搜索API
    const poiUrl = `https://restapi.amap.com/v3/place/text?key=${AMAP_API_KEY_BACKEND}&keywords=${encodeURIComponent(keyword)}&types=150000&city=&output=JSON&offset=20`;
    const poiResponse = await fetchWithErrorHandling(poiUrl);
    
    if (poiResponse.status === '1' && poiResponse.pois && poiResponse.pois.length > 0) {
      return poiResponse.pois.map((item: any) => ({
        name: item.name,
        address: item.address,
        location: item.location,
        adcode: item.adcode
      }));
    }
    
    return [];
  } catch (error) {
    console.error('城市搜索失败:', error);
    // API调用失败时返回空数组
    return [];
  }
};

// 逆地理编码获取城市信息
export const getCityInfoByLocation = async (longitude: number, latitude: number) => {
  const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_API_KEY_BACKEND}&location=${longitude},${latitude}&output=JSON`;
  
  try {
    const response = await fetchWithErrorHandling(url);
    
    if (response.status === '1' && response.regeocode && response.regeocode.addressComponent) {
      const { addressComponent } = response.regeocode;
      return {
        city: addressComponent.city || addressComponent.province,
        district: addressComponent.district || '',
        formattedAddress: response.regeocode.formatted_address
      };
    }
    
    throw new Error('未找到位置信息');
  } catch (error) {
    console.error('获取城市信息失败:', error);
    throw error;
  }
};

// 获取当前天气
export const getCurrentWeather = async (longitude: number, latitude: number) => {
  // 使用和风天气API (免费版)
  const url = `https://devapi.qweather.com/v7/weather/now?key=YOUR_QWEATHER_KEY&location=${longitude},${latitude}`;
  
  try {
    // 由于没有真实的和风天气API密钥，我们使用模拟数据，但保留结构与真实API一致
    // 在实际项目中，替换为真实的API调用和密钥
    return {
      temp: Math.floor(Math.random() * 20 + 10).toString(), // 10-30度之间随机
      feelsLike: Math.floor(Math.random() * 20 + 10).toString(),
      icon: ['100', '101', '102', '103', '104', '300', '301', '302'][Math.floor(Math.random() * 8)],
      text: ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雷阵雨', '雾'][Math.floor(Math.random() * 8)],
      windDir: ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'][Math.floor(Math.random() * 8)],
      windScale: Math.floor(Math.random() * 5 + 1).toString(),
      windSpeed: Math.floor(Math.random() * 20 + 5).toString(),
      humidity: Math.floor(Math.random() * 50 + 30).toString(),
      pressure: Math.floor(Math.random() * 20 + 1000).toString(),
      vis: Math.floor(Math.random() * 10 + 5).toString(),
      cloud: Math.floor(Math.random() * 50 + 10).toString(),
      dew: Math.floor(Math.random() * 20 + 5).toString()
    };
    
    // 真实API调用代码（需要替换为有效的密钥）
    // const response = await fetchWithErrorHandling(url);
    // if (response.code === '200' && response.now) {
    //   return response.now;
    // }
    // throw new Error('获取天气数据失败');
  } catch (error) {
    console.error('获取当前天气失败:', error);
    throw error;
  }
};

// 获取未来天气预报
export const getWeatherForecast = async (longitude: number, latitude: number) => {
  // 使用和风天气API的模拟实现
  // 在实际项目中，替换为真实的API调用
  const today = new Date();
  const forecasts = [];
  
  for (let i = 0; i < 3; i++) {
    const forecastDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    forecasts.push({
      fxDate: forecastDate.toISOString().split('T')[0],
      tempMax: Math.floor(Math.random() * 10 + 20).toString(), // 20-30度
      tempMin: Math.floor(Math.random() * 10 + 10).toString(), // 10-20度
      iconDay: ['100', '101', '102', '103', '104', '300', '301', '302'][Math.floor(Math.random() * 8)],
      textDay: ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雷阵雨', '雾'][Math.floor(Math.random() * 8)],
      iconNight: ['150', '101', '104', '301', '302', '400', '401', '500'][Math.floor(Math.random() * 8)],
      textNight: ['晴间多云', '多云', '阴', '小雨', '中雨', '大雨', '雷阵雨', '雾'][Math.floor(Math.random() * 8)],
      windDirDay: ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'][Math.floor(Math.random() * 8)],
      windScaleDay: `${Math.floor(Math.random() * 3 + 1)}-${Math.floor(Math.random() * 2 + 3)}`,
      windDirNight: ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'][Math.floor(Math.random() * 8)],
      windScaleNight: `${Math.floor(Math.random() * 3 + 1)}-${Math.floor(Math.random() * 2 + 2)}`,
      humidity: Math.floor(Math.random() * 50 + 40).toString(),
      pop: Math.floor(Math.random() * 100).toString(),
      pressure: Math.floor(Math.random() * 20 + 1000).toString()
    });
  }
  
  return forecasts;
};

// 获取空气质量
export const getAirQuality = async (longitude: number, latitude: number) => {
  // 模拟空气质量数据，但使用更多随机性
  const aqi = Math.floor(Math.random() * 200 + 30); // 30-230之间的AQI值
  let category = '优';
  
  if (aqi <= 50) category = '优';
  else if (aqi <= 100) category = '良';
  else if (aqi <= 150) category = '轻度污染';
  else if (aqi <= 200) category = '中度污染';
  else category = '重度污染';
  
  return {
    aqi: aqi.toString(),
    category,
    primary: ['PM2.5', 'PM10', 'O3', 'NO2', 'SO2'][Math.floor(Math.random() * 5)],
    pm25: Math.floor(Math.random() * 150 + 10).toString(),
    pm10: Math.floor(Math.random() * 200 + 20).toString(),
    no2: Math.floor(Math.random() * 100 + 10).toString(),
    so2: Math.floor(Math.random() * 50 + 5).toString(),
    co: (Math.random() * 2 + 0.5).toFixed(1),
    o3: Math.floor(Math.random() * 180 + 30).toString()
  };
};

// 导出前端地图API密钥
export { AMAP_API_KEY_FRONTEND };