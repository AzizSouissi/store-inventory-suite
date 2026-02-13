import api from './api'

export const getProducts = async ({
  page = 0,
  size = 20,
  sortBy = 'name',
  sortDir = 'asc',
  name,
  categoryId,
  supplierId,
}) => {
  const params = { page, size, sortBy, sortDir }
  if (name) params.name = name
  if (categoryId) params.categoryId = categoryId
  if (supplierId) params.supplierId = supplierId

  const { data } = await api.get('/products', { params })
  return data
}

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export const getProductByBarcode = async (barcode) => {
  const { data } = await api.get(`/products/by-barcode/${encodeURIComponent(barcode)}`)
  return data
}

export const createProduct = async (payload) => {
  const { data } = await api.post('/products', payload)
  return data
}

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`)
}

export const getLowStock = async () => {
  const { data } = await api.get('/products/alerts/low-stock')
  return data
}

export const getReorderList = async () => {
  const { data } = await api.get('/products/reorder-list')
  return data
}

export const snoozeLowStock = async (id, days = 7) => {
  await api.post(`/products/${id}/alerts/snooze`, null, { params: { days } })
}

export const receiveStock = async (id, payload) => {
  const { data } = await api.post(`/products/${id}/stock/receive`, payload)
  return data
}

export const wasteStock = async (id, payload) => {
  const { data } = await api.post(`/products/${id}/stock/waste`, payload)
  return data
}

export const getProductBatches = async (id, { availableOnly = true } = {}) => {
  const { data } = await api.get(`/products/${id}/stock/batches`, {
    params: { availableOnly },
  })
  return data
}

export const adjustStock = async (id, payload) => {
  const { data } = await api.post(`/products/${id}/stock/adjust`, payload)
  return data
}

export const getStockMovements = async (id, { page = 0, size = 20 } = {}) => {
  const { data } = await api.get(`/products/${id}/stock/movements`, { params: { page, size } })
  return data
}

export const bulkUpdateCategory = async (payload) => {
  await api.patch('/products/bulk/category', payload)
}

export const bulkUpdatePrice = async (payload) => {
  await api.patch('/products/bulk/price', payload)
}

export const importProductsCsv = async (formData) => {
  const { data } = await api.post('/products/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
