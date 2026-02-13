import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const ProductsList = React.lazy(() => import('./views/inventory/products/ProductsList'))
const ProductFormPage = React.lazy(() => import('./views/inventory/products/ProductFormPage'))
const ProductActionsPage = React.lazy(() => import('./views/inventory/products/ProductActionsPage'))
const CategoriesList = React.lazy(() => import('./views/inventory/categories/CategoriesList'))
const SuppliersList = React.lazy(() => import('./views/inventory/suppliers/SuppliersList'))
const StockAlerts = React.lazy(() => import('./views/inventory/alerts/StockAlerts'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/inventory/products', name: 'Products', element: ProductsList },
  { path: '/inventory/products/new', name: 'Add Product', element: ProductFormPage },
  { path: '/inventory/products/:id', name: 'Edit Product', element: ProductFormPage },
  { path: '/inventory/products/:id/actions', name: 'Product Actions', element: ProductActionsPage },
  { path: '/inventory/categories', name: 'Categories', element: CategoriesList },
  { path: '/inventory/suppliers', name: 'Suppliers', element: SuppliersList },
  { path: '/inventory/alerts', name: 'Stock Alerts', element: StockAlerts },
]

export default routes
