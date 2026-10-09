import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { CircleUserRound, LogOut, MapPin, ShoppingBag, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { accountApi, type Me } from '../api/account'

export type AccountOutletContext = { me: Me | null; setMe: Dispatch<SetStateAction<Me | null>> }

export function AccountLayout() {
  const navigate = useNavigate()
  const [me, setMe] = useState<Me | null>(null)
  const [profileError, setProfileError] = useState('')
  const [retry, setRetry] = useState(0)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  useEffect(() => {
    let active = true
    accountApi<Me>('/api/me').then(user => { if (active) { setMe(user); setProfileError('') } })
      .catch((cause: Error) => { if (active) setProfileError(cause.message) })
    return () => { active = false }
  }, [retry])
  const logout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    setLogoutError('')
    try { await accountApi('/api/auth/logout', 'POST'); window.dispatchEvent(new Event('vanmoc-auth-changed')); navigate('/login') }
    catch (cause) { setLogoutError((cause as Error).message) }
    finally { setLoggingOut(false) }
  }

  return <div className="account-page">
    <div className="account-layout">
      <aside className="account-menu" aria-label="Tài khoản của bạn">
        <div className="account-menu__profile">
          <span className="account-menu__avatar">{me?.avatarUrl ? <img src={me.avatarUrl} alt="" referrerPolicy="no-referrer" /> : <CircleUserRound size={30} strokeWidth={1.4} />}</span>
          <div><strong>{me?.fullName || 'Tài khoản'}</strong><small>{me?.email}</small></div>
        </div>
        {profileError && <p className="account-menu__error" role="alert">{profileError} <Link to="/login">Đăng nhập</Link> <button type="button" onClick={() => setRetry(value => value + 1)}>Thử lại</button></p>}
        <nav aria-label="Điều hướng tài khoản">
          <NavLink to="/account" end className={({ isActive }) => isActive ? 'is-active' : ''}><UserRound size={18} strokeWidth={1.7} />Thông tin tài khoản</NavLink>
          <NavLink to="/account/addresses" className={({ isActive }) => isActive ? 'is-active' : ''}><MapPin size={18} strokeWidth={1.7} />Địa chỉ nhận hàng</NavLink>
          <NavLink to="/account/orders" className={({ isActive }) => isActive ? 'is-active' : ''}><ShoppingBag size={18} strokeWidth={1.7} />Lịch sử đơn hàng</NavLink>
          <button type="button" onClick={() => void logout()} disabled={loggingOut}><LogOut size={18} strokeWidth={1.7} />{loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>
        </nav>
        {logoutError && <p className="account-menu__error" role="alert">{logoutError}</p>}
      </aside>
      <div className="account-layout__main">
        <Outlet context={{ me, setMe }} />
      </div>
    </div>
  </div>
}
