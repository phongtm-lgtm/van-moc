import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, LogOut, Package, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { accountApi, type Me } from '../api/account'

export function AccountDropdown({ onOpen }: { onOpen?: () => void }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<Me | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    accountApi<Me>('/api/me')
      .then(me => { if (active) setSession(me) })
      .catch(() => { if (active) setSession(null) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', keyboard)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', keyboard)
    }
  }, [open])

  const close = () => { setOpen(false); setError('') }
  const logout = async () => {
    setBusy(true)
    setError('')
    try {
      await accountApi('/api/auth/logout', 'POST')
      setSession(null)
      close()
      navigate('/login')
    } catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }

  return <div className="account-dropdown" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
  }}>
    {session === undefined ? <span className="account-dropdown__trigger" aria-busy="true"><UserRound size={19} strokeWidth={1.5} aria-hidden="true" /><span>Tài khoản</span></span> : session ? <>
      <button ref={trigger} type="button" className="account-dropdown__trigger"
        aria-expanded={open} aria-controls={id}
        onClick={() => { if (!open) onOpen?.(); setOpen(!open); setError('') }}>
        <UserRound size={19} strokeWidth={1.5} aria-hidden="true" />
        <span>Tài khoản</span>
        <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" className={open ? 'is-open' : ''} />
      </button>
      {open && <div id={id} className="account-dropdown__panel" aria-label="Tài khoản">
        <Link to="/account" onClick={close}><UserRound size={18} strokeWidth={1.5} aria-hidden="true" />Thông tin tài khoản</Link>
        <Link to="/account/orders" onClick={close}><Package size={18} strokeWidth={1.5} aria-hidden="true" />Đơn hàng của tôi</Link>
        <div className="account-dropdown__divider" />
        <button type="button" onClick={logout} disabled={busy}><LogOut size={18} strokeWidth={1.5} aria-hidden="true" />{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>
        {error && <p className="account-dropdown__status" role="alert">{error}</p>}
      </div>}
    </> : <Link className="account-dropdown__trigger" to="/login" state={{ from: pathname }} onClick={onOpen}>
      <UserRound size={19} strokeWidth={1.5} aria-hidden="true" />
      <span>Đăng nhập</span>
    </Link>}
  </div>
}
