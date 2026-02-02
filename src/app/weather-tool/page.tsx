'use client';

import { useState, useEffect, useRef } from 'react';
import {
  searchCity,
  getCurrentWeather,
  getWeatherForecast,
  getAirQuality,
  AMAP_API_KEY_FRONTEND
} from '@/lib/weatherService';
import { Search, MapPin, Cloud, CloudRain, Sun, Wind, Droplets, ThermometerSun, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/contexts/I18nContext';

export default function WeatherToolPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [longitude, setLongitude] = useState(116.397428); // 默认北京坐标
  const [latitude, setLatitude] = useState(39.90923);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [airQuality, setAirQuality] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // 加载地图
  useEffect(() => {
    // 重置地图加载状态
    setMapLoaded(false);
    
    const loadMap = () => {
      // 使用类型断言避免TypeScript错误
      const win = window as any;
      if (win.AMap && mapContainerRef.current) {
        try {
          // 初始化地图
          const map = new win.AMap.Map(mapContainerRef.current, {
            zoom: 12,
            center: [longitude, latitude],
            resizeEnable: true,
            mapStyle: 'amap://styles/light'
          });

          // 添加标记
          const marker = new win.AMap.Marker({
            position: [longitude, latitude],
            title: selectedCity?.name || '当前位置'
          });
          marker.setMap(map);

          // 添加错误处理
          map.on('error', (err: any) => {
            console.error('地图加载错误:', err);
          });

          mapInstanceRef.current = map;
          markerRef.current = marker;
          setMapLoaded(true);
          console.log('地图加载成功');
        } catch (error) {
          console.error('地图初始化失败:', error);
          // 显示模拟地图
          if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = `
              <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f8ff;">
                <div style="text-align: center;">
                  <MapPin className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                  <div style="color: #666;">${selectedCity?.name || '北京市'}</div>
                  <div style="color: #999; font-size: 12px;">地图加载中...</div>
                </div>
              </div>
            `;
          }
        }
      }
    };

    // 检查地图是否已加载
    if ((window as any).AMap) {
      loadMap();
    } else {
      console.log('开始加载高德地图SDK');
      // 动态加载高德地图
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_API_KEY_FRONTEND}`;
      script.async = true;
      script.onerror = () => {
        console.error('地图SDK加载失败');
        // 显示模拟地图
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f8ff;">
              <div style="text-align: center;">
                <MapPin className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                <div style="color: #666;">${selectedCity?.name || '北京市'}</div>
                <div style="color: #999; font-size: 12px;">地图加载中...</div>
              </div>
            </div>
          `;
        }
      };
      script.onload = () => {
        console.log('地图SDK加载成功');
        loadMap();
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
        mapInstanceRef.current = null;
        markerRef.current = null;
        setMapLoaded(false);
      };
    }
  }, []); // 只在组件挂载时加载一次

  // 更新地图位置
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && longitude && latitude) {
      mapInstanceRef.current.setCenter([longitude, latitude]);
      markerRef.current.setPosition([longitude, latitude]);
      markerRef.current.setTitle(selectedCity?.name || '当前位置');
    }
  }, [longitude, latitude, selectedCity]);

  // 获取天气信息
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!longitude || !latitude) return;

      setLoading(true);
      try {
        const [weather, weatherForecast, air] = await Promise.all([
          getCurrentWeather(longitude, latitude),
          getWeatherForecast(longitude, latitude),
          getAirQuality(longitude, latitude)
        ]);
        
        setCurrentWeather(weather);
        setForecast(weatherForecast || []);
        setAirQuality(air);
      } catch (error) {
        console.error('获取天气数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [longitude, latitude]);

  // 搜索城市
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const results = await searchCity(searchQuery);
    setSearchResults(results);
    setShowSearchResults(true);
  };

  // 选择城市
  const handleCitySelect = (city: any) => {
    const [lon, lat] = city.location.split(',');
    setSelectedCity(city);
    setLongitude(parseFloat(lon));
    setLatitude(parseFloat(lat));
    setSearchQuery(city.name);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // 切换展开/收起某天的详细预报
  const toggleExpandDay = (index: number) => {
    setExpandedDay(expandedDay === index ? null : index);
  };

  // 获取天气图标
  const getWeatherIcon = (weatherCode: string, isNight = false) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '100': <Sun className="w-8 h-8 text-amber-500" />,
      '101': <Cloud className="w-8 h-8 text-gray-400" />,
      '102': <Cloud className="w-8 h-8 text-gray-500" />,
      '103': <Cloud className="w-8 h-8 text-gray-600" />,
      '104': <Cloud className="w-8 h-8 text-gray-700" />,
      '300': <CloudRain className="w-8 h-8 text-blue-400" />,
      '301': <CloudRain className="w-8 h-8 text-blue-500" />,
      '302': <CloudRain className="w-8 h-8 text-blue-600" />,
    };

    return iconMap[weatherCode] || <Cloud className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('weatherToolPage.title')}</h1>
        
        {/* 搜索框 */}
        <div className="relative mb-6 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder={t('weatherToolPage.searchCity')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 py-6 text-lg"
            />
            <Button 
              type="submit" 
              className="absolute right-1 top-1 h-10 w-10 p-0"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
          
          {/* 搜索结果 */}
          {showSearchResults && searchResults.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 z-10">
              <ScrollArea className="max-h-60">
                {searchResults.map((city, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    onClick={() => handleCitySelect(city)}
                  >
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{city.name}</div>
                      <div className="text-sm text-gray-500">{city.address}</div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          )}
        </div>

        {/* 当前天气信息 */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {t('weatherToolPage.weatherOf', { city: selectedCity?.name || t('weatherToolPage.currentLocation') })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 地图 */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  ref={mapContainerRef}
                  className="w-full h-[350px] rounded-lg border-2 border-gray-200 bg-white"
                  style={{ minHeight: '350px' }}
                />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <div className="text-center p-4">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <div className="text-sm text-gray-500">{t('weatherToolPage.loadingMap')}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 当前天气详情 */}
              <div className="flex flex-col justify-center space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    <div className="bg-gray-200 h-12 w-1/3 rounded animate-pulse" />
                    <div className="bg-gray-200 h-6 rounded animate-pulse w-2/3" />
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-200 h-8 rounded animate-pulse" />
                      <div className="bg-gray-200 h-8 rounded animate-pulse" />
                      <div className="bg-gray-200 h-8 rounded animate-pulse" />
                      <div className="bg-gray-200 h-8 rounded animate-pulse" />
                    </div>
                  </div>
                ) : currentWeather ? (
                  <>
                    <div className="flex items-center gap-4">
                      {getWeatherIcon(currentWeather.icon)}
                      <div>
                        <div className="text-5xl font-bold">{currentWeather.temp}°</div>
                        <div className="text-xl text-gray-600">{currentWeather.text}</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Wind className="h-5 w-5 text-gray-500" />
                        <span>{currentWeather.windDir} {t('weatherToolPage.windScale', { scale: currentWeather.windScale })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-gray-500" />
                        <span>{t('weatherToolPage.humidityPercent', { humidity: currentWeather.humidity })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ThermometerSun className="h-5 w-5 text-gray-500" />
                        <span>{t('weatherToolPage.feelsLike', { temp: currentWeather.feelsLike })}</span>
                      </div>
                      {airQuality && (
                        <div className="flex items-center gap-2">
                          <Cloud className="h-5 w-5 text-gray-500" />
                          <span>{t('weatherToolPage.airQuality', { aqi: airQuality.aqi, category: airQuality.category })}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">{t('weatherToolPage.noWeatherData')}</div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 天气预报 */}
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">{t('weatherToolPage.forecast3Days')}</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((day) => (
                  <div key={day} className="bg-gray-200 h-16 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {forecast.length > 0 ? forecast.map((day, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div 
                      className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" 
                      onClick={() => toggleExpandDay(index)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-medium w-24">
                          {index === 0 ? t('weatherToolPage.today') : index === 1 ? t('weatherToolPage.tomorrow') : new Date(day.fxDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                          {getWeatherIcon(day.iconDay)}
                          <span>{day.textDay}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span>{day.tempMin}°~{day.tempMax}°</span>
                        {expandedDay === index ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                    
                    {expandedDay === index && (
                      <div className="p-4 bg-gray-50 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-500">{t('weatherToolPage.windDir')}</span>
                            <span>{day.windDirDay} {t('weatherToolPage.windScale', { scale: day.windScaleDay })}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">{t('weatherToolPage.precipitation')}</span>
                            <span>{day.pop}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">{t('weatherToolPage.humidity')}</span>
                            <span>{day.humidity}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">{t('weatherToolPage.pressure')}</span>
                            <span>{day.pressure}hPa</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-gray-500">{t('weatherToolPage.nightWeather')}</span>
                          <span className="flex items-center gap-1">
                            {getWeatherIcon(day.iconNight)}
                            {day.textNight}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">{t('weatherToolPage.noForecastData')}</div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}