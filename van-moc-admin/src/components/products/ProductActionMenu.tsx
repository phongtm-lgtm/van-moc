import { useEffect, useId, useRef, useState, type ReactNode, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

export type ProductMenuItem = { label: string; icon: ReactNode; to?: string; onClick?: () => void; disabled?: boolean; danger?: boolean }

export default function ProductActionMenu({ label, trigger, items, className = '' }: { label: string; trigger: ReactNode; items: ProductMenuItem[]; className?: string }) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const button = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const close = (focus = false) => { setPosition(null); if (focus) button.current?.focus() }
  useEffect(() => {
    if (!position) return
    menu.current?.querySelector<HTMLElement>('[role=menuitem]:not(:disabled)')?.focus()
    const outside = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) setPosition(null) }
    const resize = () => setPosition(null)
    const scroll = (event: Event) => { if (!menu.current?.contains(event.target as Node)) setPosition(null) }
    document.addEventListener('pointerdown', outside)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', scroll, true)
    return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', resize); window.removeEventListener('scroll', scroll, true) }
  }, [position])
  const open = () => {
    const rect = button.current?.getBoundingClientRect()
    if (!rect) return
    const height = items.length * 44 + 12
    setPosition({ left: Math.max(8, Math.min(rect.right - 228, window.innerWidth - 236)), top: rect.bottom + height + 8 < window.innerHeight ? rect.bottom + 6 : Math.max(8, rect.top - height - 6) })
  }
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); close(true) }
    if (event.key === 'Tab') { close(true); return }
    const options = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role=menuitem]:not(:disabled)') ?? [])
    const current = options.indexOf(document.activeElement as HTMLElement)
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length
      options[index]?.focus()
    }
  }
  return <><button ref={button} type="button" className={className} aria-label={label} aria-haspopup="menu" aria-expanded={!!position} aria-controls={position ? menuId : undefined} onClick={() => position ? close() : open()} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); open() } }}>{trigger}</button>
    {position && createPortal(<div id={menuId} ref={menu} role="menu" aria-label={label} className="products-action-menu" style={position} onKeyDown={keyboard}>{items.map(item => item.to ? <Link key={item.label} to={item.to} role="menuitem" onClick={() => close()}>{item.icon}{item.label}</Link> : <button type="button" key={item.label} role="menuitem" disabled={item.disabled} className={item.danger ? 'is-danger' : ''} onClick={() => { close(true); item.onClick?.() }}>{item.icon}{item.label}</button>)}</div>, document.body)}
  </>
}
