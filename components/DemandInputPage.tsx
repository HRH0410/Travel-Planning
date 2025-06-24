import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input'; // Assuming Input and TextArea support floating labels or we adapt them
import { Tag } from './ui/Tag';
import { UserDemand, RecognizedTag } from '../types';
import { APP_NAME } from '../constants';
import { v4 as uuidv4 } from 'uuid';

interface DemandInputPageProps {
  onSubmitDemand: (demand: UserDemand) => void;
  isLoading: boolean;
}

const initialDemand: UserDemand = {
  startCity: '',
  destination: '',
  duration: '',
  people: '',
  budget: '',
  rawInput: '',
};

// --- Aurora Blob Component ---
interface AuroraBlobProps {
  className: string;
  animationClass: string;
  opacity?: number; // Allow passing opacity directly
}

const AuroraBlob: React.FC<AuroraBlobProps> = ({ className, animationClass, opacity = 0.1 }) => (
  <div 
    className={`absolute -z-20 rounded-full mix-blend-multiply filter blur-4xl ${className} ${animationClass}`} // Increased blur
    style={{ opacity }} // Control opacity for extreme subtlety
  ></div>
);

// --- New Minimalist Floating SVG Icons (Inspired by Reference Image) ---
const MinimalPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z"/>
  </svg>
);
const MinimalCircleIcon: React.FC<{ className?: string }> = ({ className }) => ( // Can be styled as clock outline
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" />
    {/* For clock add: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" /> */}
  </svg>
);
const MinimalDocumentOutlineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 21H17C18.1046 21 19 20.1046 19 19V7.82843C19 7.29799 18.7893 6.78929 18.4142 6.41421L14.5858 2.58579C14.2107 2.21071 13.702 2 13.1716 2H7C5.89543 2 5 2.89543 5 4V19C5 20.1046 5.89543 21 7 21Z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V7H19" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12H15" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 16H12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MinimalHeartOutlineIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20.75C12 20.75 4 15.25 4 9.25C4 6.24301 6.24301 4 9.25 4C10.9949 4 12.5968 4.85199 13.5245 6.1132C13.7994 6.48515 14.2006 6.48515 14.4755 6.1132C15.4032 4.85199 17.0051 4 18.75 4C21.757 4 24 6.24301 24 9.25C24 15.25 16 20.75 16 20.75L12 20.75Z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
// --- End Minimalist Floating SVG Icons ---


// --- Footer Badge Icons ---
const AiChipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.75 1C10.75 0.585786 10.4142 0.25 10 0.25C9.58579 0.25 9.25 0.585786 9.25 1V2.5C9.25 2.91421 9.58579 3.25 10 3.25C10.4142 3.25 10.75 2.91421 10.75 2.5V1ZM5.00962 3.50962C5.28579 3.23345 5.28579 2.76655 5.00962 2.49038C4.73345 2.21421 4.26655 2.21421 3.99038 2.49038L2.49038 3.99038C2.21421 4.26655 2.21421 4.73345 2.49038 5.00962C2.76655 5.28579 3.23345 5.28579 3.50962 5.00962L5.00962 3.50962ZM16.0096 3.50962L17.5096 2.49038C17.7858 2.21421 18.2665 2.21421 18.5096 2.49038C18.7858 2.76655 18.7858 3.23345 18.5096 3.50962L17.0096 5.00962C16.7335 5.28579 16.2335 5.28579 15.9904 5.00962C15.7142 4.73345 15.7142 4.26655 15.9904 3.99038L16.0096 3.50962ZM1 9.25H2.5C2.91421 9.25 3.25 9.58579 3.25 10C3.25 10.4142 2.91421 10.75 2.5 10.75H1C0.585786 10.75 0.25 10.4142 0.25 10C0.25 9.58579 0.585786 9.25 1 9.25ZM17.5 9.25H19C19.4142 9.25 19.75 9.58579 19.75 10C19.75 10.4142 19.4142 10.75 19 10.75H17.5C17.0858 10.75 16.75 10.4142 16.75 10C16.75 9.58579 17.0858 9.25 17.5 9.25ZM9.25 17.5V19C9.25 19.4142 9.58579 19.75 10 19.75C10.4142 19.75 10.75 19.4142 10.75 19V17.5C10.75 17.0858 10.4142 16.75 10 16.75C9.58579 16.75 9.25 17.0858 9.25 17.5ZM5.00962 17.0096L3.50962 18.5096C3.23345 18.7858 2.76655 18.7858 2.49038 18.5096C2.21421 18.2335 2.21421 17.7665 2.49038 17.5096L3.99038 16.0096C4.26655 15.7335 4.73345 15.7335 5.00962 16.0096C5.28579 16.2858 5.28579 16.7335 5.00962 17.0096ZM16.0096 17.0096C15.7335 16.7335 15.7335 16.2665 15.9904 16.0096L17.0096 15.0096C17.2858 14.7335 17.7665 14.7335 18.0096 15.0096C18.2858 15.2858 18.2858 15.7665 18.0096 16.0096L17.0096 17.0096C16.7335 17.2858 16.2665 17.2858 16.0096 17.0096Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M14.25 6C14.25 5.58579 13.9142 5.25 13.5 5.25H6.5C6.08579 5.25 5.75 5.58579 5.75 6V14C5.75 14.4142 6.08579 14.75 6.5 14.75H13.5C13.9142 14.75 14.25 14.4142 14.25 14V6ZM7.25 6.75V13.25H12.75V6.75H7.25Z" />
  </svg>
);
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-1.165 3.437 3.691 1.015L6.07 18.57l4.405-1.83.39 4.753 3.437-1.165-1.015-3.691L18.569 13.2l-1.83-4.401-.39-4.753zm-1.218 7.062a.75.75 0 011.06 0l1.25 1.25a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 010-1.06l1.25-1.25zM5.543 7.043a.75.75 0 011.06 0l1.25 1.25a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 01-1.06 0L4.293 9.353a.75.75 0 010-1.06l1.25-1.25zm9.634.25a.75.75 0 000-1.06l-1.25-1.25a.75.75 0 00-1.06 0l-1.25 1.25a.75.75 0 000 1.06l1.25 1.25a.75.75 0 001.06 0l1.25-1.25z" clipRule="evenodd" />
  </svg>
);
const ShieldLockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6zm-1.5 3.5a1 1 0 11-2 0 1 1 0 012 0zM10 12a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 11-3 0v-1A1.5 1.5 0 0110 12z" clipRule="evenodd" />
  </svg>
);
// --- End Footer Badge Icons ---


