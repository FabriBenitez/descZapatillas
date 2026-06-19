"use client";

export function Marquee({ text }: { text: string }) {
  // Using pure CSS for the marquee to avoid heavy re-renders
  return (
    <div className="relative flex overflow-hidden border-y-2 border-[#111] bg-[#FF4500] text-white py-2 sm:py-3 z-10 w-full">
      <div className="flex animate-marquee whitespace-nowrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-4 text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-4">
            {text}
            <span className="inline-block w-2 h-2 rounded-[2px] bg-white"></span>
          </span>
        ))}
      </div>
      <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-2 sm:py-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-4 text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-4">
            {text}
            <span className="inline-block w-2 h-2 rounded-[2px] bg-white"></span>
          </span>
        ))}
      </div>
    </div>
  );
}
