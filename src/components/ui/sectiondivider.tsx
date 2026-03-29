"use client";

export function SectionDivider() {
    return  (
        <div className="relative w-screen left-1/2 -translate-x-1/2 h-12 md:h-32 z-45 pointer-events-none overflow-visible mb-10 mt-18">
            <div className="absolute left-1/2 -translate-x-1/2 w-[115vw] -translate-y-1/2 -rotate-2">
            <svg 
                className="w-full h-60 md:h-100 overflow-visible" 
                preserveAspectRatio="none" 
                viewBox="0 0 1440 100"
            >
                <defs>
                <filter id="torn-paper-rotate">
                    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
                </filter>
                </defs>

                <path 
                d="M-100 100 L1540 100 L1540 30 L-100 35 Z" 
                fill="black" 
                className="opacity-[0.04]"
                filter="url(#torn-paper-rotate)"
                style={{ transform: 'translateY(-6px)' }}
                />

                <path 
                d="M-100 100 L1540 100 L1540 30 L-100 35 Z" 
                fill="#f8fafc" 
                filter="url(#torn-paper-rotate)"
                />
            </svg>

            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-60">
                <span className="text-[10px] font-bold uppercase tracking-[1.5em] text-s-900 font-frenchpress italic">
                Suivant
                </span>
            </div>
            </div>
        </div>
    );
};