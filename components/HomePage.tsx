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
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }} // 降低整体透明度
    />
  );
};

// --- 3D旋转地球仪效果组件 ---
const RotatingGlobe: React.FC = () => {
  return (
    <div className="absolute top-1/4 right-10 w-32 h-32 opacity-10 pointer-events-none animate-spin-slow">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-300 animate-pulse"></div>
        <div className="absolute inset-2 rounded-full border border-sky-400 opacity-60"></div>
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 opacity-40 animate-bounce-slow"></div>
        <svg className="absolute inset-6 w-20 h-20 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
    </div>
  );
};

// --- 动态波浪效果组件 ---
const WaveAnimation: React.FC = () => (
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

// --- 漂浮的云朵效果 ---
const FloatingClouds: React.FC = () => {
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

interface AuroraBlobProps {
  className: string;
  animationClass: string;
}

const AuroraBlob: React.FC<AuroraBlobProps> = ({ className, animationClass }) => (
  <div className={`absolute -z-10 rounded-full filter blur-3xl mix-blend-multiply ${className} ${animationClass}`}></div>
);

// --- 增强的SVG图标组件 ---
const PlaneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.432 11.042L14.471 7.427L10.553 1.348C10.126 0.583 9.017 0.583 8.589 1.348L4.671 7.427L0.592 9.531C-0.174 9.92-0.174 10.954 0.592 11.343L4.671 13.447L8.589 19.526C9.017 20.291 10.126 20.291 10.553 19.526L14.471 13.447L21.432 12.395C22.128 12.288 22.128 11.149 21.432 11.042Z"/>
  </svg>
);

const CompassStarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z M12 5.618L10.669 9.948L6.052 10.948L9.082 13.732L8.236 18.382L12 16.2L15.764 18.382L14.918 13.732L17.948 10.948L13.331 9.948L12 5.618Z"/>
  </svg>
);

const LocationPinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C7.589 0 4 3.589 4 8C4 12.411 12 24 12 24S20 12.411 20 8C20 3.589 16.411 0 12 0ZM12 12C10.343 12 9 10.657 9 9C9 7.343 10.343 6 12 6C13.657 6 15 7.343 15 9C15 10.657 13.657 12 12 12Z"/>
  </svg>
);

const SuitcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-5-2v2H9V4h6zM4 8h16v4h-3v-1h-2v1H9v-1H7v1H4V8zm0 11v-5h3v1h2v-1h6v1h2v-1h3v5H4z"/>
  </svg>
);

const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14H4V7h16v12zM12 9c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const MountainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.5 14.5l-5-7-5 7h-3l-5-7-5 7v2h23v-2h0zM6 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
  </svg>
);

const BeachIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.127 14.56l1.43-1.43 6.44 6.44-1.43 1.43-6.44-6.44zM17.42 10.15l2.12-2.12c2.73-2.73 2.73-7.17 0-9.9L17.42 0l1.41 1.41c1.95 1.95 1.95 5.12 0 7.07l-2.12 2.12 1.42 1.42-1.42 1.42zM8.42 8.58L12 5l3.58 3.58-1.42 1.42L12 7.83 9.84 10l-1.42-1.42zM1.29 13.29L2.71 11.88l4.58 4.58-1.42 1.42-4.58-4.59zM19 19H5v2h14v-2z"/>
  </svg>
);

const TempleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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
  <div className={`absolute -z-5 pointer-events-none ${animationClass}`} style={style}>
    <IconComponent className={`w-full h-full ${colorClass}`} />
  </div>
);

