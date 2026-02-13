import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ErrorAlert from '../../../components/common/ErrorAlert'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ConfirmModal from '../../../components/common/ConfirmModal'
import { getCategories } from '../../../services/categoryService'
import { getSuppliers } from '../../../services/supplierService'
import {
  bulkUpdateCategory,
  bulkUpdatePrice,
  deleteProduct,
  getProductById,
  getProductByBarcode,
  getProducts,
  importProductsCsv,
} from '../../../services/productService'
import {
  getProductSupplierHistory,
  getProductSuppliers,
} from '../../../services/productSupplierService'

const ProductsList = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [pageData, setPageData] = useState({ page: 0, size: 10, totalPages: 1 })
  const [filters, setFilters] = useState({ name: '', categoryId: '', supplierId: '' })
  const [barcodeQuery, setBarcodeQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkCategoryId, setBulkCategoryId] = useState('')
  const [bulkPrice, setBulkPrice] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [confirmState, setConfirmState] = useState({ visible: false, id: null })
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailProduct, setDetailProduct] = useState(null)
  const [detailSuppliers, setDetailSuppliers] = useState([])
  const [detailHistory, setDetailHistory] = useState([])

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, item) => {
      acc[item.id] = item.name
      return acc
    }, {})
  }, [categories])

  const supplierMap = useMemo(() => {
    return suppliers.reduce((acc, item) => {
      acc[item.id] = item.name
      return acc
    }, {})
  }, [suppliers])

  const fetchData = useCallback(
    async ({ page = 0, name = '', categoryId = '', supplierId = '' } = {}) => {
      setLoading(true)
      setError(null)
      try {
        const [categoriesData, suppliersData, productsPage] = await Promise.all([
          getCategories(),
          getSuppliers(),
          getProducts({
            page,
            size: pageData.size,
            name: name || undefined,
            categoryId: categoryId || undefined,
            supplierId: supplierId || undefined,
          }),
        ])
        setCategories(categoriesData)
        setSuppliers(suppliersData)
        setProducts(productsPage.content || [])
        setPageData({
          page: productsPage.number,
          size: productsPage.size,
          totalPages: productsPage.totalPages || 1,
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    },
    [pageData.size],
  )

  useEffect(() => {
    const nameFromUrl = searchParams.get('name') || ''
    const categoryFromUrl = searchParams.get('categoryId') || ''
    const supplierFromUrl = searchParams.get('supplierId') || ''
    setFilters({ name: nameFromUrl, categoryId: categoryFromUrl, supplierId: supplierFromUrl })
    fetchData({
      page: 0,
      name: nameFromUrl,
      categoryId: categoryFromUrl,
      supplierId: supplierFromUrl,
    })
  }, [fetchData, searchParams])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    fetchData({
      page: 0,
      name: filters.name,
      categoryId: filters.categoryId,
      supplierId: filters.supplierId,
    })
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map((product) => product.id))
    }
  }

  const handleBulkUpdateCategory = async () => {
    if (!bulkCategoryId || selectedIds.length === 0) return
    setLoading(true)
    setError(null)
    try {
      await bulkUpdateCategory({ productIds: selectedIds, categoryId: bulkCategoryId })
      setSelectedIds([])
      setBulkCategoryId('')
      fetchData({
        page: pageData.page,
        name: filters.name,
        categoryId: filters.categoryId,
        supplierId: filters.supplierId,
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update category')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpdatePrice = async () => {
    if (!bulkPrice || selectedIds.length === 0) return
    setLoading(true)
    setError(null)
    try {
      await bulkUpdatePrice({ productIds: selectedIds, price: Number(bulkPrice) })
      setSelectedIds([])
      setBulkPrice('')
      fetchData({
        page: pageData.page,
        name: filters.name,
        categoryId: filters.categoryId,
        supplierId: filters.supplierId,
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update price')
    } finally {
      setLoading(false)
    }
  }

  const buildCsvValue = (value) => {
    if (value === null || value === undefined) return ''
    const text = String(value)
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }

  const handleExportCsv = () => {
    const headers = [
      'name',
      'barcode',
      'categoryId',
      'primarySupplierId',
      'costPrice',
      'price',
      'quantity',
      'unit',
      'imageUrl',
      'notes',
      'lowStockThreshold',
    ]

    const rows = products.map((product) => [
      product.name,
      product.barcode,
      product.categoryId,
      product.primarySupplierId,
      product.costPrice,
      product.price,
      product.quantity,
      product.unit,
      product.imageUrl,
      product.notes,
      product.lowStockThreshold,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(buildCsvValue).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'products.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportCsv = async () => {
    if (!importFile) return
    setLoading(true)
    setError(null)
    setSuccessMessage('')
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      const result = await importProductsCsv(formData)
      setSuccessMessage(
        `Import complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`,
      )
      setImportFile(null)
      fetchData({ page: pageData.page, name: filters.name, categoryId: filters.categoryId })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to import CSV')
    } finally {
      setLoading(false)
    }
  }

  const handleBarcodeLookup = async () => {
    if (!barcodeQuery.trim()) {
      setError('Please enter a barcode')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const product = await getProductByBarcode(barcodeQuery.trim())
      navigate(`/inventory/products/${product.id}`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Barcode not found')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmState.id) return
    setLoading(true)
    try {
      await deleteProduct(confirmState.id)
      setConfirmState({ visible: false, id: null })
      fetchData({ page: pageData.page, name: filters.name, categoryId: filters.categoryId })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete product')
      setConfirmState({ visible: false, id: null })
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (value) => {
    if (!value) return '-'
    try {
      return new Date(value).toLocaleString()
    } catch (error) {
      return String(value)
    }
  }

  const openDetails = async (productId) => {
    setDetailVisible(true)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const [product, supplierLinks, history] = await Promise.all([
        getProductById(productId),
        getProductSuppliers(productId),
        getProductSupplierHistory(productId),
      ])
      setDetailProduct(product)
      setDetailSuppliers(supplierLinks)
      setDetailHistory(history)
    } catch (err) {
      setDetailError(err?.response?.data?.message || 'Failed to load product details')
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetails = () => {
    setDetailVisible(false)
    setDetailProduct(null)
    setDetailSuppliers([])
    setDetailHistory([])
    setDetailError(null)
  }

  const renderPagination = () => {
    const items = []
    for (let i = 0; i < pageData.totalPages; i += 1) {
      items.push(
        <CPaginationItem
          key={i}
          active={i === pageData.page}
          onClick={() =>
            fetchData({
              page: i,
              name: filters.name,
              categoryId: filters.categoryId,
              supplierId: filters.supplierId,
            })
          }
        >
          {i + 1}
        </CPaginationItem>,
      )
    }
    return <CPagination className="mt-3">{items}</CPagination>
  }

  return (
    <div>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Products</strong>
          <CButton color="primary" onClick={() => navigate('/inventory/products/new')}>
            Add Product
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-3 mb-3">
            <CCol md={4}>
              <CFormInput
                placeholder="Search by name"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyFilters()
                  if (event.key === 'Enter') event.preventDefault()
                }}
              />
            </CCol>
            <CCol md={4}>
              <CFormSelect
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect
                name="supplierId"
                value={filters.supplierId}
                onChange={handleFilterChange}
              >
                <option value="">All suppliers</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={1} className="d-grid">
              <CButton color="secondary" onClick={applyFilters}>
                Apply
              </CButton>
            </CCol>
          </CRow>

          <CRow className="g-3 mb-3">
            <CCol md={10}>
              <CFormInput
                placeholder="Scan or enter barcode"
                value={barcodeQuery}
                onChange={(event) => setBarcodeQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleBarcodeLookup()
                  if (event.key === 'Enter') event.preventDefault()
                }}
              />
            </CCol>
            <CCol md={2} className="d-grid">
              <CButton color="primary" onClick={handleBarcodeLookup}>
                Lookup
              </CButton>
            </CCol>
          </CRow>

          <ErrorAlert error={error} />
          {successMessage && <div className="text-success mb-3">{successMessage}</div>}

          <CRow className="g-3 mb-3">
            <CCol md={5}>
              <CFormSelect
                value={bulkCategoryId}
                onChange={(event) => setBulkCategoryId(event.target.value)}
              >
                <option value="">Bulk change category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2} className="d-grid">
              <CButton
                color="secondary"
                onClick={handleBulkUpdateCategory}
                disabled={!selectedIds.length}
              >
                Apply
              </CButton>
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="number"
                step="0.01"
                min="0"
                value={bulkPrice}
                onChange={(event) => setBulkPrice(event.target.value)}
                placeholder="Bulk set price"
              />
            </CCol>
            <CCol md={2} className="d-grid">
              <CButton
                color="secondary"
                onClick={handleBulkUpdatePrice}
                disabled={!selectedIds.length}
              >
                Apply
              </CButton>
            </CCol>
          </CRow>

          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormInput
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => setImportFile(event.target.files?.[0] || null)}
              />
            </CCol>
            <CCol md={3} className="d-grid">
              <CButton color="primary" onClick={handleImportCsv} disabled={!importFile}>
                Import CSV
              </CButton>
            </CCol>
            <CCol md={3} className="d-grid">
              <CButton color="secondary" onClick={handleExportCsv} disabled={products.length === 0}>
                Export CSV
              </CButton>
            </CCol>
          </CRow>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === products.length}
                      onChange={toggleSelectAll}
                    />
                  </CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Barcode</CTableHeaderCell>
                  <CTableHeaderCell>Category</CTableHeaderCell>
                  <CTableHeaderCell>Price</CTableHeaderCell>
                  <CTableHeaderCell>Quantity</CTableHeaderCell>
                  <CTableHeaderCell>Unit</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {products.map((product) => {
                  const isLow = Number(product.quantity) < Number(product.lowStockThreshold)
                  return (
                    <CTableRow key={product.id}>
                      <CTableDataCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="link"
                          className="p-0 text-decoration-none"
                          onClick={() => openDetails(product.id)}
                        >
                          {product.name}
                        </CButton>
                      </CTableDataCell>
                      <CTableDataCell>{product.barcode || '-'}</CTableDataCell>
                      <CTableDataCell>{categoryMap[product.categoryId] || '-'}</CTableDataCell>
                      <CTableDataCell>{product.price}</CTableDataCell>
                      <CTableDataCell>{product.quantity}</CTableDataCell>
                      <CTableDataCell>{product.unit}</CTableDataCell>
                      <CTableDataCell>
                        {isLow ? (
                          <CBadge color="danger">Low</CBadge>
                        ) : (
                          <CBadge color="success">OK</CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          className="me-2"
                          onClick={() => navigate(`/inventory/products/${product.id}`)}
                        >
                          Edit
                        </CButton>
                        <CButton
                          size="sm"
                          color="primary"
                          variant="outline"
                          className="me-2"
                          onClick={() => navigate(`/inventory/products/${product.id}/actions`)}
                        >
                          Actions
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          onClick={() => setConfirmState({ visible: true, id: product.id })}
                        >
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          )}

          {!loading && renderPagination()}
        </CCardBody>
      </CCard>

      <ConfirmModal
        visible={confirmState.visible}
        title="Delete product"
        message="Are you sure you want to delete this product?"
        onCancel={() => setConfirmState({ visible: false, id: null })}
        onConfirm={handleDelete}
        confirmText="Delete"
      />

      <CModal visible={detailVisible} onClose={closeDetails} size="lg">
        <CModalHeader>
          <CModalTitle>{detailProduct?.name || 'Product details'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {detailError && <ErrorAlert error={detailError} />}
          {detailLoading ? (
            <LoadingSpinner />
          ) : (
            detailProduct && (
              <div>
                <CRow className="g-3 mb-4">
                  <CCol md={6}>
                    <div className="fw-semibold">Primary supplier</div>
                    <div>
                      {supplierMap[detailProduct.primarySupplierId] ||
                        detailProduct.primarySupplierId ||
                        '-'}
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="fw-semibold">Cost price</div>
                    <div>{detailProduct.costPrice ?? '-'}</div>
                  </CCol>
                  <CCol md={3}>
                    <div className="fw-semibold">Sell price</div>
                    <div>{detailProduct.price ?? '-'}</div>
                  </CCol>
                  <CCol md={6}>
                    <div className="fw-semibold">Category</div>
                    <div>{categoryMap[detailProduct.categoryId] || '-'}</div>
                  </CCol>
                  <CCol md={3}>
                    <div className="fw-semibold">Quantity</div>
                    <div>{detailProduct.quantity ?? '-'}</div>
                  </CCol>
                  <CCol md={3}>
                    <div className="fw-semibold">Unit</div>
                    <div>{detailProduct.unit || '-'}</div>
                  </CCol>
                  <CCol md={12}>
                    <div className="fw-semibold">Notes</div>
                    <div>{detailProduct.notes || '-'}</div>
                  </CCol>
                </CRow>

                <h6 className="mb-2">Suppliers</h6>
                {detailSuppliers.length === 0 ? (
                  <div className="text-muted mb-4">No suppliers linked.</div>
                ) : (
                  <CTable striped responsive className="mb-4">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Supplier</CTableHeaderCell>
                        <CTableHeaderCell>Negotiated price</CTableHeaderCell>
                        <CTableHeaderCell>Note</CTableHeaderCell>
                        <CTableHeaderCell>Updated</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detailSuppliers.map((item) => (
                        <CTableRow key={item.id}>
                          <CTableDataCell>
                            {item.supplierName || supplierMap[item.supplierId] || item.supplierId}
                          </CTableDataCell>
                          <CTableDataCell>{item.negotiatedPrice ?? '-'}</CTableDataCell>
                          <CTableDataCell>{item.note || '-'}</CTableDataCell>
                          <CTableDataCell>{formatDateTime(item.updatedAt)}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}

                <h6 className="mb-2">Supplier price history</h6>
                {detailHistory.length === 0 ? (
                  <div className="text-muted">No history entries.</div>
                ) : (
                  <CTable striped responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Supplier</CTableHeaderCell>
                        <CTableHeaderCell>Price</CTableHeaderCell>
                        <CTableHeaderCell>Note</CTableHeaderCell>
                        <CTableHeaderCell>Updated by</CTableHeaderCell>
                        <CTableHeaderCell>Effective at</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detailHistory.map((item) => (
                        <CTableRow key={item.id}>
                          <CTableDataCell>
                            {item.supplierName || supplierMap[item.supplierId] || item.supplierId}
                          </CTableDataCell>
                          <CTableDataCell>{item.negotiatedPrice ?? '-'}</CTableDataCell>
                          <CTableDataCell>{item.note || '-'}</CTableDataCell>
                          <CTableDataCell>{item.updatedBy || '-'}</CTableDataCell>
                          <CTableDataCell>{formatDateTime(item.effectiveAt)}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </div>
            )
          )}
        </CModalBody>
      </CModal>
    </div>
  )
}

export default ProductsList