interface FloatingElementProps {
  IconComponent: React.FC<{ className?: string }>;
  style: React.CSSProperties;
  animationClass: string;
  colorClass: string;
  opacity: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({ IconComponent, style, animationClass, colorClass, opacity }) => (
  <div className={`absolute -z-10 pointer-events-none ${animationClass}`} style={{...style, opacity}}>
    <IconComponent className={`w-full h-full ${colorClass}`} />
  </div>
);

export const DemandInputPage: React.FC<DemandInputPageProps> = ({ onSubmitDemand, isLoading }) => {
  const [demand, setDemand] = useState<UserDemand>(initialDemand);
  const [recognizedTags, setRecognizedTags] = useState<RecognizedTag[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDemand(prev => ({ ...prev, [name]: value }));
  };
  
  const parseRawInput = useCallback((text: string) => {
    const newTags: RecognizedTag[] = [];
    if (text.toLowerCase().includes("paris") || text.includes("巴黎")) newTags.push({ id: uuidv4(), category: "目的地", value: text.includes("巴黎") ? "巴黎" : "Paris" });
    const durationMatch = text.match(/(\d+)\s*(days?|天)/i);
    if (durationMatch) {
        newTags.push({ id: uuidv4(), category: "时长", value: `${durationMatch[1]} ${durationMatch[2].includes('天') ? '天' : 'days'}` });
    }
    const budgetMatch = text.match(/(?:budget|预算)\s*(?:is|为|大约)?\s*(\d+)\s*(\w+)?/i);
    if (budgetMatch) {
        newTags.push({ id: uuidv4(), category: "预算", value: `${budgetMatch[1]}${budgetMatch[2] ? ' ' + budgetMatch[2] : ''}` });
    }
    setRecognizedTags(newTags);
  }, []);

  const handleRawInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setDemand(prev => ({ ...prev, rawInput: value }));
    parseRawInput(value);
  };

  const handleTagRemove = (tagId: string) => {
    setRecognizedTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    
    const finalDemand = { ...demand };
    if (!finalDemand.rawInput.trim() && (finalDemand.startCity || finalDemand.destination || finalDemand.duration || finalDemand.people)) {
      finalDemand.rawInput = `计划从${finalDemand.startCity || '（未指定出发地）'}出发，前往${finalDemand.destination || '（未指定目的地）'}。旅行时长${finalDemand.duration || '（未指定）'}，${finalDemand.people || '（未指定人数）'}人。预算为${finalDemand.budget || '未指定'}。`;
    }
    onSubmitDemand(finalDemand);
  };

