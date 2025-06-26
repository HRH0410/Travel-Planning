import React, { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { AMAP_CONFIG, DEFAULT_MAP_CENTER } from '../../constants';

interface MapPoint {
  longitude: number;
  latitude: number;
  name: string;
  type?: 'attraction' | 'dining' | 'accommodation' | 'travel' | 'other';
}

interface AmapComponentProps {
  center?: { longitude: number; latitude: number };
  markers?: MapPoint[];
  zoom?: number;
  onMarkerClick?: (marker: MapPoint) => void;
  onMapCenterChange?: (center: { longitude: number; latitude: number }) => void;
  height?: string;
  className?: string;
}

// 错误边界组件
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('地图组件错误:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('地图组件错误详情:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// 获取不同类型的标记图标颜色
const getMarkerIcon = (type?: string) => {
  const colorMap: Record<string, string> = {
    attraction: '#FF5722',  // 景点 - 红色
    dining: '#4CAF50',      // 餐饮 - 绿色
    accommodation: '#2196F3', // 住宿 - 蓝色
    travel: '#9C27B0',      // 交通 - 紫色
    other: '#FF9800'        // 其他 - 橙色
  };
  
  return colorMap[type || 'other'] || colorMap.other;
};

// 原生高德地图组件
const NativeAmapComponent: React.FC<AmapComponentProps> = ({
  center = DEFAULT_MAP_CENTER,
  markers = [],
  zoom = 13,
  onMarkerClick,
  onMapCenterChange,
  height = '500px',
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mapReadyRef = useRef<boolean>(false); // 追踪地图是否完全加载

  // 验证并修复坐标
  const validateCoordinate = (coord: number, fallback: number): number => {
    return (isNaN(coord) || !isFinite(coord)) ? fallback : coord;
  };

  // 点击标记时重新居中地图
  const handleMarkerClick = (marker: MapPoint) => {
    console.log('标记被点击:', marker.name);
    
    if (mapInstanceRef.current && mapReadyRef.current) {
      const lng = marker.longitude;
      const lat = marker.latitude;
      
      console.log('点击标记的原始坐标:', { lng, lat });
      
      // 严格验证坐标
      if (typeof lng === 'number' && typeof lat === 'number' &&
          !isNaN(lng) && !isNaN(lat) &&
          isFinite(lng) && isFinite(lat) &&
          lng >= -180 && lng <= 180 &&
          lat >= -90 && lat <= 90) {
        
        try {
          // 平滑移动到点击的标记，不改变缩放级别
          mapInstanceRef.current.panTo([lng, lat]);
          console.log(`地图平滑移动到: [${lng}, ${lat}]`);
          
          // 触发地图中心变化回调
          if (onMapCenterChange) {
            onMapCenterChange({ longitude: lng, latitude: lat });
          }
        } catch (error) {
          console.error('移动地图中心失败:', error);
        }
      } else {
        console.warn('标记坐标无效，无法居中地图:', { lng, lat });
      }
    } else {
      console.warn('地图未准备好，无法处理标记点击');
    }
    
    // 触发标记点击回调（不延迟，避免状态不同步）
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  // 清理现有标记
  const clearMarkers = () => {
    if (markersRef.current.length > 0 && mapInstanceRef.current) {
      console.log(`准备清理 ${markersRef.current.length} 个标记点`);
      
      try {
        // 尝试批量移除标记
        mapInstanceRef.current.remove(markersRef.current);
        console.log('✅ 成功批量清理标记点');
      } catch (error) {
        console.warn('批量清理标记点时出错:', error);
        // 如果批量清理失败，尝试逐个清理
        let successCount = 0;
        markersRef.current.forEach((marker, index) => {
          try {
            if (marker && typeof marker.remove === 'function') {
              marker.remove();
              successCount++;
            } else if (mapInstanceRef.current && marker) {
              mapInstanceRef.current.remove(marker);
              successCount++;
            }
          } catch (err) {
            console.warn(`清理标记点 ${index} 失败:`, err);
          }
        });
        console.log(`✅ 逐个清理完成，成功清理 ${successCount}/${markersRef.current.length} 个标记点`);
      } finally {
        // 无论如何都要清空引用数组
        markersRef.current = [];
      }
    } else {
      console.log('无标记点需要清理');
    }
  };

  // 添加标记点
  const addMarkers = () => {
    if (!mapInstanceRef.current || markers.length === 0) {
      console.log('地图未初始化或无标记点，跳过添加标记');
      return;
    }

    clearMarkers();

    console.log(`准备添加 ${markers.length} 个标记点`);

    // 先验证所有标记点的坐标
    const validatedMarkers = markers.map((marker, index) => {
      const validLng = validateCoordinate(marker.longitude, DEFAULT_MAP_CENTER.longitude);
      const validLat = validateCoordinate(marker.latitude, DEFAULT_MAP_CENTER.latitude);
      
      const isOriginalValid = !isNaN(marker.longitude) && !isNaN(marker.latitude) && 
                             isFinite(marker.longitude) && isFinite(marker.latitude);
      
      console.log(`标记点 ${index + 1}: ${marker.name} 原始坐标[${marker.longitude}, ${marker.latitude}] ${isOriginalValid ? '✓' : '✗'} 修正后[${validLng}, ${validLat}]`);
      
      return {
        ...marker,
        validLng,
        validLat,
        isValid: isOriginalValid
      };
    });

    const newMarkers = validatedMarkers.map((marker, index) => {
      try {
        const markerInstance = new (window as any).AMap.Marker({
          position: [marker.validLng, marker.validLat],
          title: marker.name,
          icon: new (window as any).AMap.Icon({
            size: new (window as any).AMap.Size(32, 32),
            image: `data:image/svg+xml;base64,${btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="12" fill="${getMarkerIcon(marker.type)}" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
              </svg>
            `)}`,
            imageSize: new (window as any).AMap.Size(32, 32)
          })
        });

        // 添加点击事件
        markerInstance.on('click', () => handleMarkerClick(marker));

        console.log(`✅ 标记点 ${index + 1} 创建成功`);
        return markerInstance;
      } catch (error) {
        console.error(`❌ 创建标记点 ${index + 1} 失败:`, error);
        return null;
      }
    }).filter(Boolean); // 过滤掉创建失败的标记

    if (newMarkers.length > 0) {
      try {
        markersRef.current = newMarkers;
        mapInstanceRef.current.add(newMarkers);
        console.log(`✅ 成功添加 ${newMarkers.length} 个标记点到地图`);
      } catch (error) {
        console.error('❌ 添加标记点到地图失败:', error);
        return;
      }
    }

    // 自适应地图视野
    const trueValidMarkers = validatedMarkers.filter(m => m.isValid);

    if (trueValidMarkers.length > 1) {
      try {
        const bounds = new (window as any).AMap.Bounds();
        trueValidMarkers.forEach(marker => {
          bounds.extend([marker.validLng, marker.validLat]);
        });
        
        console.log('设置地图边界以包含所有标记点');
        mapInstanceRef.current.setBounds(bounds, false, [60, 60, 60, 60]);
      } catch (error) {
        console.error('设置地图边界时出错:', error);
      }
    } else if (trueValidMarkers.length === 1) {
      const marker = trueValidMarkers[0];
      try {
        mapInstanceRef.current.setZoomAndCenter(15, [marker.validLng, marker.validLat]);
        console.log(`地图居中到唯一标记点: [${marker.validLng}, ${marker.validLat}]`);
      } catch (error) {
        console.error('设置地图中心时出错:', error);
      }
    }
  };

  // 初始化地图（只在首次加载时）
  useEffect(() => {
    let mapInstance: any = null;

    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) {
        console.log('地图容器不可用或地图已存在，跳过初始化');
        return;
      }

      // 检查容器是否仍在DOM中
      const container = mapRef.current;
      if (!container.isConnected) {
        console.warn('容器已从DOM中移除，跳过初始化');
        return;
      }

      const width = container.offsetWidth;
      const height = container.offsetHeight;
      
      console.log('初始化时容器尺寸:', { width, height });
      
      if (width <= 0 || height <= 0 || isNaN(width) || isNaN(height)) {
        console.warn('容器尺寸无效，延迟初始化地图');
        setTimeout(() => {
          // 再次检查容器是否仍然存在
          if (mapRef.current && mapRef.current.isConnected) {
            initMap();
          }
        }, 100);
        return;
      }

      try {
        console.log('开始初始化高德地图...');
        
        const AMap = await AMapLoader.load({
          key: AMAP_CONFIG.KEY,
          version: AMAP_CONFIG.VERSION,
          plugins: ['AMap.Scale', 'AMap.ControlBar'],
          ...(AMAP_CONFIG.SECURITY_JS_CODE && {
            securityJSCode: AMAP_CONFIG.SECURITY_JS_CODE
          })
        });

        console.log('✅ 高德地图API加载成功');

        const safeCenter = center || DEFAULT_MAP_CENTER;
        
        // 严格验证初始中心点
        let validCenter;
        if (safeCenter && 
            typeof safeCenter.longitude === 'number' && 
            typeof safeCenter.latitude === 'number' &&
            !isNaN(safeCenter.longitude) && !isNaN(safeCenter.latitude) &&
            isFinite(safeCenter.longitude) && isFinite(safeCenter.latitude) &&
            safeCenter.longitude >= -180 && safeCenter.longitude <= 180 &&
            safeCenter.latitude >= -90 && safeCenter.latitude <= 90) {
          validCenter = [safeCenter.longitude, safeCenter.latitude];
        } else {
          console.warn('传入的中心点无效，使用默认中心点:', safeCenter);
          validCenter = [DEFAULT_MAP_CENTER.longitude, DEFAULT_MAP_CENTER.latitude];
        }

        console.log('初始化地图中心点:', validCenter);

        // 验证缩放级别
        const validZoom = (typeof zoom === 'number' && !isNaN(zoom) && isFinite(zoom) && zoom >= 3 && zoom <= 20) 
          ? zoom 
          : 13;

        console.log('初始化缩放级别:', validZoom);

        // 再次检查容器是否仍然有效
        if (!mapRef.current || !mapRef.current.isConnected) {
          console.warn('容器在初始化过程中被移除，中止地图创建');
          return;
        }

        mapInstance = new AMap.Map(mapRef.current, {
          center: validCenter,
          zoom: validZoom,
          viewMode: '3D',
          resizeEnable: true,
          dragEnable: true,
          zoomEnable: true,
          doubleClickZoom: true,
          keyboardEnable: true,
          scrollWheel: true
        });

        mapInstanceRef.current = mapInstance;

        // 监听地图加载完成
        mapInstance.on('complete', () => {
          console.log('✅ 地图加载完成');
          mapReadyRef.current = true; // 标记地图已完全加载
          
          // 强制刷新地图尺寸（防止容器大小问题）
          setTimeout(() => {
            if (mapInstanceRef.current && mapRef.current && mapReadyRef.current) {
              const width = mapRef.current.offsetWidth;
              const height = mapRef.current.offsetHeight;
              
              console.log('地图完成后容器尺寸:', { width, height });
              
              if (width > 0 && height > 0 && 
                  !isNaN(width) && !isNaN(height) &&
                  isFinite(width) && isFinite(height)) {
                try {
                  if (mapInstanceRef.current.getStatus && 
                      mapInstanceRef.current.getStatus().dragEnable !== undefined) {
                    mapInstanceRef.current.getSize();
                    console.log('地图尺寸刷新完成');
                  }
                } catch (error) {
                  console.warn('刷新地图尺寸时出错:', error);
                }
              }
            }
          }, 100);
        });

        // 监听地图错误
        mapInstance.on('error', (error: any) => {
          console.error('❌ 地图加载错误:', error);
        });

        // 添加控件
        try {
          if (AMap.ControlBar) {
            mapInstance.addControl(new AMap.ControlBar({
              position: { right: '10px', bottom: '10px' }
            }));
          }
          
          if (AMap.Scale) {
            mapInstance.addControl(new AMap.Scale({
              position: { left: '10px', bottom: '10px' }
            }));
          }
        } catch (error) {
          console.warn('地图控件加载失败:', error);
        }

      } catch (error) {
        console.error('地图初始化失败:', error);
      }
    };

    initMap();

    // 清理函数
    return () => {
      console.log('开始清理地图组件...');
      
      // 重置状态标志
      mapReadyRef.current = false;
      
      // 清理标记点
      try {
        clearMarkers();
      } catch (error) {
        console.warn('清理标记点时出错:', error);
      }
      
      // 销毁地图实例
      if (mapInstance) {
        try {
          console.log('销毁地图实例...');
          
          // 先清除所有事件监听器
          if (typeof mapInstance.off === 'function') {
            mapInstance.off('complete');
            mapInstance.off('error');
          }
          
          // 延迟销毁，确保所有异步操作完成
          setTimeout(() => {
            try {
              if (mapInstance && typeof mapInstance.destroy === 'function') {
                mapInstance.destroy();
                console.log('✅ 地图实例销毁完成');
              }
            } catch (destroyError) {
              console.warn('销毁地图实例时出错:', destroyError);
            }
          }, 100);
          
        } catch (error) {
          console.warn('地图清理过程中出错:', error);
        } finally {
          mapInstance = null;
          mapInstanceRef.current = null;
        }
      }
      
      console.log('地图组件清理完成');
    };
  }, []); // 只在组件挂载时执行一次

  // 更新地图中心点（不重新初始化地图）
  useEffect(() => {
    if (mapInstanceRef.current && mapReadyRef.current && center) {
      // 严格验证中心点坐标
      const lng = center.longitude;
      const lat = center.latitude;
      
      console.log('原始中心点坐标:', { lng, lat });
      
      // 检查坐标是否有效
      if (typeof lng === 'number' && typeof lat === 'number' &&
          !isNaN(lng) && !isNaN(lat) &&
          isFinite(lng) && isFinite(lat) &&
          lng >= -180 && lng <= 180 &&
          lat >= -90 && lat <= 90) {
        
        const validCenter = [lng, lat];
        console.log('设置有效的地图中心点:', validCenter);
        
        try {
          mapInstanceRef.current.setCenter(validCenter);
        } catch (error) {
          console.error('设置地图中心点失败:', error, '使用的坐标:', validCenter);
        }
      } else {
        console.warn('中心点坐标无效，跳过设置:', { lng, lat });
      }
    } else {
      console.log('地图未准备好或中心点为空，跳过中心点更新');
    }
  }, [center]);

  // 更新缩放级别（不重新初始化地图）
  useEffect(() => {
    if (mapInstanceRef.current && mapReadyRef.current && typeof zoom === 'number') {
      // 验证缩放级别是否有效
      if (!isNaN(zoom) && isFinite(zoom) && zoom >= 3 && zoom <= 20) {
        console.log('更新地图缩放级别:', zoom);
        try {
          mapInstanceRef.current.setZoom(zoom);
        } catch (error) {
          console.error('设置地图缩放级别失败:', error);
        }
      } else {
        console.warn('缩放级别无效:', zoom);
      }
    }
  }, [zoom]);

  // 更新标记点（不重新初始化地图）
  useEffect(() => {
    if (mapInstanceRef.current && mapReadyRef.current) {
      console.log('标记更新触发，当前标记数量:', markers.length);
      
      // 如果标记数量和内容没有实质性变化，避免重新渲染
      const currentMarkersSignature = markersRef.current.map(m => 
        m.getOptions ? `${m.getOptions().position?.join(',')}_${m.getOptions().title}` : 'invalid'
      ).join('|');
      
      const newMarkersSignature = markers.map(m => 
        `${m.longitude},${m.latitude}_${m.name}`
      ).join('|');
      
      if (currentMarkersSignature === newMarkersSignature && markersRef.current.length > 0) {
        console.log('标记内容未变化，跳过重新渲染');
        return;
      }
      
      console.log('标记内容发生变化，重新渲染标记');
      addMarkers();
    } else {
      console.log('地图未准备好，延迟添加标记');
      // 如果地图还没准备好，等待一段时间后重试
      const timeout = setTimeout(() => {
        if (mapInstanceRef.current && mapReadyRef.current) {
          addMarkers();
        }
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [markers]);

  // 监听容器尺寸变化，调整地图大小（但不重新初始化）
  useEffect(() => {
    if (!mapRef.current) return;

    const container = mapRef.current;
    let resizeTimeout: NodeJS.Timeout;
    let resizeObserver: ResizeObserver | null = null;
    
    try {
      // 使用 ResizeObserver 监听容器尺寸变化
      resizeObserver = new ResizeObserver((entries) => {
        // 清除之前的timeout
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        
        // 防抖处理，避免频繁调用
        resizeTimeout = setTimeout(() => {
          for (const entry of entries) {
            // 检查目标元素是否仍然在DOM中
            if (entry.target && entry.target.isConnected &&
                mapInstanceRef.current && mapRef.current && mapReadyRef.current) {
              
              const { width, height } = entry.contentRect;
              
              console.log('容器尺寸变化:', { width, height });
              
              // 检查尺寸是否有效且地图已经完全初始化
              if (width > 0 && height > 0 && 
                  !isNaN(width) && !isNaN(height) &&
                  isFinite(width) && isFinite(height)) {
                
                try {
                  // 使用更安全的方式调用地图API
                  if (typeof mapInstanceRef.current.getSize === 'function' && 
                      mapInstanceRef.current.getStatus && 
                      mapInstanceRef.current.getStatus().dragEnable !== undefined) {
                    // 地图已完全初始化，可以安全调用 getSize
                    mapInstanceRef.current.getSize();
                    console.log('地图尺寸调整完成');
                  } else {
                    console.warn('地图API未完全准备好，跳过尺寸调整');
                  }
                } catch (error) {
                  console.warn('调整地图尺寸时出错:', error);
                }
              } else {
                console.warn('容器尺寸无效，跳过地图尺寸调整');
              }
            } else {
              console.log('目标元素不在DOM中或地图未准备好，跳过尺寸调整');
            }
          }
        }, 150); // 增加防抖延迟
      });

      resizeObserver.observe(container);
    } catch (error) {
      console.warn('创建ResizeObserver失败:', error);
    }

    // 简化 window resize 监听
    const handleWindowResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = setTimeout(() => {
        if (mapInstanceRef.current && mapRef.current && mapRef.current.isConnected && mapReadyRef.current) {
          const width = mapRef.current.offsetWidth;
          const height = mapRef.current.offsetHeight;
          
          if (width > 0 && height > 0 && 
              !isNaN(width) && !isNaN(height) &&
              isFinite(width) && isFinite(height)) {
            
            try {
              if (typeof mapInstanceRef.current.getSize === 'function' && 
                  mapInstanceRef.current.getStatus && 
                  mapInstanceRef.current.getStatus().dragEnable !== undefined) {
                mapInstanceRef.current.getSize();
                console.log('Window resize 地图尺寸调整完成');
              } else {
                console.warn('Window resize: 地图API未完全准备好');
              }
            } catch (error) {
              console.warn('Window resize 调整地图尺寸时出错:', error);
            }
          }
        } else {
          console.log('Window resize: 地图未准备好或容器不在DOM中，跳过尺寸调整');
        }
      }, 200);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      if (resizeObserver) {
        try {
          resizeObserver.disconnect();
        } catch (error) {
          console.warn('断开ResizeObserver时出错:', error);
        }
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className={className}
      style={{ 
        width: '100%', 
        height,
        position: 'relative',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ddd',
        minHeight: '300px'
      }}
    />
  );
};

// 主地图组件
export const AmapComponent: React.FC<AmapComponentProps> = (props) => {
  // 检查是否配置了API Key
  if (!AMAP_CONFIG.KEY || AMAP_CONFIG.KEY === 'your-amap-api-key') {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg ${props.className || ''}`}
        style={{ height: props.height || '500px' }}
      >
        <div className="text-center p-4">
          <div className="text-gray-500 mb-2">
            📍 地图功能需要配置API密钥
          </div>
          <div className="text-sm text-gray-400">
            请在 constants.ts 中配置您的高德地图 API Key
            <br />
            获取地址：<a href="https://lbs.amap.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://lbs.amap.com/</a>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            步骤：<br/>
            1. 注册高德开放平台账号<br/>
            2. 创建应用获取Web端API Key<br/>
            3. 在constants.ts中替换API Key
          </div>
        </div>
      </div>
    );
  }

  const errorFallback = (
    <div 
      className={`flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg ${props.className || ''}`}
      style={{ height: props.height || '500px' }}
    >
      <div className="text-center p-4">
        <div className="text-red-500 mb-2">
          ⚠️ 地图加载失败
        </div>
        <div className="text-sm text-red-400">
          地图组件遇到错误，请刷新页面重试
        </div>
      </div>
    </div>
  );

  return (
    <MapErrorBoundary fallback={errorFallback}>
      <NativeAmapComponent {...props} />
    </MapErrorBoundary>
  );
};

export default AmapComponent;
