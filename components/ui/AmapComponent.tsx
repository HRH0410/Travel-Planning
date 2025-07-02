import React, { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { AMAP_CONFIG, DEFAULT_MAP_CENTER } from '../../constants';

interface MapPoint {
  longitude: number;
  latitude: number;
  name: string;
  type?: 'attraction' | 'dining' | 'accommodation' | 'travel' | 'other';
  activityIndex?: number; // 添加景点编号
}

interface AmapComponentProps {
  center?: { longitude: number; latitude: number };
  markers?: MapPoint[];
  zoom?: number;
  onMarkerClick?: (marker: MapPoint) => void;
  onMapCenterChange?: (center: { longitude: number; latitude: number }) => void;
  onZoomChange?: (zoom: number) => void;
  height?: string;
  className?: string;
  selectedActivityId?: string | null; // 新增：选中的活动ID
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

// 高德地图组件 - 支持标记点显示
const NativeAmapComponent: React.FC<AmapComponentProps> = ({
  center = DEFAULT_MAP_CENTER,
  markers = [],
  zoom = 13,
  onMarkerClick,
  selectedActivityId,
  height = '500px',
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const mapReadyRef = useRef<boolean>(false);
  const markersRef = useRef<any[]>([]);

  // 清理所有标记点
  const clearMarkers = () => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        try {
          if (mapInstanceRef.current && marker) {
            mapInstanceRef.current.remove(marker);
          }
        } catch (error) {
          console.warn('清理标记点时出错:', error);
        }
      });
      markersRef.current = [];
    }
  };

  // 创建标记点图标
  const createMarkerIcon = (type: string, index: number, isSelected: boolean) => {
    const color = getMarkerIcon(type);
    
    if (isSelected) {
      // 选中状态：路标形状，镂空白色中心，彩色边框和文字
      return new (window as any).AMap.Icon({
        imageSize: new (window as any).AMap.Size(40, 52),
        anchor: new (window as any).AMap.Pixel(20, 50), // 锚点在路标底部尖端
        image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
          <svg width="40" height="52" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
            <!-- 外层路标形状，增加顶部间距 -->
            <path d="M20 46s16-11 16-24c0-8.8-7.2-16-16-16S4 13.2 4 22c0 13 16 24 16 24z" 
                  fill="${color}" stroke="#ffffff" stroke-width="2"/>
            <!-- 内层白色圆形镂空 -->
            <circle cx="20" cy="22" r="11" fill="white" stroke="${color}" stroke-width="2"/>
            <!-- 文字 -->
            <text x="20" y="26" text-anchor="middle" font-family="Arial, sans-serif" 
                  font-size="13" font-weight="bold" fill="${color}">${index}</text>
          </svg>
        `)}`
      });
    } else {
      // 未选中状态：圆形，彩色底色，白色文字
      return new (window as any).AMap.Icon({
        imageSize: new (window as any).AMap.Size(32, 32),
        anchor: new (window as any).AMap.Pixel(16, 16), // 锚点在圆心
        image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <!-- 圆形背景 -->
            <circle cx="16" cy="16" r="15" fill="${color}" stroke="#ffffff" stroke-width="2"/>
            <!-- 文字 -->
            <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" 
                  font-size="12" font-weight="bold" fill="white">${index}</text>
          </svg>
        `)}`
      });
    }
  };

  // 更新标记点
  const updateMarkers = () => {
    if (!mapInstanceRef.current || !mapReadyRef.current) {
      console.log('地图未准备好，跳过标记点更新');
      return;
    }

    // 清理现有标记点
    clearMarkers();

    // 过滤有效的标记点
    const validMarkers = markers.filter(marker => 
      marker && 
      typeof marker.longitude === 'number' && 
      typeof marker.latitude === 'number' &&
      !isNaN(marker.longitude) && 
      !isNaN(marker.latitude) &&
      isFinite(marker.longitude) && 
      isFinite(marker.latitude) &&
      marker.longitude >= -180 && marker.longitude <= 180 &&
      marker.latitude >= -90 && marker.latitude <= 90
    );

    console.log(`更新标记点: ${validMarkers.length}/${markers.length}个有效标记`);

    // 添加新的标记点
    validMarkers.forEach((markerData, index) => {
      try {
        const markerIndex = markerData.activityIndex || (index + 1);
        
        const marker = new (window as any).AMap.Marker({
          position: new (window as any).AMap.LngLat(markerData.longitude, markerData.latitude),
          icon: createMarkerIcon(markerData.type || 'other', markerIndex, false), // 初始状态为未选中
          title: markerData.name,
          clickable: true,
          zIndex: 100 // 默认层级
        });

        // 添加点击事件
        marker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(markerData);
          }
          
          // 点击后将该景点设置为地图中心，使用平滑动画
          if (mapInstanceRef.current) {
            try {
              const newCenter = new (window as any).AMap.LngLat(markerData.longitude, markerData.latitude);
              mapInstanceRef.current.panTo(newCenter, 400, 'ease-in-out');
              console.log(`✅ 地图中心已设置为: ${markerData.name} (${markerData.longitude}, ${markerData.latitude})`);
            } catch (error) {
              console.warn('设置地图中心失败:', error);
            }
          }
        });

        // 将标记点添加到地图
        mapInstanceRef.current.add(marker);
        markersRef.current.push(marker);
        
        console.log(`✅ 添加标记点: ${markerData.name} at (${markerData.longitude}, ${markerData.latitude})`);
      } catch (error) {
        console.warn(`创建标记点失败: ${markerData.name}`, error);
      }
    });

    console.log(`✅ 标记点更新完成，共${markersRef.current.length}个标记点`);
  };

  // 初始化地图（只在首次加载时）
  useEffect(() => {
    let mapInstance: any = null;
    let originalConsoleError: typeof console.error | null = null;

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
          plugins: [
            'AMap.IndoorMap',        // 室内地图插件
            'AMap.Buildings',        // 3D建筑插件
            'AMap.ControlBar',       // 3D控制条插件
            'AMap.Scale',            // 比例尺插件
            'AMap.ToolBar',          // 工具条插件
            'AMap.CitySearch'        // 城市搜索插件
          ],
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

        // 验证缩放级别 - 3D建筑在较高缩放级别(14+)下更明显
        const validZoom = (typeof zoom === 'number' && !isNaN(zoom) && isFinite(zoom) && zoom >= 3 && zoom <= 20) 
          ? Math.max(zoom, 14)  // 确保最小缩放级别为14，以便显示3D建筑
          : 15;  // 默认使用15级缩放，这个级别下3D建筑效果最佳

        console.log('初始化缩放级别:', validZoom);

        // 再次检查容器是否仍然有效
        if (!mapRef.current || !mapRef.current.isConnected) {
          console.warn('容器在初始化过程中被移除，中止地图创建');
          return;
        }

        mapInstance = new AMap.Map(mapRef.current, {
          center: validCenter,
          zoom: validZoom,
          viewMode: '3D',              // 启用3D视图模式
          resizeEnable: true,
          dragEnable: true,
          zoomEnable: true,
          doubleClickZoom: true,
          keyboardEnable: true,
          scrollWheel: true,
          touchZoom: true,
          touchZoomCenter: 1,
          jogEnable: true,
          animateEnable: true,
          pitchEnable: true,           // 启用倾斜功能，支持3D视角
          rotateEnable: true,          // 启用旋转功能，支持3D视角
          pitch: 45,                   // 设置初始倾斜角度（0-83度），45度更容易看到3D效果
          rotation: 0,                 // 设置初始旋转角度
          mapStyle: 'amap://styles/normal',  // 使用标准地图样式，更好支持3D建筑
          features: ['bg', 'point', 'road', 'building'], // 确保包含building特性
          expandZoomRange: true,
          zooms: [3, 20],
          showBuildingBlock: true,     // 显示3D楼块
          showLabel: true,             // 显示地图标注
          showIndoorMap: false,        // 关闭室内地图，避免与3D建筑冲突
          building3d: true,            // 启用3D建筑（关键配置）
          buildingAnimation: true,     // 启用建筑动画
          skyColor: '#87CEEB',         // 设置天空颜色，增强3D效果
          terrain: false,              // 关闭地形，专注于建筑3D效果
          layers: [                    // 明确指定图层
            new AMap.TileLayer({
              getTileUrl: function(x: number, y: number, z: number) {
                return `https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=${x}&y=${y}&z=${z}`;
              },
              zIndex: 1
            })
          ]
        });

        mapInstanceRef.current = mapInstance;

        // 添加全局错误处理，防止地图内部错误影响页面
        originalConsoleError = console.error;
        const handleMapError = (...args: any[]) => {
          const errorMessage = args[0]?.toString() || '';
          // 如果是地图相关的 LngLat 错误，降级为警告
          if (errorMessage.includes('Invalid Object: LngLat') || 
              errorMessage.includes('LngLat(NaN, NaN)')) {
            console.warn('地图坐标警告（已处理）:', ...args);
            return;
          }
          // 其他错误正常输出
          if (originalConsoleError) {
            originalConsoleError(...args);
          }
        };
        
        // 临时替换 console.error
        console.error = handleMapError;        // 监听地图加载完成
        mapInstance.on('complete', () => {
          console.log('✅ 地图加载完成');
          mapReadyRef.current = true;
          
          // 强制启用3D建筑显示
          try {
            // 确保3D建筑图层可见
            mapInstance.getCity((info: any) => {
              console.log('当前城市:', info);
              // 强制刷新建筑图层
              mapInstance.setFeatures(['bg', 'point', 'road', 'building']);
              // 高德地图 API 2.1Beta 中没有 refresh 方法，改用其他方式强制重新渲染
              try {
                // 尝试使用 render 方法重新渲染
                if (typeof mapInstance.render === 'function') {
                  mapInstance.render();
                } else {
                  // 如果没有 render 方法，通过轻微改变缩放级别来触发重新渲染
                  const currentZoom = mapInstance.getZoom();
                  mapInstance.setZoom(currentZoom);
                }
              } catch (renderError) {
                console.warn('地图重新渲染失败:', renderError);
              }
            });
          } catch (error) {
            console.warn('获取城市信息失败:', error);
          }
          
          // 禁用浏览器默认的右键菜单和拖拽行为
          if (mapRef.current) {
            const mapContainer = mapRef.current;
            
            // 阻止右键菜单
            mapContainer.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              e.stopPropagation();
            });
            
            // 阻止默认的拖拽行为
            mapContainer.addEventListener('dragstart', (e) => {
              e.preventDefault();
            });
            
            // 阻止选择文本
            mapContainer.addEventListener('selectstart', (e) => {
              e.preventDefault();
            });
            
            // 确保鼠标事件能正确传递
            mapContainer.style.userSelect = 'none';
            mapContainer.style.webkitUserSelect = 'none';
            (mapContainer.style as any).mozUserSelect = 'none';
            (mapContainer.style as any).msUserSelect = 'none';
            
            console.log('✅ 地图交互事件处理设置完成');
          }
          
          // 添加3D控制条
          try {
            const controlBar = new (window as any).AMap.ControlBar({
              position: {
                top: '10px',
                right: '10px'
              },
              showControlButton: true,  // 显示控制按钮
              showZoomBar: true,        // 显示缩放条
              showDirectionButton: true // 显示方向按钮
            });
            mapInstance.addControl(controlBar);
            console.log('✅ 3D控制条添加成功');
          } catch (error) {
            console.warn('添加3D控制条失败:', error);
          }
          
          // 添加工具条
          try {
            const toolbar = new (window as any).AMap.ToolBar({
              position: {
                top: '110px',
                right: '10px'
              },
              offset: new (window as any).AMap.Pixel(0, 0),
              locate: true,             // 显示定位按钮
              direction: true,          // 显示方向按钮
              autoPosition: false,      // 关闭自动定位
              locationMarker: true,     // 显示定位标记
              useNative: false          // 不使用原生定位
            });
            mapInstance.addControl(toolbar);
            console.log('✅ 工具条添加成功');
          } catch (error) {
            console.warn('添加工具条失败:', error);
          }
          
          // 添加比例尺
          try {
            const scale = new (window as any).AMap.Scale({
              position: {
                bottom: '10px',
                left: '10px'
              }
            });
            mapInstance.addControl(scale);
            console.log('✅ 比例尺添加成功');
          } catch (error) {
            console.warn('添加比例尺失败:', error);
          }
          
          // 延迟设置视角，确保3D建筑正确加载
          setTimeout(() => {
            try {
              // 设置一个更明显的3D视角
              mapInstance.setPitch(50);  // 设置倾斜角度
              mapInstance.setRotation(15); // 稍微旋转增加立体感
              
              // 强制重新渲染
              try {
                if (typeof mapInstance.render === 'function') {
                  mapInstance.render();
                } else {
                  // 通过轻微改变缩放级别来触发重新渲染
                  const currentZoom = mapInstance.getZoom();
                  mapInstance.setZoom(currentZoom);
                }
              } catch (renderError) {
                console.warn('地图重新渲染失败:', renderError);
              }
              console.log('✅ 3D视角设置完成');
            } catch (error) {
              console.warn('设置3D视角失败:', error);
            }
          }, 1000);
          
          // 地图加载完成后立即添加标记点
          updateMarkers();
        });

        // 监听地图错误（但不阻止正常操作）
        mapInstance.on('error', (error: any) => {
          console.warn('⚠️ 地图运行时警告:', error);
          // 不重新抛出错误，避免阻止地图操作
        });

        console.log('地图初始化完成，等待加载完成事件');

      } catch (error) {
        console.error('地图初始化失败:', error);
      }
    };

    initMap();

    // 清理函数
    return () => {
      console.log('开始清理地图组件...');
      
      // 恢复原始的 console.error
      if (originalConsoleError) {
        console.error = originalConsoleError;
      }
      
      // 重置状态标志
      mapReadyRef.current = false;
      
      // 清理标记点
      clearMarkers();
      
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

  // 监听标记点变化
  useEffect(() => {
    if (mapReadyRef.current) {
      updateMarkers();
    }
  }, [markers]); // 移除 selectedActivityId 依赖，避免选中状态变化时重新创建所有标记

  // 单独处理选中和悬停状态的变化，只更新样式而不重新创建标记
  useEffect(() => {
    if (mapReadyRef.current && markersRef.current.length > 0 && markersRef.current.length === markers.length) {
      markersRef.current.forEach((marker, index) => {
        const markerData = markers[index];
        if (markerData) {
          const isSelected = selectedActivityId === markerData.name;
          const markerIndex = markerData.activityIndex || (index + 1);
          try {
            // 只更新图标，不重新创建标记
            const newIcon = createMarkerIcon(markerData.type || 'other', markerIndex, isSelected);
            marker.setIcon(newIcon);
            marker.setzIndex(isSelected ? 1000 : 100);
          } catch (error) {
            console.warn('更新标记样式失败:', error);
          }
        }
      });
    }
  }, [selectedActivityId]); // 移除 markers 依赖，避免标记数据变化时重复更新

  // 监听选中活动变化，根据shouldCenterOnSelect决定是否自动居中到选中的景点
  useEffect(() => {
    if (mapReadyRef.current && mapInstanceRef.current && selectedActivityId) {
      // 查找选中的标记点
      const selectedMarker = markers.find(marker => marker.name === selectedActivityId);
      if (selectedMarker && 
          typeof selectedMarker.longitude === 'number' && 
          typeof selectedMarker.latitude === 'number' &&
          !isNaN(selectedMarker.longitude) && 
          !isNaN(selectedMarker.latitude)) {
        try {
          const newCenter = new (window as any).AMap.LngLat(selectedMarker.longitude, selectedMarker.latitude);
          mapInstanceRef.current.panTo(newCenter, 400, 'ease-in-out');
          console.log(`✅ 自动居中到选中景点: ${selectedMarker.name} (${selectedMarker.longitude}, ${selectedMarker.latitude})`);
        } catch (error) {
          console.warn('自动居中失败:', error);
        }
      }
    }
  }, [selectedActivityId, markers]);

  // 简化的容器尺寸监听
  useEffect(() => {
    if (!mapRef.current) return;

    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = setTimeout(() => {
        if (mapInstanceRef.current && mapRef.current && mapRef.current.isConnected && mapReadyRef.current) {
          try {
            if (typeof mapInstanceRef.current.getSize === 'function') {
              mapInstanceRef.current.getSize();
              console.log('地图尺寸调整完成');
            }
          } catch (error) {
            console.warn('调整地图尺寸时出错:', error);
          }
        }
      }, 200);
    };

    // 监听窗口尺寸变化
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener('resize', handleResize);
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
      title="💡 3D交互提示：右键拖拽可旋转视角，按住Shift+鼠标拖拽可调整倾斜角度，滚轮缩放可查看3D建筑"
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