// --- 浮动emoji元素 ---
const FloatingEmojiElements: React.FC = () => {
  const emojiElements = [
    // 左侧emoji元素
    { emoji: '✈️', style: { top: '20%', left: '1%', fontSize: '28px', opacity: 0.4, animationDelay: '0s', animationDuration: '15s' }, animationClass: 'animate-float' },
    { emoji: '🗺️', style: { top: '45%', left: '4%', fontSize: '32px', opacity: 0.35, animationDelay: '2s', animationDuration: '18s' }, animationClass: 'animate-float-soft' },
    { emoji: '🎒', style: { top: '72%', left: '2%', fontSize: '30px', opacity: 0.38, animationDelay: '4s', animationDuration: '20s' }, animationClass: 'animate-fade-in-out' },
    { emoji: '📸', style: { top: '10%', left: '6%', fontSize: '26px', opacity: 0.42, animationDelay: '6s', animationDuration: '16s' }, animationClass: 'animate-soft-pulse' },
    { emoji: '🏔️', style: { top: '85%', left: '3%', fontSize: '34px', opacity: 0.33, animationDelay: '8s', animationDuration: '22s' }, animationClass: 'animate-float' },
    { emoji: '🌍', style: { top: '60%', left: '1%', fontSize: '29px', opacity: 0.37, animationDelay: '10s', animationDuration: '19s' }, animationClass: 'animate-float-soft' },
    
    // 右侧emoji元素
    { emoji: '🏖️', style: { top: '15%', right: '1%', fontSize: '31px', opacity: 0.36, animationDelay: '1s', animationDuration: '17s' }, animationClass: 'animate-fade-in-out' },
    { emoji: '🕌', style: { top: '40%', right: '4%', fontSize: '28px', opacity: 0.4, animationDelay: '3s', animationDuration: '21s' }, animationClass: 'animate-float' },
    { emoji: '🎪', style: { top: '68%', right: '2%', fontSize: '30px', opacity: 0.34, animationDelay: '5s', animationDuration: '18s' }, animationClass: 'animate-soft-pulse' },
    { emoji: '🗽', style: { top: '25%', right: '6%', fontSize: '33px', opacity: 0.32, animationDelay: '7s', animationDuration: '24s' }, animationClass: 'animate-float-soft' },
    { emoji: '🚁', style: { top: '90%', right: '3%', fontSize: '27px', opacity: 0.41, animationDelay: '9s', animationDuration: '16s' }, animationClass: 'animate-float' },
    { emoji: '⛩️', style: { top: '55%', right: '1%', fontSize: '29px', opacity: 0.38, animationDelay: '11s', animationDuration: '20s' }, animationClass: 'animate-fade-in-out' },
    
    // 更多散布的元素
    { emoji: '🎭', style: { top: '8%', left: '15%', fontSize: '24px', opacity: 0.25, animationDelay: '12s', animationDuration: '25s' }, animationClass: 'animate-soft-pulse' },
    { emoji: '🏛️', style: { top: '35%', right: '15%', fontSize: '26px', opacity: 0.28, animationDelay: '13s', animationDuration: '23s' }, animationClass: 'animate-float' },
    { emoji: '🌸', style: { top: '78%', left: '12%', fontSize: '25px', opacity: 0.3, animationDelay: '14s', animationDuration: '19s' }, animationClass: 'animate-float-soft' },
    { emoji: '🎌', style: { top: '92%', right: '12%', fontSize: '23px', opacity: 0.26, animationDelay: '15s', animationDuration: '21s' }, animationClass: 'animate-fade-in-out' },
  ];

  return (
    <>
      {emojiElements.map((element, index) => (
        <div
          key={`emoji-${index}`}
          className={`absolute pointer-events-none z-1 select-none ${element.animationClass}`}
          style={{
            ...element.style,
            animationDelay: element.style.animationDelay,
            animationDuration: element.style.animationDuration
          }}
        >
          <span className="block transform-gpu transition-transform duration-300 hover:scale-110">
            {element.emoji}
          </span>
        </div>
      ))}
    </>
  );
};

