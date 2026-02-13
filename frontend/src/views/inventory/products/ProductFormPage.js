import React, { useCallback, useEffect, useState } from 'react'
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorAlert from '../../../components/common/ErrorAlert'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ProductForm from '../../../components/inventory/ProductForm'
import { getCategories } from '../../../services/categoryService'
import { getSuppliers } from '../../../services/supplierService'
import { createProduct, getProductById, updateProduct } from '../../../services/productService'

const emptyForm = {
  name: '',
  barcode: '',
  categoryId: '',
  primarySupplierId: '',
  price: '',
  unit: '',
  imageUrl: '',
  notes: '',
  lowStockThreshold: '',
}

const ProductFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const categoriesData = await getCategories()
      setCategories(categoriesData)
      const suppliersData = await getSuppliers()
      setSuppliers(suppliersData)

      if (isEdit) {
        const product = await getProductById(id)
        setValues({
          ...product,
          primarySupplierId: product.primarySupplierId ?? '',
          price: product.price ?? '',
          lowStockThreshold: product.lowStockThreshold ?? '',
        })
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load product data')
    } finally {
      setLoading(false)
    }
  }, [id, isEdit])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const payload = {
      ...values,
      barcode: values.barcode?.trim() || null,
      primarySupplierId: values.primarySupplierId,
      price: Number(values.price),
      lowStockThreshold: Number(values.lowStockThreshold),
    }

    try {
      if (isEdit) {
        await updateProduct(id, payload)
      } else {
        await createProduct(payload)
      }
      navigate('/inventory/products')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }
  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>{isEdit ? 'Edit Product' : 'Add Product'}</strong>
        <div className="d-flex gap-2">
          {isEdit && (
            <CButton
              color="primary"
              variant="outline"
              onClick={() => navigate(`/inventory/products/${id}/actions`)}
            >
              Actions
            </CButton>
          )}
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
        {loading && categories.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <ProductForm
            values={values}
            categories={categories}
            suppliers={suppliers}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitLabel={isEdit ? 'Update Product' : 'Create Product'}
            loading={loading}
          />
        )}
      </CCardBody>
    </CCard>
  )
}

export default ProductFormPage
