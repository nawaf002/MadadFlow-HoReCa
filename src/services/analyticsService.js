
import { logEvent } from 'firebase/analytics'
import { analyticsReady } from '../firebase'

// ========================================
// GENERAL ANALYTICS EVENT TRACKING
// ========================================

export async function trackEvent(eventName, parameters = {}) {
  try {
    const analytics = await analyticsReady

    if (!analytics) {
      return
    }

    logEvent(analytics, eventName, parameters)

    console.log(
      'Google Analytics event:',
      eventName,
      parameters
    )

  } catch (error) {
    console.error(
      'Analytics tracking error:',
      error
    )
  }
}

// ========================================
// DASHBOARD TRACKING
// ========================================

export function trackDashboardView() {
  return trackEvent('dashboard_view')
}

// ========================================
// ADMIN DASHBOARD TRACKING
// ========================================

export function trackAdminDashboardView() {
  return trackEvent('admin_dashboard_view')
}

// ========================================
// CATEGORY TRACKING
// ========================================

export function trackCategoryOpened(categoryID) {
  return trackEvent('category_opened', {
    category_id: categoryID
  })
}

// ========================================
// PRODUCT TRACKING
// ========================================

export function trackProductSearch() {
  return trackEvent('product_search')
}

export function trackProductCreated() {
  return trackEvent('product_created')
}

// ========================================
// PURCHASE ORDER TRACKING
// ========================================

export function trackPurchaseOrderCreated() {
  return trackEvent('purchase_order_created')
}

// ========================================
// SUPPLIER TRACKING
// ========================================

export function trackSupplierView() {
  return trackEvent('supplier_view')
}
