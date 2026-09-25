import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react'
import { useCart } from '../hooks/useCart'

// ─── Data ────────────────────────────────────────────────────────────────────

const PRODUCT_DETAILS = [
  { id: 1, name: 'Lược sừng khắc hoa sen', category: 'Lược sừng', price: 320000, stock: 12, material: 'Sừng trâu tự nhiên', origin: 'Làng nghề Thụy Ứng, Hà Nội', sku: 'VM-LS-001', engravable: true, image: '/image/products/luoc-rang-thua.jpg', description: 'Lược sừng khắc hoa sen được chế tác thủ công từ sừng tự nhiên, giữ lại sắc màu và đường vân nguyên bản. Mỗi sản phẩm được nghệ nhân Thụy Ứng hoàn thiện tỉ mỉ.' },
  { id: 2, name: 'Trâm cài hoa mai', category: 'Trâm cài', price: 185000, stock: 8, material: 'Sừng bò tự nhiên', origin: 'Làng nghề Thụy Ứng, Hà Nội', sku: 'VM-TC-002', engravable: false, image: '/image/products/tram-hoa-sen.jpg', description: 'Trâm cài hoa mai được tạo hình thủ công từ sừng bò tự nhiên, mang vẻ đẹp tinh tế của nghề làng truyền thống Thụy Ứng.' },
  { id: 3, name: 'Lược sừng cán dài', category: 'Lược sừng', price: 450000, stock: 4, material: 'Sừng trâu tự nhiên', origin: 'Làng nghề Thụy Ứng, Hà Nội', sku: 'VM-LS-003', engravable: true, image: '/image/products/luoc-rang-thua.jpg', description: 'Lược sừng cán dài được tạo hình thủ công, phù hợp tóc dài và dày, bề mặt mài bóng mịn từ sừng trâu tự nhiên.' },
  { id: 4, name: 'Vòng tay sừng tự nhiên', category: 'Trang sức', price: 650000, stock: 6, material: 'Sừng hỗn hợp tự nhiên', origin: 'Làng nghề Thụy Ứng, Hà Nội', sku: 'VM-TS-004', engravable: false, image: '/image/products/bo-qua-tang.jpg', description: 'Vòng tay được chế tác từ sừng tự nhiên, mỗi vòng mang đường vân độc bản không lặp lại.' },
  { id: 5, name: 'Lược sừng bỏ túi', category: 'Lược sừng', price: 280000, stock: 15, material: 'Sừng trâu tự nhiên', origin: 'Làng nghề Thụy Ứng, Hà Nội', sku: 'VM-LS-005', engravable: true, image: '/image/products/luoc-bo-tui.jpg', description: 'Lược sừng bỏ túi nhỏ gọn, tiện dụng hàng ngày, chế tác từ sừng trâu với bề mặt mài bóng tự nhiên.' },
  { id: 6, name: 'Trâm cài lá sen', category: 'Trâm cài', price: 220000, stock: 3, material: 'Sừng bò tự nhiên', origin: 'Làng nghề Thụy Ứng, Hà Nội', sku: 'VM-TC-006', engravable: false, image: '/image/products/tram-hoa-sen.jpg', description: 'Trâm cài lá sen tinh xảo, dành cho tóc mỏng và tóc bới nhẹ nhàng.' },
  { id: 7, name: 'Bộ quà tặng Vân Mộc', category: 'Quà tặng', price: 1200000, stock: 5, material: 'Sừng tự nhiên tuyển chọn', origin: 'Làng nghề Thụy Ứng, Hà Nội', sku: 'VM-QT-007', engravable: true, image: '/image/products/bo-qua-tang.jpg', description: 'Bộ quà tặng Vân Mộc gồm các sản phẩm sừng tuyển chọn, đóng gói trang nhã — lý tưởng để tặng người thân.' },
  { id: 8, name: 'Kẹp tóc khắc mẫu đơn', category: 'Trang sức', price: 380000, stock: 7, material: 'Sừng bò tự nhiên', origin: 'Làng nghề Thụy Ứng, Hà Nội', sku: 'VM-TS-008', engravable: false, image: '/image/products/tram-hoa-sen.jpg', description: 'Kẹp tóc khắc hoa mẫu đơn, tỉ mỉ từng chi tiết từ sừng bò tự nhiên.' },
]

