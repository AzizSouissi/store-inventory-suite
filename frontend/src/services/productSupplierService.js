import api from './api'

export const getProductSuppliers = async (productId) => {
  const { data } = await api.get(`/products/${productId}/suppliers`)
  return data
}

export const upsertProductSupplier = async (productId, payload) => {
  const { data } = await api.post(`/products/${productId}/suppliers`, payload)
  return data
}

export const getProductSupplierHistory = async (productId) => {
  const { data } = await api.get(`/products/${productId}/suppliers/history`)
  return data
}
