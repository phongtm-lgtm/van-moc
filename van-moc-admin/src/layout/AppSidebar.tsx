import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, Package, Truck, ArrowUpRight, X } from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'

const groups = [
  { title: 'Quản lý cửa hàng', items: [{ path: '/orders', label: 'Đơn hàng', icon: ShoppingBag }, { path: '/products', label: 'Sản phẩm', icon: Package }] },
  { title: 'Vận hành', items: [{ path: '/shipping', label: 'Phí giao hàng', icon: Truck }] },
]

export default function AppSidebar() {
  const { isMobileOpen, setIsMobileOpen } = useSidebar()
  useEffect(() => {
    if (!isMobileOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsMobileOpen(false) }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', close)
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', close) }
  }, [isMobileOpen, setIsMobileOpen])
  return <aside id="admin-sidebar" className={`admin-sidebar${isMobileOpen ? ' is-open' : ''}`}>
    <div className="admin-brand-row"><Link to="/" className="admin-brand" onClick={() => setIsMobileOpen(false)}><span className="admin-brand-mark" aria-hidden="true"><span className="admin-logo-mark admin-logo-mark--dark" /><span className="admin-logo-mark admin-logo-mark--light" /></span><span><strong>Vân Mộc</strong><small>Quản trị cửa hàng</small></span></Link><button className="admin-icon-button admin-mobile-toggle" aria-label="Đóng điều hướng" onClick={() => setIsMobileOpen(false)}><X size={20} /></button></div>
    <nav className="admin-navigation" aria-label="Điều hướng chính">{groups.map(group => <div className="admin-nav-group" key={group.title}><h2>{group.title}</h2><ul>{group.items.map(({ path, label, icon: Icon }) => <li key={path}><NavLink to={path} className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`} onClick={() => setIsMobileOpen(false)}><Icon size={20} strokeWidth={1.7} /><span>{label}</span></NavLink></li>)}</ul></div>)}</nav>
    {import.meta.env.VITE_STOREFRONT_URL && <div className="admin-sidebar-footer"><a className="admin-nav-link" href={import.meta.env.VITE_STOREFRONT_URL}><ArrowUpRight size={20} strokeWidth={1.7} /><span>Về cửa hàng</span></a></div>}
  </aside>
}
