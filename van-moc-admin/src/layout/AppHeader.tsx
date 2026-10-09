import { Link, useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, LogOut, ChevronRight } from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import { useTheme } from '@/context/ThemeContext'
import { accountApi } from '@/api/account'

export default function AppHeader() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar()
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const section = pathname.startsWith('/products') ? { label: 'Sản phẩm', path: '/products' } : pathname.startsWith('/shipping') ? { label: 'Phí giao hàng', path: '/shipping' } : { label: 'Đơn hàng', path: '/orders' }
  const detail = pathname === '/products/new' ? 'Thêm sản phẩm' : pathname === '/products/bulk' ? 'Nhập nhiều sản phẩm' : pathname === '/products/categories' ? 'Danh mục' : pathname === '/products/engraving-fonts' ? 'Font khắc' : pathname.startsWith('/products/') ? 'Chỉnh sửa sản phẩm' : pathname.startsWith('/orders/') ? 'Chi tiết đơn hàng' : ''
  const logout = async () => { await accountApi('/api/auth/logout', 'POST'); window.location.assign('/signin') }
  return <header className="admin-header">
    <div className="admin-header-location"><button className="admin-icon-button admin-mobile-toggle" aria-label="Mở điều hướng" aria-expanded={isMobileOpen} aria-controls="admin-sidebar" onClick={toggleMobileSidebar}><Menu size={21} /></button><nav aria-label="Đường dẫn trang"><ol className="admin-breadcrumbs"><li className="admin-breadcrumb-root">Quản trị</li><li className="admin-breadcrumb-root"><ChevronRight size={15} /></li><li>{detail ? <Link to={section.path}>{section.label}</Link> : <span aria-current="page">{section.label}</span>}</li>{detail && <><li><ChevronRight size={15} /></li><li><span aria-current="page">{detail}</span></li></>}</ol></nav></div>
    <div className="admin-header-controls"><button className="admin-icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'} title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}>{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button><div className="admin-account"><span className="admin-avatar" role="img" aria-label="Vân Mộc"><span className="admin-logo-mark admin-logo-mark--dark" /><span className="admin-logo-mark admin-logo-mark--light" /></span><span>Quản trị viên</span></div><button className="admin-logout" onClick={() => void logout().catch(() => window.alert('Đăng xuất chưa thành công.'))} aria-label="Đăng xuất"><LogOut size={18} /><span>Đăng xuất</span></button></div>
  </header>
}
