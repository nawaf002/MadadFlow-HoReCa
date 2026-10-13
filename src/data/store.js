
import { computed, reactive } from 'vue'

// ==========================================
// DEMO SUPPLIERS
// ==========================================

const demoSuppliers = [
  { id: 1, name: 'Oman Harvest Produce', category: 'Fresh Produce', score: 97, delivery: 98, fulfilment: 99, avgDelivery: '2h 10m', quality: 4.9, active: true },
  { id: 2, name: 'Muscat Hospitality Supply', category: 'Dry Goods', score: 95, delivery: 96, fulfilment: 98, avgDelivery: '3h 20m', quality: 4.8, active: true },
  { id: 3, name: 'Coastal Dairy Trading', category: 'Dairy', score: 93, delivery: 94, fulfilment: 96, avgDelivery: '2h 45m', quality: 4.7, active: true },
  { id: 4, name: 'Gulf Beverage Solutions', category: 'Beverages', score: 92, delivery: 95, fulfilment: 93, avgDelivery: '3h 05m', quality: 4.6, active: true },
  { id: 5, name: 'Al Noor Food Trading', category: 'Frozen Food', score: 90, delivery: 91, fulfilment: 95, avgDelivery: '4h 10m', quality: 4.5, active: true },
  { id: 6, name: 'Prime Coffee Oman', category: 'Coffee & Bar', score: 96, delivery: 97, fulfilment: 98, avgDelivery: '1h 55m', quality: 4.9, active: true },
  { id: 7, name: 'Capital Bakery Supplies', category: 'Bakery', score: 88, delivery: 90, fulfilment: 91, avgDelivery: '3h 45m', quality: 4.4, active: true },
  { id: 8, name: 'Ocean Catch Foods', category: 'Seafood', score: 94, delivery: 92, fulfilment: 97, avgDelivery: '2h 30m', quality: 4.8, active: true },
  { id: 9, name: 'Green Valley Organics', category: 'Organic Produce', score: 91, delivery: 93, fulfilment: 92, avgDelivery: '3h 00m', quality: 4.7, active: true },
  { id: 10, name: 'Desert Spice Trading', category: 'Spices & Condiments', score: 89, delivery: 90, fulfilment: 94, avgDelivery: '3h 50m', quality: 4.6, active: true },
]

// ==========================================
// DEMO INVENTORY
// ==========================================

const demoInventory = [
  { id: 1, product: 'Arabica Coffee Beans', category: 'Coffee', stock: 12, unit: 'kg', reorderPoint: 20, suggestedOrder: 30, supplier: 'Prime Coffee Oman', dailyUse: 4, expiryDays: 80, cost: 4.8 },
  { id: 2, product: 'Premium Basmati Rice', category: 'Dry Goods', stock: 28, unit: 'kg', reorderPoint: 40, suggestedOrder: 60, supplier: 'Muscat Hospitality Supply', dailyUse: 9, expiryDays: 210, cost: 1.35 },
  { id: 3, product: 'Olive Oil 5L', category: 'Cooking', stock: 9, unit: 'units', reorderPoint: 15, suggestedOrder: 20, supplier: 'Al Noor Food Trading', dailyUse: 2, expiryDays: 160, cost: 7.2 },
  { id: 4, product: 'Chicken Breast', category: 'Poultry', stock: 18, unit: 'kg', reorderPoint: 25, suggestedOrder: 40, supplier: 'Al Noor Food Trading', dailyUse: 7, expiryDays: 3, cost: 2.45 },
  { id: 5, product: 'Fresh Salmon', category: 'Seafood', stock: 14, unit: 'kg', reorderPoint: 18, suggestedOrder: 25, supplier: 'Ocean Catch Foods', dailyUse: 5, expiryDays: 2, cost: 5.8 },
  { id: 6, product: 'Whipping Cream 1L', category: 'Dairy', stock: 32, unit: 'units', reorderPoint: 20, suggestedOrder: 36, supplier: 'Coastal Dairy Trading', dailyUse: 5, expiryDays: 6, cost: 1.85 },
]

// ==========================================
// DEMO PURCHASE ORDERS
// ==========================================