// --- 装饰性旅行路径线条 ---
const TravelPathLines: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 左侧装饰线条 */}
      <div className="absolute left-0 top-1/4 w-32 h-px bg-gradient-to-r from-transparent via-blue-200/30 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute left-4 top-1/2 w-24 h-px bg-gradient-to-r from-transparent via-purple-200/25 to-transparent animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
      <div className="absolute left-2 top-3/4 w-28 h-px bg-gradient-to-r from-transparent via-teal-200/35 to-transparent animate-pulse" style={{ animationDelay: '1s', animationDuration: '6s' }}></div>
      
      {/* 右侧装饰线条 */}
      <div className="absolute right-0 top-1/3 w-30 h-px bg-gradient-to-l from-transparent via-pink-200/30 to-transparent animate-pulse" style={{ animationDuration: '4.5s' }}></div>
      <div className="absolute right-4 top-2/3 w-26 h-px bg-gradient-to-l from-transparent via-orange-200/25 to-transparent animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '5.5s' }}></div>
      <div className="absolute right-2 top-5/6 w-32 h-px bg-gradient-to-l from-transparent via-cyan-200/35 to-transparent animate-pulse" style={{ animationDelay: '3s', animationDuration: '4s' }}></div>
      
      {/* 对角线装饰 */}
      <div className="absolute top-10 left-10 w-20 h-20 border border-dashed border-blue-200/20 rounded-full animate-spin-slow opacity-40"></div>
      <div className="absolute bottom-16 right-12 w-16 h-16 border border-dashed border-purple-200/25 rounded-full animate-spin-slow opacity-35" style={{ animationDirection: 'reverse', animationDuration: '25s' }}></div>
    </div>
  );
};


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

// --- 增强版滚动卡片式旅行风景展示 ---
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

// --- 互动式旅行统计展示 ---
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

// --- 精选旅行主题展示 ---
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

