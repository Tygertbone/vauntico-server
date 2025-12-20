/**
 * Performance Monitoring Utilities
 * Track Core Web Vitals and send to analytics
 */

// Track Web Vitals (using basic Performance API)
export function reportWebVitals() {
  // Only run in browser
  if (typeof window === 'undefined') return
  if (!window.performance || !window.performance.timing) return

  // Use Navigation Timing API
  const timing = window.performance.timing
  const loadTime = timing.loadEventEnd - timing.navigationStart
  const domReady = timing.domContentLoadedEventEnd - timing.navigationStart
  const ttfb = timing.responseStart - timing.fetchStart
  
  // Send basic metrics
  sendToAnalytics({
    name: 'page_load',
    value: loadTime,
    id: Date.now().toString()
  })
  
  sendToAnalytics({
    name: 'dom_ready',
    value: domReady,
    id: Date.now().toString()
  })
  
  sendToAnalytics({
    name: 'ttfb',
    value: ttfb,
    id: Date.now().toString()
  })
}

// Send metrics to analytics
function sendToAnalytics(metric) {
  const { name, value, id } = metric

  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true
    })
  }

  // Send to Mixpanel
  if (window.mixpanel) {
    window.mixpanel.track('web_vital', {
      metric_name: name,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      metric_id: id,
      rating: getRating(name, value)
    })
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}:`, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      rating: getRating(name, value)
    })
  }
}

// Get rating (good, needs-improvement, poor)
function getRating(name, value) {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 }
  }

  const threshold = thresholds[name]
  if (!threshold) return 'unknown'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Track long tasks (blocking main thread > 50ms)
export function monitorLongTasks() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            if (import.meta.env.DEV) {
              console.warn('[Performance] Long task detected:', {
                duration: Math.round(entry.duration),
                startTime: Math.round(entry.startTime)
              })
            }

            // Send to analytics
            if (window.mixpanel) {
              window.mixpanel.track('long_task', {
                duration: Math.round(entry.duration),
                start_time: Math.round(entry.startTime)
              })
            }
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      // Long task API not supported
    }
  }
}

// Monitor resource loading
export function monitorResourceTiming() {
  if (!window.performance || !window.performance.getEntriesByType) return

  const resources = window.performance.getEntriesByType('resource')
  const slowResources = resources.filter(r => r.duration > 1000)

  if (slowResources.length > 0 && import.meta.env.DEV) {
    console.warn('[Performance] Slow resources detected:', slowResources.map(r => ({
      name: r.name,
      duration: Math.round(r.duration),
      size: r.transferSize
    })))
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  // Wait for page to fully load
  if (document.readyState === 'complete') {
    reportWebVitals()
    monitorLongTasks()
    monitorResourceTiming()
  } else {
    window.addEventListener('load', () => {
      reportWebVitals()
      monitorLongTasks()
      monitorResourceTiming()
    })
  }
}

// Export dev utilities
export const PerformanceDev = {
  // Get current performance metrics
  getMetrics: () => {
    if (!window.performance) return null

    const navigation = window.performance.getEntriesByType('navigation')[0]
    const paint = window.performance.getEntriesByType('paint')

    return {
      dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      tcp: Math.round(navigation.connectEnd - navigation.connectStart),
      ttfb: Math.round(navigation.responseStart - navigation.requestStart),
      download: Math.round(navigation.responseEnd - navigation.responseStart),
      domInteractive: Math.round(navigation.domInteractive),
      domComplete: Math.round(navigation.domComplete),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      resources: window.performance.getEntriesByType('resource').length
    }
  },

  // Log performance summary
  logSummary: () => {
    const metrics = PerformanceDev.getMetrics()
    if (!metrics) return

    console.table({
      'DNS Lookup': `${metrics.dns}ms`,
      'TCP Connection': `${metrics.tcp}ms`,
      'Time to First Byte': `${metrics.ttfb}ms`,
      'Download': `${metrics.download}ms`,
      'DOM Interactive': `${metrics.domInteractive}ms`,
      'DOM Complete': `${metrics.domComplete}ms`,
      'Page Load': `${metrics.loadComplete}ms`,
      'First Contentful Paint': metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A',
      'Resources Loaded': metrics.resources
    })
  }
}

// Expose in dev mode
if (import.meta.env.DEV) {
  window.VaunticoPerformance = PerformanceDev
  console.log('📊 Performance Monitoring: window.VaunticoPerformance.logSummary()')
}
