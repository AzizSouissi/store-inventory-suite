import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import ErrorAlert from '../../components/common/ErrorAlert'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { getProducts } from '../../services/productService'
import { createSale, getSales } from '../../services/salesService'

const ManualSalesPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [pageData, setPageData] = useState({ page: 0, size: 10, totalPages: 1 })
  const getLocalDateTimeValue = () => {
    const now = new Date()
    const pad = (value) => String(value).padStart(2, '0')
    const year = now.getFullYear()
    const month = pad(now.getMonth() + 1)
    const day = pad(now.getDate())
    const hours = pad(now.getHours())
    const minutes = pad(now.getMinutes())
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [form, setForm] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    saleDate: getLocalDateTimeValue(),
  })

  const productMap = useMemo(() => {
    return products.reduce((acc, item) => {
      acc[item.id] = item.name
      return acc
    }, {})
  }, [products])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsPage, salesPage] = await Promise.all([
        getProducts({ page: 0, size: 200 }),
        getSales({ page: 0, size: pageData.size }),
      ])
      setProducts(productsPage.content || [])
      setSales(salesPage.content || [])
      setPageData({
        page: salesPage.number,
        size: salesPage.size,
        totalPages: salesPage.totalPages || 1,
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }, [pageData.size])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleChange = (event) => {
    const { name, value } = event.target
    if (name === 'productId') {
      const selected = products.find((item) => item.id === value)
      setForm((prev) => ({
        ...prev,
        productId: value,
        unitPrice: selected?.price ?? prev.unitPrice,
      }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!form.productId || !form.quantity || !form.unitPrice || !form.saleDate) {
      setError('Product, quantity, unit price, and sale date are required')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await createSale({
        productId: form.productId,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        saleDate: new Date(form.saleDate).toISOString(),
      })
      await loadData()
      setForm({
        productId: '',
        quantity: '',
        unitPrice: '',
        saleDate: getLocalDateTimeValue(),
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to record sale')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>Manual Sales</strong>
      </CCardHeader>
      <CCardBody>
        <ErrorAlert error={error} />

        <CCard className="mb-4">
          <CCardHeader>
            <strong>Record Sale</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="productId">Product</CFormLabel>
                <CFormSelect
                  id="productId"
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel htmlFor="quantity">Quantity</CFormLabel>
                <CFormInput
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="0.001"
                  value={form.quantity}
                  onChange={handleChange}
                />
                <div className="mt-1 text-muted">
                  Unit: {products.find((item) => item.id === form.productId)?.unit || '-'}
                </div>
              </CCol>
              <CCol md={3}>
                <CFormLabel htmlFor="unitPrice">Unit price</CFormLabel>
                <CFormInput
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="saleDate">Sale date</CFormLabel>
                <CFormInput
                  id="saleDate"
                  name="saleDate"
                  type="datetime-local"
                  value={form.saleDate}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>
            <CButton className="mt-3" color="primary" onClick={handleSubmit}>
              Record Sale
            </CButton>
          </CCardBody>
        </CCard>

        <CCard>
          <CCardHeader>
            <strong>Recent Sales</strong>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <LoadingSpinner />
            ) : sales.length === 0 ? (
              <div>No sales recorded yet.</div>
            ) : (
              <CTable striped responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Product</CTableHeaderCell>
                    <CTableHeaderCell>Quantity</CTableHeaderCell>
                    <CTableHeaderCell>Unit Price</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                    <CTableHeaderCell>By</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {sales.map((sale) => (
                    <CTableRow key={sale.id}>
                      <CTableDataCell>
                        {sale.saleDate ? new Date(sale.saleDate).toLocaleString() : '-'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {sale.productName || productMap[sale.productId] || '-'}
                      </CTableDataCell>
                      <CTableDataCell>{sale.quantity}</CTableDataCell>
                      <CTableDataCell>{sale.unitPrice}</CTableDataCell>
                      <CTableDataCell>
                        {Number(sale.quantity) * Number(sale.unitPrice)}
                      </CTableDataCell>
                      <CTableDataCell>{sale.performedBy || '-'}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCardBody>
    </CCard>
  )
}

export default ManualSalesPage
