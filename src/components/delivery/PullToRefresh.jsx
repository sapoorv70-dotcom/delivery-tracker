import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, className, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      if (refreshingRef.current) return;

      // Skip if touch started inside a fixed overlay (sidebar, dialog, comment panel)
      if (e.target.closest && e.target.closest('.fixed')) return;

      // Skip if touch started inside a scrollable sub-section that can scroll up
      let node = e.target;
      while (node && node !== el) {
        const style = window.getComputedStyle(node);
        const overflowY = style.overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollTop > 0) {
          return;
        }
        node = node.parentElement;
      }

      // Only engage pull tracking when the scroll root is at the very top.
      // This keeps native iOS scroll-bounce / momentum scrolling fully intact.
      if (el.scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
        pullingRef.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!pullingRef.current) return;
      // If the browser has started native scrolling away from top, bail immediately
      // so we never fight the native gesture or lock body touch events.
      if (el.scrollTop > 0) {
        pullingRef.current = false;
        pullRef.current = 0;
        setPullDistance(0);
        return;
      }
      const diff = e.touches[0].clientY - startYRef.current;
      if (diff > 0) {
        pullRef.current = Math.min(diff * 0.5, THRESHOLD * 1.5);
        setPullDistance(pullRef.current);
      }
    };

    const handleTouchEnd = async () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      if (pullRef.current >= THRESHOLD) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPullDistance(THRESHOLD);
        try {
          await onRefresh();
        } catch (e) {
          console.error('Pull-to-refresh failed:', e);
        } finally {
          pullRef.current = 0;
          refreshingRef.current = false;
          setRefreshing(false);
          setPullDistance(0);
        }
      } else {
        pullRef.current = 0;
        setPullDistance(0);
      }
    };

    // All listeners are passive — we never call preventDefault, so iOS Safari
    // WebView native scroll-bounce and momentum scrolling remain fully functional.
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh]);

  return (
    <div ref={containerRef} className={className}>
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200 ease-out"
        style={{ height: refreshing ? THRESHOLD : pullDistance }}
      >
        <Loader2
          className={`w-5 h-5 text-slate-400 transition-opacity duration-200 ${pullDistance > 10 || refreshing ? 'opacity-100' : 'opacity-0'} ${refreshing ? 'animate-spin' : ''}`}
        />
      </div>
      {children}
    </div>
  );
}