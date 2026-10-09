import { useEffect, useState } from 'react'

type Props = { code: string; fileUrl: string | null; cssUrl?: string | null; fontFamily?: string | null; fontWeight?: number | null; italic?: boolean; className?: string; text: string }

export default function FontSample({ code, fileUrl, cssUrl, fontFamily, fontWeight, italic, className, text }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(fileUrl || cssUrl ? 'loading' : 'ready')
  const family = `engraving-${code}`

  useEffect(() => {
    let alive = true
    if (fileUrl) {
      const font = new FontFace(family, `url("${fileUrl}")`, { style: 'normal' })
      font.load().then(loaded => {
        if (!alive) return
        document.fonts.add(loaded)
        setStatus('ready')
      }).catch(() => { if (alive) setStatus('error') })
    } else if (cssUrl && fontFamily && fontWeight) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = cssUrl
      link.onload = () => {
        document.fonts.load(`${italic ? 'italic ' : ''}${fontWeight} 20px "${fontFamily}"`, 'An Nhiên · Tình Yêu').then(faces => {
          if (alive) setStatus(faces.length ? 'ready' : 'error')
        }).catch(() => { if (alive) setStatus('error') })
      }
      link.onerror = () => { if (alive) setStatus('error') }
      document.head.append(link)
      return () => { alive = false; link.remove() }
    }
    return () => { alive = false }
  }, [family, fileUrl, cssUrl, fontFamily, fontWeight, italic])

  if ((fileUrl || cssUrl) && status !== 'ready') return <span className={className} role="status">{status === 'loading' ? 'Đang tải kiểu chữ…' : 'Không tải được kiểu chữ này.'}</span>
  return <span className={className} style={{ fontFamily: fileUrl ? `"${family}"` : cssUrl && fontFamily ? `"${fontFamily}"` : code === 'SERIF' ? 'serif' : 'cursive', fontWeight: cssUrl && fontWeight ? fontWeight : undefined, fontStyle: cssUrl && italic ? 'italic' : undefined }}>{text}</span>
}
