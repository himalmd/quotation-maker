import { useRef, useState, useLayoutEffect } from 'react';
import type { LayoutProps } from './layouts/types';
import ClassicLayout from './layouts/ClassicLayout';
import ModernLayout  from './layouts/ModernLayout';
import BoldLayout    from './layouts/BoldLayout';
import MinimalLayout from './layouts/MinimalLayout';
import type { LayoutId } from '../types';

interface PdfPreviewProps {
  layout: LayoutId;
  layoutProps: LayoutProps;
  /** Scale factor to apply (1 = full A4 size). Default 1. */
  scale?: number;
  /** Extra wrapper className for the scroll container */
  className?: string;
}

// A4 at 96 dpi ≈ 794 × 1123 px
const A4_W = 794;
const A4_H = 1123;

export default function PdfPreview({ layout, layoutProps, scale = 1, className = '' }: PdfPreviewProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [ready, setReady] = useState(false);

  const LayoutComponent =
    layout === 'modern'  ? ModernLayout  :
    layout === 'bold'    ? BoldLayout    :
    layout === 'minimal' ? MinimalLayout :
    ClassicLayout;

  // Measure the actual rendered height of the layout to work out page count
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.scrollHeight;
      const newPageCount = Math.max(1, Math.ceil(h / (A4_H - 1))); // Use -1 to avoid edge case rounding issues
      setPageCount(newPageCount);
      setReady(true);
    };

    // Initial measure
    updateHeight();

    // Use ResizeObserver to catch any changes in content (like images loading or AI text appearing)
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, [layout, JSON.stringify(layoutProps)]);

  const scaledW = Math.round(A4_W * scale);
  const scaledH = Math.round(A4_H * scale);

  return (
    <div className={`flex flex-col items-center gap-6 pb-12 ${className}`}>
      {/*
        Hidden measurement node — rendered at full A4 width, off-screen.
        We only need scrollHeight from it; it is never visible.
      */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: A4_W,
          pointerEvents: 'none',
          zIndex: -1,
          visibility: 'hidden',
        }}
      >
        <div ref={measureRef} style={{ width: A4_W }}>
          <LayoutComponent {...layoutProps} />
        </div>
      </div>

      {/* Stacked A4 page cards */}
      {Array.from({ length: pageCount }).map((_, pageIdx) => (
        <div
          key={pageIdx}
          className="bg-white shadow-2xl flex-shrink-0 relative transition-opacity duration-300"
          style={{
            width: scaledW,
            height: scaledH,
            overflow: 'hidden',
            borderRadius: 4,
            opacity: ready ? 1 : 0,
            // Subtle page shadow
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2), 0 4px 10px -5px rgba(0,0,0,0.1)',
          }}
        >
          {/* The actual layout, shifted up by (pageIdx × A4_H) before scaling */}
          <div
            style={{
              transform: `scale(${scale}) translateY(${-pageIdx * A4_H}px)`,
              transformOrigin: 'top left',
              width: A4_W,
            }}
          >
            <LayoutComponent {...layoutProps} />
          </div>

          {/* Page number badge */}
          <div
            className="absolute bottom-3 right-4 text-[10px] font-black tracking-widest text-gray-300 select-none uppercase pointer-events-none"
          >
            Page {pageIdx + 1} / {pageCount}
          </div>
        </div>
      ))}
    </div>
  );
}
