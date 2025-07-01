import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { APP_NAME } from '../constants';
import { AppView } from '../types';
import logoImage from "../components/Logo.png";
// 导入目的地图片
import beijing from '../assets/destinations/beijing.jpg';
import zhangjiajie from '../assets/destinations/zhangjiajie.jpg';
import shanghai from '../assets/destinations/shanghai.jpg';
import lijiang from '../assets/destinations/lijiang.jpg';
import tibet from '../assets/destinations/tibet.jpg';
import huangshan from '../assets/destinations/huangshan.jpg';
import guilin from '../assets/destinations/guilin.jpg';
import { useElderModeContext } from './ElderModeContext';
import '../src/elder-mode.css'; // 导入关怀模式专属样式

interface HomePageProps {
  setView: (view: AppView) => void;
  onShowSampleData?: () => void;
}

// --- 粒子效果组件 ---
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

const ParticleSystem: React.FC = () => {
  const { isElderMode } = useElderModeContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const createParticle = useCallback((index: number): Particle => {
    const colors = ['#60a5fa', '#38bdf8', '#a78bfa', '#f472b6', '#fbbf24']; // 更柔和的颜色
    return {
      id: index,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3, // 减慢速度
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5, // 减小粒子大小
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.2 + 0.05 // 降低透明度
    };
  }, []);

  useEffect(() => {
    if (isElderMode) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 初始化粒子 - 减少数量
    particlesRef.current = Array.from({ length: 30 }, (_, i) => createParticle(i));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 边界检测
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // 绘制粒子
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 绘制连接线 - 减少强度
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [createParticle, isElderMode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }} // 降低整体透明度
    />
  );
};

// --- 动态波浪效果组件 ---
const WaveAnimation: React.FC = () => {
  const { isElderMode } = useElderModeContext();
  if (isElderMode) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden z-0 opacity-80 pointer-events-none">
      <svg 
        className="waves w-full h-36 md:h-48 translate-y-1" 
        viewBox="24 24 150 28" 
        preserveAspectRatio="none" 
        shapeRendering="auto"
      >
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.1)" />
          </linearGradient>
        </defs>
        <g className="parallax">
          <use xlinkHref="#gentle-wave" x="48" y="0" fill="url(#wave-gradient)" />
          <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(186, 230, 253, 0.5)" />
          <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(125, 211, 252, 0.3)" />
          <use xlinkHref="#gentle-wave" x="48" y="7" fill="rgba(56, 189, 248, 0.2)" />
        </g>
      </svg>
    </div>
  );
};

// --- 漂浮的云朵效果 ---
const FloatingClouds: React.FC = () => {
  const { isElderMode } = useElderModeContext();
  if (isElderMode) return null;

  const clouds = [
    { size: 'w-24 h-12', position: 'top-[20%] left-[10%]', animation: 'animate-float-cloud-1', opacity: 'opacity-20' },
    { size: 'w-32 h-16', position: 'top-[15%] right-[15%]', animation: 'animate-float-cloud-2', opacity: 'opacity-15' },
    { size: 'w-20 h-10', position: 'top-[40%] left-[5%]', animation: 'animate-float-cloud-3', opacity: 'opacity-25' },
    { size: 'w-28 h-14', position: 'top-[35%] right-[8%]', animation: 'animate-float-cloud-4', opacity: 'opacity-18' },
  ];

  return (
    <>
      {clouds.map((cloud, index) => (
        <div
          key={`cloud-${index}`}
          className={`absolute ${cloud.size} ${cloud.position} ${cloud.animation} ${cloud.opacity} pointer-events-none z-0`}
        >
          <svg viewBox="0 0 100 50" className="w-full h-full text-sky-200 drop-shadow-sm">
            <path
              d="M20 35c-8 0-15-7-15-15s7-15 15-15c2 0 4 1 6 2 3-5 8-8 14-8 9 0 16 7 16 16 0 1 0 2-1 3 5 2 8 7 8 12 0 8-6 14-14 14H20z"
              fill="currentColor"
            />
          </svg>
        </div>
      ))}
    </>
  );
};

