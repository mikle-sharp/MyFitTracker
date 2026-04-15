'use client';

import { useState, useEffect } from 'react';
import { getAppFont } from '@/lib/storage';

// Базовые пропсы для всех иконок
interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

// Хук для определения текущего стиля
function useIconStyle() {
  const [isRetro, setIsRetro] = useState(false);
  useEffect(() => {
    const checkStyle = () => {
      const savedFont = getAppFont();
      setIsRetro(savedFont === "retro");
    };
    checkStyle();
    const interval = setInterval(checkStyle, 500);
    return () => clearInterval(interval);
  }, []);
  return isRetro;
}

export function BackupIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="13" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M10.06,1H3.88c-.76,0-1.38.63-1.38,1.4v11.2c0,.77.62,1.4,1.38,1.4h8.25c.76,0,1.38-.63,1.38-1.4V4.5l-3.44-3.5Z"/>
        <path stroke="currentColor" fill="none"  d="M9.38,1v2.8c0,.77.62,1.4,1.37,1.4h2.75"/>
    </svg>
  );
}

export function BookmarkIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="13" y="13.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="14.5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="13.5" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="13.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="14.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="13.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="12.5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="12.5" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="12.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="12.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="11.5" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="11.5" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="10.5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10.5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="10.5" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="11.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="11.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="10.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="10.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="9.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="9.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="8.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="8.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="7.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="7.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="6.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="6.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="5.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="5.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="4.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="4.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="3.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="3.5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="2.5" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="1.5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="2.5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="1.5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="1.5" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="1.5" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1.5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1.5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1.5" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1.5" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="1.5" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M12.67,14l-4.67-2.67-4.67,2.67V3.33c0-.74.6-1.33,1.33-1.33h6.67c.74,0,1.33.6,1.33,1.33v10.67Z"/>
    </svg>
  );
}

export function CalendarIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="14" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M5.33,1.33v2.67"/>
        <path stroke="currentColor" fill="none"  d="M10.67,1.33v2.67"/>
        <rect stroke="currentColor" fill="none"  x="2" y="2.67" width="12" height="12" rx="1.33" ry="1.33"/>
        <path stroke="currentColor" fill="none"  d="M2,6.67h12"/>
    </svg>
  );
}

export function CheckIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="6" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="4" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M13.33,4l-7.33,7.33-3.33-3.33"/>
    </svg>
  );
}

export function ChevronDownIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="9" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="7" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M4,6l4,4,4-4"/>
    </svg>
  );
}

export function ChevronUpIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="12" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="6" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M12,10l-4-4-4,4"/>
    </svg>
  );
}

export function ChevronLeftIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="6" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="4" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="currentColor" fill="none" d="M10,4L6,8l4,4"/>
    </svg>
  );
}

export function ChevronRightIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="10" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="4" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="currentColor" fill="none" d="M6,12l4-4L6,4"/>
    </svg>
  );
}

export function CopyIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="14" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="2" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect stroke="currentColor" fill="none"  x="5.2" y="5.2" width="9.8" height="9.8" rx="1.33" ry="1.33"/>
        <path stroke="currentColor" fill="none"  d="M2.4,10.8c-.77,0-1.4-.63-1.4-1.4V2.4c0-.77.63-1.4,1.4-1.4h7c.77,0,1.4.63,1.4,1.4"/>
    </svg>
  );
}

export function ExportIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="15" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="2" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M8,10.33V1"/>
        <path stroke="currentColor" fill="none"  d="M15,10.33v3.11c0,.86-.7,1.56-1.56,1.56H2.56c-.86,0-1.56-.7-1.56-1.56v-3.11"/>
        <path stroke="currentColor" fill="none"  d="M11.89,4.89l-3.89-3.89-3.89,3.89"/>
    </svg>
  );
}

export function GoogleIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M12.08,2.94c-1.12-.9-2.54-1.44-4.08-1.44-3.59,0-6.5,2.91-6.5,6.5s2.91,6.5,6.5,6.5,6.5-2.91,6.5-6.5h-6.5"/>
    </svg>
  );
}

export function ImportIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="15" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M8,10.33V1"/>
        <path stroke="currentColor" fill="none"  d="M15,10.33v3.11c0,.86-.7,1.56-1.56,1.56H2.56c-.86,0-1.56-.7-1.56-1.56v-3.11"/>
        <path stroke="currentColor" fill="none"  d="M4.11,6.44l3.89,3.89,3.89-3.89"/>
    </svg>
  );
}

export function PencilIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M14.42,4.37c.77-.77.77-2.02,0-2.79-.77-.77-2.02-.77-2.79,0L2.29,10.92c-.16.16-.28.36-.35.58l-.92,3.05c-.06.19.05.38.24.44.07.02.14.02.2,0l3.05-.92c.22-.07.42-.19.58-.35L14.42,4.37Z"/>
        <path stroke="currentColor" fill="none"  d="M10.1,3.1l2.8,2.8"/>
    </svg>
  );
}

export function PlusIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="8" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="3" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M3.33,8h9.33"/>
        <path stroke="currentColor" fill="none"  d="M8,3.33v9.33"/>
    </svg>
  );
}