 const auroraBlobsData = [
    { className: 'w-[30rem] h-[30rem] sm:w-[40rem] sm:h-[40rem] top-[-20%] left-[-25%]', animationClass: 'animate-aurora-blob-1', opacity: 0.08, colorClasses: 'bg-gradient-to-br from-sky-100 to-blue-200' },
    { className: 'w-[28rem] h-[28rem] sm:w-[35rem] sm:h-[35rem] top-[-5%] right-[-20%]', animationClass: 'animate-aurora-blob-2', opacity: 0.06, colorClasses: 'bg-gradient-to-br from-purple-100 to-pink-100' },
    { className: 'w-[32rem] h-[32rem] sm:w-[42rem] sm:h-[42rem] bottom-[-35%] left-[10%]', animationClass: 'animate-aurora-blob-3', opacity: 0.1, colorClasses: 'bg-gradient-to-br from-teal-100 to-cyan-100' },
    { className: 'w-[26rem] h-[26rem] sm:w-[32rem] sm:h-[32rem] bottom-[-25%] right-[-15%]', animationClass: 'animate-aurora-blob-4', opacity: 0.07, colorClasses: 'bg-gradient-to-br from-orange-100 to-yellow-100' },
  ];

  const floatingElementsData = [
    { IconComponent: MinimalPlusIcon, style: { top: '10%', left: '85%', width: '30px', height: '30px', animationDelay: '0s', animationDuration: '28s' }, colorClass: 'text-pink-200', opacity: 0.3 },
    { IconComponent: MinimalCircleIcon, style: { top: '75%', left: '5%', width: '35px', height: '35px', animationDelay: '3s',  animationDuration: '30s' }, colorClass: 'text-blue-200', opacity: 0.25 },
    { IconComponent: MinimalDocumentOutlineIcon, style: { top: '20%', left: '15%', width: '40px', height: '40px', animationDelay: '1s',  animationDuration: '26s' }, colorClass: 'text-purple-200', opacity: 0.2 },
    { IconComponent: MinimalHeartOutlineIcon, style: { top: '80%', left: '70%', width: '28px', height: '28px', animationDelay: '4s',  animationDuration: '32s' }, colorClass: 'text-red-200', opacity: 0.35 },
    { IconComponent: MinimalPlusIcon, style: { top: '50%', left: '90%', width: '25px', height: '25px', animationDelay: '2s', animationDuration: '25s' }, colorClass: 'text-teal-200', opacity: 0.2 },
  ];


  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-hidden">
      {auroraBlobsData.map((blob, index) => (
        <AuroraBlob key={`aurora-form-${index}`} className={`${blob.className} ${blob.colorClasses}`} animationClass={blob.animationClass} opacity={blob.opacity} />
      ))}
      {floatingElementsData.map((iconData, index) => (
        <FloatingElement 
          key={`float-form-${index}`} 
          IconComponent={iconData.IconComponent} 
          style={iconData.style} 
          animationClass="animate-float" 
          colorClass={iconData.colorClass}
          opacity={iconData.opacity}
        />
      ))}

