import React, { useEffect, useMemo, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import ErrorAlert from '../../../components/common/ErrorAlert'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { getCategories } from '../../../services/categoryService'
import { getLowStock, getReorderList, snoozeLowStock } from '../../../services/productService'

const StockAlerts = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [categories, setCategories] = useState([])
  const [reorderList, setReorderList] = useState([])

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, item) => {
      acc[item.id] = item.name
      return acc
    }, {})
  }, [categories])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [categoriesData, lowStock, reorder] = await Promise.all([
        getCategories(),
        getLowStock(),
        getReorderList(),
      ])
      setCategories(categoriesData)
      setAlerts(lowStock)
      setReorderList(reorder)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <CCard>
      <CCardHeader>
        <strong>Stock Alerts</strong>
      </CCardHeader>
      <CCardBody>
        <ErrorAlert error={error} />
        {loading ? (
          <LoadingSpinner />
        ) : (
          <CTable striped responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Category</CTableHeaderCell>
                <CTableHeaderCell>Quantity</CTableHeaderCell>
                <CTableHeaderCell>Threshold</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {alerts.map((product) => (
                <CTableRow key={product.id}>
                  <CTableDataCell>{product.name}</CTableDataCell>
                  <CTableDataCell>{categoryMap[product.categoryId] || '-'}</CTableDataCell>
                  <CTableDataCell>{product.quantity}</CTableDataCell>
                  <CTableDataCell>{product.lowStockThreshold}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="danger">Critical</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CButton
                      size="sm"
                      color="secondary"
                      variant="outline"
                      onClick={async () => {
                        setLoading(true)
                        try {
                          await snoozeLowStock(product.id, 7)
                          loadData()
                        } catch (err) {
                          setError(err?.response?.data?.message || 'Failed to snooze alert')
                        } finally {
                          setLoading(false)
                        }
                      }}
                    >
                      Snooze 7d
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}

        <CCard className="mt-4">
          <CCardHeader>
            <strong>Reorder List</strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol>
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <CTable striped responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>Category</CTableHeaderCell>
                        <CTableHeaderCell>Quantity</CTableHeaderCell>
                        <CTableHeaderCell>Threshold</CTableHeaderCell>
                        <CTableHeaderCell>Suggested Order</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {reorderList.map((item) => (
                        <CTableRow key={item.id}>
                          <CTableDataCell>{item.name}</CTableDataCell>
                          <CTableDataCell>{categoryMap[item.categoryId] || '-'}</CTableDataCell>
                          <CTableDataCell>{item.quantity}</CTableDataCell>
                          <CTableDataCell>{item.lowStockThreshold}</CTableDataCell>
                          <CTableDataCell>{item.suggestedOrderQuantity}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCardBody>
    </CCard>
  )
}

export default StockAlerts
