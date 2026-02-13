import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilFactory, cilList, cilSpeedometer, cilTag } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Inventory',
  },
  {
    component: CNavGroup,
    name: 'Products',
    to: '/inventory/products',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Products',
        to: '/inventory/products',
      },
      {
        component: CNavItem,
        name: 'Add Product',
        to: '/inventory/products/new',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Categories',
    to: '/inventory/categories',
    icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Suppliers',
    to: '/inventory/suppliers',
    icon: <CIcon icon={cilFactory} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Stock Alerts',
    to: '/inventory/alerts',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Sales',
    to: '/sales',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
]

export default _nav