export function RefreshCwIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="11" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="2" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M2,8c0-3.31,2.69-6,6-6,1.68,0,3.29.66,4.49,1.83l1.51,1.51"/>
        <path stroke="currentColor" fill="none"  d="M14,2v3.33h-3.33"/>
        <path stroke="currentColor" fill="none"  d="M14,8c0,3.31-2.69,6-6,6h0c-1.68,0-3.29-.66-4.49-1.83l-1.51-1.51"/>
        <path stroke="currentColor" fill="none"  d="M5.33,10.67h-3.33v3.33"/>
    </svg>
  );
}

export function SearchIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="15" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="2" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M15,15l-3.38-3.38"/>
        <circle stroke="currentColor" fill="none"  cx="7.22" cy="7.22" r="6.22"/>
    </svg>
  );
}

export function SettingsIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M8.16,1h-.32c-.8,0-1.44.63-1.44,1.4v.13c0,.5-.28.96-.72,1.21l-.31.18c-.45.25-1,.25-1.44,0l-.11-.06c-.69-.39-1.57-.16-1.97.51l-.16.27c-.4.67-.16,1.52.53,1.91l.11.07c.44.25.72.71.72,1.2v.36c0,.5-.27.97-.72,1.22l-.11.06c-.69.39-.92,1.24-.53,1.91l.16.27c.4.67,1.28.9,1.97.51l.11-.06c.45-.25,1-.25,1.44,0l.31.18c.45.25.72.71.72,1.21v.13c0,.77.65,1.4,1.44,1.4h.32c.8,0,1.44-.63,1.44-1.4v-.13c0-.5.28-.96.72-1.21l.31-.18c.45-.25,1-.25,1.44,0l.11.06c.69.39,1.57.16,1.97-.51l.16-.27c.4-.67.16-1.52-.53-1.91l-.11-.06c-.45-.25-.72-.72-.72-1.22v-.35c0-.5.27-.97.72-1.22l.11-.06c.69-.39.92-1.24.53-1.91l-.16-.27c-.4-.67-1.28-.9-1.97-.51l-.11.06c-.45.25-1,.25-1.44,0l-.31-.17c-.45-.25-.72-.71-.72-1.21v-.13c0-.77-.65-1.4-1.44-1.4Z"/>
        <circle stroke="currentColor" fill="none"  cx="8" cy="8" r="2.15"/>
    </svg>
  );
}

export function StyleIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="4.5" y="15.5" width="1" height="1"/>
        <rect fill="currentColor" x="3.5" y="15.5" width="1" height="1"/>
        <rect fill="currentColor" x="2.5" y="15.5" width="1" height="1"/>
        <rect fill="currentColor" x="1.5" y="15.5" width="1" height="1"/>
        <rect fill="currentColor" x=".5" y="15.5" width="1" height="1"/>
        <rect fill="currentColor" x="5.5" y="14.5" width="1" height="1"/>
        <rect fill="currentColor" x=".5" y="14.5" width="1" height="1"/>
        <rect fill="currentColor" x="6.5" y="13.5" width="1" height="1"/>
        <rect fill="currentColor" x="1.5" y="13.5" width="1" height="1"/>
        <rect fill="currentColor" x="6.5" y="12.5" width="1" height="1"/>
        <rect fill="currentColor" x="1.5" y="12.5" width="1" height="1"/>
        <rect fill="currentColor" x="6.5" y="11.5" width="1" height="1"/>
        <rect fill="currentColor" x="1.5" y="11.5" width="1" height="1"/>
        <rect fill="currentColor" x="7.5" y="10.5" width="1" height="1"/>
        <rect fill="currentColor" x="5.5" y="10.5" width="1" height="1"/>
        <rect fill="currentColor" x="3.5" y="10.5" width="1" height="1"/>
        <rect fill="currentColor" x="2.5" y="10.5" width="1" height="1"/>
        <rect fill="currentColor" x="8.5" y="9.5" width="1" height="1"/>
        <rect fill="currentColor" x="9.5" y="8.5" width="1" height="1"/>
        <rect fill="currentColor" x="4.5" y="9.5" width="1" height="1"/>
        <rect fill="currentColor" x="10.5" y="7.5" width="1" height="1"/>
        <rect fill="currentColor" x="7.5" y="8.5" width="1" height="1"/>
        <rect fill="currentColor" x="5.5" y="8.5" width="1" height="1"/>
        <rect fill="currentColor" x="11.5" y="6.5" width="1" height="1"/>
        <rect fill="currentColor" x="6.5" y="7.5" width="1" height="1"/>
        <rect fill="currentColor" x="12.5" y="5.5" width="1" height="1"/>
        <rect fill="currentColor" x="7.5" y="6.5" width="1" height="1"/>
        <rect fill="currentColor" x="13.5" y="4.5" width="1" height="1"/>
        <rect fill="currentColor" x="9.5" y="4.5" width="1" height="1"/>
        <rect fill="currentColor" x="8.5" y="5.5" width="1" height="1"/>
        <rect fill="currentColor" x="14.5" y="3.5" width="1" height="1"/>
        <rect fill="currentColor" x="10.5" y="3.5" width="1" height="1"/>
        <rect fill="currentColor" x="15.5" y="2.5" width="1" height="1"/>
        <rect fill="currentColor" x="11.5" y="2.5" width="1" height="1"/>
        <rect fill="currentColor" x="14.5" y="1.5" width="1" height="1"/>
        <rect fill="currentColor" x="12.5" y="1.5" width="1" height="1"/>
        <rect fill="currentColor" x="13.5" y=".5" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.19,14.88c.45-.7.45-1.44.52-2.35.13-1.69,1.03-2.76,2.73-2.42,2.35.48,2.09,2.98.76,4.01-1.41,1.1-4.01.76-4.01.76Z"/>
        <path d="M6.21,11.7C11.4,7.59,14.81,1.91,14.81,1.91l-1-.83S7.89,5.43,4.35,10.09"/>
        <path d="M6.83,7.21c.82.7,1.42,1.15,2.01,2.03"/>
    </svg>
  );
}

