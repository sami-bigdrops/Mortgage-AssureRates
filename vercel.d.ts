declare module '@vercel/analytics/next' {
  export function Analytics(): null
}

declare module '@vercel/speed-insights/next' {
  interface SpeedInsightsProps {
    sampleRate?: number
    route?: string | null
    debug?: boolean
  }
  export function SpeedInsights(props?: SpeedInsightsProps): null
}
