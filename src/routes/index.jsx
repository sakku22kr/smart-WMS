import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider }   from '@/context/AuthContext';
import AppLayout          from '@components/layout/AppLayout';
import ProtectedRoute     from './ProtectedRoute';
import GuestRoute         from './GuestRoute';
import AuthErrorBoundary  from '@components/auth/AuthErrorBoundary';
import Loader             from '@components/common/Loader';

// ─── Lazy-loaded Auth Pages ────────────────────────────────────
const Login          = lazy(() => import('@pages/auth/Login'));
const Register       = lazy(() => import('@pages/auth/Register'));
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('@pages/auth/ResetPassword'));
const VerifyEmail    = lazy(() => import('@pages/auth/VerifyEmail'));
const NotFound       = lazy(() => import('@pages/NotFound'));

// ─── Lazy-loaded App Pages ─────────────────────────────────────
const Dashboard      = lazy(() => import('@pages/dashboard/Dashboard'));
const Users          = lazy(() => import('@pages/users/Users'));
const UserDetail     = lazy(() => import('@pages/users/UserDetail'));
const Warehouses     = lazy(() => import('@pages/warehouses/Warehouses'));
const WarehouseDetail = lazy(() => import('@pages/warehouses/WarehouseDetail'));
const Categories     = lazy(() => import('@pages/categories/Categories'));
const CreateCategory = lazy(() => import('@pages/categories/CreateCategory'));
const EditCategory   = lazy(() => import('@pages/categories/EditCategory'));
const CategoryDetail = lazy(() => import('@pages/categories/CategoryDetail'));
const Products       = lazy(() => import('@pages/products/Products'));
const CreateProduct  = lazy(() => import('@pages/products/CreateProduct'));
const EditProduct    = lazy(() => import('@pages/products/EditProduct'));
const ProductDetail  = lazy(() => import('@pages/products/ProductDetail'));
const Suppliers      = lazy(() => import('@pages/suppliers/Suppliers'));
const SupplierForm   = lazy(() => import('@pages/suppliers/SupplierForm'));
const SupplierDetail = lazy(() => import('@pages/suppliers/SupplierDetail'));
const Inventory              = lazy(() => import('@pages/inventory/Inventory'));
const CreateTransaction      = lazy(() => import('@pages/inventory/CreateTransaction'));
const EditTransaction        = lazy(() => import('@pages/inventory/EditTransaction'));
const TransactionDetail      = lazy(() => import('@pages/inventory/TransactionDetail'));
const StockManagement        = lazy(() => import('@pages/inventory/StockManagement'));
const InventoryHistory       = lazy(() => import('@pages/inventory/InventoryHistory'));
const InventoryAlerts        = lazy(() => import('@pages/inventory/InventoryAlerts'));
const PurchaseOrders = lazy(() => import('@pages/purchase-orders/PurchaseOrders'));
const CreatePurchaseOrder = lazy(() => import('@pages/purchase-orders/CreatePurchaseOrder'));
const PurchaseOrderDetail = lazy(() => import('@pages/purchase-orders/PurchaseOrderDetail'));
const Reports        = lazy(() => import('@pages/reports/Reports'));
const InventoryReport  = lazy(() => import('@pages/reports/InventoryReport'));
const ProductReport    = lazy(() => import('@pages/reports/ProductReport'));
const WarehouseReport  = lazy(() => import('@pages/reports/WarehouseReport'));
const SupplierReport   = lazy(() => import('@pages/reports/SupplierReport'));
const PurchaseReport   = lazy(() => import('@pages/reports/PurchaseReport'));
const Profile        = lazy(() => import('@pages/profile/Profile'));
const ChangePassword = lazy(() => import('@pages/profile/ChangePassword'));
const Settings       = lazy(() => import('@pages/settings/Settings'));
const Notifications  = lazy(() => import('@pages/notifications/Notifications'));

// ─── Suspense fallback ─────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader size="lg" label="Loading…" />
  </div>
);

const withSuspense = (Component) => (
  <AuthErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  </AuthErrorBoundary>
);

// ─── Root Layout — provides AuthProvider inside Router context ─
// IMPORTANT: AuthProvider uses useNavigate() which requires Router context.
// It must be rendered inside createBrowserRouter's route tree, not outside RouterProvider.
const RootLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

