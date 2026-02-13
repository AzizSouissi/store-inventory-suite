import api from './api'

export const createSale = async (payload) => {
  const { data } = await api.post('/sales', payload)
  return data
}

export const getSales = async ({ page = 0, size = 20, productId } = {}) => {
  const params = { page, size }
  if (productId) params.productId = productId

  const { data } = await api.get('/sales', { params })
  return data
}
