'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className: string
  delayMs?: number
}

export function AboutRevealCard({ children, className, delayMs = 0 }: Props) {
  const cardRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(card)

    return () => observer.disconnect()
  }, [])

  return (
    <article
      ref={cardRef}
      className={`${className} ${isVisible ? 'animate-about-card-reveal' : 'translate-x-[-1.5rem] opacity-0'}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </article>
  )
}
