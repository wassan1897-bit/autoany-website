"use client";
import { cn } from "../../lib/cn";

export function ConsultButton({
  className,
  text = "Book Consult",
  href = "mailto:hello@autoany.io"
}: {
  className?: string;
  text?: string;
  href?: string;
}) {
  return (
    <button 
      type="button"
      onClick={() => {
        window.location.href = href || "mailto:hello@autoany.io";
      }}
      className={cn(
        "group flex min-w-[180px] decoration-0 transition-transform active:scale-95 cursor-pointer outline-none w-auto h-[50px] pr-6 pl-6 relative items-center justify-center pointer-events-auto",
        className
      )}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: "8px",
        opacity: 1,
        border: "none",
        zIndex: 50,
      }}
    >
      {/* Glow Layer */}
      <div 
        className="pointer-events-none transition-opacity ease-in-out duration-[1200ms] group-hover:opacity-0 opacity-100 absolute top-0 right-0 bottom-0 left-0" 
        style={{
          background: "radial-gradient(15% 50% at 50% 100%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)",
          borderRadius: "8px",
          filter: "blur(15px)"
        }}
      />

      {/* Glow Hover Layer */}
      <div 
        className="pointer-events-none transition-opacity ease-in-out duration-[1200ms] group-hover:opacity-100 opacity-0 absolute top-0 right-0 bottom-0 left-0" 
        style={{
          background: "radial-gradient(60.6% 50% at 50% 100%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)",
          borderRadius: "8px",
          filter: "blur(18px)"
        }}
      />

      {/* Stroke Layer */}
      <div 
        className="pointer-events-none will-change-auto transition-opacity ease-in-out duration-[1200ms] group-hover:opacity-0 opacity-100 absolute top-0 right-0 bottom-0 left-0" 
        style={{
          background: "radial-gradient(10.7% 50% at 50% 100%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)",
          borderRadius: "8px"
        }}
      />

      {/* Stroke Hover Layer */}
      <div 
        className="pointer-events-none will-change-auto transition-opacity ease-in-out duration-[1200ms] group-hover:opacity-100 opacity-0 absolute top-0 right-0 bottom-0 left-0" 
        style={{
          background: "radial-gradient(60.1% 50% at 50% 100%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)",
          borderRadius: "8px"
        }}
      />

      {/* Fill Layer */}
      <div 
        className="pointer-events-none rounded-[7px] absolute top-[1px] right-[1px] bottom-[1px] left-[1px]" 
        style={{
          backgroundColor: "rgb(0, 0, 0)",
          opacity: 1
        }}
      />

      {/* Content Layer */}
      <div className="pointer-events-none relative z-20 flex items-center justify-center gap-2 opacity-100">
        <span 
          className="m-0 p-0 font-sans text-[15px] font-medium text-white tracking-wide" 
          style={{
            WebkitFontSmoothing: "antialiased",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)"
          }}
        >
          {text}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="lucide lucide-arrow-right transition-transform duration-300 group-hover:translate-x-1"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
