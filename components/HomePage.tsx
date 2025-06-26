
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { APP_NAME, APP_SLOGAN } from '../constants';
import { AppView } from '../types';

interface HomePageProps {
  setView: (view: AppView) => void;
  onShowSampleData?: () => void;
}

interface AuroraBlobProps {
  className: string;
  animationClass: string;
}

const AuroraBlob: React.FC<AuroraBlobProps> = ({ className, animationClass }) => (
  <div className={`absolute -z-10 rounded-full filter blur-3xl mix-blend-multiply ${className} ${animationClass}`}></div>
);

// --- SVG Icons for Floating Elements ---
const PlaneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.432 11.042L14.471 7.427L10.553 1.348C10.126 0.583 9.017 0.583 8.589 1.348L4.671 7.427L0.592 9.531C-0.174 9.92 -0.174 10.954 0.592 11.343L4.671 13.447L8.589 19.526C9.017 20.291 10.126 20.291 10.553 19.526L14.471 13.447L21.432 12.395C22.128 12.288 22.128 11.149 21.432 11.042Z"/>
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
  const logoImageUrl = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80";

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const auroraBlobs = [
    { className: 'w-72 h-72 sm:w-96 sm:h-96 top-[5%] left-[5%] bg-gradient-to-br from-sky-300 to-blue-400 opacity-60', animationClass: 'animate-aurora-blob-1' },
    { className: 'w-60 h-60 sm:w-80 sm:h-80 top-[20%] right-[10%] bg-gradient-to-br from-purple-300 to-pink-300 opacity-50', animationClass: 'animate-aurora-blob-2' },
    { className: 'w-52 h-52 sm:w-72 sm:h-72 bottom-[15%] left-[25%] bg-gradient-to-br from-teal-200 to-cyan-300 opacity-40', animationClass: 'animate-aurora-blob-3' },
    { className: 'w-48 h-48 sm:w-64 sm:h-64 bottom-[5%] right-[20%] bg-gradient-to-br from-orange-200 to-yellow-300 opacity-30', animationClass: 'animate-aurora-blob-4' },
  ];
  
  const floatingIconsData = [
    { IconComponent: PlaneIcon, style: { top: '15%', left: '80%', width: '60px', height: '60px', opacity: 0.2, animationDelay: '0s', animationDuration: '18s' }, colorClass: 'text-sky-300' },
    { IconComponent: CompassStarIcon, style: { top: '70%', left: '10%', width: '50px', height: '50px', opacity: 0.25, animationDelay: '3s',  animationDuration: '20s' }, colorClass: 'text-purple-300' },
    { IconComponent: LocationPinIcon, style: { top: '40%', left: '45%', width: '40px', height: '40px', opacity: 0.15, animationDelay: '1s',  animationDuration: '16s' }, colorClass: 'text-pink-300' },
    { IconComponent: PlaneIcon, style: { top: '85%', left: '60%', width: '45px', height: '45px', opacity: 0.2, animationDelay: '5s',  animationDuration: '22s' }, colorClass: 'text-orange-200' },
    { IconComponent: CompassStarIcon, style: { top: '5%', left: '30%', width: '35px', height: '35px', opacity: 0.3, animationDelay: '2s',  animationDuration: '17s' }, colorClass: 'text-teal-200' },
  ];


  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Aurora Blobs Background */}
      {auroraBlobs.map((blob, index) => (
        <AuroraBlob key={`aurora-${index}`} className={blob.className} animationClass={blob.animationClass} />
      ))}
      {/* Floating Travel Icons Background */}
      {floatingIconsData.map((iconData, index) => (
        <FloatingTravelIcon 
          key={`float-${index}`} 
          IconComponent={iconData.IconComponent} 
          style={iconData.style} 
          animationClass="animate-float" 
          colorClass={iconData.colorClass}
        />
      ))}
      
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 text-center pt-12 md:pt-16">
        <header className={`max-w-3xl mb-10 md:mb-12 transform transition-all duration-1000 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="group w-48 h-48 md:w-56 md:h-56 bg-white rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-sky-300/50">
            <img 
              src={logoImageUrl} 
              alt="品牌Logo - 智游无界" 
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </div>
          <h1 className={`text-6xl md:text-7xl font-bold mb-5 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 animate-text-shimmer [text-shadow:0_2px_8px_rgba(100,150,255,0.3)]`}>
            {APP_NAME}
          </h1>
          <p className={`text-md md:text-lg text-slate-700 max-w-xl mx-auto transition-opacity duration-1000 ease-out delay-200 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            您的个性化智能旅行助手。通过自然语言轻松对话，AI为您量身定制完美行程。
          </p>
        </header>

        <main className={`mb-12 md:mb-16 transform transition-all duration-1000 ease-out delay-300 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button 
            size="lg" 
            onClick={() => setView(AppView.DemandInput)}
            className="shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 text-white focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white rounded-lg px-10 py-4 text-lg group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            开始规划我的旅行
          </Button>
        </main>

        <section className="w-full max-w-5xl px-4 mb-10 md:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<span>💬</span>}
              title="自然语言交互"
              description="像聊天一样描述您的需求，AI即可理解并规划。"
              delay="delay-[400ms]"
            />
            <FeatureCard
              icon={<span>🎨</span>}
              title="个性化定制"
              description="根据您的兴趣、预算和时间，打造独一无二的旅程。"
              delay="delay-[550ms]"
            />
            <FeatureCard
              icon={<span>🗺️</span>}
              title="智能行程规划"
              description="自动安排景点、餐饮、交通，省时省心。"
              delay="delay-[700ms]"
            />
          </div>
        </section>
      </div>

      <footer className={`relative z-10 w-full py-8 text-center text-slate-600 text-sm transition-opacity duration-1000 ease-out delay-[800ms] ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        © {new Date().getFullYear()} {APP_NAME}. 版权所有.
      </footer>
    </div>
  );
};
