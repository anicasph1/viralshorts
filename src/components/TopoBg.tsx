import { motion } from 'framer-motion';

export function TopoBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100" />
      
      {/* Topographic lines - SVG pattern */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern 
            id="topo-pattern" 
            x="0" 
            y="0" 
            width="400" 
            height="400" 
            patternUnits="userSpaceOnUse"
          >
            {/* Contour lines */}
            <path 
              d="M0,100 Q100,80 200,100 T400,100" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.8"
            />
            <path 
              d="M0,150 Q100,120 200,150 T400,150" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.6"
            />
            <path 
              d="M0,200 Q100,170 200,200 T400,200" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.8"
            />
            <path 
              d="M0,250 Q100,220 200,250 T400,250" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.6"
            />
            <path 
              d="M0,300 Q100,280 200,300 T400,300" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.8"
            />
            <path 
              d="M0,350 Q100,320 200,350 T400,350" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.6"
            />
            {/* Vertical contour lines */}
            <path 
              d="M100,0 Q80,100 100,200 T100,400" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
            />
            <path 
              d="M200,0 Q180,100 200,200 T200,400" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.7"
            />
            <path 
              d="M300,0 Q280,100 300,200 T300,400" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo-pattern)" />
      </svg>

      {/* Animated floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-neutral-200/30 to-transparent blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-neutral-300/20 to-transparent blur-3xl"
        animate={{
          x: [0, -25, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-gradient-to-br from-neutral-200/25 to-transparent blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid dots */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}
