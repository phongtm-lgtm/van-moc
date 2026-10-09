import { useState, type FormEvent } from 'react'
import { API_BASE } from '@/api/account'
import GridShape from '@/components/common/GridShape'
import Label from '@/components/form/Label'
import Input from '@/components/form/input/InputField'
import Button from '@/components/ui/button/Button'

export default function SignInPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (busy || !username || !password) return
    setBusy(true); setError('')
    try {
      const csrfResponse = await fetch(`${API_BASE}/api/auth/csrf`, { credentials: 'include' })
      if (!csrfResponse.ok) throw new Error('Không thể lấy CSRF token.')
      const csrf = await csrfResponse.json() as { headerName: string; token: string }
      const response = await fetch(`${API_BASE}/api/admin/login`, { method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', [csrf.headerName]: csrf.token },
        body: new URLSearchParams({ username, password }) })
      if (!response.ok) throw new Error(response.status === 401 ? 'Tên đăng nhập hoặc mật khẩu không đúng.' : 'Đăng nhập chưa thành công. Vui lòng thử lại.')
      setPassword(''); onLogin()
    } catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }
  return <div className="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900"><div className="relative flex min-h-screen w-full flex-col justify-center lg:flex-row">
    <div className="flex flex-1 flex-col"><div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
      <div className="mb-8"><h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">Đăng nhập</h1><p className="text-sm text-gray-500 dark:text-gray-400">Nhập tên đăng nhập và mật khẩu để quản trị Vân Mộc.</p></div>
      <form onSubmit={event => void submit(event)}><div className="space-y-6">
        <div><Label>Tên đăng nhập <span className="text-error-500">*</span></Label><Input name="username" value={username} onChange={event => setUsername(event.target.value)} placeholder="Tên đăng nhập" /></div>
        <div><Label>Mật khẩu <span className="text-error-500">*</span></Label><Input name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Mật khẩu" /></div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><input type="checkbox" checked={showPassword} onChange={event => setShowPassword(event.target.checked)} />Hiển thị mật khẩu</label>
        {error && <p role="alert" className="rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10">{error}</p>}
        <Button className="w-full" disabled={busy || !username || !password}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</Button>
      </div></form>
    </div></div>
    <div className="hidden min-h-screen w-1/2 items-center bg-brand-950 lg:grid dark:bg-white/5"><div className="relative z-1 flex items-center justify-center"><GridShape /><div className="flex max-w-xs flex-col items-center"><h2 className="mb-4 text-4xl font-semibold text-white">Vân Mộc</h2><p className="text-center text-gray-400">Hệ thống quản trị cửa hàng</p></div></div></div>
  </div></div>
}
