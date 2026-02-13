import React from 'react'
import { CButton, CForm, CFormInput, CFormLabel } from '@coreui/react'

const CategoryForm = ({ values, onChange, onSubmit, submitLabel = 'Save', loading = false }) => {
  return (
    <CForm onSubmit={onSubmit}>
      <CFormLabel htmlFor="name">Category name</CFormLabel>
      <CFormInput id="name" name="name" value={values.name} onChange={onChange} required />
      <CFormLabel className="mt-3" htmlFor="defaultLowStockThreshold">
        Default low stock threshold (optional)
      </CFormLabel>
      <CFormInput
        id="defaultLowStockThreshold"
        name="defaultLowStockThreshold"
        type="number"
        step="0.001"
        min="0"
        value={values.defaultLowStockThreshold}
        onChange={onChange}
      />
      <div className="mt-3">
        <CButton color="primary" type="submit" disabled={loading}>
          {submitLabel}
        </CButton>
      </div>
    </CForm>
  )
}

export default CategoryForm