const PlaneIcon: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.432 11.042L14.471 7.427L10.553 1.348C10.126 0.583 9.017 0.583 8.589 1.348L4.671 7.427L0.592 9.531C-0.174 9.92-0.174 10.954 0.592 11.343L4.671 13.447L8.589 19.526C9.017 20.291 10.126 20.291 10.553 19.526L14.471 13.447L21.432 12.395C22.128 12.288 22.128 11.149 21.432 11.042Z"/>
  </svg>
);

const CompassStarIcon: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z M12 5.618L10.669 9.948L6.052 10.948L9.082 13.732L8.236 18.382L12 16.2L15.764 18.382L14.918 13.732L17.948 10.948L13.331 9.948L12 5.618Z"/>
  </svg>
);

const LocationPinIcon: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C7.589 0 4 3.589 4 8C4 12.411 12 24 12 24S20 12.411 20 8C20 3.589 16.411 0 12 0ZM12 12C10.343 12 9 10.657 9 9C9 7.343 10.343 6 12 6C13.657 6 15 7.343 15 9C15 10.657 13.657 12 12 12Z"/>
  </svg>
);

const SuitcaseIcon: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-5-2v2H9V4h6zM4 8h16v4h-3v-1h-2v1H9v-1H7v1H4V8zm0 11v-5h3v1h2v-1h6v1h2v-1h3v5H4z"/>
  </svg>
);

const CameraIcon: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14H4V7h16v12zM12 9c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const MountainIcon: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.5 14.5l-5-7-5 7h-3l-5-7-5 7v2h23v-2h0zM6 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
  </svg>
);

const TempleIcon: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 10.5h11v1h-11zM12 1l7.5 5H19v2h-1.5v12H19v2H5v-2h1.5V8H5V6h.5L12 1zM8.5 8v12h7V8h-7z"/>
  </svg>
);

// --- End SVG Icons ---


interface FloatingIconProps {
  IconComponent: React.FC<{ className?: string }>;
  style: React.CSSProperties;
  animationClass: string;
  colorClass: string;
}

const FloatingTravelIcon: React.FC<FloatingIconProps> = ({ IconComponent, style, animationClass, colorClass }) => (
  <div 
    className={`absolute z-0 text-slate-300/70 pointer-events-none ${animationClass}`}
    style={style}
  >
    <IconComponent className={`w-10 h-10 md:w-12 md:h-12 ${colorClass}`} />
  </div>
);


