"use client";

export function Marquee({ text }: { text: string }) {
  return (
    <div className="relative flex overflow-hidden border-y-2 border-[#111] bg-[#111] text-[#fbbf24] py-2 sm:py-2.5 z-10 w-full">
      <div className="flex animate-marquee whitespace-nowrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-4 text-[11px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-4">
            {text}
            <span className="inline-block w-2 h-2 rounded-[2px] bg-[#FF4500]"></span>
          </span>
        ))}
      </div>
      <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-2 sm:py-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-4 text-[11px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-4">
            {text}
            <span className="inline-block w-2 h-2 rounded-[2px] bg-[#FF4500]"></span>
          </span>
        ))}
      </div>
    </div>
  );
}