export function Trash2Icon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M1.7,3.8h12.6"/>
        <path stroke="currentColor" fill="none"  d="M12.9,3.8v9.8c0,.7-.7,1.4-1.4,1.4h-7c-.7,0-1.4-.7-1.4-1.4V3.8"/>
        <path stroke="currentColor" fill="none"  d="M5.2,3.8v-1.4c0-.7.7-1.4,1.4-1.4h2.8c.7,0,1.4.7,1.4,1.4v1.4"/>
        <line stroke="currentColor"  x1="6.6" y1="7.3" x2="6.6" y2="11.5"/>
        <line stroke="currentColor"  x1="9.4" y1="7.3" x2="9.4" y2="11.5"/>
    </svg>
  );
}

export function TrendingUpIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="9" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M10.8,4.5h4.2v4.2"/>
        <path stroke="currentColor" fill="none"  d="M15,4.5l-5.95,5.95-3.5-3.5L1,11.5"/>
    </svg>
  );
}

export function TrophyIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="14" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M6.6,9.86v1.14c0,.49-.26.94-.68,1.19-.89.66-1.41,1.69-1.42,2.8"/>
        <path stroke="currentColor" fill="none"  d="M9.4,9.86v1.14c0,.49.26.94.68,1.19.89.66,1.41,1.69,1.42,2.8"/>
        <path stroke="currentColor" fill="none"  d="M12.2,5.9h1.05c.97,0,1.75-.78,1.75-1.75s-.78-1.75-1.75-1.75h-1.05"/>
        <path stroke="currentColor" fill="none"  d="M2.4,15h11.2"/>
        <path stroke="currentColor" fill="none"  d="M3.8,5.9c0,2.32,1.88,4.2,4.2,4.2s4.2-1.88,4.2-4.2V1.7c0-.39-.31-.7-.7-.7h-7c-.39,0-.7.31-.7.7v4.2Z"/>
        <path stroke="currentColor" fill="none"  d="M3.8,5.9h-1.05c-.97,0-1.75-.78-1.75-1.75s.78-1.75,1.75-1.75h1.05"/>
    </svg>
  );
}

export function WeightIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="15" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle stroke="currentColor" fill="none"  cx="8" cy="2.98" r="1.98"/>
        <polygon stroke="currentColor" fill="none"  points="12.31 5.8 3.69 5.8 1 15 15 15 12.31 5.8"/>
    </svg>
  );
}

export function XIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="12" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="4" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M12,4L4,12"/>
        <path stroke="currentColor" fill="none"  d="M4,4l8,8"/>
    </svg>
  );
}

export function DumbbellIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 25 25" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="18" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="23" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="2" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M17,18s1-1,1-2c0,0,1-1,2-1,0,0,0,2-2,5v2"/>
        <path stroke="currentColor" fill="none"  d="M7,18s-1-1-1-2c0,0-1-1-2-1,0,0,0,2,2,5v2"/>
        <line stroke="currentColor"  x1="12" y1="18" x2="12" y2="22"/>
        <path stroke="currentColor" fill="none"  d="M20,12v1c-1,0-2,1-3,1h-3c-1,0-2-2-2-4,0,2-1,4-2,4h-3c-1,0-2-1-3-1v-1"/>
        <polyline stroke="currentColor" fill="none"  points="16 6 13 6 12 7 11 6 8 6"/>
        <path stroke="currentColor" fill="none"  d="M23,7s-1-2-5-2c0,0-1-1-3-2v-1"/>
        <path stroke="currentColor" fill="none"  d="M1,7s1-2,5-2c0,0,1-1,3-2v-1"/>
    </svg>
  );
}

export function HeartIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 25 25" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="15" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse stroke="currentColor" fill="none"  cx="11.99" cy="3.02" rx="2.07" ry="2.02"/>
        <path stroke="currentColor" fill="none"  d="M16.68,14l1.58-1.65c.84-.87.99-2.23.34-3l-1.12-1.32c-.71-.84-1.71-1.29-2.82-1.29h-5.31c-1.11,0-2.11.46-2.82,1.29l-1.12,1.32c-.65.77-.5,2.13.34,3l1.58,1.65"/>
        <path stroke="currentColor" fill="none"  d="M14.35,10.57l.51,4.04c.14,1.07.32,2.13.57,3.18l.92,4c.14.62-.34,1.21-.99,1.21h-.7c-.49,0-.91-.34-1-.81l-1.14-6.08c-.1-.56-.92-.56-1.03,0l-1.14,6.08c-.09.47-.51.81-1,.81h-.7c-.65,0-1.14-.59-.99-1.21l.92-4c.24-1.05.43-2.11.57-3.18l.51-4.04"/>
    </svg>
  );
}