const GALLERY_POSITIONS = ['center', '22% center', '72% center', 'center bottom', '45% center']

const ENGRAVING_FONTS = [
  { id: 'elegant', label: 'Thanh lịch', family: '"Playfair Display", Georgia, serif', style: { fontStyle: 'italic' as const } },
  { id: 'calligraphy', label: 'Thư pháp', family: '"Dancing Script", cursive', style: {} },
  { id: 'modern', label: 'Hiện đại', family: '"Montserrat", sans-serif', style: { letterSpacing: '0.04em' } },
  { id: 'classic', label: 'Cổ điển', family: '"Libre Baskerville", Georgia, serif', style: {} },
]

const ENGRAVING_POSITIONS = [
  { id: 'front', label: 'Mặt trước', maxChars: 12, hint: 'Phù hợp tên hoặc thông điệp ngắn.' },
  { id: 'back', label: 'Mặt sau', maxChars: 12, hint: 'Kín đáo hơn, phù hợp tên hoặc ngày kỷ niệm.' },
  { id: 'edge', label: 'Cạnh / cán', maxChars: 8, hint: 'Khắc ở cạnh / cán phù hợp với nội dung ngắn, tối đa 8 ký tự.' },
]

const ENGRAVING_FEE = 50000

function formatPrice(n: number) {
  return `${new Intl.NumberFormat('vi-VN').format(n)} đ`
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const product = PRODUCT_DETAILS.find((p) => p.id === Number(id)) ?? PRODUCT_DETAILS[0]

  const [activeImage, setActiveImage] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Engraving state
  const [engravingEnabled, setEngravingEnabled] = useState(false)
  const [engravingText, setEngravingText] = useState('')
  const [engravingFont, setEngravingFont] = useState(ENGRAVING_FONTS[0].id)
  const [engravingPosition, setEngravingPosition] = useState(ENGRAVING_POSITIONS[0].id)

  const positionConfig = ENGRAVING_POSITIONS.find((p) => p.id === engravingPosition)!
  const maxChars = positionConfig.maxChars
  const selectedFont = ENGRAVING_FONTS.find((f) => f.id === engravingFont)!

  const engravingFee = engravingEnabled ? ENGRAVING_FEE : 0
  const totalPrice = product.price * quantity + engravingFee

  const handleTextChange = (val: string) => {
    if (val.length <= maxChars) setEngravingText(val)
  }

  const handlePositionChange = (position: string) => {
    const nextPosition = ENGRAVING_POSITIONS.find((item) => item.id === position)!
    setEngravingPosition(position)
    setEngravingText((text) => text.slice(0, nextPosition.maxChars))
  }

  const changeImage = (dir: -1 | 1) => {
    setActiveImage((cur) => (cur + dir + GALLERY_POSITIONS.length) % GALLERY_POSITIONS.length)
  }

  useEffect(() => {
    if (!isZoomOpen) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsZoomOpen(false)
      if (event.key === 'ArrowLeft') changeImage(-1)
      if (event.key === 'ArrowRight') changeImage(1)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isZoomOpen])

  const previewLabel = engravingText || 'Vân Mộc'
  const addProductToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      },
      quantity,
      engravingEnabled ? {
        text: engravingText,
        font: selectedFont.label,
        position: positionConfig.label,
        fee: ENGRAVING_FEE,
      } : undefined,
    )
  }

  return (
    <article className="pdp">
      {/* Background decor */}
      <div className="pdp__grain" aria-hidden />
      <svg className="pdp__motif pdp__motif--left" viewBox="0 0 220 340" fill="none" aria-hidden>
        <path d="M16 329C45 242 92 161 185 51M66 231c-36-35-39-78-11-113 35 27 42 64 17 105M112 157c31-30 64-38 98-18-22 38-53 48-93 28" />
        <path d="M45 283c-27-7-41-25-40-52 28 3 45 18 47 45M150 94c-17-29-13-54 12-75 25 25 24 51-3 77" />
      </svg>
      <svg className="pdp__motif pdp__motif--right" viewBox="0 0 220 430" fill="none" aria-hidden>
        <path d="M204 8C147 95 104 195 87 419M158 93c-14-38-5-69 28-92 26 36 18 68-23 98M122 174c38-32 73-36 105-11-27 40-62 46-102 19" />
        <path d="M99 268c-39-29-76-28-108 3 34 34 71 35 109 6M90 350c35-20 67-16 93 13-31 31-63 30-94-4" />
      </svg>

      <div className="pdp__inner">
        <button
          type="button"
          className="pdp-back"
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/shop')}
        >
          <ChevronLeft size={17} aria-hidden />
          Quay lại
        </button>

        {/* Main layout */}
        <div className="pdp-layout">

          {/* ── Left: Gallery ─────────────────────────────────── */}
          <section className="pdp-gallery" aria-label="Hình ảnh sản phẩm">
            <div className="pdp-gallery__main">
              <img
                src={product.image}
                alt={product.name}
                style={{ objectPosition: GALLERY_POSITIONS[activeImage] }}
              />
              <button
                type="button"
                className="pdp-gallery__zoom"
                onClick={() => setIsZoomOpen(true)}
                aria-label="Phóng to ảnh sản phẩm"
              >
                <ZoomIn size={18} />
              </button>
              <button type="button" className="pdp-gallery__arrow pdp-gallery__arrow--prev" onClick={() => changeImage(-1)} aria-label="Ảnh trước">
                <ChevronLeft size={20} />
              </button>
              <button type="button" className="pdp-gallery__arrow pdp-gallery__arrow--next" onClick={() => changeImage(1)} aria-label="Ảnh tiếp">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="pdp-gallery__thumbs" role="list">
              {GALLERY_POSITIONS.map((pos, i) => (
                <button
                  role="listitem"
                  type="button"
                  key={pos}
                  className={activeImage === i ? 'is-active' : ''}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Xem ảnh ${i + 1}`}
                  aria-pressed={activeImage === i}
                >
                  <img src={product.image} alt="" style={{ objectPosition: pos }} />
                </button>
              ))}
            </div>
          </section>

          {/* ── Right: Info ───────────────────────────────────── */}
          <section className="pdp-info" aria-label="Thông tin sản phẩm">

            {/* Title + price */}
            <h1 className="pdp-info__title">{product.name}</h1>
            <div className="pdp-info__price-row">
              <p className="pdp-info__price">{formatPrice(product.price)}</p>
              <p className={`pdp-info__stock ${product.stock <= 10 ? 'is-low' : ''}`}>
                {product.stock <= 10 ? `Chỉ còn ${product.stock}` : `Còn lại ${product.stock}`}
              </p>
            </div>
            <p className="pdp-info__desc">{product.description}</p>

            {/* Specs */}
            <dl className="pdp-specs">
              <div>
                <dt>Chất liệu</dt>
                <dd>{product.material}</dd>
              </div>
              <div>
                <dt>Xuất xứ</dt>
                <dd>{product.origin}</dd>
              </div>
              <div>
                <dt>Mã SKU</dt>
                <dd>{product.sku}</dd>
              </div>
            </dl>

            <p className="pdp-microcopy">
              Mỗi sản phẩm có sắc độ và đường vân riêng do đặc tính tự nhiên của sừng.
            </p>

            {/* ── Engraving section ─────────────────────────── */}
            {product.engravable && (
              <div className="pdp-engraving">
                {/* Header */}
                <div className="pdp-engraving__header">
                  <div className="pdp-engraving__toggle-row">
                    <label className="pdp-engraving__toggle" htmlFor="engraving-switch">
                      <input
                        id="engraving-switch"
                        type="checkbox"
                        role="switch"
                        checked={engravingEnabled}
                        onChange={(e) => setEngravingEnabled(e.target.checked)}
                      />
                      <span className="pdp-engraving__toggle-track" aria-hidden />
                      <span className="pdp-engraving__toggle-label">Khắc tên lên sản phẩm</span>
                    </label>
                    <span className="pdp-engraving__fee-badge">+ {formatPrice(ENGRAVING_FEE)}</span>
                  </div>
                </div>

                {engravingEnabled && (
                  <div className="pdp-engraving__body">
                    {/* Text input */}
                    <div className="pdp-field">
                      <label className="pdp-field__label" htmlFor="engraving-text">
                        Nội dung cần khắc
                      </label>
                      <div className="pdp-field__input-wrap">
                        <input
                          id="engraving-text"
                          type="text"
                          className="pdp-field__input"
                          value={engravingText}
                          onChange={(e) => handleTextChange(e.target.value)}
                          placeholder="Nhập nội dung..."
                          maxLength={maxChars}
                          aria-describedby="engraving-hint"
                        />
                        <span className={`pdp-field__counter ${engravingText.length >= maxChars ? 'is-max' : ''}`} aria-live="polite">
                          {engravingText.length}/{maxChars}
                        </span>
                      </div>
                      <p className="pdp-field__hint" id="engraving-hint">
                        Tối đa {maxChars} ký tự, bao gồm chữ, số và khoảng trắng.
                      </p>
                    </div>

                    {/* Position selector (Dropdown) */}
                    <div className="pdp-field">
                      <label className="pdp-field__label" htmlFor="engraving-position-select">
                        Vị trí khắc
                      </label>
                      <div className="pdp-select-wrap">
                        <select
                          id="engraving-position-select"
                           className="pdp-field__select"
                           value={engravingPosition}
                           onChange={(e) => handlePositionChange(e.target.value)}
                        >
                          {ENGRAVING_POSITIONS.map((pos) => (
                            <option key={pos.id} value={pos.id}>
                              {pos.label} - {pos.hint}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pdp-select-icon" aria-hidden />
                      </div>
                    </div>

                    {/* Font selector */}
                    <div className="pdp-field">
                      <p className="pdp-field__label" id="font-group-label">Chọn font chữ</p>
                      <div className="pdp-font-grid" role="radiogroup" aria-labelledby="font-group-label">
                        {ENGRAVING_FONTS.map((font) => (
                          <label
                            key={font.id}
                            className={`pdp-font-card ${engravingFont === font.id ? 'is-selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="engraving-font"
                              value={font.id}
                              checked={engravingFont === font.id}
                              onChange={() => setEngravingFont(font.id)}
                              className="sr-only"
                            />
                            <span
                              className="pdp-font-card__preview"
                              style={{ fontFamily: font.family, ...font.style }}
                              aria-hidden
                            >
                              {previewLabel}
                            </span>
                            <span className="pdp-font-card__name">{font.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Live preview */}
                    <div className="pdp-field">
                      <div className="pdp-field__label-row">
                        <span className="pdp-field__label">Xem trước nét khắc</span>
                        <span className="pdp-preview__badge">{positionConfig.label}</span>
                      </div>
                      <div className="pdp-preview" aria-label="Xem trước khắc tên">
                        <div className="pdp-preview__surface">
                          <div className="pdp-preview__grain-lines" aria-hidden />
                          <span
                            className="pdp-preview__text"
                             style={{
                               fontFamily: selectedFont.family,
                               ...selectedFont.style,
                             }}
                          >
                             {previewLabel}
                           </span>
                         </div>
                      </div>
                      <p className="pdp-field__hint">
                        Chi tiết khắc được thực hiện thủ công bởi nghệ nhân làng nghề Thụy Ứng.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price breakdown */}
            <div className="pdp-breakdown">
              <div className="pdp-breakdown__row">
                <span>Giá sản phẩm</span>
                <span>{formatPrice(product.price)}</span>
              </div>
              {engravingEnabled && (
                <div className="pdp-breakdown__row">
                  <span>Phí khắc tên</span>
                  <span>+ {formatPrice(ENGRAVING_FEE)}</span>
                </div>
              )}
              {quantity > 1 && (
                <div className="pdp-breakdown__row">
                  <span>Số lượng</span>
                  <span>× {quantity}</span>
                </div>
              )}
              <div className="pdp-breakdown__row pdp-breakdown__row--total">
                <span>Tạm tính</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Quantity */}
            <div className="pdp-quantity">
              <span className="pdp-quantity__label">Số lượng</span>
              <div className="pdp-quantity__control" role="group" aria-label="Chọn số lượng">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Giảm số lượng"
                  disabled={quantity <= 1}
                >
                  <Minus size={15} />
                </button>
                <output aria-live="polite">{quantity}</output>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Tăng số lượng"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="pdp-actions">
              <button type="button" className="pdp-cta pdp-cta--cart" onClick={addProductToCart}>
                <ShoppingCart size={20} />
                Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                className="pdp-cta shop-product-card__buy-now"
                onClick={() => {
                  addProductToCart()
                  navigate('/cart')
                }}
              >
                Mua ngay
              </button>
            </div>

            {/* Assurances */}
            <div className="pdp-assurances">
              <div>
                <Truck size={22} aria-hidden />
                <span><strong>Giao hàng toàn quốc</strong>3–5 ngày làm việc</span>
              </div>
              <div>
                <Gift size={22} aria-hidden />
                <span><strong>Sản phẩm thủ công</strong>Đóng gói trang nhã</span>
              </div>
              <div>
                <ShieldCheck size={22} aria-hidden />
                <span><strong>Hỗ trợ đổi trả</strong>Trong 7 ngày</span>
              </div>
            </div>

          </section>
        </div>
      </div>

      {isZoomOpen && (
        <div className="pdp-lightbox" role="dialog" aria-modal="true" aria-label={`Ảnh phóng to ${product.name}`}>
          <button
            type="button"
            className="pdp-lightbox__backdrop"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Đóng ảnh phóng to"
          />
          <div className="pdp-lightbox__content">
            <img
              src={product.image}
              alt={product.name}
              style={{ objectPosition: GALLERY_POSITIONS[activeImage] }}
            />
            <button
              type="button"
              className="pdp-lightbox__close"
              onClick={() => setIsZoomOpen(false)}
              aria-label="Đóng"
              autoFocus
            >
              <X size={22} />
            </button>
            <button
              type="button"
              className="pdp-lightbox__arrow pdp-lightbox__arrow--prev"
              onClick={() => changeImage(-1)}
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              type="button"
              className="pdp-lightbox__arrow pdp-lightbox__arrow--next"
              onClick={() => changeImage(1)}
              aria-label="Ảnh tiếp"
            >
              <ChevronRight size={26} />
            </button>
            <span className="pdp-lightbox__counter">
              {activeImage + 1} / {GALLERY_POSITIONS.length}
            </span>
          </div>
        </div>
      )}

      {/* Sticky mobile CTA */}
      <div className="pdp-sticky-bar" aria-label="Thêm vào giỏ hàng nhanh">
        <div className="pdp-sticky-bar__price">
          <PackageCheck size={15} aria-hidden />
          {formatPrice(totalPrice)}
          {engravingEnabled && <span className="pdp-sticky-bar__engraving-note">(bao gồm phí khắc)</span>}
        </div>
        <button type="button" className="pdp-sticky-bar__btn" onClick={addProductToCart}>
          <ShoppingCart size={17} />
          Thêm vào giỏ
        </button>
      </div>
    </article>
  )
}