const demoOrders = [
  { id: 'PO-2918', supplier: 'Prime Coffee Oman', product: 'Arabica Coffee Beans', category: 'Coffee', amount: 1260, status: 'In Transit', eta: 'Today · 1:40 PM', deliveryProgress: 75, location: 'Madinat Al Irfan Hotel', createdAt: '2026-09-14' },
  { id: 'PO-2917', supplier: 'Oman Harvest Produce', product: 'Fresh Vegetables', category: 'Produce', amount: 840, status: 'Out for Delivery', eta: 'Today · 12:20 PM', deliveryProgress: 90, location: 'Qurum Bistro', createdAt: '2026-09-14' },
  { id: 'PO-2916', supplier: 'Coastal Dairy Trading', product: 'Milk & Dairy', category: 'Dairy', amount: 1460, status: 'Confirmed', eta: 'Tomorrow · 9:00 AM', deliveryProgress: 25, location: 'Al Mouj Café', createdAt: '2026-09-13' },
  { id: 'PO-2915', supplier: 'Muscat Hospitality Supply', product: 'Basmati Rice', category: 'Dry Goods', amount: 4120, status: 'Processing', eta: '16 Sep · 2:30 PM', deliveryProgress: 15, location: 'Madinat Al Irfan Hotel', createdAt: '2026-09-13' },
  { id: 'PO-2914', supplier: 'Gulf Beverage Solutions', product: 'Beverages', category: 'Beverages', amount: 980, status: 'Delivered', eta: 'Delivered', deliveryProgress: 100, location: 'Qurum Bistro', createdAt: '2026-09-12' },
  { id: 'PO-2913', supplier: 'Ocean Catch Foods', product: 'Fresh Salmon', category: 'Seafood', amount: 2240, status: 'In Transit', eta: 'Today · 3:10 PM', deliveryProgress: 64, location: 'Muttrah Grill', createdAt: '2026-09-12' },
  { id: 'PO-2912', supplier: 'Capital Bakery Supplies', product: 'Flour & Baking Mix', category: 'Bakery', amount: 650, status: 'Delivered', eta: 'Delivered', deliveryProgress: 100, location: 'Al Mouj Café', createdAt: '2026-09-11' },
  { id: 'PO-2911', supplier: 'Al Noor Food Trading', product: 'Frozen Chicken', category: 'Frozen Food', amount: 1880, status: 'Cancelled', eta: 'Cancelled', deliveryProgress: 0, location: 'Madinat Al Irfan Hotel', createdAt: '2026-09-10', cancelReason: 'Supplier stock unavailable' },
]

// ==========================================
// LOCAL STORAGE HELPER
// ==========================================

function load(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key))
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

// ==========================================
// MAIN REACTIVE STORE
// ==========================================

