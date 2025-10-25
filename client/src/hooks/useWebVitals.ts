import { useEffect } from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    const trackMetric = (metric: WebVitalsMetric) => {
      // In production, send to analytics service
      if (process.env.NODE_ENV === 'development') {
        const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
        // Silent in production - no console logs
      }
    };

    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
          const value = lastEntry.renderTime || lastEntry.loadTime || 0;
          
          trackMetric({
            name: 'LCP',
            value,
            rating: value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor'
          });
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // Browser doesn't support LCP
      }
    };

    // First Input Delay (FID)
    const observeFID = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const value = entry.processingStart - entry.startTime;
            
            trackMetric({
              name: 'FID',
              value,
              rating: value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor'
            });
          });
        });

        observer.observe({ type: 'first-input', buffered: true });
      } catch {
        // Browser doesn't support FID
      }
    };

    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }

          trackMetric({
            name: 'CLS',
            value: clsValue,
            rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
          });
        });

        observer.observe({ type: 'layout-shift', buffered: true });
      } catch {
        // Browser doesn't support CLS
      }
    };

    observeLCP();
    observeFID();
    observeCLS();
  }, []);
}
