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
import { useNavigate, useParams } from 'react-router-dom'
import ErrorAlert from '../../../components/common/ErrorAlert'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { getSuppliers } from '../../../services/supplierService'
import {
  getProductSupplierHistory,
  getProductSuppliers,
} from '../../../services/productSupplierService'
import {
  getProductById,
  getProductBatches,
  getStockMovements,
  receiveStock,
  wasteStock,
} from '../../../services/productService'

const ProductActionsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [product, setProduct] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [movements, setMovements] = useState([])
  const [batches, setBatches] = useState([])
  const [allBatches, setAllBatches] = useState([])
  const [productSuppliers, setProductSuppliers] = useState([])
  const [supplierHistory, setSupplierHistory] = useState([])

  const [stockActions, setStockActions] = useState({
    receiveQty: '',
    receiveSupplierId: '',
    receiveCostPrice: '',
    receiveExpiryDate: '',
    receiveNote: '',
    wasteBatchId: '',
    wasteQty: '',
    wasteReason: 'WASTE',
    wasteNote: '',
  })

  const supplierNameById = useMemo(() => {
    const map = {}
    suppliers.forEach((s) => {
      map[s.id] = s.name
    })
    return map
  }, [suppliers])

  const batchNumberById = useMemo(() => {
    const map = {}
    allBatches.forEach((batch) => {
      map[batch.id] = batch.lotNumber || batch.id
    })
    return map
  }, [allBatches])

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const suppliersData = await getSuppliers()
      setSuppliers(suppliersData)

      const productData = await getProductById(id)
      setProduct(productData)
      setStockActions((prev) => ({
        ...prev,
        receiveSupplierId: productData.primarySupplierId ?? '',
        receiveCostPrice: productData.costPrice ?? '',
      }))

      const [movementPage, availableBatches, allBatchList, supplierLinks, history] =
        await Promise.all([
          getStockMovements(id, { page: 0, size: 10 }),
          getProductBatches(id, { availableOnly: true }),
          getProductBatches(id, { availableOnly: false }),
          getProductSuppliers(id),
          getProductSupplierHistory(id),
        ])

      setMovements(movementPage.content || [])
      setBatches(availableBatches)
      setAllBatches(allBatchList)
      setProductSuppliers(supplierLinks)
      setSupplierHistory(history)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load product actions data')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStockChange = (event) => {
    const { name, value } = event.target
    setStockActions((prev) => ({ ...prev, [name]: value }))
  }

  const refreshAfterStockChange = async () => {
    const [movementPage, availableBatches, allBatchList, supplierLinks, history, updatedProduct] =
      await Promise.all([
        getStockMovements(id, { page: 0, size: 10 }),
        getProductBatches(id, { availableOnly: true }),
        getProductBatches(id, { availableOnly: false }),
        getProductSuppliers(id),
        getProductSupplierHistory(id),
        getProductById(id),
      ])

    setMovements(movementPage.content || [])
    setBatches(availableBatches)
    setAllBatches(allBatchList)
    setProductSuppliers(supplierLinks)
    setSupplierHistory(history)
    setProduct(updatedProduct)

    setStockActions((prev) => ({
      ...prev,
      receiveSupplierId: updatedProduct.primarySupplierId ?? prev.receiveSupplierId,
      receiveCostPrice: updatedProduct.costPrice ?? prev.receiveCostPrice,
    }))
  }

  const handleReceiveStock = async () => {
    if (!stockActions.receiveQty || !stockActions.receiveCostPrice) return
    setLoading(true)
    setError(null)
    try {
      await receiveStock(id, {
        quantity: Number(stockActions.receiveQty),
        supplierId: stockActions.receiveSupplierId || null,
        costPrice: Number(stockActions.receiveCostPrice),
        expiryDate: stockActions.receiveExpiryDate
          ? new Date(stockActions.receiveExpiryDate).toISOString()
          : null,
        note: stockActions.receiveNote || null,
      })

      await refreshAfterStockChange()
      setStockActions((prev) => ({
        ...prev,
        receiveQty: '',
        receiveExpiryDate: '',
        receiveNote: '',
      }))
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to receive stock')
    } finally {
      setLoading(false)
    }
  }

  const handleWasteStock = async () => {
    if (!stockActions.wasteBatchId || !stockActions.wasteQty) return
    setLoading(true)
    setError(null)
    try {
      await wasteStock(id, {
        batchId: stockActions.wasteBatchId,
        quantity: Number(stockActions.wasteQty),
        reason: stockActions.wasteReason,
        note: stockActions.wasteNote || null,
      })

      await refreshAfterStockChange()
      setStockActions((prev) => ({
        ...prev,
        wasteBatchId: '',
        wasteQty: '',
        wasteNote: '',
      }))
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to record waste')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !product) {
    return <LoadingSpinner />
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Actions{product?.name ? `: ${product.name}` : ''}</strong>
        <div className="d-flex gap-2">
          <CButton
            color="info"
            variant="outline"
            onClick={() => navigate(`/inventory/products/${id}`)}
          >
            Edit
          </CButton>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => navigate('/inventory/products')}
          >
            Back
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody>
        <ErrorAlert error={error} />

        <CCard className="mb-4">
          <CCardHeader>
            <strong>Stock Actions</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="receiveQty">Receive quantity</CFormLabel>
                <CFormInput
                  id="receiveQty"
                  name="receiveQty"
                  type="number"
                  step="0.001"
                  min="0"
                  value={stockActions.receiveQty}
                  onChange={handleStockChange}
                />

                <CFormLabel className="mt-2" htmlFor="receiveSupplierId">
                  Supplier
                </CFormLabel>
                <CFormSelect
                  id="receiveSupplierId"
                  name="receiveSupplierId"
                  value={stockActions.receiveSupplierId}
                  onChange={handleStockChange}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </CFormSelect>

                <CFormLabel className="mt-2" htmlFor="receiveCostPrice">
                  Cost price (TND)
                </CFormLabel>
                <CFormInput
                  id="receiveCostPrice"
                  name="receiveCostPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={stockActions.receiveCostPrice}
                  onChange={handleStockChange}
                />

                <CFormLabel className="mt-2" htmlFor="receiveExpiryDate">
                  Expiry date (optional)
                </CFormLabel>
                <CFormInput
                  id="receiveExpiryDate"
                  name="receiveExpiryDate"
                  type="date"
                  value={stockActions.receiveExpiryDate}
                  onChange={handleStockChange}
                />

                <CFormLabel className="mt-2" htmlFor="receiveNote">
                  Note (optional)
                </CFormLabel>
                <CFormInput
                  id="receiveNote"
                  name="receiveNote"
                  value={stockActions.receiveNote}
                  onChange={handleStockChange}
                />

                <CButton className="mt-2" color="success" onClick={handleReceiveStock}>
                  Receive Stock
                </CButton>
              </CCol>

              <CCol md={6}>
                <CFormLabel className="mt-2" htmlFor="wasteBatchId">
                  Select batch (non-empty)
                </CFormLabel>
                <CFormSelect
                  id="wasteBatchId"
                  name="wasteBatchId"
                  value={stockActions.wasteBatchId}
                  onChange={handleStockChange}
                >
                  <option value="">Select batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.lotNumber || 'Batch'} · {batch.quantityRemaining}
                      {batch.expiryDate
                        ? ` · exp ${new Date(batch.expiryDate).toLocaleDateString()}`
                        : ''}
                    </option>
                  ))}
                </CFormSelect>

                <CFormLabel className="mt-2" htmlFor="wasteReason">
                  Reason
                </CFormLabel>
                <CFormSelect
                  id="wasteReason"
                  name="wasteReason"
                  value={stockActions.wasteReason}
                  onChange={handleStockChange}
                >
                  <option value="WASTE">Waste</option>
                  <option value="SPOILAGE">Spoilage</option>
                </CFormSelect>

                <CFormLabel className="mt-2" htmlFor="wasteQty">
                  Waste/Spoilage quantity
                </CFormLabel>
                <CFormInput
                  id="wasteQty"
                  name="wasteQty"
                  type="number"
                  step="0.001"
                  min="0"
                  value={stockActions.wasteQty}
                  onChange={handleStockChange}
                />

                <CFormLabel className="mt-2" htmlFor="wasteNote">
                  Note (optional)
                </CFormLabel>
                <CFormInput
                  id="wasteNote"
                  name="wasteNote"
                  value={stockActions.wasteNote}
                  onChange={handleStockChange}
                />

                <CButton className="mt-2" color="danger" onClick={handleWasteStock}>
                  Record Waste
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>
            <strong>Recent Stock Movements</strong>
          </CCardHeader>
          <CCardBody>
            {movements.length === 0 ? (
              <div>No movements recorded yet.</div>
            ) : (
              <CTable striped responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Delta</CTableHeaderCell>
                    <CTableHeaderCell>Reason</CTableHeaderCell>
                    <CTableHeaderCell>Batch</CTableHeaderCell>
                    <CTableHeaderCell>Unit Cost</CTableHeaderCell>
                    <CTableHeaderCell>Supplier</CTableHeaderCell>
                    <CTableHeaderCell>By</CTableHeaderCell>
                    <CTableHeaderCell>Note</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {movements.map((movement) => (
                    <CTableRow key={movement.id}>
                      <CTableDataCell>
                        {movement.createdAt ? new Date(movement.createdAt).toLocaleString() : '-'}
                      </CTableDataCell>
                      <CTableDataCell>{movement.delta}</CTableDataCell>
                      <CTableDataCell>{movement.reason}</CTableDataCell>
                      <CTableDataCell>
                        {movement.batchId ? batchNumberById[movement.batchId] || '-' : '-'}
                      </CTableDataCell>
                      <CTableDataCell>{movement.unitCost ?? '-'}</CTableDataCell>
                      <CTableDataCell>
                        {movement.supplierId
                          ? supplierNameById[movement.supplierId] || movement.supplierId
                          : '-'}
                      </CTableDataCell>
                      <CTableDataCell>{movement.performedBy || '-'}</CTableDataCell>
                      <CTableDataCell>{movement.note || '-'}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>

        <CCard>
          <CCardHeader>
            <strong>Suppliers & Negotiated Prices</strong>
          </CCardHeader>
          <CCardBody>
            <div className="mt-4">
              {productSuppliers.length === 0 ? (
                <div>No suppliers added yet.</div>
              ) : (
                <CTable striped responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Supplier</CTableHeaderCell>
                      <CTableHeaderCell>Price</CTableHeaderCell>
                      <CTableHeaderCell>Note</CTableHeaderCell>
                      <CTableHeaderCell>Updated</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {productSuppliers.map((item) => (
                      <CTableRow key={item.id}>
                        <CTableDataCell>{item.supplierName}</CTableDataCell>
                        <CTableDataCell>{item.negotiatedPrice}</CTableDataCell>
                        <CTableDataCell>{item.note || '-'}</CTableDataCell>
                        <CTableDataCell>
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </div>

            <div className="mt-4">
              <strong>Supplier Price History</strong>
              {supplierHistory.length === 0 ? (
                <div className="mt-2">No history yet.</div>
              ) : (
                <CTable striped responsive className="mt-2">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Supplier</CTableHeaderCell>
                      <CTableHeaderCell>Price</CTableHeaderCell>
                      <CTableHeaderCell>Updated By</CTableHeaderCell>
                      <CTableHeaderCell>Note</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {supplierHistory.map((item) => (
                      <CTableRow key={item.id}>
                        <CTableDataCell>
                          {item.effectiveAt ? new Date(item.effectiveAt).toLocaleString() : '-'}
                        </CTableDataCell>
                        <CTableDataCell>{item.supplierName}</CTableDataCell>
                        <CTableDataCell>{item.negotiatedPrice}</CTableDataCell>
                        <CTableDataCell>{item.updatedBy || '-'}</CTableDataCell>
                        <CTableDataCell>{item.note || '-'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </div>
          </CCardBody>
        </CCard>
      </CCardBody>
    </CCard>
  )
}

export default ProductActionsPage
