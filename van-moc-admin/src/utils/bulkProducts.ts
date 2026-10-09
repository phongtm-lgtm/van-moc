import { blankProduct, type ProductForm } from '../api/products'

export type BulkRow = {
  key: string
  form: ProductForm
  price: string
  autoSlug: boolean
  status: 'draft' | 'saving' | 'saved' | 'error' | 'uncertain'
  error: string
  productId?: string
}

export function productSlug(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 255).replace(/-$/, '')
}

export function newBulkRow(categoryId = '', source?: BulkRow): BulkRow {
  return {
    key: crypto.randomUUID(),
    form: { ...blankProduct, categoryId, ...source?.form, code: '', slug: '', name: '', fonts: [], positions: [] },
    price: source?.price ?? '', autoSlug: true, status: 'draft', error: '',
  }
}

export function bulkRowError(row: BulkRow, rows: BulkRow[]): string {
  const { form } = row
  if (!form.name.trim()) return 'Nhập tên sản phẩm.'
  if (!form.code.trim()) return 'Nhập mã sản phẩm.'
  if (!form.categoryId) return 'Chọn danh mục.'
  if (!form.material.trim()) return 'Nhập chất liệu.'
  if (!row.price.trim() || !Number.isSafeInteger(Number(row.price)) || Number(row.price) < 0 || Number(row.price) > 9999999999999) return 'Giá phải là số nguyên từ 0 đến 9.999.999.999.999 VND.'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) return 'Slug cần có chữ thường không dấu, số hoặc dấu gạch ngang.'
  if ([form.name, form.code, form.material, form.slug].some(value => value.length > 255)) return 'Tên, mã, chất liệu và slug tối đa 255 ký tự.'
  if (rows.some(other => other.key !== row.key && other.form.code.trim() === form.code.trim())) return 'Mã sản phẩm bị trùng với dòng khác.'
  if (rows.some(other => other.key !== row.key && other.form.slug === form.slug)) return 'Slug bị trùng với dòng khác. Hãy sửa slug để phân biệt sản phẩm.'
  return ''
}
