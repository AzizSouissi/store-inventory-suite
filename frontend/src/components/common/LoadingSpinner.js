import React from 'react'
import { CSpinner } from '@coreui/react'

const LoadingSpinner = ({ className = 'text-center' }) => {
  return (
    <div className={className}>
      <CSpinner color="primary" />
    </div>
  )
}

export default LoadingSpinner
