import React from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'

const ProductForm = ({
  values,
  categories,
  suppliers,
  onChange,
  onSubmit,
  submitLabel = 'Save',
  loading = false,
}) => {
  return (
    <CForm onSubmit={onSubmit}>
      <CRow className="g-3">
        <CCol md={6}>
          <CFormLabel htmlFor="name">Name</CFormLabel>
          <CFormInput id="name" name="name" value={values.name} onChange={onChange} required />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="barcode">Barcode (optional)</CFormLabel>
          <CFormInput
            id="barcode"
            name="barcode"
            value={values.barcode}
            onChange={onChange}
            placeholder="Scan or type barcode"
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="categoryId">Category</CFormLabel>
          <CFormSelect
            id="categoryId"
            name="categoryId"
            value={values.categoryId}
            onChange={onChange}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="primarySupplierId">Primary Supplier</CFormLabel>
          <CFormSelect
            id="primarySupplierId"
            name="primarySupplierId"
            value={values.primarySupplierId}
            onChange={onChange}
            required
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="price">Price (TND)</CFormLabel>
          <CInputGroup>
            <CInputGroupText>TND</CInputGroupText>
            <CFormInput
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={values.price}
              onChange={onChange}
              required
            />
          </CInputGroup>
        </CCol>
        <CCol md={4}>
          <CFormLabel htmlFor="unit">Unit</CFormLabel>
          <CFormSelect id="unit" name="unit" value={values.unit} onChange={onChange} required>
            <option value="">Select unit</option>
            <option value="KG">kg</option>
            <option value="G">g</option>
            <option value="PIECE">piece</option>
            <option value="PACK">pack</option>
          </CFormSelect>
        </CCol>
        <CCol md={4}>
          <CFormLabel htmlFor="lowStockThreshold">Low Stock Threshold</CFormLabel>
          <CFormInput
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            step="0.01"
            min="0"
            value={values.lowStockThreshold}
            onChange={onChange}
            required
          />
        </CCol>
        <CCol md={4}>
          <CFormLabel htmlFor="imageUrl">Image URL</CFormLabel>
          <CFormInput id="imageUrl" name="imageUrl" value={values.imageUrl} onChange={onChange} />
        </CCol>
        <CCol md={12}>
          <CFormLabel htmlFor="notes">Notes</CFormLabel>
          <CFormTextarea
            id="notes"
            name="notes"
            rows={3}
            value={values.notes}
            onChange={onChange}
          />
        </CCol>
      </CRow>
      <div className="mt-4">
        <CButton color="primary" type="submit" disabled={loading}>
          {submitLabel}
        </CButton>
      </div>
    </CForm>
  )
}

export default ProductForm
