import React from 'react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

const ConfirmModal = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'Confirm',
}) => {
  return (
    <CModal visible={visible} onClose={onCancel} alignment="center">
      <CModalHeader>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>{message}</CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onCancel}>
          Cancel
        </CButton>
        <CButton color="danger" onClick={onConfirm}>
          {confirmText}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ConfirmModal