// ─── Router ───────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    // Root layout wraps ALL routes — provides AuthProvider inside router context
    element: <RootLayout />,
    children: [

      // ── Guest-only routes (redirect authenticated users away) ──
      {
        element: <GuestRoute />,
        children: [
          { path: '/login',           element: withSuspense(Login)          },
          { path: '/register',        element: withSuspense(Register)       },
          { path: '/forgot-password', element: withSuspense(ForgotPassword) },
        ],
      },

      // ── Token-based auth pages (accessible regardless of auth state) ──
      { path: '/reset-password', element: withSuspense(ResetPassword) },
      { path: '/verify-email',   element: withSuspense(VerifyEmail)   },

      // ── Protected App routes ───────────────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              // Default redirect
              { index: true, element: <Navigate to="/dashboard" replace /> },

              // General authenticated routes
              { path: '/dashboard',       element: withSuspense(Dashboard)      },
              { path: '/profile',         element: withSuspense(Profile)        },
              { path: '/change-password', element: withSuspense(ChangePassword) },
              { path: '/settings',        element: withSuspense(Settings)       },
              { path: '/notifications',   element: withSuspense(Notifications)  },
              { path: '/reports',             element: withSuspense(Reports)           },
              { path: '/reports/inventory',   element: withSuspense(InventoryReport)   },
              { path: '/reports/products',    element: withSuspense(ProductReport)     },
              { path: '/reports/warehouses',  element: withSuspense(WarehouseReport)   },
              { path: '/reports/suppliers',   element: withSuspense(SupplierReport)    },
              { path: '/reports/purchases',   element: withSuspense(PurchaseReport)    },

              // Warehouse staff+ routes
              { path: '/inventory',              element: withSuspense(Inventory)         },
              { path: '/inventory/create',       element: withSuspense(CreateTransaction) },
              { path: '/inventory/:id/edit',     element: withSuspense(EditTransaction)   },
              { path: '/inventory/:id',          element: withSuspense(TransactionDetail) },
              { path: '/stock-management',       element: withSuspense(StockManagement)   },
              { path: '/inventory-history',      element: withSuspense(InventoryHistory)  },
              { path: '/inventory-alerts',       element: withSuspense(InventoryAlerts)   },
              { path: '/products',           element: withSuspense(Products)      },
              { path: '/products/create',    element: withSuspense(CreateProduct) },
              { path: '/products/:id/edit',  element: withSuspense(EditProduct)   },
              { path: '/products/:id',       element: withSuspense(ProductDetail) },
              { path: '/categories',           element: withSuspense(Categories)    },
              { path: '/categories/new',       element: withSuspense(CreateCategory)},
              { path: '/categories/:id/edit',  element: withSuspense(EditCategory)  },
              { path: '/categories/:id',       element: withSuspense(CategoryDetail)},
              { path: '/suppliers',          element: withSuspense(Suppliers)     },
              { path: '/suppliers/create',   element: withSuspense(SupplierForm)  },
              { path: '/suppliers/:id/edit', element: withSuspense(SupplierForm)  },
              { path: '/suppliers/:id',      element: withSuspense(SupplierDetail)},
              { path: '/warehouses',     element: withSuspense(Warehouses)    },
              { path: '/warehouses/:id', element: withSuspense(WarehouseDetail)},
              { path: '/purchase-orders',          element: withSuspense(PurchaseOrders)      },
              { path: '/purchase-orders/create',   element: withSuspense(CreatePurchaseOrder) },
              { path: '/purchase-orders/:id',      element: withSuspense(PurchaseOrderDetail) },
              { path: '/purchase-orders/:id/edit', element: withSuspense(CreatePurchaseOrder) },

              // Admin-only routes
              {
                element: (
                  <ProtectedRoute
                    roles={['ROLE_ADMIN']}
                    fallbackTo="/dashboard"
                  />
                ),
                children: [
                  { path: '/users',      element: withSuspense(Users)      },
                  { path: '/users/:id',  element: withSuspense(UserDetail) },
                ],
              },
            ],
          },
        ],
      },

      // ── Catch-all — 404 ───────────────────────────────────────
      { path: '*', element: withSuspense(NotFound) },
    ],
  },
]);

export default router;
