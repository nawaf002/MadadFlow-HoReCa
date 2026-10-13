
import { computed } from 'vue'
import { state, priceHistory } from '../data/store'

// ==========================================
// SPENDING INTELLIGENCE
// ==========================================

const validStatuses = new Set([
  'Processing',
  'Confirmed',
  'Preparing',
  'In Transit',
  'Out for Delivery',
  'Delivered'
])

const money = value => Number(value || 0)

const isValidDate = value => {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false
  }

  const date = new Date(`${value}T00:00:00Z`)

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
}

const eligibleOrders = computed(() =>
  state.orders.filter(order =>
    validStatuses.has(order.status) &&
    isValidDate(order.createdAt) &&
    order.amount !== null &&
    order.amount !== undefined &&
    order.amount !== '' &&
    Number.isFinite(Number(order.amount)) &&
    Number(order.amount) >= 0
  )
)

export const procurementSpend = computed(() =>
  eligibleOrders.value.reduce(
    (total, order) => total + money(order.amount),
    0
  )
)

export const completedSpend = computed(() =>
  eligibleOrders.value
    .filter(order => order.status === 'Delivered')
    .reduce(
      (total, order) => total + money(order.amount),
      0
    )
)

export const monthlySpending = computed(() => {
  const months = new Map()

  eligibleOrders.value.forEach(order => {
    const month = order.createdAt.slice(0, 7)

    months.set(
      month,
      (months.get(month) || 0) + money(order.amount)
    )
  })

  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month,
      amount
    }))
})

export const spendingByCategory = computed(() => {
  const categories = new Map()

  eligibleOrders.value.forEach(order => {
    const category = order.category || 'Uncategorized'

    categories.set(
      category,
      (categories.get(category) || 0) +
      money(order.amount)
    )
  })

  return [...categories.entries()]
    .map(([category, amount]) => ({
      category,
      amount
    }))
    .sort((a, b) => b.amount - a.amount)
})

export const spendingBySupplier = computed(() => {
  const suppliers = new Map()

  eligibleOrders.value.forEach(order => {
    const supplier = order.supplier || 'Unknown'

    suppliers.set(
      supplier,
      (suppliers.get(supplier) || 0) +
      money(order.amount)
    )
  })

  return [...suppliers.entries()]
    .map(([supplier, amount]) => ({
      supplier,
      amount
    }))
    .sort((a, b) => b.amount - a.amount)
})

export function getSpendingTrend(range = '6M') {
  const count = {
    '3M': 3,
    '6M': 6,
    '1Y': 12
  }[range] || 6

  const totals = new Map(
    monthlySpending.value.map(item => [
      item.month,
      item.amount
    ])
  )

  const now = new Date()
  const result = []

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    )

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0')
    ].join('-')

    result.push({
      month: key,
      amount: totals.get(key) || 0
    })
  }

  return result
}

// ==========================================
// PRICE INTELLIGENCE
// ==========================================

export const priceIntelligence = computed(() => {
  return state.inventory.map(item => {
    const currentPrice = Number(item.cost)

    const history = priceHistory
      .filter(entry =>
        entry.product === item.product &&
        entry.supplier === item.supplier &&
        Number.isFinite(Number(entry.price)) &&
        Number(entry.price) >= 0 &&
        isValidDate(entry.date)
      )
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      )

    const latestObservation = history.at(-1)

    const previousPrice = latestObservation
      ? Number(latestObservation.price)
      : null

    const changePercent =
      previousPrice !== null &&
      previousPrice > 0 &&
      Number.isFinite(currentPrice)
        ? (
            (currentPrice - previousPrice) /
            previousPrice
          ) * 100
        : null

    return {
      id: item.id,
      product: item.product,
      category: item.category,
      supplier: item.supplier,
      unit: item.unit,
      currentPrice,
      previousPrice,
      changePercent,
      observationCount: history.length,
      lastObservedDate: latestObservation?.date || null,
      alert: changePercent !== null &&
             changePercent >= 5
    }
  })
})

export const priceAlerts = computed(() =>
  priceIntelligence.value.filter(
    item => item.alert
  )
)

export const productsMonitored = computed(() =>
  priceIntelligence.value.length
)

export const averagePriceChange = computed(() => {
  const validChanges = priceIntelligence.value
    .map(item => item.changePercent)
    .filter(value => value !== null)

  if (!validChanges.length) return null

  return validChanges.reduce(
    (total, value) => total + value,
    0
  ) / validChanges.length
})

// ==========================================
// PRICE HISTORY
// ==========================================

export function getProductPriceHistory(
  product,
  supplier
) {
  return priceHistory
    .filter(entry =>
      entry.product === product &&
      entry.supplier === supplier &&
      isValidDate(entry.date) &&
      entry.price !== null &&
      entry.price !== '' &&
      Number.isFinite(Number(entry.price)) &&
      Number(entry.price) >= 0
    )
    .sort((a, b) =>
      a.date.localeCompare(b.date)
    )
    .map(entry => ({
      id: entry.id,
      date: entry.date,
      price: Number(entry.price)
    }))
}

// ==========================================
// SUPPLIER PRICE COMPARISON
// ==========================================

export const supplierPriceComparison = computed(() => {
  const grouped = new Map()

  priceHistory.forEach(entry => {
    if (
      !entry.product ||
      !entry.supplier ||
      !isValidDate(entry.date) ||
      entry.price === null ||
      entry.price === '' ||
      !Number.isFinite(Number(entry.price)) ||
      Number(entry.price) < 0
    ) {
      return
    }

    const key = `${entry.product}::${entry.supplier}`

    const previous = grouped.get(key)

    if (
      !previous ||
      entry.date > previous.date
    ) {
      grouped.set(key, {
        product: entry.product,
        supplier: entry.supplier,
        price: Number(entry.price),
        date: entry.date
      })
    }
  })

  const byProduct = new Map()

  grouped.forEach(entry => {
    if (!byProduct.has(entry.product)) {
      byProduct.set(entry.product, [])
    }

    byProduct.get(entry.product).push(entry)
  })

  return [...byProduct.entries()]
    .map(([product, suppliers]) => ({
      product,
      suppliers: suppliers.sort(
        (a, b) => a.price - b.price
      )
    }))
    .filter(group => group.suppliers.length > 1)
})
