"use client";

import React, { useRef, useEffect, useState } from "react";

type LogoItem = React.ReactNode | string;

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right";
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  fadeOut?: boolean;
  scaleOnHover?: boolean;
  className?: string;
}

export default function LogoLoop({
  logos,
  speed = 120,
  direction = "left",
  logoHeight = 60,
  gap = 60,
  hoverSpeed = 0,
  fadeOut = true,
  scaleOnHover = true,
  className = "",
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      setOffset((prev) => {
        const movement = currentSpeed * deltaTime;
        const contentWidth = container.scrollWidth / 2;
        
        if (direction === "left") {
          const newOffset = prev + movement;
          return newOffset >= contentWidth ? newOffset - contentWidth : newOffset;
        } else {
          const newOffset = prev - movement;
          return newOffset <= -contentWidth ? newOffset + contentWidth : newOffset;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentSpeed, direction]);

  const handleMouseEnter = () => {
    setCurrentSpeed(hoverSpeed);
  };

  const handleMouseLeave = () => {
    setCurrentSpeed(speed);
  };

  const renderLogos = () => {
    return logos.map((logo, index) => (
      <div
        key={index}
        className={`flex-shrink-0 flex items-center justify-center transition-transform duration-300 ${
          scaleOnHover ? "hover:scale-110" : ""
        }`}
        style={{
          height: `${logoHeight}px`,
          marginRight: `${gap}px`,
        }}
      >
        {typeof logo === "string" ? (
          <img
            src={logo}
            alt={`Logo ${index + 1}`}
            className="h-full w-auto object-contain"
          />
        ) : (
          logo
        )}
      </div>
    ));
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {fadeOut && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-emerald-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-emerald-50 to-transparent z-10 pointer-events-none" />
        </>
      )}
      
      <div
        ref={containerRef}
        className="flex"
        style={{
          transform: `translateX(-${offset}px)`,
        }}
      >
        {renderLogos()}
        {renderLogos()}
      </div>
    </div>
  );
}
