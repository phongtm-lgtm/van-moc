import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { accountApi } from '@/api/account'
import FontSample from '@/components/products/FontSample'
import './EngravingFontsPage.css'

type Font = { code: string; name: string; fileUrl: string | null; cssUrl: string | null; fontFamily: string | null; fontWeight: number | null; italic: boolean; active: boolean }

export default function EngravingFontsPage() {
  const [fonts, setFonts] = useState<Font[]>([])
  const [preview, setPreview] = useState('An Nhiên · Tình Yêu')
  const [loading, setLoading] = useState(true)
  const [busyCode, setBusyCode] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let alive = true
    accountApi<Font[]>('/api/admin/engraving-fonts').then(items => { if (alive) { setFonts(items); setError('') } })
      .catch((cause: Error) => { if (alive) setError(cause.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [reload])

  const toggle = async (font: Font) => {
    if (busyCode) return
    setBusyCode(font.code); setError(''); setNotice('')
    try {
      const updated = await accountApi<Font>(`/api/admin/engraving-fonts/${font.code}`, 'PATCH', { active: !font.active })
      setFonts(current => current.map(item => item.code === font.code ? updated : item))
      setNotice(`Đã ${updated.active ? 'bật' : 'ẩn'} kiểu chữ “${updated.name}”.`)
    } catch (cause) { setError((cause as Error).message) }
    finally { setBusyCode(null) }
  }

  return <section className="engraving-font-page">
    <header className="ef-heading"><div><h1>Thư viện kiểu chữ khắc</h1><p>Xem thử nét chữ và bật những kiểu khách hàng có thể chọn khi khắc tên.</p></div><Link to="/products">← Quay lại sản phẩm</Link></header>
    {error && <div role="alert" className="ef-feedback ef-error">{error}<button type="button" onClick={() => { setLoading(true); setReload(value => value + 1) }}>Tải lại</button></div>}
    {notice && <p role="status" className="ef-feedback ef-notice">{notice}</p>}
    <div className="ef-library">
      <div className="ef-toolbar"><div><h2>Kiểu chữ khắc</h2><p>Tắt kiểu chữ sẽ ngừng cho khách chọn; đơn hàng cũ vẫn được giữ nguyên.</p></div><label htmlFor="ef-preview">Thử nội dung khắc<input id="ef-preview" type="text" maxLength={100} value={preview} onChange={event => setPreview(event.target.value)} placeholder="Nhập chữ để xem thử" /></label></div>
      {loading ? <p className="ef-empty" role="status">Đang tải kiểu chữ…</p> : !fonts.length ? <p className="ef-empty">Chưa có kiểu chữ nào. Vui lòng thử tải lại.</p> : <ul className="ef-list">{fonts.map(font => <li key={font.code} className={!font.active ? 'is-hidden' : ''}>
        <div className="ef-font-info"><div className="ef-font-heading"><strong>{font.name}</strong><span className={font.active ? 'ef-status is-active' : 'ef-status'}>{font.active ? 'Đang bật' : 'Đã tắt'}</span></div><div className="ef-preview" lang="vi"><FontSample code={font.code} fileUrl={font.fileUrl} cssUrl={font.cssUrl} fontFamily={font.fontFamily} fontWeight={font.fontWeight} italic={font.italic} text={preview || 'An Nhiên · Tình Yêu'} /></div></div>
        <label className="ef-toggle"><span className="ef-toggle-label">{font.active ? 'Đang bật' : 'Đã tắt'}</span><input type="checkbox" role="switch" aria-label={`${font.active ? 'Tắt' : 'Bật'} kiểu chữ ${font.name}`} checked={font.active} disabled={busyCode !== null} onChange={() => void toggle(font)} /><span className="ef-toggle-track" aria-hidden="true" /></label>
      </li>)}</ul>}
    </div>
  </section>
}