export function LegsIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 25 25" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="19" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M10.45,1.21c-.26,2.05,1.57,3.73,1.26,6.08-.09.71-.09,1.05,0,1.26"/>
        <path stroke="currentColor" fill="none"  d="M13.64,1.75s-.74,3.6,1.05,6.45"/>
        <path stroke="currentColor" fill="none"  d="M18.76,1c.09,1.22.35,2.18-.39,3.48-.65,1.17-.83,2.35-.87,3.52"/>
        <path stroke="currentColor" fill="none"  d="M16.12,9c.7.8.87,2.26.44,3.73s-1.48,4.65-1.39,7.58"/>
        <path stroke="currentColor" fill="none"  d="M16.82,21.41c.44.21.78.5,1.26.46.48,0,.91-.08.91.29,0,.42-.57.71-1.7.54-1.13-.21-1.13.29-1.96.29-.78-.04-1.09-.38-1.7-.29-.61.04-1.31.25-1.52-.5-.22-.71.52-1.34.78-1.76.21-.33.2-2.54,0-3.97"/>
        <path stroke="currentColor" fill="none"  d="M12.74,9.95c-.93.58-1.07,2.24-.66,3.22.35.96.83,1.41,1.26,1.44"/>
        <path stroke="currentColor" fill="none"  d="M5.03,1.21c-.26,2.05,1.57,3.73,1.26,6.08-.09.71-.09,1.05,0,1.26"/>
        <path stroke="currentColor" fill="none"  d="M8.29,2.89c-.09,1.3,0,3.48,1.18,5.32"/>
        <path stroke="currentColor" fill="none"  d="M10.6,15.33c-.35,1.47-.7,3.27-.65,4.99,0,0,.26.21.57.42"/>
        <path stroke="currentColor" fill="none"  d="M10.42,22.75c-1.05.25-1.39-.13-2-.04-.61.04-1.31.13-1.52-.5s.52-1.34.78-1.76c.17-.27.19-1.74.1-3.05"/>
        <path stroke="currentColor" fill="none"  d="M7.49,10.02c-.89.72-1.02,2.67-.64,3.84.22.67.46,1.14.71,1.42"/>
    </svg>
  );
}

export function MainIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 25 25" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="8" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="2" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.83,12.8c.81.81,2.14.81,2.95,0s.81-2.14,0-2.95h0l-1.84-1.84c.81.81,2.13.81,2.95,0,.81-.81.81-2.13,0-2.95h0l-2.95-2.95c-.81-.81-2.13-.81-2.95,0-.81.81-.81,2.13,0,2.95l-1.84-1.84c-.81-.81-2.14-.81-2.95,0s-.81,2.14,0,2.95l6.64,6.64h-.01Z"/>
        <path d="M2.1,21.9h0c-.44-.44-.44-1.16,0-1.6l.66-.66,1.6,1.6-.66.66c-.44.44-1.16.44-1.6,0Z"/>
        <path d="M21.24,4.36l-1.6-1.6.66-.66c.44-.44,1.16-.44,1.6,0h0c.44.44.44,1.16,0,1.6l-.66.66Z"/>
        <path d="M5.06,21.89c.81.81,2.13.81,2.95,0,.81-.81.81-2.13,0-2.95h0l1.84,1.84c.81.81,2.14.81,2.95,0,.81-.81.81-2.14,0-2.95l-6.64-6.64c-.81-.81-2.14-.81-2.95,0s-.81,2.14,0,2.95l1.84,1.84c-.81-.81-2.13-.81-2.95,0-.81.81-.81,2.13,0,2.95l2.95,2.95h0Z"/>
        <rect x="8.46" y="10.87" width="7.07" height="2.27" transform="translate(-4.97 12) rotate(-45)"/>
        <line x1="5.05" y1="15.98" x2="8.01" y2="18.94"/>
        <line x1="15.99" y1="5.06" x2="18.94" y2="8.01"/>
    </svg>
  );
}

export function TargetIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 25 25" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="19" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="23" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line stroke="currentColor"  x1="12" y1="16.5" x2="12" y2="22.5"/>
        <path stroke="currentColor" fill="none"  d="M2,16.5s1,0,2-1"/>
        <path stroke="currentColor" fill="none"  d="M6,22.5s-1.13-1.32-1.13-4.18"/>
        <path stroke="currentColor" fill="none"  d="M3,12.5s-1,1,0,2,4,3,4,4"/>
        <path stroke="currentColor" fill="none"  d="M8,13.5c1-1,2-2,3-5"/>
        <path stroke="currentColor" fill="none"  d="M9,1.5s0,1.26-.5,2.28"/>
        <path stroke="currentColor" fill="none"  d="M1,7.5c.56-1.37,2-2,3-2"/>
        <path stroke="currentColor" fill="none"  d="M4,7.28s.99-.31,1.7-1.02,1.3-2.76,4.3-1.76"/>
        <path stroke="currentColor" fill="none"  d="M20,15.5c1,1,2,1,2,1"/>
        <path stroke="currentColor" fill="none"  d="M19.13,18.32c0,2.86-1.13,4.18-1.13,4.18"/>
        <path stroke="currentColor" fill="none"  d="M17,18.5c0-1,3-3,4-4s0-2,0-2"/>
        <path stroke="currentColor" fill="none"  d="M13,8.5c1,3,2,4,3,5"/>
        <path stroke="currentColor" fill="none"  d="M15.5,3.78c-.5-1.02-.5-2.28-.5-2.28"/>
        <path stroke="currentColor" fill="none"  d="M20,5.5c1,0,2.44.63,3,2"/>
        <path stroke="currentColor" fill="none"  d="M14,4.5c3-1,3.59,1.05,4.3,1.76s1.7,1.02,1.7,1.02"/>
    </svg>
  );
}

