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
import CategoryForm from '../../../components/inventory/CategoryForm'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../../services/categoryService'

const CategoriesList = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalState, setModalState] = useState({ visible: false, isEdit: false, id: null })
  const [formValues, setFormValues] = useState({ name: '', defaultLowStockThreshold: '' })
  const [confirmState, setConfirmState] = useState({ visible: false, id: null })

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreate = () => {
    setFormValues({ name: '', defaultLowStockThreshold: '' })
    setModalState({ visible: true, isEdit: false, id: null })
  }

  const openEdit = (category) => {
    setFormValues({
      name: category.name,
      defaultLowStockThreshold: category.defaultLowStockThreshold ?? '',
    })
    setModalState({ visible: true, isEdit: true, id: category.id })
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
      const payload = {
        name: formValues.name,
        defaultLowStockThreshold:
          formValues.defaultLowStockThreshold === ''
            ? null
            : Number(formValues.defaultLowStockThreshold),
      }

      if (modalState.isEdit) {
        await updateCategory(modalState.id, payload)
      } else {
        await createCategory(payload)
      }
      setModalState({ visible: false, isEdit: false, id: null })
      fetchData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmState.id) return
    setLoading(true)
    try {
      await deleteCategory(confirmState.id)
      setConfirmState({ visible: false, id: null })
      fetchData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete category')
      setConfirmState({ visible: false, id: null })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Categories</strong>
        <CButton color="primary" onClick={openCreate}>
          Add Category
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
                <CTableHeaderCell>Default Threshold</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {categories.map((cat) => (
                <CTableRow key={cat.id}>
                  <CTableDataCell>{cat.name}</CTableDataCell>
                  <CTableDataCell>{cat.defaultLowStockThreshold ?? '-'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CButton
                      size="sm"
                      color="info"
                      variant="outline"
                      className="me-2"
                      onClick={() => openEdit(cat)}
                    >
                      Edit
                    </CButton>
                    <CButton
                      size="sm"
                      color="danger"
                      variant="outline"
                      onClick={() => setConfirmState({ visible: true, id: cat.id })}
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
          <CModalTitle>{modalState.isEdit ? 'Edit Category' : 'Add Category'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CategoryForm
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
        title="Delete category"
        message="Are you sure you want to delete this category?"
        onCancel={() => setConfirmState({ visible: false, id: null })}
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </CCard>
  )
}

export default CategoriesList
