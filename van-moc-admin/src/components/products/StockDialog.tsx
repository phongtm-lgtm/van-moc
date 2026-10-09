import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X, Package } from 'lucide-react'
import { accountApi, ApiError } from '@/api/account'
import type { Product } from '@/api/products'

export default function StockDialog({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [current, setCurrent] = useState<Product | null>(null)
  const [delta, setDelta] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [uncertain, setUncertain] = useState(false)
  const [retry, setRetry] = useState(0)
  const saving = useRef(false)
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close() }, [])
  useEffect(() => {
    let alive = true
    setError(''); setCurrent(null)
    accountApi<Product>(`/api/admin/products/${product.id}`).then(result => { if (alive) setCurrent(result) }).catch((cause: Error) => { if (alive) setError(cause.message) })
    return () => { alive = false }
  }, [product.id, retry])
  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (saving.current || !current || uncertain) return
    const amount = Number(delta)
    if (!Number.isInteger(amount) || !amount || Math.abs(amount) > 1000000 || current.stock + amount < 0 || !note.trim()) { setError('Nhập số lượng nguyên khác 0, lý do điều chỉnh và đảm bảo tồn kho không âm.'); return }
    saving.current = true; setBusy(true); setError('')
    try {
      await accountApi(`/api/admin/products/${product.id}/stock`, 'POST', { delta: amount, note: note.trim() })
      onSaved(); onClose()
    } catch (cause) {
      // Stock adjustments are not idempotent; an uncertain response must not be retried blindly.
      if (!(cause instanceof ApiError) || cause.status >= 500) { setUncertain(true); setError('Chưa xác định được kết quả điều chỉnh. Mở lịch sử tồn kho để kiểm tra trước khi tạo điều chỉnh khác.') }
      else setError((cause as Error).message)
    } finally { saving.current = false; setBusy(false) }
  }
  return createPortal(<dialog ref={dialog} className="products-stock-dialog" onCancel={event => { if (busy) event.preventDefault(); else onClose() }} aria-labelledby="stock-dialog-title">
    <div className="products-dialog-heading"><div><h2 id="stock-dialog-title">Cập nhật tồn kho</h2><p>{product.details.name}</p></div><button type="button" className="products-icon-button" aria-label="Đóng cập nhật tồn kho" disabled={busy} onClick={onClose}><X size={20} /></button></div>
    {error && <div className="products-feedback is-error" role="alert">{error}{!current && <button type="button" onClick={() => setRetry(value => value + 1)}>Thử lại</button>}</div>}
    {!current && !error && <p role="status">Đang tải tồn kho mới nhất…</p>}
    {current && <form onSubmit={event => void save(event)}><div className="products-stock-preview"><Package size={22} /><span>Tồn hiện tại <strong>{current.stock.toLocaleString('vi-VN')}</strong></span><span>Sau điều chỉnh <strong>{(current.stock + (Number(delta) || 0)).toLocaleString('vi-VN')}</strong></span></div><fieldset disabled={busy || uncertain}><label>Số lượng điều chỉnh<input autoFocus required type="number" min={Math.max(-current.stock, -1000000)} max="1000000" step="1" value={delta} onChange={event => setDelta(event.target.value)} placeholder="VD: 10 để thêm, -2 để giảm" /></label><label>Lý do điều chỉnh<input required value={note} onChange={event => setNote(event.target.value)} placeholder="Nhập hàng, kiểm kê…" /></label><div className="products-dialog-actions"><button type="button" className="products-button" onClick={onClose}>Hủy</button><button className="products-button is-primary" disabled={!Number(delta) || !note.trim()}>{busy ? 'Đang lưu…' : 'Lưu điều chỉnh'}</button></div></fieldset></form>}
    {uncertain && <Link className="products-history-link" to={`/products/${product.id}`}>Mở sản phẩm và kiểm tra lịch sử tồn kho →</Link>}
  </dialog>, document.body)
}