export const state = reactive({
  suppliers: load('madad-suppliers', demoSuppliers),
  inventory: load('madad-inventory', demoInventory),
  orders: load('madad-orders-v2', demoOrders),

  notifications: [
    { id: 1, title: 'Delivery approaching', message: 'PO-2917 is approximately 20 minutes away.', time: '4 min ago', unread: true },
    { id: 2, title: 'Low stock detected', message: 'Arabica Coffee Beans reached its reorder threshold.', time: '12 min ago', unread: true },
    { id: 3, title: 'Supplier update', message: 'Ocean Catch Foods updated today’s availability.', time: '24 min ago', unread: false },
  ],

  watchlist: [
    { id: 1, product: 'Premium Arabica Coffee Beans', suppliersWatching: 4, available: false, supplier: null, stock: null, price: null },
    { id: 2, product: 'Fresh Avocado', suppliersWatching: 6, available: false, supplier: null, stock: null, price: null },
    { id: 3, product: 'Whipping Cream 1L', suppliersWatching: 3, available: true, supplier: 'Coastal Dairy Trading', stock: '68 units', price: 'OMR 1.850' },
    { id: 4, product: 'Fresh Blueberries', suppliersWatching: 5, available: false, supplier: null, stock: null, price: null },
  ],

  invoices: [
    { id: 'INV-8812', supplier: 'Prime Coffee Oman', order: 'PO-2918', amount: 1260, status: 'Outstanding', due: '20 Sep', location: 'Madinat Al Irfan Hotel' },
    { id: 'INV-8811', supplier: 'Oman Harvest Produce', order: 'PO-2917', amount: 840, status: 'Paid', due: 'Paid 14 Sep', location: 'Qurum Bistro' },
    { id: 'INV-8810', supplier: 'Coastal Dairy Trading', order: 'PO-2916', amount: 1460, status: 'Outstanding', due: '22 Sep', location: 'Al Mouj Café' },
    { id: 'INV-8809', supplier: 'Gulf Beverage Solutions', order: 'PO-2914', amount: 980, status: 'Paid', due: 'Paid 12 Sep', location: 'Qurum Bistro' },
  ],

  locations: [
    { id: 1, name: 'Madinat Al Irfan Hotel', type: 'Hotel', spend: 18400, openOrders: 7, stockHealth: 82, urgentNeeds: ['Chicken Breast', 'Basmati Rice'] },
    { id: 2, name: 'Qurum Bistro', type: 'Restaurant', spend: 11250, openOrders: 4, stockHealth: 91, urgentNeeds: ['Fresh Avocado'] },
    { id: 3, name: 'Al Mouj Café', type: 'Café', spend: 7840, openOrders: 3, stockHealth: 88, urgentNeeds: ['Arabica Coffee Beans'] },
    { id: 4, name: 'Muttrah Grill', type: 'Restaurant', spend: 5190, openOrders: 2, stockHealth: 76, urgentNeeds: ['Fresh Salmon'] },
  ],

  exceptions: [
    { id: 'EX-104', type: 'Delayed Delivery', order: 'PO-2913', severity: 'High', supplier: 'Ocean Catch Foods', detail: 'Driver delayed by 55 minutes', status: 'Open' },
    { id: 'EX-103', type: 'Cancelled Order', order: 'PO-2911', severity: 'Medium', supplier: 'Al Noor Food Trading', detail: 'Supplier stock unavailable', status: 'Resolved' },
    { id: 'EX-102', type: 'Missing Item', order: 'PO-2908', severity: 'High', supplier: 'Muscat Hospitality Supply', detail: '2 cartons missing from delivery', status: 'Investigating' },
    { id: 'EX-101', type: 'Substitution', order: 'PO-2907', severity: 'Low', supplier: 'Coastal Dairy Trading', detail: 'Brand substitution approved by buyer', status: 'Resolved' },
  ],

  insights: [
    { id: 1, title: 'Produce prices are falling', description: 'Average vegetable pricing is 6.8% below your recent purchasing average.', impact: 'Potential saving: OMR 310', confidence: 'High', action: 'Compare suppliers' },
    { id: 2, title: 'Coffee stock may run out soon', description: 'Arabica Coffee Beans could fall below operating requirements within 3 days.', impact: 'Avoid stock-out', confidence: 'High', action: 'Reorder' },
    { id: 3, title: 'Dairy delivery can be improved', description: 'A higher-performing supplier may reduce delivery lead time by roughly two hours.', impact: 'Faster fulfilment', confidence: 'Medium', action: 'Review supplier' },
  ],

  categoryTrends: [
    { category: 'Fresh Produce', change: -6.8, spend: 9200, waste: 2.9 },
    { category: 'Dairy', change: 2.1, spend: 6100, waste: 1.8 },
    { category: 'Seafood', change: 5.4, spend: 7400, waste: 4.6 },
    { category: 'Coffee & Bar', change: -1.2, spend: 4800, waste: 0.9 },
    { category: 'Dry Goods', change: 1.7, spend: 8800, waste: 0.5 },
  ],
})

// ==========================================
// SMART PROCUREMENT — PRICE HISTORY
// ==========================================

// Historical price observations are stored
// separately from inventory data.

export const priceHistory = reactive(
  load('madad-price-history', [])
)

export function recordProductPrice({
  product,
  supplier,
  price,
  date = new Date().toISOString().slice(0, 10)
}) {
  const amount = Number(price)

  if (
    typeof product !== 'string' ||
    !product.trim() ||
    typeof supplier !== 'string' ||
    !supplier.trim() ||
    price === '' ||
    price === null ||
    price === undefined ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date))
  ) {
    throw new Error('Invalid product price information')
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    product: product.trim(),
    supplier: supplier.trim(),
    price: amount,
    date
  }

  priceHistory.push(entry)

  localStorage.setItem(
    'madad-price-history',
    JSON.stringify(priceHistory)
  )

  return entry
}

// ==========================================
// COMPUTED DASHBOARD METRICS
// ==========================================

export const monthlySpend = computed(() =>
  state.orders.reduce(
    (sum, order) => sum + Number(order.amount || 0),
    0
  )
)

export const openOrders = computed(() =>
  state.orders.filter(
    o => !['Delivered', 'Cancelled'].includes(o.status)
  ).length
)

export const cancelledOrders = computed(() =>
  state.orders.filter(o => o.status === 'Cancelled').length
)

export const unreadNotifications = computed(() =>
  state.notifications.filter(n => n.unread).length
)

export const outstandingInvoices = computed(() =>
  state.invoices
    .filter(i => i.status === 'Outstanding')
    .reduce((sum, i) => sum + i.amount, 0)
)

export const paidInvoices = computed(() =>
  state.invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.amount, 0)
)