export function ClockIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 13 13" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="9" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M6,3v3l2,1"/>
        <circle stroke="currentColor" fill="none"  cx="6" cy="6" r="5"/>
    </svg>
  );
}

export function Repeat2Icon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 13 13" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="9" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="3" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M1,4.5l1.5-1.5,1.5,1.5"/>
        <path stroke="currentColor" fill="none"  d="M6.5,9h-3c-.55,0-1-.45-1-1V3"/>
        <path stroke="currentColor" fill="none"  d="M11,7.5l-1.5,1.5-1.5-1.5"/>
        <path stroke="currentColor" fill="none"  d="M5.5,3h3c.55,0,1,.45,1,1v5"/>
    </svg>
  );
}

export function UserIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 13 13" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="10" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M9.5,10.5v-1c0-1.1-.9-2-2-2h-3c-1.1,0-2,.9-2,2v1"/>
        <circle stroke="currentColor" fill="none"  cx="6" cy="3.5" r="2"/>
    </svg>
  );
}

export function ZapIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 13 13" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="6" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M2,7c-.28,0-.5-.22-.5-.5,0-.12.04-.23.11-.32L6.56,1.09c.09-.1.25-.12.35-.03.07.06.1.16.08.26l-.96,3.01c-.1.26.03.55.29.64.06.02.12.03.18.03h3.5c.28,0,.5.22.5.5,0,.12-.04.23-.11.32l-4.95,5.1c-.09.1-.25.12-.35.03-.07-.06-.1-.16-.08-.26l.96-3.01c.1-.26-.03-.55-.29-.64-.06-.02-.12-.03-.18-.03h-3.5Z"/>
    </svg>
  );
}

export function AlertCircleIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle stroke="currentColor" fill="none"  cx="8" cy="8" r="7"/>
        <line stroke="currentColor"  x1="8" y1="4.5" x2="8" y2="8.5"/>
        <circle stroke="currentColor" fill="none" cx="8" cy="11" r="0.75" fill="#000"/>
    </svg>
  );
}

export function ExternalLinkIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M12,9v3.5c0,.83-.67,1.5-1.5,1.5H3.5c-.83,0-1.5-.67-1.5-1.5V5.5c0-.83.67-1.5,1.5-1.5h3.5"/>
        <polyline stroke="currentColor" fill="none"  points="10,1 15,1 15,6"/>
        <line stroke="currentColor"  x1="7.5" y1="8.5" x2="15" y2="1"/>
    </svg>
  );
}

export function LogInIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M6,1.5h-2.5c-1.1,0-2,.9-2,2v9c0,1.1.9,2,2,2h2.5"/>
        <line stroke="currentColor"  x1="10" y1="8" x2="4" y2="8"/>
        <polyline stroke="currentColor" fill="none"  points="7,5 10,8 7,11"/>
    </svg>
  );
}

export function LogOutIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="15" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none"  d="M10,1.5h2.5c1.1,0,2,.9,2,2v9c0,1.1-.9,2-2,2h-2.5"/>
        <line stroke="currentColor"  x1="12" y1="8" x2="6" y2="8"/>
        <polyline stroke="currentColor" fill="none"  points="9,5 12,8 9,11"/>
    </svg>
  );
}

export function SheetIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="14" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect stroke="currentColor" fill="none"  x="2" y="1" width="12" height="14" rx="1.33" ry="1.33"/>
        <line stroke="currentColor"  x1="5" y1="5" x2="11" y2="5"/>
        <line stroke="currentColor"  x1="5" y1="8" x2="11" y2="8"/>
        <line stroke="currentColor"  x1="5" y1="11" x2="9" y2="11"/>
    </svg>
  );
}

export function TypeIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="10" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="3" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line stroke="currentColor"  x1="2" y1="4" x2="14" y2="4"/>
        <line stroke="currentColor"  x1="4" y1="8" x2="12" y2="8"/>
        <line stroke="currentColor"  x1="6" y1="12" x2="10" y2="12"/>
    </svg>
  );
}


