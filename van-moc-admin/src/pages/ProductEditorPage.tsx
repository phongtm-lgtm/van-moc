import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { accountApi } from '@/api/account'
import { blankProduct, type ProductForm, type Product, type ProductImage, type Page, type Movement } from '@/api/products'
import { productSlug } from '@/utils/bulkProducts'
import FontSample from '@/components/products/FontSample'
import { Package, ImagePlus, PencilLine, SlidersHorizontal, Plus, ArrowLeft, ChevronDown, Send } from 'lucide-react'
import './ProductEditorPage.css'

type Photo = { key: string; file: File }
type Category = { id: string; name: string }
type EngravingFont = { code: string; name: string; fileUrl: string | null; cssUrl: string | null; fontFamily: string | null; fontWeight: number | null; italic: boolean; active: boolean }
type SaveIntent = 'publish' | 'draft' | 'another'
const positions = [{ value: 'FRONT', label: 'Mặt trước' }, { value: 'BACK', label: 'Mặt sau' }, { value: 'HANDLE', label: 'Tay cầm' }]
const newSku = () => `VM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
const initialForm = (): ProductForm => ({ ...blankProduct, code: newSku(), material: 'Sừng tự nhiên', fonts: [], positions: [] })

function Icon({ name }: { name: 'box' | 'photo' | 'pen' | 'settings' | 'plus' | 'arrow' | 'chevron' }) {
  const icons = { box: Package, photo: ImagePlus, pen: PencilLine, settings: SlidersHorizontal, plus: Plus, arrow: ArrowLeft, chevron: ChevronDown }
  const LucideIcon = icons[name]
  return <LucideIcon size={20} strokeWidth={1.7} aria-hidden="true" />
}

function PhotoPreview({ photo, primary, disabled, remove }: { photo: Photo; primary: boolean; disabled: boolean; remove: () => void }) {
  const [url, setUrl] = useState('')
  useEffect(() => { const next = URL.createObjectURL(photo.file); setUrl(next); return () => URL.revokeObjectURL(next) }, [photo.file])
  const video = photo.file.type.startsWith('video/')
  return <figure className="pe-photo">{video ? <video src={url || undefined} controls playsInline preload="metadata" aria-label={photo.file.name} /> : <img src={url || undefined} alt={photo.file.name} />}<button type="button" disabled={disabled} onClick={remove} aria-label={`Bỏ ${video ? 'video' : 'ảnh'} ${photo.file.name}`}>×</button><figcaption><span title={photo.file.name}>{photo.file.name}</span>{video ? 'Video' : primary ? 'Ảnh đại diện' : 'Ảnh thư viện'} · Chờ lưu</figcaption></figure>
}

function SectionTitle({ icon, title, description }: { icon: Parameters<typeof Icon>[0]['name']; title: string; description?: string }) {
  return <div className="pe-section-heading"><span className="pe-section-icon"><Icon name={icon} /></span><div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>
}

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: ReactNode; hint?: string }) {
  return <label className="pe-field"><span>{label}{required && <span className="pe-required"> *</span>}</span>{children}{hint && <small>{hint}</small>}</label>
}

export default function ProductEditorPage() {
  const { id: routeId } = useParams()
  const [searchParams] = useSearchParams()
  const sourceId = searchParams.get('copy')
  const navigate = useNavigate()
  const [createdId, setCreatedId] = useState<string>()
  const id = routeId || createdId
  const [form, setForm] = useState<ProductForm>(initialForm)
  const [price, setPrice] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [availableFonts, setAvailableFonts] = useState<EngravingFont[]>([])
  const [categorySearch, setCategorySearch] = useState('')
  const [searchingCategories, setSearchingCategories] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [history, setHistory] = useState<Page<Movement> | null>(null)
  const [page, setPage] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [engravingOpen, setEngravingOpen] = useState(false)
  const [delta, setDelta] = useState('')
  const [note, setNote] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const saving = useRef(false)
  const editor = useRef<HTMLFormElement>(null)

  useEffect(() => {
    let alive = true
    setReady(false)
    setError('')
    const loadId = routeId || sourceId
    Promise.all([accountApi<Category[]>('/api/categories'), loadId ? accountApi<Product>(`/api/admin/products/${loadId}`) : Promise.resolve(null), accountApi<EngravingFont[]>('/api/admin/engraving-fonts')])
      .then(([items, loaded, fontItems]) => {
        if (!alive) return
        const details = loaded ? { ...loaded.details, description: loaded.details.description?.trim() ? loaded.details.description : loaded.details.shortDescription ?? '' } : { ...initialForm(), categoryId: items[0]?.id ?? '' }
        if (sourceId && !routeId) Object.assign(details, { code: newSku(), name: `${details.name} (bản sao)`, slug: '', version: 0, active: false })
        if (sourceId && !routeId) details.slug = productSlug(details.name)
        setCategories(items); setAvailableFonts(fontItems); setForm(details); setPrice(loaded ? String(details.price) : '')
        setProduct(routeId ? loaded : null); setCreatedId(undefined); setPhotos([])
        setAutoSlug(!routeId); setReady(true)
        setNotice(sourceId && !routeId ? 'Đã sao chép thông tin và cấu hình khắc. Hãy kiểm tra tên, giá và chọn ảnh cho sản phẩm mới.' : '')
      }).catch((cause: Error) => { if (alive) setError(cause.message) })
    return () => { alive = false }
  }, [routeId, sourceId, loadAttempt])

  useEffect(() => {
    if (!id) return
    let alive = true
    accountApi<Page<Movement>>(`/api/admin/products/${id}/stock?page=${page}`).then(result => { if (alive) setHistory(result) })
      .catch((cause: Error) => { if (alive) setError(cause.message) })
    return () => { alive = false }
  }, [id, page, refresh])

  const update = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm(current => ({ ...current, [key]: value }))
  const addPhotos = (files: FileList | null) => {
    if (!files || busy) return
    const items = Array.from(files)
    if (items.some(file => !['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm'].includes(file.type) || !file.size)) { setError('Chọn ảnh JPG, PNG, WebP, GIF, AVIF hoặc video MP4, WebM có nội dung.'); return }
    setPhotos(current => [...current, ...items.map(file => ({ key: crypto.randomUUID(), file }))])
    setError('')
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving.current || !ready) return
    const intent = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value as SaveIntent || 'publish'
    setError(''); setNotice('')
    if (!form.name.trim() || !form.categoryId || !price.trim() || !Number.isSafeInteger(Number(price)) || Number(price) < 0 || Number(price) > 9999999999999) {
      setError('Nhập tên sản phẩm, chọn danh mục và giá bán nguyên không âm.'); return
    }
    if (!form.code.trim() || !form.material.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      setAdvancedOpen(true); setError('Kiểm tra mã SKU, chất liệu và slug trong Thông tin nâng cao.'); return
    }
    if (form.engravingEnabled && (!form.fonts.length || !form.positions.length || !form.engravingMaxChars || form.engravingMaxChars < 1 || form.engravingMaxChars > 255 || !Number.isSafeInteger(form.engravingFee) || form.engravingFee < 0 || form.engravingFee > 9999999999999 || form.positions.some(position => position.maxChars !== null && (!Number.isInteger(position.maxChars) || position.maxChars < 1 || position.maxChars > 255)))) {
      setEngravingOpen(true); setError('Chọn ít nhất một kiểu chữ, một vị trí khắc, giới hạn 1–255 ký tự và phí khắc hợp lệ.'); return
    }
    saving.current = true; setBusy(true)
    try {
      const description = form.description.trim()
      const saved = await accountApi<Product>(`/api/admin/products${id ? `/${id}` : ''}`, id ? 'PATCH' : 'POST', {
        ...form, name: form.name.trim(), code: form.code.trim(), material: form.material.trim(), price: Number(price),
        description, shortDescription: description.replace(/\s+/g, ' ').slice(0, 2000), active: intent !== 'draft',
      })
      setCreatedId(saved.id); setProduct(saved); setForm(saved.details)
      // Remember the created product and remove each successful upload before retrying a partial failure.
      for (const photo of photos) {
        const data = new FormData(); data.append('file', photo.file)
        try {
          const image = await accountApi<ProductImage>(`/api/admin/products/${saved.id}/images`, 'POST', data)
          setProduct(current => current ? { ...current, images: [...current.images, image] } : current)
          setPhotos(current => current.filter(item => item.key !== photo.key))
        } catch (cause) {
          setError(`Sản phẩm đã lưu, nhưng tệp “${photo.file.name}” chưa tải lên được. ${(cause as Error).message} Bấm lưu để thử lại các tệp còn lại.`)
          return
        }
      }
      if (intent === 'another') {
        if (routeId || sourceId) navigate('/products/new', { replace: true })
        else {
          setForm({ ...initialForm(), categoryId: form.categoryId, material: form.material }); setPrice('')
          setProduct(null); setCreatedId(undefined); setAutoSlug(true); setPhotos([]); setAdvancedOpen(false); setEngravingOpen(false)
        }
        setNotice('Đã lưu sản phẩm. Bạn có thể nhập sản phẩm tiếp theo.')
        requestAnimationFrame(() => editor.current?.querySelector<HTMLInputElement>('[name="name"]')?.focus())
      } else {
        setNotice(intent === 'draft' ? 'Đã lưu nháp. Sản phẩm chưa hiển thị để bán.' : 'Đã lưu sản phẩm.')
        if (!routeId) navigate(`/products/${saved.id}`, { replace: true })
      }
    } catch (cause) { setError((cause as Error).message) }
    finally { saving.current = false; setBusy(false) }
  }

  const adjust = async (event: FormEvent) => {
    event.preventDefault()
    if (!id || saving.current || !Number.isInteger(Number(delta)) || !Number(delta) || !note.trim() || !window.confirm(`Điều chỉnh tồn ${Number(delta) > 0 ? '+' : ''}${delta}?`)) return
    saving.current = true; setBusy(true); setError('')
    try {
      await accountApi(`/api/admin/products/${id}/stock`, 'POST', { delta: Number(delta), note })
      const updated = await accountApi<Product>(`/api/admin/products/${id}`)
      setProduct(updated); update('version', updated.details.version); setRefresh(value => value + 1)
      setDelta(''); setNote(''); setNotice('Đã điều chỉnh tồn và ghi lịch sử.')
    } catch (cause) { setError((cause as Error).message) }
    finally { saving.current = false; setBusy(false) }
  }

  const setPrimaryImage = async (image: ProductImage) => {
    if (!id || saving.current || image.primary || image.mediaType === 'VIDEO') return
    saving.current = true; setBusy(true); setError(''); setNotice('')
    try {
      await accountApi<ProductImage>(`/api/admin/products/${id}/images/${image.id}/primary`, 'PATCH')
      setProduct(current => current ? { ...current, images: current.images.map(item => ({ ...item, primary: item.id === image.id })) } : current)
      setNotice('Đã cập nhật ảnh đại diện sản phẩm.')
    } catch (cause) { setError((cause as Error).message) }
    finally { saving.current = false; setBusy(false) }
  }

  return <section className="product-editor">
    <header className="pe-header">
      <div className="pe-title-row"><div><h1>{routeId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1><p>Quản lý thông tin, hình ảnh và cấu hình bán hàng.</p></div><Link className="pe-back pe-button pe-button-secondary" to="/products"><Icon name="arrow" /> Danh sách sản phẩm</Link></div>
    </header>
    {error && <div className="pe-alert pe-alert-error" role="alert">{error}{!ready && <button type="button" onClick={() => setLoadAttempt(value => value + 1)}>Thử tải lại</button>}</div>}
    {notice && <div className="pe-alert pe-alert-success" role="status">{notice}</div>}
    {!ready ? <div className="pe-card pe-loading" role="status">{error ? 'Chưa tải được thông tin sản phẩm.' : 'Đang chuẩn bị thông tin sản phẩm…'}</div> : <>
      <form ref={editor} className="pe-form" onSubmit={event => void save(event)}>
        <fieldset disabled={busy} className="pe-fieldset pe-editor-grid">
          <div className="pe-main-column">
          <div className="pe-card">
            <SectionTitle icon="box" title="Thông tin sản phẩm" />
            <div className="pe-card-body">
              <Field label="Tên sản phẩm" required><input autoFocus name="name" required maxLength={255} value={form.name} placeholder="VD: Lược sừng trâu thủ công" onChange={event => { const name = event.target.value; setForm(current => ({ ...current, name, ...(autoSlug ? { slug: productSlug(name) } : {}) })) }} /></Field>
              <div className="pe-two-columns">
                <Field label="Giá bán" required><span className="pe-price-input"><input name="price" type="number" required min="0" max="9999999999999" step="1" value={price} placeholder="250000" onChange={event => setPrice(event.target.value)} /><span>VND</span></span></Field>
                <div className="pe-category"><Field label="Danh mục" required><select name="categoryId" required value={form.categoryId} onChange={event => update('categoryId', event.target.value)}><option value="" disabled>Chọn danh mục</option>{categories.filter(category => category.id === form.categoryId || !categorySearch || productSlug(category.name).includes(productSlug(categorySearch))).map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></Field><button type="button" className="pe-text-button pe-category-search" onClick={() => { setSearchingCategories(value => !value); setCategorySearch('') }}>{searchingCategories ? 'Đóng tìm kiếm' : 'Tìm danh mục'}</button>{searchingCategories && <input aria-label="Tìm danh mục" type="search" value={categorySearch} placeholder="Gõ tên để lọc danh mục…" onChange={event => setCategorySearch(event.target.value)} />}</div>
              </div>
              <Field label="Mô tả"><textarea name="description" rows={3} maxLength={20000} value={form.description} placeholder="Điều gì làm sản phẩm này đặc biệt?" onChange={event => update('description', event.target.value)} /></Field>
            </div>
          </div>

          <div className="pe-card pe-options">
            <div className="pe-disclosure">
              <button type="button" className="pe-disclosure-trigger" aria-expanded={engravingOpen} aria-controls="engraving-options" onClick={() => setEngravingOpen(value => !value)}><SectionTitle icon="pen" title="Dịch vụ khắc tên" description={form.engravingEnabled ? 'Đã bật · Tùy chỉnh kiểu chữ, vị trí và phí khắc.' : 'Chưa bật · Cấu hình cá nhân hóa sản phẩm.'} /><Icon name="chevron" /></button>
              <div id="engraving-options" hidden={!engravingOpen} className="pe-disclosure-body">
                 <label className="pe-switch-row"><span><strong>Cho phép khắc tên</strong><small>Khách hàng có thể cá nhân hóa sản phẩm.</small></span><input type="checkbox" role="switch" checked={form.engravingEnabled} onChange={event => setForm(current => ({ ...current, engravingEnabled: event.target.checked, fonts: current.fonts.length ? current.fonts : availableFonts.filter(font => font.active).slice(0, 1).map(font => font.code), positions: current.positions.length ? current.positions : [{ position: 'FRONT', maxChars: null }] }))} /><span className="pe-switch-track" aria-hidden="true" /></label>
                {form.engravingEnabled && <div className="pe-engraving-fields">
                  <div className="pe-two-columns"><Field label="Phí khắc mỗi sản phẩm" hint="Để 0 nếu khắc miễn phí."><span className="pe-price-input"><input aria-label="Phí khắc" type="number" min="0" max="9999999999999" step="1" value={form.engravingFee} onChange={event => update('engravingFee', Number(event.target.value))} /><span>VND</span></span></Field><Field label="Giới hạn ký tự"><input aria-label="Giới hạn ký tự" type="number" min="1" max="255" step="1" value={form.engravingMaxChars ?? ''} onChange={event => update('engravingMaxChars', event.target.value ? Number(event.target.value) : null)} /></Field></div>
                  <fieldset className="pe-choice-group"><legend>Kiểu chữ <span>Chọn một hoặc nhiều · <Link to="/products/engraving-fonts">Quản lý font</Link></span></legend><div className="pe-fonts">{availableFonts.filter(font => font.active || form.fonts.includes(font.code)).map(font => <label key={font.code} className={form.fonts.includes(font.code) ? 'is-selected' : ''}><FontSample code={font.code} fileUrl={font.fileUrl} cssUrl={font.cssUrl} fontFamily={font.fontFamily} fontWeight={font.fontWeight} italic={font.italic} className="pe-font-sample" text="An Nhiên" /><span><input type="checkbox" disabled={!font.active} checked={form.fonts.includes(font.code)} onChange={event => update('fonts', event.target.checked ? [...form.fonts, font.code] : form.fonts.filter(value => value !== font.code))} />{font.name}{font.cssUrl ? ` · ${font.fontWeight} ${font.italic ? 'Nghiêng' : 'Thường'}` : ''}{!font.active ? ' (đã ẩn)' : ''}</span></label>)}</div></fieldset>
                  <fieldset className="pe-choice-group"><legend>Vị trí khắc <span>Chọn một hoặc nhiều</span></legend><div className="pe-positions">{positions.map(position => { const selected = form.positions.find(item => item.position === position.value); return <div key={position.value}><label className={`pe-position ${selected ? 'is-selected' : ''}`}><input type="checkbox" checked={!!selected} onChange={event => update('positions', event.target.checked ? [...form.positions, { position: position.value, maxChars: null }] : form.positions.filter(item => item.position !== position.value))} />{position.label}</label>{selected && <input aria-label={`Giới hạn riêng ${position.label.toLowerCase()}`} type="number" min="1" max="255" step="1" value={selected.maxChars ?? ''} placeholder={`Tối đa ${form.engravingMaxChars ?? 30} ký tự`} onChange={event => update('positions', form.positions.map(item => item.position === position.value ? { ...item, maxChars: event.target.value ? Number(event.target.value) : null } : item))} />}</div> })}</div><p className="pe-hint">Bỏ trống giới hạn riêng để dùng giới hạn chung của sản phẩm.</p></fieldset>
                </div>}
              </div>
            </div>
          </div>
          </div>
          <div className="pe-side-column">
            <div className="pe-card pe-publishing">
              <div className="pe-section-heading"><span className="pe-section-icon"><Send size={20} strokeWidth={1.7} /></span><div><h2>Xuất bản</h2><p>Trạng thái hiển thị và lưu sản phẩm.</p></div></div>
              <div className="pe-savebar"><div className="pe-publish-status"><span>Trạng thái hiện tại</span><span className="pe-status"><span />{id ? product?.details.active ? 'Đang bán' : 'Bản nháp / chưa bán' : 'Sản phẩm mới'}</span></div><p>Lưu nháp để hoàn thiện sau, hoặc lưu sản phẩm để mở bán.</p><div className="pe-save-actions"><button type="submit" name="intent" value="draft" className="pe-button pe-button-secondary">Lưu nháp</button><button type="submit" name="intent" value="publish" className="pe-button pe-button-primary">{busy ? 'Đang lưu…' : 'Lưu sản phẩm'}</button></div><button type="submit" name="intent" value="another" className="pe-text-button pe-save-another"><Icon name="plus" /> Lưu & thêm sản phẩm tiếp theo</button></div>
            </div>
            <div className="pe-card">
              <SectionTitle icon="photo" title="Ảnh và video sản phẩm" description="Ảnh đầu tiên là ảnh đại diện. Video hiển thị trong thư viện." />
              <div className="pe-card-body">
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm" multiple aria-label="Chọn ảnh hoặc video sản phẩm" className="pe-file-input" onChange={event => { addPhotos(event.target.files); event.target.value = '' }} />
                {!product?.images.length && !photos.length ? <div className={`pe-dropzone ${dragging ? 'is-dragging' : ''}`} onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); addPhotos(event.dataTransfer.files) }}>
                  <button type="button" className="pe-button pe-button-secondary pe-add-media" onClick={() => fileInput.current?.click()}><ImagePlus size={20} />Thêm ảnh / video</button><p>Chọn nhiều tệp hoặc kéo thả vào đây · JPG, PNG, WebP, GIF, AVIF, MP4, WebM.</p>
                </div> : <div className={`pe-media-list ${dragging ? 'is-dragging' : ''}`} onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); addPhotos(event.dataTransfer.files) }}>
                  <div className="pe-media-toolbar"><span>{(product?.images.length ?? 0) + photos.length} tệp · Kéo thả để thêm</span><button type="button" className="pe-button pe-button-secondary pe-add-media" onClick={() => fileInput.current?.click()}><Plus size={18} />Thêm ảnh / video</button></div>
                   <div className="pe-gallery">{product?.images.map(image => <figure className="pe-photo" key={image.id}>{image.mediaType === 'VIDEO' ? <video src={image.url} controls playsInline preload="metadata" aria-label={`Video ${form.name}`} /> : <img src={image.url} alt={image.altText || form.name} />}<figcaption>{image.mediaType === 'VIDEO' ? 'Video' : image.primary ? 'Ảnh đại diện' : 'Ảnh thư viện'} · Đã lưu{image.mediaType !== 'VIDEO' && !image.primary && <button className="pe-set-primary" type="button" disabled={busy} onClick={() => void setPrimaryImage(image)} aria-label={`Đặt ảnh ${image.displayOrder + 1} làm ảnh đại diện`}>Đặt làm ảnh đại diện</button>}</figcaption></figure>)}{photos.map((photo, index) => <PhotoPreview photo={photo} key={photo.key} primary={!product?.images.some(image => image.mediaType !== 'VIDEO') && index === photos.findIndex(item => item.file.type.startsWith('image/'))} disabled={busy} remove={() => setPhotos(current => current.filter(item => item.key !== photo.key))} />)}</div>
                </div>}
              </div>
            </div>
            <div className="pe-card pe-options pe-quick-settings"><div className="pe-disclosure">
              <button type="button" className="pe-disclosure-trigger" aria-expanded={advancedOpen} aria-controls="advanced-options" onClick={() => setAdvancedOpen(value => !value)}><SectionTitle icon="settings" title="Thông tin nâng cao" description="Mã SKU, đường dẫn và chất liệu đã được điền sẵn." /><Icon name="chevron" /></button>
              <div id="advanced-options" hidden={!advancedOpen} className="pe-disclosure-body">
                <div className="pe-two-columns"><Field label="Mã SKU" hint="Tự sinh cho sản phẩm mới. Bạn có thể sửa lại."><input name="code" maxLength={255} value={form.code} onChange={event => update('code', event.target.value)} /></Field><Field label="Chất liệu"><input name="material" list="product-materials" maxLength={255} value={form.material} onChange={event => update('material', event.target.value)} /><datalist id="product-materials"><option value="Sừng tự nhiên" /><option value="Sừng trâu" /><option value="Sừng bò" /><option value="Gỗ tự nhiên" /></datalist></Field></div>
                <Field label="Đường dẫn sản phẩm (slug)" hint="Tự tạo từ tên; chỉ dùng chữ thường không dấu, số và dấu gạch ngang."><input name="slug" maxLength={255} value={form.slug} onChange={event => { setAutoSlug(false); update('slug', event.target.value) }} /></Field>
                {!autoSlug && <button type="button" className="pe-text-button" onClick={() => { setAutoSlug(true); update('slug', productSlug(form.name)) }}>Tạo lại từ tên sản phẩm</button>}
              </div>
            </div>
            </div>
          </div>
        </fieldset>
      </form>
      <div className="pe-bottom-links"><Link to="/products/bulk">Nhập nhiều sản phẩm bằng bảng →</Link>{routeId && <Link to={`/products/new?copy=${routeId}`}>Sao chép sản phẩm này →</Link>}</div>
      {id && <div className="pe-card pe-stock"><SectionTitle icon="box" title="Tồn kho" description={`Hiện có ${product?.stock ?? 0} sản phẩm. Mỗi lần điều chỉnh đều được ghi lại.`} /><div className="pe-card-body"><form onSubmit={event => void adjust(event)}><fieldset disabled={busy} className="pe-fieldset pe-stock-fields"><Field label="Số lượng điều chỉnh"><input required type="number" min="-1000000" max="1000000" step="1" value={delta} placeholder="VD: 10 hoặc -2" onChange={event => setDelta(event.target.value)} /></Field><Field label="Lý do"><input required value={note} placeholder="Nhập hàng, kiểm kê…" onChange={event => setNote(event.target.value)} /></Field><button type="submit" className="pe-button pe-button-secondary" disabled={!Number(delta) || !note.trim()}>Cập nhật tồn</button></fieldset></form><details className="pe-history"><summary>Lịch sử tồn kho</summary>{history?.content.map(item => <div key={item.id}><strong>{item.delta > 0 ? '+' : ''}{item.delta} · {item.reason}</strong><span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span><p>{item.note}</p>{item.orderId && <Link to={`/orders/${item.orderId}`}>Xem đơn hàng</Link>}</div>)}{!history?.content.length && <p>Chưa có biến động tồn kho.</p>}<div className="pe-history-pages"><button type="button" disabled={busy || !page} onClick={() => setPage(value => value - 1)}>← Trước</button><button type="button" disabled={busy || page + 1 >= (history?.totalPages ?? 0)} onClick={() => setPage(value => value + 1)}>Sau →</button></div></details></div></div>}
      {!id && <p className="pe-stock-note">Sản phẩm mới bắt đầu với tồn kho 0. Bạn có thể nhập tồn kho ngay sau khi lưu.</p>}
    </>}
  </section>
}
