import { useEffect, useRef, useState } from 'react'

type AboutStrategyTimelineProps = {
  items: string[]
}

export function AboutStrategyTimeline({ items }: AboutStrategyTimelineProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)
  const total = items.length
  const progress = total <= 1 ? 1 : active / (total - 1)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || total <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      if (pausedRef.current) return
      setActive(current => (current + 1) % total)
    }, 3800)

    return () => window.clearInterval(id)
  }, [inView, total])

  return (
    <div
      ref={rootRef}
      className={`about-strategy-motion${inView ? ' is-in-view' : ''}`}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
      onFocusCapture={() => { pausedRef.current = true }}
      onBlurCapture={event => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
          pausedRef.current = false
        }
      }}
    >
      <div className="about-strategy-motion__rail">
        <span className="about-strategy-motion__bound" aria-hidden="true">2026</span>
        <div className="about-strategy-motion__track" aria-hidden="true">
          <span className="about-strategy-motion__fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="about-strategy-motion__bound" aria-hidden="true">2031</span>

        <div className="about-strategy-motion__stage">
          <article
            key={active}
            className="about-strategy-motion__card"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="about-strategy-motion__card-text">{items[active]}</p>
            <p className="about-strategy-motion__card-index">
              {active + 1} / {total}
            </p>
          </article>
        </div>
      </div>

      <div className="about-strategy-motion__dots" role="tablist" aria-label="Các bước chiến lược">
        {items.map((item, index) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Bước ${index + 1}: ${item}`}
            className={`about-strategy-motion__dot${index === active ? ' is-active' : ''}`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </div>
  )
}