export function MikleSharpIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 117 31" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="98" y="29" width="1" height="1"/>
        <rect fill="currentColor" x="97" y="29" width="1" height="1"/>
        <rect fill="currentColor" x="99" y="28" width="1" height="1"/>
        <rect fill="currentColor" x="97" y="28" width="1" height="1"/>
        <rect fill="currentColor" x="100" y="27" width="1" height="1"/>
        <rect fill="currentColor" x="97" y="27" width="1" height="1"/>
        <rect fill="currentColor" x="100" y="26" width="1" height="1"/>
        <rect fill="currentColor" x="97" y="26" width="1" height="1"/>
        <rect fill="currentColor" x="101" y="25" width="1" height="1"/>
        <rect fill="currentColor" x="102" y="24" width="1" height="1"/>
        <rect fill="currentColor" x="99" y="24" width="1" height="1"/>
        <rect fill="currentColor" x="98" y="25" width="1" height="1"/>
        <rect fill="currentColor" x="103" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="100" y="23" width="1" height="1"/>
        <rect fill="currentColor" x="104" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="101" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="105" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="102" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="103" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="62" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="106" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="104" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="73" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="72" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="71" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="70" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="69" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="68" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="67" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="61" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="60" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="59" y="21" width="1" height="1"/>
        <rect fill="currentColor" x="58" y="22" width="1" height="1"/>
        <rect fill="currentColor" x="45" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="44" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="43" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="42" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="41" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="40" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="36" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="37" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="35" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="27" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="26" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="20" width="1" height="1"/>
        <rect fill="currentColor" x="107" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="100" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="99" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="98" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="94" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="93" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="92" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="82" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="76" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="75" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="74" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="67" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="66" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="65" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="61" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="59" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="51" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="50" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="49" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="48" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="47" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="46" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="45" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="39" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="35" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="32" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="28" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="26" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="23" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="112" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="111" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="110" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="109" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="108" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="107" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="100" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="98" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="97" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="96" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="95" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="91" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="83" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="82" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="77" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="65" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="64" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="62" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="58" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="53" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="52" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="51" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="40" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="39" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="36" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="33" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="29" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="26" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="23" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="114" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="113" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="107" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="101" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="99" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="98" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="91" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="90" y="19" width="1" height="1"/>
        <rect fill="currentColor" x="84" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="82" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="78" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="67" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="66" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="65" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="44" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="43" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="41" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="40" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="39" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="37" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="35" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="34" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="30" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="27" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="24" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="115" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="110" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="109" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="108" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="102" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="99" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="91" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="85" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="83" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="79" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="71" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="70" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="69" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="68" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="48" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="47" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="46" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="45" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="42" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="41" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="38" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="31" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="28" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="25" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="115" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="112" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="111" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="109" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="103" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="99" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="91" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="86" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="85" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="84" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="80" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="49" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="45" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="44" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="43" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="38" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="36" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="31" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="30" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="29" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="26" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="23" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="16" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="115" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="114" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="113" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="110" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="105" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="104" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="99" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="93" y="18" width="1" height="1"/>
        <rect fill="currentColor" x="93" y="17" width="1" height="1"/>
        <rect fill="currentColor" x="93" y="16" width="1" height="1"/>
        <rect fill="currentColor" x="93" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="94" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="91" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="90" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="89" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="88" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="87" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="81" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="48" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="47" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="46" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="39" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="35" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="34" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="32" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="27" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="23" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="17" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="110" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="108" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="107" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="106" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="104" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="98" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="97" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="96" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="95" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="87" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="82" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="40" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="34" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="33" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="24" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="18" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="111" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="88" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="82" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="41" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="36" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="35" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="34" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="29" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="25" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="23" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="112" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="89" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="83" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="41" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="38" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="37" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="35" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="26" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="19" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="90" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="84" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="45" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="42" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="35" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="20" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="90" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="87" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="86" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="85" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="84" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="46" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="43" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="36" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="21" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="91" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="89" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="88" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="85" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="47" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="43" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="37" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="92" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="90" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="85" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="48" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="44" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="38" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="93" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="90" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="86" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="49" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="45" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="39" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="23" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="93" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="91" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="87" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="50" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="46" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="40" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="23" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="94" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="91" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="88" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="51" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="50" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="46" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="41" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="24" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="95" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="91" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="90" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="89" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="51" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="47" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="43" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="42" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="24" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="51" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="48" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="24" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="23" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="22" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="51" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="50" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="49" y="1" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 117 31" fill="none">
        <path fill="currentColor" d="M98.51,28.69c.41-2.58,4-6.4,5.89-8.24.42-.41,2.68-2.02,2.61-2.43-.03-.19-.41-.3-.31-.6l.92-.15,4.84-6.49.49.32-4.1,5.84c.13.12,3.68-2.24,4.66-2.59,1.54-.54,3.46-.7,2.06,1.63-1.05,1.76-2.92,2.46-4.88,2.43-1.1-.02-2.94-.1-3.08-.02-.18.11-.74.81-.81,1.01-.16.42-.14,1.8-.67.81-2.25,2.9-4.18,6.07-6.41,8.97-.91,1.18-1.47,1.16-1.2-.48h0ZM108.67,17.58c-.29.41,1.88.34,2.06.33,1.54-.1,3.58-.68,4.16-2.26.54-1.47-.34-1.22-1.27-.84-1.86.78-3.22,1.88-4.95,2.76h0ZM99.75,28.29c1.14-1.51,4.13-5.43,4.8-7.1-2.24,1.83-4.48,4.11-5.45,6.89-.55,1.59-.21,1.33.64.21h0Z"/>
        <path fill="currentColor" d="M22.22,12.99l4.82-2.78c.57-.99,1.13-1.92,2.35-2.13.17-.03.6-.13.56.15-.95-.03-1.78.64-2.14,1.48.22.19,1.23-.86,1.48-.33-1.88.34-2.2,1.82-3.16,3.17-1.1,1.55-3.93,4.66-4.56,6.12-.19.43-.25.73-.19,1.2-.9-.07-.38-1.21-.13-1.69l5.24-7.33c-.19-.18-3.82,2.39-4.21,2.78-.22.27-1.5,2.03-1.89,1.65-.32-.32.83-.97,1.02-1.36.32-.65.63-4.22.05-4.21-.45,0-4.68,6.21-5.57,7.15-2.7,2.84-6.33,3.93-10.23,3.66-1.09-.07-5.42-.7-4.61-2.45.33-.72,4.38-1.57,5.32-1.76,1.76-.35,3.94-.72,5.71-.88.13-.01.6-.05.33.17-3.58.6-7.21,1.18-10.61,2.47-.55.8,2.12,1.51,2.59,1.59,2.02.36,4.36.23,6.33-.33,4.95-1.42,7.32-6.65,10.42-10.29.26-.55-.3-1.05-.25-1.63.39,0,.42,1.31.82.98.54-1.18,3.73-4.43,2.3-5.65-.73-.63-1.59-.08-2.3.24-.12-.32.66-.7.81-.74.94-.28,1.95-.11,2.24.9.27.95-.44,2.06-.88,2.9-.43.81-2.07,2.86-1.98,3.54.45,1.27.5,1.67.3,3.4h0Z"/>
        <path fill="currentColor" d="M85.78,9.54c0-.27-.06-.53.16-.74.27-.26,2.08-.65,2.75-1.03,1.28-.73,2.96-2.83,2.69-4.38-.16-.88-1.2.1-1.57.4-7.28,5.98-8.81,17.43-20.59,16.74-.98-.06-6.19-.94-4.61-2.64.91-.99,9.18-2.31,10.87-2.46.13-.01.6-.05.33.17-2.76.53-5.79.91-8.48,1.72-1.9.57-3.39,1.25-.45,2.09,12,3.43,15.29-9.49,22.21-15.69,2.83-2.54,3.72-.58,2.15,2.15-1.1,1.91-3.28,3.32-5.47,3.66h0Z"/>
        <path fill="currentColor" d="M41.32,3.15l-7.74,10.58c.13.24.4-.03.54-.12,1.71-.96,3.33-2.26,5.12-3.04,1.16.49.4,1.51-.72,1.1l-.08-.32-4.53,2.7c4.43-.19,3.83,1.77.88,3.66-.51.05-3.53,2.15-3.68,2-.22-.23.26-.66.41-.82.72-.69,2.52-1.4,3.49-2.1,3.42-2.45-.24-2.12-2.39-1.9l-4.07,4.98c-1.5,1.05-1.29-.56-.96-1.61.64-2.04,2.8-3.18,4.65-3.89l8.24-10.81.82-.41h0ZM30.94,15.61c-1.67.27-3.13,2.28-3.13,3.93l1.8-1.89c.15-.31,1.54-1.83,1.32-2.04h0Z"/>
        <path fill="currentColor" d="M90.81,14.14c.99.17,1.11,1.12.58,1.89-1.27,1.81-4.03,2.31-5.52,3.85-.19-.1-.07-.5,0-.65.28-.56,3.45-2.11,4.27-2.79.31-.26,1.19-1.02.89-1.46-.16-.24-3.38-.27-3.77-.09-.69.31-2.78,3.54-3.54,4.34-2.52,2.69-1.87-.87-.65-2.45,1.23-1.57,2.96-1.61,4.1-2.8,2.78-2.89,5.07-7.32,7.82-10.25.24-.26.53-.54.9-.58l-7.99,10.99c.88.11,2.05-.14,2.88,0h0ZM85.95,15.45c-1.91.27-3.54,2.23-3.46,4.1,1.37-1.15,2.29-2.75,3.46-4.1h0Z"/>
        <path fill="currentColor" d="M40.88,13.87c-.83.82-1.76,2.34-2.53,3.3-.68.84-1.46,1.62-2.14,2.46.36.25.81-.21,1.15-.34.15-.06.54-.21.5.09-.61.08-1.02.65-1.6.78-.18.04-1.19.21-1.03-.21.11-.29,1.47-1.56,1.8-1.98.4-.49,2.43-3.03,2.56-3.37.09-.23-.11-.47,0-.65.06-.1,1.26-1.02,1.64-1.49,2.56-3.17,4.53-6.73,7.42-9.83.78-.83,1.41-1.73,2.64-1.65,2.72.17-.74,4.25-1.49,5.1-2.63,2.97-6.24,5.09-8.92,7.76h0ZM41.48,12.99c1.42-1.29,3.03-2.4,4.45-3.69,1.24-1.13,6.07-5.7,5.93-7.21-.06-.69-.92-.67-1.44-.46-.65.27-4.07,4.46-4.72,5.3l-4.21,6.05h0Z"/>
        <path fill="currentColor" d="M57.62,18.07c-.02.23-.73.28-.92.31-4.62.52-10.37,2.05-14.8,2-1.99-.02-3.57-1.08-1.9-2.96l-.82-.08c.18-.22.51-.33.78-.37,2.87-.49,5.14-2.14,7.94-2.75.69-.15,4.24-.66,3.06.76-.85,1.02-6.55,2.15-8.1,2.43-.85.15-2.37-.05-2.91,1.05-.76,1.56,3.49,1.31,4.25,1.26,4.43-.25,8.95-1.71,13.42-1.64h0ZM50.71,14.47c-2.36-.36-4.54.87-6.7,1.61l-1.54.85c1.95-.27,4.05-.65,5.93-1.23.81-.25,1.86-.44,2.31-1.23h0Z"/>
        <path fill="currentColor" d="M98.96,18.73l1.64-1.48c-3.76,5.12-2.01.33-2.14.16-1.22,1.18-5.59,2.54-6.84,1.32-.98-.96.7-2.54,1.66-2.8l-1.5,1.64c-.61,1.97,3.45.97,4.42.62.52-.18,2.32-1.13,2.56-1.55.27-.47.31-1.78.02-2.25-.63-.99-2.94-.43-3.94-.34,1.04-.64,3.37-.79,4.52-.57.5.09.91.74.92,1.22,0,1.07-1.66,2.62-1.32,4.02h0Z"/>
        <path fill="currentColor" d="M106.86,13.65c-.17-.12-3.21,2.03-3.54,2.29-.84.69-1.77,2.8-2.55,3.2-.25.13-.49-.04-.49-.17-.02-.47,3.72-4.86,4.18-5.67,1.3-.57.09.92-.24,1.32.33.28,3.15-2.94,4.2-1.97.73.68-.23,2.07-1.24,1.57-.28-.14-.3-.56-.33-.58h0Z"/>
        <path fill="currentColor" d="M61.79,20.16c-.8-.85,2.23-.82,1.18-1.92-.24.2-2,.98-2.12.96-.26-.05-.82-.86-1.34-1.27-.27-.22-.53-.33-.73-.16-.18.15.07.65.21.75.23.18,1.42,1.11,1.42,1.12.01.29-.69.51-1.03.75-.33.23.19.61.45.64.25.02.82-.93,1.15-.93.36,0,1.87,1.75,2.31,1.75.4,0,.27-.18.03-.38-.62-.5-.94-.66-1.55-1.31h0Z"/>
        <path fill="currentColor" d="M23.64,20.15c-.84.79-.17-.72.02-1.04.44-.73,3.67-5.58,4.32-5.87.63-.29.97.57.74,1.07l-2.81,2.45c-.83.82-1.5,2.67-2.27,3.39h0Z"/>
    </svg>
  );
}

