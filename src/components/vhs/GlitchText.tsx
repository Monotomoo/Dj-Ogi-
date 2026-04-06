import { useEffect, useState } from 'react'

interface GlitchTextProps {
  text: string
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'div' | 'p'
  active?: boolean
}

export default function GlitchText({ text, className = '', as: Tag = 'span', active = false }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 150)
    }, 3000 + Math.random() * 4000)
    return () => clearInterval(interval)
  }, [active])

  return (
    <Tag className={`rgb-split ${isGlitching ? 'glitching' : ''} ${className}`}>
      {text}
    </Tag>
  )
}