export const procurementHealth = computed(() => {
  const stockScore = state.inventory.length
    ? state.inventory.reduce(
        (sum, item) =>
          sum + Math.min(
            100,
            item.reorderPoint > 0
              ? (item.stock / item.reorderPoint) * 100
              : 100
          ),
        0
      ) / state.inventory.length
    : 100

  const deliveryScore = state.suppliers.length
    ? state.suppliers.reduce(
        (sum, supplier) =>
          sum + Number(supplier.delivery || 0),
        0
      ) / state.suppliers.length
    : 100

  const exceptionPenalty =
    state.exceptions.filter(
      issue => issue.status !== 'Resolved'
    ).length * 3

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        stockScore * 0.35 +
        deliveryScore * 0.65 -
        exceptionPenalty
      )
    )
  )
})

// ==========================================
// PERSIST DATA
// ==========================================

export function persist() {
  localStorage.setItem(
    'madad-suppliers',
    JSON.stringify(state.suppliers)
  )

  localStorage.setItem(
    'madad-inventory',
    JSON.stringify(state.inventory)
  )

  localStorage.setItem(
    'madad-orders-v2',
    JSON.stringify(state.orders)
  )

  localStorage.setItem(
    'madad-price-history',
    JSON.stringify(priceHistory)
  )
}

// ==========================================
// PURCHASE ORDER MANAGEMENT
// ==========================================

export function createOrder(order) {
  const existingNumbers = state.orders
    .map(item => Number(
      String(item.id || '').replace(/^PO-/, '')
    ))
    .filter(Number.isFinite)

  const next = Math.max(3000, ...existingNumbers) + 1

  const newOrder = {
    ...order,
    id: `PO-${next}`,
    status: 'Processing',
    deliveryProgress: 10,
    createdAt: new Date().toISOString().slice(0, 10),
    amount: Number(order.amount || 0),
  }

  state.orders.unshift(newOrder)

  state.notifications.unshift({
    id: Date.now(),
    title: 'Purchase order created',
    message: `${newOrder.id} for ${newOrder.product} is now processing.`,
    time: 'Just now',
    unread: true
  })

  persist()

  return newOrder
}

export function cancelOrder(
  order,
  reason = 'Cancelled by buyer'
) {
  order.status = 'Cancelled'
  order.eta = 'Cancelled'
  order.deliveryProgress = 0
  order.cancelReason = reason

  state.exceptions.unshift({
    id: `EX-${Date.now()}`,
    type: 'Cancelled Order',
    order: order.id,
    severity: 'Medium',
    supplier: order.supplier,
    detail: reason,
    status: 'Open'
  })

  persist()
}

export function advanceDelivery(order) {
  const stages = [
    { status: 'Processing', progress: 15 },
    { status: 'Confirmed', progress: 30 },
    { status: 'Preparing', progress: 45 },
    { status: 'In Transit', progress: 70 },
    { status: 'Out for Delivery', progress: 90 },
    { status: 'Delivered', progress: 100 },
  ]

  const current = stages.findIndex(
    stage => stage.status === order.status
  )

  if (current === -1 || current === stages.length - 1) {
    return
  }

  const next = stages[current + 1]

  order.status = next.status
  order.deliveryProgress = next.progress

  if (next.status === 'Delivered') {
    order.eta = 'Delivered'
  }

  state.notifications.unshift({
    id: Date.now(),
    title: `${order.id} updated`,
    message: `Delivery status changed to ${order.status}.`,
    time: 'Just now',
    unread: true
  })

  persist()
}

// ==========================================
// INVENTORY SIMULATION
// ==========================================

export function simulateConsumption() {
  state.inventory.forEach(item => {
    const usage = Math.max(
      1,
      Math.round(
        item.dailyUse * (0.2 + Math.random() * 0.4)
      )
    )

    item.stock = Math.max(0, item.stock - usage)
  })

  state.notifications.unshift({
    id: Date.now(),
    title: 'Inventory synced',
    message: 'Live consumption simulation updated stock levels.',
    time: 'Just now',
    unread: true
  })

  persist()
}

// ==========================================
// SUPPLIER AVAILABILITY SIMULATION
// ==========================================

export function simulateAvailability() {
  const item = state.watchlist.find(
    product => !product.available
  )

  if (!item) return null

  item.available = true
  item.supplier = 'Muscat Hospitality Supply'
  item.stock = '45 units'
  item.price = 'OMR 4.800'

  state.notifications.unshift({
    id: Date.now(),
    title: `${item.product} available`,
    message: `${item.supplier} has stock available now.`,
    time: 'Just now',
    unread: true
  })

  return item
}

// ==========================================
// EXCEPTION MANAGEMENT
// ==========================================

export function resolveException(issue) {
  issue.status = 'Resolved'
}

// ==========================================
// NOTIFICATION MANAGEMENT
// ==========================================

export function markNotificationsRead() {
  state.notifications.forEach(notification => {
    notification.unread = false
  })
}
