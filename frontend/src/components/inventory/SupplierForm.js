import React from 'react'
import { CButton, CForm, CFormInput, CFormLabel, CFormTextarea } from '@coreui/react'

const SupplierForm = ({ values, onChange, onSubmit, submitLabel = 'Save', loading = false }) => {
  return (
    <CForm onSubmit={onSubmit}>
      <CFormLabel htmlFor="name">Supplier name</CFormLabel>
      <CFormInput id="name" name="name" value={values.name} onChange={onChange} required />

      <CFormLabel className="mt-3" htmlFor="phone">
        Phone
      </CFormLabel>
      <CFormInput id="phone" name="phone" value={values.phone} onChange={onChange} />

      <CFormLabel className="mt-3" htmlFor="address">
        Address
      </CFormLabel>
      <CFormInput id="address" name="address" value={values.address} onChange={onChange} />

      <CFormLabel className="mt-3" htmlFor="notes">
        Notes
      </CFormLabel>
      <CFormTextarea id="notes" name="notes" rows={3} value={values.notes} onChange={onChange} />

      <div className="mt-3">
        <CButton color="primary" type="submit" disabled={loading}>
          {submitLabel}
        </CButton>
      </div>
    </CForm>
  )
}

export default SupplierForm