// --- 旅行统计信息面板 ---
const TravelStatsPanel: React.FC = () => {
  const [stats] = useState([
    { number: "1000+", label: "用户信任", icon: "👥", color: "from-blue-500 to-cyan-500" },
    { number: "50+", label: "覆盖城市", icon: "🏙️", color: "from-green-500 to-emerald-500" },
    { number: "100%", label: "满意度", icon: "⭐", color: "from-yellow-500 to-orange-500" },
    { number: "10/10", label: "智能服务", icon: "🤖", color: "from-purple-500 to-pink-500" }
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={`stat-${index}`}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-white/20 shadow-lg group-hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-2xl md:text-3xl mb-2 animate-bounce-slow">{stat.icon}</div>
              <div className={`text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.number}
              </div>
              <div className="text-xs md:text-sm text-slate-600 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 滚动目的地卡片 ---
const ScrollingDestinationPanel: React.FC = () => {
  // 使用本地图片
  const destinations = [
    { 
      name: "北京故宫", 
      imageUrl: beijing,
      theme: "皇家宫殿",
      color: "from-amber-500 to-red-500"
    },
    { 
      name: "张家界", 
      imageUrl: zhangjiajie,
      theme: "奇峰异石",
      color: "from-green-500 to-emerald-500"
    },
    { 
      name: "上海外滩", 
      imageUrl: shanghai,
      theme: "现代都市",
      color: "from-blue-500 to-indigo-500"
    },
    { 
      name: "云南丽江", 
      imageUrl: lijiang,
      theme: "古镇风情",
      color: "from-orange-500 to-amber-500"
    },
    { 
      name: "西藏布达拉宫", 
      imageUrl: tibet,
      theme: "神圣殿堂",
      color: "from-purple-500 to-pink-500"
    },
    { 
      name: "黄山日出", 
      imageUrl: huangshan,
      theme: "云海奇观",
      color: "from-yellow-500 to-amber-500"
    },
    { 
      name: "桂林山水", 
      imageUrl: guilin,
      theme: "山水画卷",
      color: "from-emerald-500 to-teal-500"
    },
    { 
      name: "九寨沟", 
      imageUrl: "https://source.unsplash.com/featured/?jiuzhaigou,lake",
      theme: "彩色湖泊",
      color: "from-sky-500 to-blue-500"
    }
  ];
  
  return (
    <div className="w-full overflow-hidden py-6 my-10 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent pointer-events-none"></div>
      <h3 className="text-center text-xl font-semibold text-slate-700 mb-6 relative z-10">
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">热门旅行目的地</span>
      </h3>
      <div className="flex animate-scrollX hover:pause">
        {[...destinations, ...destinations].map((destination, index) => {
          // 创建一个本地状态管理图片加载
          const [isLoading, setIsLoading] = useState(true);
          const [hasError, setHasError] = useState(false);
          
          // 使用本地后备图片，如果远程图片加载失败
          // 使用更美观的带渐变背景的文字作为图片回退方案
          const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(destination.name)}&background=0D8ABC&color=fff&size=200&font-size=0.33&bold=true`;
          
          return (
            <div 
              key={`dest-${index}`} 
              className="flex-shrink-0 w-72 h-48 mx-4 rounded-2xl overflow-hidden shadow-xl relative group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            >
              {isLoading && (
                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${destination.color}`}>
                  <div className="relative w-14 h-14">
                    {/* 渐变边框 */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse"></div>
                    {/* 旋转加载指示器 */}
                    <div className="absolute inset-0 border-4 border-transparent border-t-white border-r-white/70 rounded-full animate-spin"></div>
                    {/* 目的地名称 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/80 font-bold text-sm">{destination.name.substring(0, 2)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <img 
                src={hasError ? fallbackImage : destination.imageUrl} 
                alt={destination.name}
                loading="lazy"
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                } ${hasError ? 'bg-gradient-to-br ' + destination.color : ''}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  console.log(`Failed to load image for ${destination.name}`);
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h4 className="font-bold text-xl mb-1 drop-shadow-lg">{destination.name}</h4>
                <p className="text-sm text-blue-200 font-medium opacity-90">{destination.theme}</p>

              </div>
              

              
              {/* 添加目的地边框高亮 */}
              <div 
                className={`absolute inset-0 border-2 border-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl group-hover:scale-105 pointer-events-none bg-gradient-to-r ${destination.color}`}
                style={{
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'content-box, border-box',
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor'
                }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 精选旅行主题 ---
const InteractiveTravelThemes: React.FC = () => {
  const themes = [
    { id: 'nature', name: '自然风光', icon: '🏔️', color: 'from-green-400 to-emerald-600', description: '山川湖海，感受大自然的魅力' },
    { id: 'culture', name: '文化历史', icon: '🏛️', color: 'from-amber-400 to-orange-600', description: '古迹文物，探索历史的足迹' },
    { id: 'city', name: '都市风情', icon: '🏙️', color: 'from-blue-400 to-indigo-600', description: '繁华都市，体验现代生活' },
    { id: 'food', name: '美食之旅', icon: '🍜', color: 'from-red-400 to-pink-600', description: '地道美食，品味舌尖上的旅行' },
    { id: 'adventure', name: '户外探险', icon: '🧗', color: 'from-purple-400 to-violet-600', description: '挑战自我，享受刺激体验' },
    { id: 'relaxation', name: '休闲度假', icon: '🏖️', color: 'from-cyan-400 to-teal-600', description: '放松身心，享受悠闲时光' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto my-12 px-4">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
          精选<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">旅行主题</span>
        </h3>
        <p className="text-slate-600 max-w-2xl mx-auto">
          多样化的旅行主题展示 
          <span className="inline-block mx-2 text-slate-400">•</span>
          <span className="text-sm text-slate-500">（仅供参考展示）</span>
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="relative group transition-all duration-300 hover:scale-102"
          >
            <div className={`absolute -inset-1 bg-gradient-to-r ${theme.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300`}></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-3xl md:text-4xl mb-3 transform group-hover:scale-105 transition-transform duration-300">
                {theme.icon}
              </div>
              <h4 className="font-bold text-lg mb-2 text-slate-800 transition-colors duration-300">
                {theme.name}
              </h4>
              <p className="text-sm text-slate-600 transition-all duration-300 opacity-70 overflow-hidden">
                {theme.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 功能特点卡片 ---
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={`transform transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${delay}`}>
      <Card className="p-6 text-center bg-white/70 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl hover:shadow-sky-500/30 transition-all duration-300 h-full flex flex-col group relative overflow-hidden hover:-translate-y-1.5 hover:scale-105">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-1/3 group-hover:w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-b-full opacity-70 group-hover:opacity-100 transition-all duration-500 ease-out"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl"></div>
        
        <div className="relative z-10 flex-shrink-0 pt-2 pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:-rotate-[5deg] group-hover:shadow-lg group-hover:shadow-blue-400/50">
            {icon}
          </div>
        </div>

        <div className="relative z-10 flex-grow">
          <h3 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-300 mb-2">{title}</h3>
          <div className="h-0.5 w-8 group-hover:w-16 mx-auto bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-300 ease-out mb-3"></div>
          <p className="text-sm text-slate-600 group-hover:text-slate-700 leading-relaxed min-h-[4.5rem]">{description}</p>
        </div>
      </Card>
    </div>
  );
};

export const HomePage: React.FC<HomePageProps> = ({ setView }) => {
  const { isElderMode } = useElderModeContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 在关怀模式下使用更加极简优雅的页面结构
  if (isElderMode) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 py-10 elder-mode-background">
        {/* 关怀模式切换按钮 */}

        
        <div className="elder-header-content">
          {/* Logo容器 - 放大版 */}
          <div className="elder-logo-container">
            <img 
              src={logoImage} 
              alt={APP_NAME}
              className="w-44 h-44 object-contain"
            />
          </div>
          
          {/* 主标题 - 更大更显著 */}
          <h1 className="elder-main-title text-center" style={{ transform: 'scale(1.1)' }}>
            智游无界
          </h1>
        </div>
        
        {/* 简洁介绍文本 - 放大版 */}
        <div className="elder-intro-container">
          <p className="text-3xl text-center text-slate-700 max-w-2xl leading-relaxed font-medium">
            您的个性化智能旅行助手。<br />
            <span className="text-blue-600 font-bold">AI</span>为您量身定制完美行程。
          </p>
        </div>
        
        {/* 主要行动按钮 */}
        <div className="elder-button-container">
          <Button 
            size="lg" 
            onClick={() => setView(AppView.DemandInput)}
            className="elder-main-button"
          >
            <span className="elder-button-text">开始规划我的旅行</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen text-center px-4 pt-24 pb-12 overflow-hidden ${isElderMode ? 'elder-mode-background' : ''}`}>
      {/* 关怀模式切换按钮 */}

      
      {/* 普通模式下的装饰元素 */}
      {!isElderMode && (
        <>
          <ParticleSystem />
          <FloatingClouds />
          <WaveAnimation />
          <FloatingTravelIcon IconComponent={LocationPinIcon} style={{ top: '15%', left: '5%' }} animationClass="animate-float-gentle" colorClass="text-blue-300" />
          <FloatingTravelIcon IconComponent={SuitcaseIcon} style={{ top: '60%', left: '8%' }} animationClass="animate-float-gentle animation-delay-500" colorClass="text-purple-300" />
          <FloatingTravelIcon IconComponent={CameraIcon} style={{ top: '25%', right: '6%' }} animationClass="animate-float-gentle" colorClass="text-pink-300" />
          <FloatingTravelIcon IconComponent={MountainIcon} style={{ bottom: '20%', right: '10%' }} animationClass="animate-float-gentle animation-delay-500" colorClass="text-teal-300" />
          <FloatingTravelIcon IconComponent={TempleIcon} style={{ bottom: '30%', left: '15%' }} animationClass="animate-float-gentle" colorClass="text-amber-300" />
        </>
      )}
      
      {/* 主要内容容器 */}
      <div className={`relative z-10 flex flex-col items-center justify-center w-full max-w-5xl transition-opacity duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 页面标题和介绍 */}
        <header className={`mb-8 md:mb-10 transform transition-all duration-1000 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} elder:transition-none elder:transform-none`}>
          <div className="relative group mb-8">
            {/* 更加活泼的背景装饰 */}
            <div className="absolute -inset-8 bg-gradient-to-r from-blue-100/40 via-purple-50/30 to-pink-100/40 rounded-full blur-3xl opacity-70 group-hover:opacity-90 transition-all duration-1000"></div>
            
            {/* Logo 容器 - 现代化3D风格 */}
            <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-8">
              {/* 浮动背景圆环 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-pink-400/20 animate-pulse-gentle"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/40 shadow-2xl"></div>
              
              {/* 主Logo区域 - 3D效果 */}
              <div className="absolute inset-4 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 rounded-full flex items-center justify-center shadow-xl overflow-hidden transition-all duration-700 ease-out hover:scale-110 group-hover:shadow-2xl group-hover:shadow-blue-200/40 border-2 border-gradient-to-r from-blue-200/40 via-purple-200/30 to-pink-200/40">
                <img 
                  src={logoImage} 
                  alt="智游无界 - AI旅行规划助手" 
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-2"
                />
                
                {/* 动态光效覆盖 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-blue-200/10 to-purple-200/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
              
              {/* 动态装饰元素 */}
              <div className="absolute -top-2 right-4 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce-gentle shadow-lg"></div>
              <div className="absolute -bottom-3 left-3 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float-gentle shadow-lg"></div>
              <div className="absolute top-3 -left-2 w-3.5 h-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse-gentle shadow-lg"></div>
              <div className="absolute bottom-4 -right-2 w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full animate-bounce-gentle animation-delay-500 shadow-lg"></div>
              
              {/* 旋转光环 */}
              <div className="absolute -inset-1 rounded-full border-2 border-dashed border-gradient-to-r from-blue-300/50 via-purple-300/30 to-pink-300/50 animate-spin-slow opacity-0 group-hover:opacity-60 transition-all duration-700"></div>
            </div>
          </div>
          
          {/* 现代化大标题 - 3D文字效果 */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight relative">
              {/* 背景阴影文字 */}
              <span className="absolute inset-0 bg-gradient-to-r from-gray-300/40 via-gray-400/30 to-gray-300/40 bg-clip-text text-transparent blur-sm transform translate-x-1 translate-y-1">
                智游无界
              </span>
              {/* 主文字 - 渐变效果 */}
              <span className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                智游无界
              </span>
              {/* 高光效果 */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-clip-text text-transparent animate-shimmer">
                智游无界
              </span>
            </h1>
            
            {/* 动态装饰线 */}
            <div className="flex justify-center items-center mb-6">
              <div className="h-px w-48 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse"></div>
            </div>
          </div>
          
          {/* 现代化介绍文字 */}
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium mb-4">
              您的专属 <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-lg font-bold shadow-lg">AI</span> 旅行规划师
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              🌟 智能分析偏好 • 🎯 精准匹配路线 • ✨ 个性化体验定制
            </p>
          </div>
          
          {/* 现代化功能标签 - 卡片风格 */}
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "城市探索", emoji: "🏙️", color: "from-blue-400 to-cyan-400" },
              { name: "自然风光", emoji: "🌲", color: "from-green-400 to-emerald-400" },
              { name: "文化体验", emoji: "🎭", color: "from-purple-400 to-violet-400" },
              { name: "美食之旅", emoji: "🍜", color: "from-orange-400 to-amber-400" },
              { name: "户外冒险", emoji: "⛰️", color: "from-teal-400 to-green-400" },
              { name: "摄影之旅", emoji: "📸", color: "from-pink-400 to-rose-400" },
            ].map((tag, index) => (
              <div
                key={`tag-${index}`}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 border border-white/40 cursor-pointer"
                style={{ 
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* 卡片背景渐变 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tag.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                
                {/* 内容 */}
                <div className="relative z-10 text-center">
                  <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {tag.emoji}
                  </div>
                  <div className="text-sm font-medium text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    {tag.name}
                  </div>
                </div>
                
                {/* 底部装饰线 */}
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${tag.color} rounded-full group-hover:w-3/4 transition-all duration-300`}></div>
              </div>
            ))}
          </div>
        </header>

        {/* 主要行动按钮 - 现代化设计 */}
        <main className={`mb-12 transform transition-all duration-1000 ease-out delay-300 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} elder:transition-none elder:transform-none`}>
          <div className="relative group">
            {/* 按钮背景光效 */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/30 via-purple-400/20 to-pink-400/30 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
            
            <Button 
              size="lg" 
              onClick={() => setView(AppView.DemandInput)}
              className="relative px-16 py-6 text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 border border-white/10 backdrop-blur-sm overflow-hidden"
            >
              {/* 按钮内部动态效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* 按钮内容 */}
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white filter drop-shadow-sm">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <span className="tracking-wide text-white drop-shadow-sm">开始我的AI旅行规划</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce-gentle shadow-sm"></div>
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce-gentle animation-delay-200 shadow-sm"></div>
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce-gentle animation-delay-400 shadow-sm"></div>
                </div>
              </div>
              
              {/* 底部装饰条 */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>
          
          {/* 辅助提示文字 */}
          <p className="mt-6 text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            🚀 只需用自然语言描述您的想法<br />
            ✨ AI将为您智能规划完美行程
          </p>
        </main>

        {/* 非核心内容 - 在老人模式下隐藏 */}
        {!isElderMode && (
          <>
            {/* 现代化亮点展示面板 */}
            <div className={`w-full max-w-6xl mx-auto mb-12 px-4 transform transition-all duration-1000 ease-out delay-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-pink-50/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/40 shadow-2xl relative overflow-hidden">
                {/* 背景装饰 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                      为什么选择智游无界
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                      领先的AI技术，为您带来前所未有的旅行规划体验
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        icon: "🎯",
                        title: "精准匹配",
                        description: "AI深度理解需求",
                        color: "from-blue-400 to-cyan-400"
                      },
                      {
                        icon: "⚡",
                        title: "秒速生成",
                        description: "3秒完成行程规划",
                        color: "from-purple-400 to-violet-400"
                      },
                      {
                        icon: "🌟",
                        title: "品质保证",
                        description: "精选优质景点",
                        color: "from-pink-400 to-rose-400"
                      },
                      {
                        icon: "💎",
                        title: "完全免费",
                        description: "无隐藏费用",
                        color: "from-emerald-400 to-teal-400"
                      }
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-white/40"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          {feature.icon}
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2 text-lg">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                        
                        {/* 底部装饰条 */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 旅行统计信息 */}
            <div className={`transform transition-all duration-1000 ease-out delay-600 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <TravelStatsPanel />
            </div>

            {/* 滚动旅行目的地展示 */}
            <div className={`w-full max-w-6xl mx-auto transform transition-all duration-1000 ease-out delay-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <ScrollingDestinationPanel />
            </div>

            {/* 精选旅行主题展示区域 */}
            <div className={`transform transition-all duration-1000 ease-out delay-800 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <InteractiveTravelThemes />
            </div>

            {/* 功能特点展示 */}
            <section className="w-full max-w-6xl px-4 mb-10 md:mb-16 relative z-10">
              <div className="text-center mb-8 transform transition-all duration-700 ease-out delay-[900ms] opacity-0 translate-y-10" style={{ opacity: isMounted ? 1 : 0, transform: isMounted ? 'translateY(0)' : 'translateY(40px)' }}>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">智能旅行规划特色</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">体验AI驱动的旅行规划，让您的旅程更加轻松愉快</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <FeatureCard
                  icon={<span className="text-2xl">💬</span>}
                  title="自然语言交互"
                  description="像聊天一样描述您的需求，AI即可理解并规划。无需复杂操作，简单交流即可。"
                  delay="delay-[1000ms]"
                />
                <FeatureCard
                  icon={<span className="text-2xl">🎨</span>}
                  title="个性化定制"
                  description="根据您的兴趣、预算和时间，打造独一无二的旅程。每次旅行都与众不同。"
                  delay="delay-[1100ms]"
                />
                <FeatureCard
                  icon={<span className="text-2xl">🗺️</span>}
                  title="智能行程规划"
                  description="自动安排景点、餐饮、交通，省时省心。贴心建议让您的旅途更加顺畅愉快。"
                  delay="delay-[1200ms]"
                />
              </div>
            </section>

            {/* 交互式分割线 */}
            <div className="w-full max-w-4xl mx-auto mb-10 opacity-30 flex items-center justify-center">
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
              <CompassStarIcon className="mx-4 text-slate-400 w-6 h-6 rotate-12 animate-pulse-gentle" />
              <PlaneIcon className="mx-4 text-slate-400 w-6 h-6 -rotate-45 animate-float-gentle" />
              <CompassStarIcon className="mx-4 text-slate-400 w-6 h-6 -rotate-12 animate-pulse-gentle" />
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            </div>

            {/* 使用步骤展示 */}
            <section className={`w-full max-w-5xl px-4 mb-12 transform transition-all duration-1000 ease-out delay-[1300ms] ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} elder:transition-none elder:transform-none`}>
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-8 elder:text-3xl">简单三步，开始您的旅程</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                {/* 连接线 - 仅在中等屏幕上显示 */}
                <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-500 elder:hidden"></div>
                
                {/* 步骤1 */}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg z-10 transform hover:scale-110 transition-transform duration-300 elder:transform-none elder:w-16 elder:h-16 elder:text-2xl">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 elder:text-xl">描述您的需求</h3>
                  <p className="text-slate-600 text-sm elder:text-base">告诉AI您的旅行偏好、目的地想法和时间预算</p>
                </div>
                
                {/* 步骤2 */}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg z-10 transform hover:scale-110 transition-transform duration-300 elder:transform-none elder:w-16 elder:h-16 elder:text-2xl">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 elder:text-xl">获取智能推荐</h3>
                  <p className="text-slate-600 text-sm elder:text-base">AI根据您的需求生成个性化旅行计划</p>
                </div>
                
                {/* 步骤3 */}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-xl font-bold shadow-lg z-10 transform hover:scale-110 transition-transform duration-300 elder:transform-none elder:w-16 elder:h-16 elder:text-2xl">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 elder:text-xl">调整并确认</h3>
                  <p className="text-slate-600 text-sm elder:text-base">根据自己的喜好灵活调整，最终确定完美行程</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <footer className={`relative z-10 w-full py-8 text-center text-slate-600 ${isElderMode ? 'text-base' : 'text-sm'} transition-opacity duration-1000 ease-out delay-[800ms] ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className={`flex justify-center ${isElderMode ? 'space-x-8' : 'space-x-4'} mb-3`}>
            {['关于我们', '使用条款', '隐私政策', '联系我们'].map((item, i) => (
              <a key={i} href="#" className={`${isElderMode ? 'text-blue-600 font-medium text-lg' : 'text-slate-500'} hover:text-blue-500 transition-colors`}>{item}</a>
            ))}
          </div>
          <p className={isElderMode ? 'text-base mt-4' : ''}>© {new Date().getFullYear()} {APP_NAME}. 版权所有.</p>
        </div>
      </footer>
    </div>
  );
};