      <div className={`w-full max-w-5xl relative z-10 transform transition-all duration-1000 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <header className="text-center mb-10 md:mb-12">
          <h1 className={`text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 [text-shadow:0_1px_4px_rgba(100,150,255,0.2)] transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            {APP_NAME}
          </h1>
          <p className={`mt-3 text-md sm:text-lg text-slate-600 transition-all duration-700 ease-out delay-150 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            请告诉我们您的梦想之旅！越详细越好哦。
          </p>
        </header>

        <form 
          onSubmit={handleSubmit} 
          className={`space-y-8 bg-white rounded-3xl shadow-2xl border border-slate-100/90 p-10 sm:p-12 relative overflow-hidden transform transition-all duration-1000 ease-out delay-300 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          {/* Floating labels require relative positioning on their parent for the label absolute positioning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 relative z-10">
            {/* Example of Floating Label Input - Apply to others */}
            <div className="relative">
              <Input
                id="startCity"
                name="startCity"
                value={demand.startCity}
                onChange={handleInputChange}
                placeholder=" " // Required for floating label effect
                required
                className="peer bg-slate-50/80 hover:bg-slate-100/90 focus:bg-white border-slate-300/80 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 rounded-xl py-3 px-4 text-base h-12"
              />
              <label htmlFor="startCity" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                出发城市 (必填)
              </label>
            </div>

            <div className="relative">
              <Input
                id="destination"
                name="destination"
                value={demand.destination}
                onChange={handleInputChange}
                placeholder=" "
                required
                className="peer bg-slate-50/80 hover:bg-slate-100/90 focus:bg-white border-slate-300/80 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 rounded-xl py-3 px-4 text-base h-12"
              />
              <label htmlFor="destination" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                目的地城市 (必填)
              </label>
            </div>
            
            <div className="relative">
              <Input
                id="duration"
                name="duration"
                value={demand.duration}
                onChange={handleInputChange}
                placeholder=" "
                required
                className="peer bg-slate-50/80 hover:bg-slate-100/90 focus:bg-white border-slate-300/80 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 rounded-xl py-3 px-4 text-base h-12"
              />
              <label htmlFor="duration" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                旅行天数 (必填)
              </label>
            </div>

            <div className="relative">
              <Input
                id="people"
                name="people"
                value={demand.people}
                onChange={handleInputChange}
                placeholder=" "
                required
                className="peer bg-slate-50/80 hover:bg-slate-100/90 focus:bg-white border-slate-300/80 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 rounded-xl py-3 px-4 text-base h-12"
              />
              <label htmlFor="people" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                旅行人数 (必填)
              </label>
            </div>
            
            <div className="relative md:col-span-2">
               <Input
                id="budget"
                name="budget"
                value={demand.budget}
                onChange={handleInputChange}
                placeholder=" "
                className="peer bg-slate-50/80 hover:bg-slate-100/90 focus:bg-white border-slate-300/80 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 rounded-xl py-3 px-4 text-base h-12"
              />
              <label htmlFor="budget" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                预算 (可选)
              </label>
            </div>
          </div>

          <div className="relative z-10">
            <label htmlFor="rawInput" className="block text-sm font-medium text-slate-600 mb-1.5">额外需求描述 (可选)</label>
            <TextArea
              id="rawInput"
              name="rawInput"
              value={demand.rawInput}
              onChange={handleRawInputChange}
              placeholder="例如：对历史文化感兴趣，希望包含至少两个博物馆..."
              rows={5}
              className="text-base bg-slate-50/80 hover:bg-slate-100/90 focus:bg-white border-slate-300/80 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 rounded-xl py-3 px-4"
            />
            {recognizedTags.length > 0 && (
              <div className="mt-4 p-3 sm:p-4 bg-slate-50/70 rounded-xl shadow-sm">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">AI 理解为：</h4>
                <div className="flex flex-wrap gap-2">
                  {recognizedTags.map(tag => (
                    <Tag 
                      key={tag.id} 
                      text={`${tag.category}: ${tag.value}`} 
                      onRemove={() => handleTagRemove(tag.id)} 
                      color="bg-sky-100/90 text-sky-700"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full relative z-10 shadow-lg hover:shadow-xl hover:shadow-indigo-400/40 transform hover:-translate-y-1 hover:scale-[1.02] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 text-white focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white rounded-xl py-3.5 text-lg group" 
            disabled={isLoading}
          >
            {isLoading ? '正在规划您的旅程...' : '生成我的行程'}
             {isLoading && (
              <svg className="animate-spin ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
             )}
             {!isLoading && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:scale-110">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
             )}
          </Button>

          <div className={`mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 transform transition-opacity duration-700 ease-out delay-[600ms] ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs flex items-center shadow-sm group hover:bg-slate-200/70 transition-colors">
              <AiChipIcon className="w-4 h-4 mr-1.5 text-blue-500 group-hover:scale-110 transition-transform" />
              AI 智能规划
            </span>
            <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs flex items-center shadow-sm group hover:bg-slate-200/70 transition-colors">
              <SparklesIcon className="w-4 h-4 mr-1.5 text-purple-500 group-hover:scale-110 transition-transform" />
              个性化定制
            </span>
            <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs flex items-center shadow-sm group hover:bg-slate-200/70 transition-colors">
              <ShieldLockIcon className="w-4 h-4 mr-1.5 text-teal-500 group-hover:scale-110 transition-transform" />
              安全与隐私
            </span>
          </div>

        </form>
         <footer className={`relative z-10 w-full pt-10 text-center text-slate-500 text-xs transition-opacity duration-1000 ease-out delay-[800ms] ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
             © {new Date().getFullYear()} {APP_NAME}. 精心为您规划.
        </footer>
      </div>
    </div>
  );
};
