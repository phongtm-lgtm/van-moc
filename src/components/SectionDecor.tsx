/** Soft accents layered over paper texture backgrounds. */
export function SectionDecor({
  variant = 'light',
  showMotif = false,
}: {
  variant?: 'light' | 'warm' | 'wine'
  /** Top center ornamental flourish — only on selected sections */
  showMotif?: boolean
}) {
  const wine = variant === 'wine'

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      {showMotif && !wine ? (
        <svg
          className="absolute left-1/2 top-3 md:top-5 h-8 w-40 -translate-x-1/2 md:h-9 md:w-48 text-[#c9973a]/50"
          viewBox="0 0 200 36"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M10 18 H70" />
          <path d="M130 18 H190" />
          <path d="M100 6 C108 12 108 24 100 30 C92 24 92 12 100 6 Z" />
          <circle cx="100" cy="18" r="2.2" fill="currentColor" stroke="none" />
          <path d="M82 18 C88 12 94 12 100 18 C106 12 112 12 118 18" />
        </svg>
      ) : null}

      {wine ? (
        <>
          <svg
            className="absolute -left-8 -top-10 w-[280px] md:w-[380px] text-[#c9973a] opacity-[0.14]"
            viewBox="0 0 320 280"
            fill="currentColor"
          >
            <ellipse cx="90" cy="140" rx="70" ry="110" transform="rotate(-28 90 140)" className="opacity-40" />
            <path d="M40 200 C70 80 140 40 200 70 C150 110 100 160 70 230 Z" className="opacity-70" />
          </svg>
          <svg
            className="absolute -right-10 bottom-[-40px] w-[260px] md:w-[340px] rotate-12 text-[#fff2dc] opacity-[0.1]"
            viewBox="0 0 300 260"
            fill="currentColor"
          >
            <path d="M220 40 C180 90 150 150 160 230 C210 180 260 120 280 60 Z" />
          </svg>
          <svg
            className="absolute inset-0 size-full text-[#c9973a]/25"
            viewBox="0 0 1200 600"
            preserveAspectRatio="none"
            fill="none"
            stroke="currentColor"
          >
            <path d="M-20 180 C180 120 320 220 520 160 C720 100 880 200 1220 140" strokeWidth="1.1" />
            <path d="M-20 260 C200 210 380 300 560 240 C760 170 940 280 1220 220" strokeWidth="0.8" opacity="0.7" />
            <path d="M-20 420 C160 380 340 460 540 400 C760 330 960 450 1220 390" strokeWidth="1" opacity="0.55" />
          </svg>
          <svg
            className="absolute left-1/2 top-3 md:top-5 h-8 w-40 -translate-x-1/2 md:h-9 md:w-48 text-[#c9973a]/45"
            viewBox="0 0 200 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M10 18 H70" />
            <path d="M130 18 H190" />
            <path d="M100 6 C108 12 108 24 100 30 C92 24 92 12 100 6 Z" />
            <circle cx="100" cy="18" r="2.2" fill="currentColor" stroke="none" />
            <path d="M82 18 C88 12 94 12 100 18 C106 12 112 12 118 18" />
          </svg>
          <div className="absolute -left-20 top-1/3 h-56 w-56 rounded-full bg-[#c9973a]/10 blur-3xl" />
          <div className="absolute -right-16 bottom-1/4 h-48 w-48 rounded-full bg-[#fff2dc]/06 blur-3xl" />
        </>
      ) : null}
    </div>
  )
}
