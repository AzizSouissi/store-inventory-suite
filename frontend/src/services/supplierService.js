import api from './api'

export const getSuppliers = async () => {
  const { data } = await api.get('/suppliers')
  return data
}

export const getSupplierById = async (id) => {
  const { data } = await api.get(`/suppliers/${id}`)
  return data
}

export const createSupplier = async (payload) => {
  const { data } = await api.post('/suppliers', payload)
  return data
}

export const updateSupplier = async (id, payload) => {
  const { data } = await api.put(`/suppliers/${id}`, payload)
  return data
}

export const deleteSupplier = async (id) => {
  await api.delete(`/suppliers/${id}`)
}
