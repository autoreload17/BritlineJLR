"use client";

import { useEffect } from "react";

export default function AnimatedFavicon() {
  useEffect(() => {
    // Skip animation on iOS/Safari - they don't support animated favicons well
    // Also check for mobile devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isIOS || isSafari || isMobile) {
      // Don't animate on iOS/Safari/Mobile - use static icon from metadata
      // Find and ensure apple-icon is used
      const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (appleIcon && !appleIcon.href.includes('apple-icon')) {
        appleIcon.href = '/apple-icon.svg';
      }
      return; // Don't animate on iOS/Safari/Mobile
    }
    // Создаем SVG колеса с анимацией
    const createWheelSVG = (rotation: number) => {
      return `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
          <g transform="rotate(${rotation} 25 25)">
            <!-- Внешний обод колеса (серый металлик) -->
            <circle 
              cx="25" 
              cy="25" 
              r="24" 
              fill="none" 
              stroke="#888888" 
              stroke-width="2"
            />
            <!-- Шина (British Racing Green) -->
            <circle 
              cx="25" 
              cy="25" 
              r="20" 
              fill="#004225"
            />
            <!-- Спицы диска (серый металлик) -->
            <line x1="25" y1="5" x2="25" y2="15" stroke="#888888" stroke-width="1.5" />
            <line x1="25" y1="35" x2="25" y2="45" stroke="#888888" stroke-width="1.5" />
            <line x1="5" y1="25" x2="15" y2="25" stroke="#888888" stroke-width="1.5" />
            <line x1="35" y1="25" x2="45" y2="25" stroke="#888888" stroke-width="1.5" />
            <line x1="10.86" y1="10.86" x2="17.07" y2="17.07" stroke="#888888" stroke-width="1.5" />
            <line x1="32.93" y1="32.93" x2="39.14" y2="39.14" stroke="#888888" stroke-width="1.5" />
            <line x1="10.86" y1="39.14" x2="17.07" y2="32.93" stroke="#888888" stroke-width="1.5" />
            <line x1="32.93" y1="17.07" x2="39.14" y2="10.86" stroke="#888888" stroke-width="1.5" />
            <!-- Центральная ступица -->
            <circle 
              cx="25" 
              cy="25" 
              r="8" 
              fill="#666666"
            />
            <circle 
              cx="25" 
              cy="25" 
              r="5" 
              fill="#888888"
            />
          </g>
        </svg>
      `)}`;
    };

    // Находим или создаем favicon link
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    // Анимация вращения с использованием requestAnimationFrame для плавности
    let rotation = 0;
    const rotationSpeed = 1.5; // градусов за кадр (медленнее для плавности)
    let lastTime = Date.now();
    let animationFrameId: number;

    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      
      // Обновляем только если прошло достаточно времени (для контроля скорости)
      if (deltaTime >= 16) { // ~60 FPS
        rotation = (rotation + rotationSpeed) % 360;
        favicon.href = createWheelSVG(rotation);
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Запускаем анимацию
    animationFrameId = requestAnimationFrame(animate);

    // Очистка при размонтировании
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return null; // Компонент не рендерит ничего
}