export function ListIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="10" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="2" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" fill="none" d="M14,2L14,2H2"/>
        <path stroke="currentColor" fill="none" d="M10.3,14H4.8 M2.4,14H2"/>
        <path stroke="currentColor" fill="none" d="M10.3,6H4.8 M2.4,6H2"/>
        <path stroke="currentColor" fill="none" d="M10.3,10H4.8 M2.4,10H2"/>
    </svg>
  );
}

export function TodayIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="12" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="15" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="15" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="1" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="1" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="2" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line stroke="currentColor" fill="none" x1="8" y1="11.94" x2="8" y2="7.17"/>
        <ellipse stroke="currentColor" fill="none" cx="8" cy="4.34" rx="2.87" ry="2.84"/>
        <path stroke="currentColor" fill="none" d="M5.13,10.35c-2.15.36-3.63,1.1-3.63,1.96,0,1.21,2.91,2.19,6.5,2.19s6.5-.98,6.5-2.19c0-.86-1.48-1.61-3.63-1.96"/>
    </svg>
  );
}

export function HistoryIcon({ className, style }: IconProps) {
  const isRetro = useIconStyle();

  if (isRetro) {
    return (
      <svg className={className} viewBox="0 0 17 17" fill="none" style={{ ...style, stroke: undefined }}>
        <rect fill="currentColor" x="5" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="14" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="13" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="12" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="14" y="5" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="3" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="13" y="4" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="4" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="12" y="3" width="1" height="1"/>
        <rect fill="currentColor" x="2" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="5" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="6" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="7" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="2" width="1" height="1"/>
        <rect fill="currentColor" x="10" y="10" width="1" height="1"/>
        <rect fill="currentColor" x="11" y="11" width="1" height="1"/>
        <rect fill="currentColor" x="9" y="9" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="8" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="7" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="6" width="1" height="1"/>
        <rect fill="currentColor" x="8" y="5" width="1" height="1"/>
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="currentColor" fill="none" d="M5.3,5.3H2V2"/>
      <path stroke="currentColor" fill="none" d="M8,5.8V8l2.7,1.3"/>
      <path stroke="currentColor" fill="none" d="M2,5.3c0,0,1.3-1.2,1.8-1.6C4.9,2.7,6.3,2,8,2s3.2,0.7,4.2,1.8S14,6.3,14,8s-0.7,3.2-1.8,4.2S9.7,14,8,14s-3.2-0.7-4.2-1.8"/>
    </svg>
  );
}