export const HomePage: React.FC<HomePageProps> = ({ setView }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const parallaxRef = useRef<HTMLDivElement>(null);

  // 鼠标位置跟踪用于视差效果
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (parallaxRef.current) {
        const { clientX, clientY } = e;
        const { width, height } = parallaxRef.current.getBoundingClientRect();
        const x = (clientX / width - 0.5) * 20;  // -10 to 10
        const y = (clientY / height - 0.5) * 20; // -10 to 10
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    const timer = setTimeout(() => setIsMounted(true), 100);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  const auroraBlobs = [
    { className: 'w-72 h-72 sm:w-96 sm:h-96 top-[5%] left-[5%] bg-gradient-to-br from-sky-300 to-blue-400 opacity-60', animationClass: 'animate-aurora-blob-1' },
    { className: 'w-60 h-60 sm:w-80 sm:h-80 top-[20%] right-[10%] bg-gradient-to-br from-purple-300 to-pink-300 opacity-50', animationClass: 'animate-aurora-blob-2' },
    { className: 'w-52 h-52 sm:w-72 sm:h-72 bottom-[15%] left-[25%] bg-gradient-to-br from-teal-200 to-cyan-300 opacity-40', animationClass: 'animate-aurora-blob-3' },
    { className: 'w-48 h-48 sm:w-64 sm:h-64 bottom-[5%] right-[20%] bg-gradient-to-br from-orange-200 to-yellow-300 opacity-30', animationClass: 'animate-aurora-blob-4' },
  ];
  
  const floatingIconsData = [
    // 原有的图标
    { IconComponent: PlaneIcon, style: { top: '15%', left: '80%', width: '60px', height: '60px', opacity: 0.2, animationDelay: '0s', animationDuration: '18s' }, colorClass: 'text-sky-300' },
    { IconComponent: CompassStarIcon, style: { top: '70%', left: '10%', width: '50px', height: '50px', opacity: 0.25, animationDelay: '3s',  animationDuration: '20s' }, colorClass: 'text-purple-300' },
    { IconComponent: LocationPinIcon, style: { top: '40%', left: '45%', width: '40px', height: '40px', opacity: 0.15, animationDelay: '1s',  animationDuration: '16s' }, colorClass: 'text-pink-300' },
    { IconComponent: PlaneIcon, style: { top: '85%', left: '60%', width: '45px', height: '45px', opacity: 0.2, animationDelay: '5s',  animationDuration: '22s' }, colorClass: 'text-orange-200' },
    { IconComponent: CompassStarIcon, style: { top: '5%', left: '30%', width: '35px', height: '35px', opacity: 0.3, animationDelay: '2s',  animationDuration: '17s' }, colorClass: 'text-teal-200' },
    { IconComponent: SuitcaseIcon, style: { top: '25%', left: '70%', width: '42px', height: '42px', opacity: 0.2, animationDelay: '4s',  animationDuration: '19s' }, colorClass: 'text-blue-300' },
    { IconComponent: CameraIcon, style: { top: '60%', left: '85%', width: '38px', height: '38px', opacity: 0.25, animationDelay: '2.5s',  animationDuration: '21s' }, colorClass: 'text-indigo-300' },
    { IconComponent: MountainIcon, style: { top: '50%', left: '20%', width: '55px', height: '55px', opacity: 0.15, animationDelay: '1.5s',  animationDuration: '23s' }, colorClass: 'text-emerald-300' },
    
    // 新增的左侧元素
    { IconComponent: BeachIcon, style: { top: '30%', left: '5%', width: '48px', height: '48px', opacity: 0.18, animationDelay: '6s',  animationDuration: '24s' }, colorClass: 'text-cyan-300' },
    { IconComponent: TempleIcon, style: { top: '55%', left: '8%', width: '52px', height: '52px', opacity: 0.22, animationDelay: '7s',  animationDuration: '26s' }, colorClass: 'text-amber-300' },
    { IconComponent: SuitcaseIcon, style: { top: '12%', left: '3%', width: '44px', height: '44px', opacity: 0.16, animationDelay: '8s',  animationDuration: '19s' }, colorClass: 'text-rose-300' },
    { IconComponent: PlaneIcon, style: { top: '78%', left: '2%', width: '58px', height: '58px', opacity: 0.2, animationDelay: '9s',  animationDuration: '25s' }, colorClass: 'text-blue-300' },
    { IconComponent: CameraIcon, style: { top: '92%', left: '6%', width: '46px', height: '46px', opacity: 0.19, animationDelay: '10s',  animationDuration: '21s' }, colorClass: 'text-violet-300' },
    
    // 新增的右侧元素
    { IconComponent: MountainIcon, style: { top: '8%', right: '4%', width: '56px', height: '56px', opacity: 0.17, animationDelay: '11s',  animationDuration: '27s' }, colorClass: 'text-green-300' },
    { IconComponent: LocationPinIcon, style: { top: '35%', right: '2%', width: '50px', height: '50px', opacity: 0.21, animationDelay: '12s',  animationDuration: '20s' }, colorClass: 'text-pink-300' },
    { IconComponent: CompassStarIcon, style: { top: '58%', right: '7%', width: '54px', height: '54px', opacity: 0.16, animationDelay: '13s',  animationDuration: '24s' }, colorClass: 'text-indigo-300' },
    { IconComponent: BeachIcon, style: { top: '80%', right: '3%', width: '49px', height: '49px', opacity: 0.18, animationDelay: '14s',  animationDuration: '22s' }, colorClass: 'text-teal-300' },
    { IconComponent: TempleIcon, style: { top: '22%', right: '5%', width: '47px', height: '47px', opacity: 0.2, animationDelay: '15s',  animationDuration: '28s' }, colorClass: 'text-orange-300' },
    { IconComponent: CameraIcon, style: { top: '95%', right: '8%', width: '45px', height: '45px', opacity: 0.15, animationDelay: '16s',  animationDuration: '23s' }, colorClass: 'text-purple-300' },
    
    // 更多中间区域的装饰元素
    { IconComponent: SuitcaseIcon, style: { top: '18%', left: '25%', width: '32px', height: '32px', opacity: 0.12, animationDelay: '17s',  animationDuration: '30s' }, colorClass: 'text-sky-200' },
    { IconComponent: PlaneIcon, style: { top: '65%', left: '75%', width: '36px', height: '36px', opacity: 0.14, animationDelay: '18s',  animationDuration: '26s' }, colorClass: 'text-emerald-200' },
    { IconComponent: MountainIcon, style: { top: '88%', left: '35%', width: '40px', height: '40px', opacity: 0.13, animationDelay: '19s',  animationDuration: '29s' }, colorClass: 'text-pink-200' },
    { IconComponent: LocationPinIcon, style: { top: '10%', left: '65%', width: '34px', height: '34px', opacity: 0.11, animationDelay: '20s',  animationDuration: '31s' }, colorClass: 'text-cyan-200' },
  ];

  // 带有配色方案和精选图标的旅行标签
  const travelTags = [
    { name: "城市探索", emoji: "🏙️", colorClass: "blue" },
    { name: "自然风光", emoji: "🌲", colorClass: "green" }, // 更换为松树图标
    { name: "文化体验", emoji: "🎭", colorClass: "purple" },
    { name: "美食之旅", emoji: "🍣", colorClass: "orange" },
    { name: "户外冒险", emoji: "⛰️", colorClass: "teal" }, // 更换为山脉图标
    { name: "摄影之旅", emoji: "🎞️", colorClass: "pink" }, // 更换为胶片图标
    { name: "历史遗迹", emoji: "🏛️", colorClass: "amber" },
    { name: "博物馆", emoji: "🖼️", colorClass: "indigo" }, // 更换为画作图标
    { name: "海岛度假", emoji: "🏖️", colorClass: "cyan" }, // 更换为沙滩图标
    { name: "温泉胜地", emoji: "♨️", colorClass: "rose" }
  ];

  return (
    <div ref={parallaxRef} className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-blue-50/50 to-sky-50/80 relative overflow-hidden">
      {/* 背景装饰物 */}
      <div className="absolute h-full w-full overflow-hidden pointer-events-none">
        {/* Aurora Blobs Background - 调整颜色强度 */}
        {auroraBlobs.map((blob, index) => (
          <AuroraBlob key={`aurora-${index}`} className={blob.className.replace('opacity-60', 'opacity-30').replace('opacity-50', 'opacity-25').replace('opacity-40', 'opacity-20').replace('opacity-30', 'opacity-15')} animationClass={blob.animationClass} />
        ))}
        
        {/* 粒子背景效果 */}
        <ParticleSystem />

        {/* 3D旋转地球仪效果 */}
        <RotatingGlobe />

        {/* 动态网格背景 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] z-0"></div>
        
        {/* 世界地图轮廓 - 虚线装饰 */}
        <div 
          className="absolute top-0 left-0 right-0 bottom-0 opacity-[0.03] z-0"
          style={{
            backgroundImage: 'url("https://cdn.jsdelivr.net/npm/world-map-svg@0.0.2/vectors/world-low-resolution.svg")',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            transform: `translate3d(${mousePosition.x * -0.5}px, ${mousePosition.y * -0.5}px, 0)`,
            transition: 'transform 0.1s ease-out'
          }}
        ></div>
      </div>

      {/* 装饰性图标 */}
      {floatingIconsData.map((iconData, index) => (
        <FloatingTravelIcon 
          key={`float-${index}`} 
          IconComponent={iconData.IconComponent} 
          style={iconData.style} 
          animationClass="animate-float" 
          colorClass={iconData.colorClass}
        />
      ))}

      {/* 浮动emoji元素 */}
      <FloatingEmojiElements />

      {/* 装饰性旅行路径线条 */}
      <TravelPathLines />

      {/* 漂浮云朵效果 */}
      <FloatingClouds />

      {/* 波浪动画 */}
      <WaveAnimation />
      
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 text-center pt-12 md:pt-16">
        <header className={`max-w-3xl mb-6 md:mb-8 transform transition-all duration-1000 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative group mb-8">
            {/* 精致的光晕效果 - 减少强度 */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-sky-400/20 via-blue-400/15 to-indigo-400/20 opacity-60 group-hover:opacity-80 blur-2xl transition duration-700 group-hover:duration-300"></div>
            
            {/* Logo 容器 */}
            <div className="relative w-36 h-36 md:w-44 md:h-44 mx-auto">
              {/* 装饰性外圆环 */}
              <div className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-sky-300/30 via-blue-300/20 to-indigo-300/30 animate-pulse-slow"></div>
              <div className="absolute inset-2 rounded-full border border-sky-200/40 opacity-60"></div>
              
              {/* 主要Logo区域 */}
              <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden transition-all duration-500 ease-out hover:scale-105 group-hover:shadow-sky-200/50 border border-white/80">
                <img 
                  src={logoImage} 
                  alt="品牌Logo - 智游无界" 
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                
                {/* Logo 上的精致装饰 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* 旋转装饰环 */}
              <div className="absolute -inset-1 rounded-full border border-dashed border-sky-300/40 animate-spin-slow opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              
              {/* 浮动装饰点 */}
              <div className="absolute -top-1 right-3 w-3 h-3 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full opacity-70 animate-bounce-slow"></div>
              <div className="absolute -bottom-2 left-2 w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute top-2 -left-1 w-2.5 h-2.5 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full opacity-50 animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
          
          <h1 className={`text-6xl md:text-7xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 animate-text-shimmer [text-shadow:0_2px_8px_rgba(100,150,255,0.3)]`}>
            {APP_NAME}
          </h1>
          
          <p className={`text-lg md:text-xl text-slate-700 max-w-2xl mx-auto transition-opacity duration-1000 ease-out delay-200 leading-relaxed ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            您的个性化智能旅行助手。通过自然语言轻松对话，<span className="text-blue-600 font-medium">AI</span>为您量身定制完美行程。
          </p>
          
          {/* 优雅简洁的旅行标签云 */}
          <div className="max-w-4xl mx-auto mt-8 flex flex-wrap justify-center items-center gap-3">
            {travelTags.map((tag, index) => {
              // 为不同标签配置渐变颜色
              let gradient = '';
              switch(tag.colorClass) {
                case 'blue': gradient = 'from-blue-500 to-cyan-400'; break;
                case 'green': gradient = 'from-emerald-500 to-teal-400'; break;
                case 'purple': gradient = 'from-purple-500 to-violet-400'; break;
                case 'orange': gradient = 'from-orange-500 to-amber-400'; break;
                case 'teal': gradient = 'from-teal-500 to-green-400'; break;
                case 'pink': gradient = 'from-pink-500 to-rose-400'; break;
                case 'amber': gradient = 'from-amber-500 to-yellow-400'; break;
                case 'indigo': gradient = 'from-indigo-500 to-blue-400'; break;
                case 'cyan': gradient = 'from-cyan-500 to-sky-400'; break;
                case 'rose': gradient = 'from-rose-500 to-pink-400'; break;
                default: gradient = 'from-blue-500 to-cyan-400';
              }
              
              return (
                <span
                  key={`tag-${index}`}
                  className="group relative inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl
                  bg-white/85 text-slate-700 border border-slate-200/60 backdrop-blur-sm
                  shadow-sm transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-105 hover:shadow-md tag-fade-in
                  min-h-[44px]"
                  style={{ 
                    animationDelay: `${index * 100 + 300}ms`
                  }}
                >
                  <span className="text-lg mr-2.5 flex-shrink-0 leading-none flex items-center justify-center w-5 h-5" style={{ lineHeight: '1' }}>{tag.emoji}</span>
                  <span className="tracking-wide whitespace-nowrap leading-none flex items-center h-5">{tag.name}</span>
                  
                  {/* 悬停时的底部彩色线条 */}
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300 rounded-full`}></span>
                </span>
              );
            })}
          </div>
        </header>

        {/* 主要行动按钮 */}
        <main className={`mb-6 transform transition-all duration-1000 ease-out delay-300 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button 
            size="lg" 
            onClick={() => setView(AppView.DemandInput)}
            className="shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 text-white focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white rounded-lg px-12 py-5 text-lg group relative overflow-hidden"
          >
            {/* 按钮背景动画效果 */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-white/10 blur-xl absolute animate-ping-slow opacity-0 group-hover:opacity-60"></div>
            </div>
            <div className="relative z-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 mr-3 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:scale-110">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              开始规划我的旅行
            </div>
          </Button>
        </main>

        {/* 旅行统计信息 */}
        <div className={`transform transition-all duration-1000 ease-out delay-400 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <TravelStatsPanel />
        </div>

        {/* 滚动旅行目的地展示 */}
        <div className={`w-full max-w-6xl mx-auto transform transition-all duration-1000 ease-out delay-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <ScrollingDestinationPanel />
        </div>

        {/* 精选旅行主题展示区域（仅供参考，无交互功能） */}
        <div className={`transform transition-all duration-1000 ease-out delay-600 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <InteractiveTravelThemes />
        </div>

        {/* 功能特点展示 */}
        <section className="w-full max-w-6xl px-4 mb-10 md:mb-16 relative z-10">
          <div className="text-center mb-8 transform transition-all duration-700 ease-out delay-400 opacity-0 translate-y-10" style={{ opacity: isMounted ? 1 : 0, transform: isMounted ? 'translateY(0)' : 'translateY(40px)' }}>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">智能旅行规划特色</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">体验AI驱动的旅行规划，让您的旅程更加轻松愉快</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<span className="text-2xl">💬</span>}
              title="自然语言交互"
              description="像聊天一样描述您的需求，AI即可理解并规划。无需复杂操作，简单交流即可。"
              delay="delay-[700ms]"
            />
            <FeatureCard
              icon={<span className="text-2xl">🎨</span>}
              title="个性化定制"
              description="根据您的兴趣、预算和时间，打造独一无二的旅程。每次旅行都与众不同。"
              delay="delay-[850ms]"
            />
            <FeatureCard
              icon={<span className="text-2xl">🗺️</span>}
              title="智能行程规划"
              description="自动安排景点、餐饮、交通，省时省心。贴心建议让您的旅途更加顺畅愉快。"
              delay="delay-[1000ms]"
            />
          </div>
        </section>

        {/* 交互式分割线 */}
        <div className="w-full max-w-4xl mx-auto mb-10 opacity-30 flex items-center justify-center">
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          <CompassStarIcon className="mx-4 text-slate-400 w-6 h-6 rotate-12 animate-pulse-slow" />
          <PlaneIcon className="mx-4 text-slate-400 w-6 h-6 -rotate-45 animate-float-slow" />
          <CompassStarIcon className="mx-4 text-slate-400 w-6 h-6 -rotate-12 animate-pulse-slow" />
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
        </div>

        {/* 使用步骤展示 */}
        <section className={`w-full max-w-5xl px-4 mb-12 transform transition-all duration-1000 ease-out delay-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">简单三步，开始您的旅程</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* 连接线 - 仅在中等屏幕上显示 */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-500"></div>
            
            {/* 步骤1 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg z-10 transform hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">描述您的需求</h3>
              <p className="text-slate-600 text-sm">告诉AI您的旅行偏好、目的地想法和时间预算</p>
            </div>
            
            {/* 步骤2 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg z-10 transform hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">获取智能推荐</h3>
              <p className="text-slate-600 text-sm">AI根据您的需求生成个性化旅行计划</p>
            </div>
            
            {/* 步骤3 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-xl font-bold shadow-lg z-10 transform hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">调整并确认</h3>
              <p className="text-slate-600 text-sm">根据自己的喜好灵活调整，最终确定完美行程</p>
            </div>
          </div>
        </section>
      </div>

      <footer className={`relative z-10 w-full py-8 text-center text-slate-600 text-sm transition-opacity duration-1000 ease-out delay-[800ms] ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center space-x-4 mb-3">
            {['关于我们', '使用条款', '隐私政策', '联系我们'].map((item, i) => (
              <a key={i} href="#" className="text-slate-500 hover:text-blue-500 transition-colors">{item}</a>
            ))}
          </div>
          <p>© {new Date().getFullYear()} {APP_NAME}. 版权所有.</p>
        </div>
      </footer>
    </div>
  );
};
