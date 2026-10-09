// Run only against the isolated test environment described in docs/e2e-validation.md.
// The customer session fixture bypasses Google; this is NOT a live OAuth/payment test.
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

const temp = 'C:/Users/Acer/AppData/Local/Temp/opencode'
const targets = await (await fetch('http://localhost:9337/json')).json()
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }))
let sequence = 0
const pending = new Map(), errors = [], results = []
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const callback = pending.get(message.id)
    pending.delete(message.id)
    message.error ? callback.reject(message.error) : callback.resolve(message.result)
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails)
})
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence
  pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }))
})
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const evaluate = async expression => {
  const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails))
  return response.result.value
}
const wait = async expression => {
  for (let index = 0; index < 80; index++) { if (await evaluate(expression)) return; await sleep(200) }
  throw new Error(`Timeout: ${expression}; body=${await evaluate('document.body.innerText')}`)
}
const navigate = async url => { await send('Page.navigate', { url }); await wait('document.readyState === "complete"'); await sleep(400) }
const set = async (selector, value) => {
  await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Missing input');Object.getOwnPropertyDescriptor(el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`)
  await sleep(150)
}
const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
const api = (path, method = 'GET', body) => evaluate(`(async()=>{const headers={};if(${JSON.stringify(method)}!=='GET'){const csrf=await(await fetch('http://localhost:31008/api/auth/csrf',{credentials:'include'})).json();headers[csrf.headerName]=csrf.token;}if(${JSON.stringify(body !== undefined)})headers['Content-Type']='application/json';const r=await fetch('http://localhost:31008'+${JSON.stringify(path)},{credentials:'include',method:${JSON.stringify(method)},headers,body:${JSON.stringify(body === undefined ? undefined : JSON.stringify(body))}});return {status:r.status,data:r.status===204?null:await r.json()};})()`)
const check = async (name, action) => { await action(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`) }

try {
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable')
  await send('Network.clearBrowserCookies')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await check('Anonymous account API denied', async () => { await navigate('http://localhost:5273/shop'); assert.equal((await api('/api/me')).status, 401) })
  const cookie = (await fs.readFile(`${temp}/vanmoc-e2e-cookie.txt`, 'utf8')).trim()
  await send('Network.setCookie', { name: 'JSESSIONID', value: cookie, url: 'http://localhost:31008', path: '/', httpOnly: true, sameSite: 'Lax' })
  await check('Customer session survives navigation and reload', async () => {
    await navigate('http://localhost:5273/account'); await wait('[...document.querySelectorAll("input")].some(el=>el.value==="E2E Buyer")')
    await send('Page.reload'); await wait('[...document.querySelectorAll("input")].some(el=>el.value==="E2E Buyer")'); assert.equal((await api('/api/me')).status, 200)
  })
  await check('Address required fields and invalid phone rejected; valid address saved', async () => {
    await navigate('http://localhost:5273/account/addresses'); await wait('document.querySelectorAll("form select").length===2')
    assert.equal(await evaluate('document.querySelector("form").checkValidity()'), false)
    await set('form input:nth-of-type(1)', 'Home')
    await set('form label:nth-of-type(2) input', 'E2E Recipient')
    await set('form label:nth-of-type(3) input', 'abcdefgh')
    await set('form label:nth-of-type(4) select', '1')
    await wait('document.querySelectorAll("form select")[1].options.length>1')
    await set('form label:nth-of-type(5) select', '10')
    await set('form label:nth-of-type(6) input', 'E2E Street')
    await evaluate('document.querySelector("form").requestSubmit()'); await wait('!!document.querySelector("[role=alert]")')
    assert.equal((await api('/api/addresses')).data.length, 0)
    await set('form label:nth-of-type(3) input', '0901234567')
    await evaluate('document.querySelector("form").requestSubmit()'); await wait('!!document.querySelector("article.order-card")')
    assert.equal((await api('/api/addresses')).data.length, 1)
  })
  await check('Product engraving blank blocked and valid personalization retained in cart', async () => {
    await navigate('http://localhost:5273/shop/20000000-0000-0000-0000-000000000001')
    await wait('!!document.querySelector("#engraving-switch")'); await click('#engraving-switch')
    assert.equal(await evaluate('document.querySelector(".pdp-cta--cart").disabled'), true)
    await set('#engraving-text', 'An Nhiên'); await click('.pdp-cta--cart')
    await wait('document.body.innerText.includes("Đã thêm") || document.body.innerText.includes("giỏ hàng")')
    await navigate('http://localhost:5273/cart'); await wait('!!document.querySelector(".cart-item")')
    assert.match(await evaluate('document.querySelector(".cart-item").innerText'), /An Nhiên/)
    await click('button[aria-label="Tăng số lượng"]'); await wait('document.querySelector(".cart-item output").textContent==="2"')
    await click('button[aria-label="Giảm số lượng"]'); await wait('document.querySelector(".cart-item output").textContent==="1"')
    await click('input[aria-label="Chọn tất cả sản phẩm"]'); assert.equal(await evaluate('document.querySelector(".cart-summary a").getAttribute("aria-disabled")'), 'true')
    await click('input[aria-label="Chọn tất cả sản phẩm"]')
  })
  let cod
  await check('Browser COD checkout creates persisted snapshot and clears selected cart', async () => {
    await click('.cart-summary a'); await wait('!!document.querySelector(".checkout-submit") && !document.querySelector(".checkout-submit").disabled')
    await click('.checkout-submit'); await wait('!!document.querySelector(".checkout-page--result")')
    const orders = await api('/api/orders'); assert.equal(orders.status, 200); cod = orders.data.content[0]; cod.id = cod.orderId
    assert.equal((await api('/api/cart')).data.items.length, 0)
    const detail = await api(`/api/orders/${cod.id}`); assert.equal(detail.status, 200); assert.match(JSON.stringify(detail.data), /An Nhiên/)
  })
  await check('Customer cannot access admin or skip status', async () => { assert.equal((await api('/api/admin/orders')).status, 403) })
  let bank
  await check('Browser bank checkout shows QR and manual check does not fake paid', async () => {
    assert.equal((await api('/api/cart/items', 'POST', { productId: '20000000-0000-0000-0000-000000000001', quantity: 1 })).status, 200)
    await navigate('http://localhost:5273/cart'); await wait('!!document.querySelector(".cart-item")'); await click('.cart-summary a')
    await wait('!!document.querySelector("input[value=bank]")'); await click('input[value=bank]')
    await wait('!document.querySelector(".checkout-submit").disabled'); await click('.checkout-submit'); await wait('!!document.querySelector(".bank-modal__confirm")')
    await wait('document.querySelector(".checkout-modal").innerText.includes("123456789")')
    await click('.bank-modal__confirm'); await wait('document.body.innerText.includes("chưa xác nhận thanh toán")')
    bank = (await api('/api/orders')).data.content.find(order => order.status === 'PENDING_PAYMENT')
    if (bank) bank.id = bank.orderId
    assert.ok(bank); assert.equal((await api(`/api/orders/${bank.id}/payment`)).data.status, 'PENDING')
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }); await sleep(300)
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'), false)
    const screenshot = await send('Page.captureScreenshot', { format: 'png' }); await fs.writeFile(`${temp}/vanmoc-e2e-bank-mobile.png`, Buffer.from(screenshot.data, 'base64'))
  })
  await check('Signed test webhook makes real backend paid and browser polling updates', async () => {
    const payment = (await api(`/api/orders/${bank.id}/payment`)).data
    const body = JSON.stringify({ id: 99001, gateway: 'Vietcombank', accountNumber: '123456789', code: payment.transferCode, transferType: 'in', transferAmount: payment.amount })
    const timestamp = String(Math.floor(Date.now() / 1000)); const signature = 'sha256=' + createHmac('sha256', 'e2e-hmac-only').update(`${timestamp}.${body}`).digest('hex')
    const response = await fetch('http://localhost:31008/api/payments/sepay/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-SePay-Timestamp': timestamp, 'X-SePay-Signature': signature }, body })
    assert.equal(response.status, 200); await wait('!!document.querySelector(".checkout-page--result")')
    assert.equal((await api(`/api/orders/${bank.id}/payment`)).data.status, 'PAID')
    assert.equal((await api(`/api/orders/${bank.id}/cancel`, 'POST')).status, 409)
  })
  await check('Order history and detail render real orders on mobile', async () => {
    await navigate('http://localhost:5273/account/orders'); await wait('document.body.innerText.includes("VM")')
    await navigate(`http://localhost:5273/account/orders/${bank.id}`); await wait('document.body.innerText.includes("VM")')
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'), false)
  })
  await api('/api/auth/logout', 'POST')
  await check('Admin invalid password rejected and actual password login succeeds', async () => {
    await navigate('http://localhost:5274/login'); await wait('!!document.querySelector("input[name=username]")')
    await set('input[name=username]', 'admin'); await set('input[name=password]', 'wrong'); await evaluate('document.querySelector("form").requestSubmit()'); await wait('!!document.querySelector("[role=alert]")')
    await set('input[name=password]', 'vanmoc@2026'); await evaluate('document.querySelector("form").requestSubmit()'); await wait('!!document.querySelector("aside")')
    assert.equal((await api('/api/admin/me')).status, 200)
  })
  await check('Admin COD forward-only lifecycle and COD collection', async () => {
    assert.equal((await api(`/api/admin/orders/${cod.id}/status`, 'PATCH', { status: 'SHIPPING', collectCod: false })).status, 409)
    for (const status of ['CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPING']) assert.equal((await api(`/api/admin/orders/${cod.id}/status`, 'PATCH', { status, collectCod: false })).status, 204)
    assert.equal((await api(`/api/admin/orders/${cod.id}/status`, 'PATCH', { status: 'COMPLETED', collectCod: false })).status, 409)
    assert.equal((await api(`/api/admin/orders/${cod.id}/status`, 'PATCH', { status: 'COMPLETED', collectCod: true })).status, 204)
    await navigate(`http://localhost:5274/orders/${cod.id}`); await wait('document.body.innerText.includes("VM")')
  })
  await check('Admin pages load and session survives reload', async () => {
    for (const path of ['/products', '/shipping', '/orders']) { await navigate(`http://localhost:5274${path}`); await wait('!!document.querySelector("aside")'); assert.equal(await evaluate('document.querySelectorAll("[role=alert]").length'), 0) }
    await send('Page.reload'); await wait('!!document.querySelector("aside")'); assert.equal((await api('/api/admin/me')).status, 200)
  })
  await check('Browser admin product validation, create/edit and stock adjustment persist', async () => {
    await navigate('http://localhost:5274/products/new'); await wait('document.querySelectorAll("section form input").length>5')
    await evaluate('document.querySelector("section form").requestSubmit()'); await wait('!!document.querySelector("[role=alert]")')
    await evaluate(`(()=>{const inputs=document.querySelector('section form').querySelectorAll('input');for(const [i,v] of [[0,'E2E browser product'],[1,'E2E-BROWSER'],[2,'e2e-browser'],[3,'Horn']]){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(inputs[i],v);inputs[i].dispatchEvent(new Event('input',{bubbles:true}));}})()`)
    await sleep(200); await evaluate('document.querySelector("section form").requestSubmit()')
    await wait('location.pathname!=="/products/new" && document.querySelectorAll("section form").length===2')
    const id = await evaluate('location.pathname.split("/").pop()')
    assert.equal((await api(`/api/admin/products/${id}`)).data.stock, 0)
    await send('Page.enable')
    await evaluate('window.confirm=()=>true')
    await set('section form.admin-card input[type=number]', '3'); await set('section form.admin-card input:not([type=number])', 'E2E restock')
    await evaluate('document.querySelector("section form.admin-card").requestSubmit()'); await wait('document.body.innerText.includes("Tồn hiện tại: 3")')
    assert.equal((await api(`/api/admin/products/${id}`)).data.stock, 3)
    await set('section form .grid input', 'E2E edited product'); await evaluate('document.querySelector("section form").requestSubmit()')
    await wait('document.body.innerText.includes("Đã lưu sản phẩm")'); await sleep(300)
    assert.equal((await api(`/api/admin/products/${id}`)).data.details.name, 'E2E edited product')
  })
  await check('Browser shipping validation, override and reset persist', async () => {
    await navigate('http://localhost:5274/shipping'); await wait('!!document.querySelector(".shipping-edit")')
    const provinceName = (await api('/api/admin/shipping')).data.provinces.find(p=>p.provinceCode===1).provinceName
    const editSelector = `button[aria-label=${JSON.stringify(`Sửa phí ${provinceName}`)}]`
    await click(editSelector); await wait('!!document.querySelector("#fee-1")')
    await set('#fee-1', '-1'); assert.equal(await evaluate('document.querySelector("#fee-1").checkValidity()'), false)
    await set('#fee-1', '0.5'); assert.equal(await evaluate('document.querySelector("#fee-1").checkValidity()'), false)
    await set('#fee-1', '45000'); await evaluate('document.querySelector("#fee-1").closest("form").requestSubmit()')
    await wait('document.body.innerText.includes("Đã cập nhật phí giao hàng")')
    assert.equal((await api('/api/admin/shipping')).data.provinces.find(p=>p.provinceCode===1).effectiveFee, 45000)
    await click(editSelector); await wait('!!document.querySelector("#fee-1")')
    await evaluate('[...document.querySelector("#fee-1").closest("form").querySelectorAll("button")].find(b=>b.innerText.includes("Dùng mặc định")).click()')
    await wait('!document.querySelector("#fee-1")')
    await click(editSelector); await wait('document.querySelector("#fee-1")?.value==="30000"')
    assert.equal((await api('/api/admin/shipping')).data.provinces.find(p=>p.provinceCode===1).overrideFee, null)
  })
  await check('Logout revokes backend session', async () => { await api('/api/auth/logout', 'POST'); assert.equal((await api('/api/admin/me')).status, 401) })
  assert.equal(errors.length, 0, 'Browser uncaught exceptions')
} catch (error) {
  results.push({ name: 'Execution stopped', status: 'FAIL', error: String(error) }); console.error(error); process.exitCode = 1
} finally {
  await fs.writeFile(`${temp}/vanmoc-e2e-results.json`, JSON.stringify({ results, errors, google: 'NOT TESTED: test session fixture', sepay: 'Signed local test webhook, NOT live bank transaction' }, null, 2)); ws.close()
}
