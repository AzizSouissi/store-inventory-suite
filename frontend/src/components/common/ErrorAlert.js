import React from 'react'
import { CAlert } from '@coreui/react'

const ErrorAlert = ({ error }) => {
  if (!error) return null
  return (
    <CAlert color="danger" className="mb-3">
      {error}
    </CAlert>
  )
}

export default ErrorAlert
