import {
  createRouter,
  createWebHistory
} from 'vue-router'


// ========================================
// MADAD PAGES
// ========================================

import DashboardView from '../views/DashboardView.vue'
import ProcurementView from '../views/ProcurementView.vue'
import SuppliersView from '../views/SuppliersView.vue'
import InventoryView from '../views/InventoryView.vue'
import DeliveriesView from '../views/DeliveriesView.vue'
import FinanceView from '../views/FinanceView.vue'
import LocationsView from '../views/LocationsView.vue'
import ExceptionsView from '../views/ExceptionsView.vue'
import AnalyticsView from '../views/AnalyticsView.vue'


// ========================================
// AUTHENTICATION PAGES
// ========================================

import LoginView from '../views/LoginView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import UnauthorizedView from '../views/UnauthorizedView.vue'


// ========================================
// AUTH SERVICE
// ========================================

import {
  waitForAuth,
  getUserProfile
} from '../services/authService'


// ========================================
// ROUTES
// ========================================

const routes = [

  // LOGIN

  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Login'
    }
  },


  // DASHBOARD

  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'Overview',
      requiresAuth: true
    }
  },


  // PROCUREMENT

  {
    path: '/procurement',
    name: 'procurement',
    component: ProcurementView,
    meta: {
      title: 'Procurement',
      requiresAuth: true
    }
  },


  // SUPPLIERS

  {
    path: '/suppliers',
    name: 'suppliers',
    component: SuppliersView,
    meta: {
      title: 'Suppliers',
      requiresAuth: true
    }
  },


  // INVENTORY

  {
    path: '/inventory',
    name: 'inventory',
    component: InventoryView,
    meta: {
      title: 'Inventory',
      requiresAuth: true
    }
  },


  // DELIVERIES

  {
    path: '/deliveries',
    name: 'deliveries',
    component: DeliveriesView,
    meta: {
      title: 'Deliveries',
      requiresAuth: true
    }
  },


  // FINANCE

  {
    path: '/finance',
    name: 'finance',
    component: FinanceView,
    meta: {
      title: 'Finance',
      requiresAuth: true
    }
  },


  // LOCATIONS

  {
    path: '/locations',
    name: 'locations',
    component: LocationsView,
    meta: {
      title: 'Locations',
      requiresAuth: true
    }
  },


  // EXCEPTIONS

  {
    path: '/exceptions',
    name: 'exceptions',
    component: ExceptionsView,
    meta: {
      title: 'Exceptions',
      requiresAuth: true
    }
  },


  // ANALYTICS

  {
    path: '/analytics',
    name: 'analytics',
    component: AnalyticsView,
    meta: {
      title: 'Analytics',
      requiresAuth: true
    }
  },


  // ADMIN

  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboardView,
    meta: {
      title: 'Admin',
      requiresAuth: true,
      requiresAdmin: true
    }
  },


  // UNAUTHORIZED

  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView,
    meta: {
      title: 'Access Restricted',
      requiresAuth: true
    }
  },


  // UNKNOWN URL

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }

]


// ========================================
// CREATE ROUTER
// ========================================

const router = createRouter({

  history: createWebHistory(),

  routes

})


// ========================================
// ROUTE SECURITY
// ========================================

router.beforeEach(async (to) => {

  const user = await waitForAuth()


  // Protected page but user is not logged in

  if (to.meta.requiresAuth && !user) {

    return {
      name: 'login'
    }

  }


  // Admin-only page

  if (to.meta.requiresAdmin) {

    if (!user) {

      return {
        name: 'login'
      }

    }

    const profile = await getUserProfile(user.uid)

    if (!profile || profile.role !== 'admin') {

      return {
        name: 'unauthorized'
      }

    }

  }


  // Already logged in and trying to open login

  if (to.name === 'login' && user) {

    const profile = await getUserProfile(user.uid)

    if (profile?.role === 'admin') {

      return {
        name: 'admin'
      }

    }

    return {
      name: 'dashboard'
    }

  }


  return true

})


export default router