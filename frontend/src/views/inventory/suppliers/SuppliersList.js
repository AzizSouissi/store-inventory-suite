import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import ErrorAlert from '../../../components/common/ErrorAlert'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ConfirmModal from '../../../components/common/ConfirmModal'
import SupplierForm from '../../../components/inventory/SupplierForm'
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from '../../../services/supplierService'

const emptyForm = {
  name: '',
  phone: '',
  address: '',
  notes: '',
}

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalState, setModalState] = useState({ visible: false, isEdit: false, id: null })
  const [formValues, setFormValues] = useState(emptyForm)
  const [confirmState, setConfirmState] = useState({ visible: false, id: null })

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSuppliers()
      setSuppliers(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreate = () => {
    setFormValues(emptyForm)
    setModalState({ visible: true, isEdit: false, id: null })
  }

  const openEdit = (supplier) => {
    setFormValues({
      name: supplier.name,
      phone: supplier.phone || '',
      address: supplier.address || '',
      notes: supplier.notes || '',
    })
    setModalState({ visible: true, isEdit: true, id: supplier.id })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (modalState.isEdit) {
        await updateSupplier(modalState.id, formValues)
      } else {
        await createSupplier(formValues)
      }
      setModalState({ visible: false, isEdit: false, id: null })
      fetchData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save supplier')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmState.id) return
    setLoading(true)
    try {
      await deleteSupplier(confirmState.id)
      setConfirmState({ visible: false, id: null })
      fetchData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete supplier')
      setConfirmState({ visible: false, id: null })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Suppliers</strong>
        <CButton color="primary" onClick={openCreate}>
          Add Supplier
        </CButton>
      </CCardHeader>
      <CCardBody>
        <ErrorAlert error={error} />
        {loading ? (
          <LoadingSpinner />
        ) : (
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Phone</CTableHeaderCell>
                <CTableHeaderCell>Address</CTableHeaderCell>
                <CTableHeaderCell>Notes</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {suppliers.map((supplier) => (
                <CTableRow key={supplier.id}>
                  <CTableDataCell>{supplier.name}</CTableDataCell>
                  <CTableDataCell>{supplier.phone || '-'}</CTableDataCell>
                  <CTableDataCell>{supplier.address || '-'}</CTableDataCell>
                  <CTableDataCell>{supplier.notes || '-'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CButton
                      size="sm"
                      color="info"
                      variant="outline"
                      className="me-2"
                      onClick={() => openEdit(supplier)}
                    >
                      Edit
                    </CButton>
                    <CButton
                      size="sm"
                      color="danger"
                      variant="outline"
                      onClick={() => setConfirmState({ visible: true, id: supplier.id })}
                    >
                      Delete
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      <CModal
        visible={modalState.visible}
        onClose={() => setModalState({ visible: false, isEdit: false, id: null })}
      >
        <CModalHeader>
          <CModalTitle>{modalState.isEdit ? 'Edit Supplier' : 'Add Supplier'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <SupplierForm
            values={formValues}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitLabel={modalState.isEdit ? 'Update' : 'Create'}
            loading={loading}
          />
        </CModalBody>
      </CModal>

      <ConfirmModal
        visible={confirmState.visible}
        title="Delete supplier"
        message="Are you sure you want to delete this supplier?"
        onCancel={() => setConfirmState({ visible: false, id: null })}
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </CCard>
  )
}

export default SuppliersList
