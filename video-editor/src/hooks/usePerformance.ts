import { useRef, useCallback } from 'react'
import { useVideoStore } from '../store/videoStore'

export function usePerformance() {
  const updatePerf = useVideoStore((s) => s.updatePerf)

  // rAFループ内でstale closureを避けるためrefで管理
  const frameCountRef = useRef(0)
  const lastFpsTimeRef = useRef(performance.now())
  const frameMsRef = useRef(0)

  const recordFrame = useCallback((ms: number) => {
    frameMsRef.current = ms
    frameCountRef.current++

    const now = performance.now()
    const elapsed = now - lastFpsTimeRef.current

    // 1秒ごとにFPS更新
    if (elapsed >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / elapsed)
      updatePerf({
        fps,
        msPerFrame: Math.round(frameMsRef.current * 10) / 10,
        frameCount: frameCountRef.current,
      })
      frameCountRef.current = 0
      lastFpsTimeRef.current = now
    }
  }, [updatePerf])

  const reset = useCallback(() => {
    frameCountRef.current = 0
    lastFpsTimeRef.current = performance.now()
    frameMsRef.current = 0
    updatePerf({ fps: 0, msPerFrame: 0, frameCount: 0 })
  }, [updatePerf])

  return { recordFrame, reset }
}
