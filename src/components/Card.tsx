import { motion } from 'framer-motion';
import type { FoodBattle } from '@/types';
import { Swords, Sparkles, Camera, Video, Hash, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CardProps {
  battle: FoodBattle;
  index: number;
  isVisible: boolean;
}

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [text, started]);

  return <span>{displayedText}</span>;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors rounded-md hover:bg-neutral-100"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

export function Card({ battle, index, isVisible }: CardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const heroColor = 'text-emerald-600';
  const villainColor = 'text-rose-500';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Battle {index + 1}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 leading-tight">
          {isVisible ? <TypewriterText text={battle.title} delay={index * 200} /> : battle.title}
        </h3>
        <p className="text-sm text-neutral-500 mt-1.5">
          {isVisible ? <TypewriterText text={battle.scene} delay={index * 200 + 300} /> : battle.scene}
        </p>
      </div>

      {/* Fighters */}
      <div className="px-6 py-4 bg-neutral-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="text-lg">🥗</span>
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Hero</p>
              <p className={`text-sm font-semibold ${heroColor}`}>{battle.hero_food}</p>
            </div>
          </div>
          <Swords className="w-5 h-5 text-neutral-300" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Villain</p>
              <p className={`text-sm font-semibold ${villainColor}`}>{battle.villain_food}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <span className="text-lg">🍔</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue */}
      <div className="px-6 py-5 space-y-4">
        {battle.dialogue.map((line, i) => (
          <div key={i} className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              line.speaker === 'hero' ? 'bg-emerald-100' : 'bg-rose-100'
            }`}>
              <span className="text-sm">{line.speaker === 'hero' ? '🦸' : '🦹'}</span>
            </div>
            <div className="flex-1">
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                line.speaker === 'hero' ? heroColor : villainColor
              }`}>
                {line.speaker}
              </p>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {isVisible ? (
                  <TypewriterText 
                    text={line.line} 
                    delay={index * 200 + 600 + i * 400} 
                  />
                ) : line.line}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Prompts */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-500">Image Prompt</span>
            </div>
            <CopyButton text={battle.image_prompt} label="Copy" />
          </div>
          <p className="text-xs text-neutral-600 bg-white px-3 py-2 rounded-lg border border-neutral-200 line-clamp-2">
            {battle.image_prompt}
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-500">Video Prompt</span>
            </div>
            <CopyButton text={battle.video_prompt} label="Copy" />
          </div>
          <p className="text-xs text-neutral-600 bg-white px-3 py-2 rounded-lg border border-neutral-200 line-clamp-2">
            {battle.video_prompt}
          </p>
        </div>
      </div>

      {/* SEO Keywords */}
      <div className="px-6 py-4 border-t border-neutral-100">
        <div className="flex items-center gap-1.5 mb-2">
          <Hash className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-500">SEO Keywords</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {battle.seo_keywords.map((keyword, i) => (
            <span 
              key={i}
              className="px-2.5 py-1 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-full"
            >
              #{keyword}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
