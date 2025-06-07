"use client"

import { useState, useEffect } from "react"

export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const detectTouch = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator.msMaxTouchPoints !== undefined && navigator.msMaxTouchPoints > 0)
      )
    }

    setIsTouchDevice(detectTouch())
  }, [])

  return isTouchDevice
}
