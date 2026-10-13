
<script setup>
import { computed, reactive, ref } from 'vue'

import {
  state,
  createOrder,
  cancelOrder,
  openOrders,
  recordProductPrice,
  persist
} from '../data/store'

import {
  procurementSpend,
  completedSpend,
  spendingByCategory,
  spendingBySupplier,
  getSpendingTrend,
  priceIntelligence,
  priceAlerts,
  productsMonitored,
  averagePriceChange,
  getProductPriceHistory,
  supplierPriceComparison
} from '../services/smartProcurementService'

// ==========================================
// GENERAL STATE
// ==========================================

const spendRange = ref('6M')
const showNewOrder = ref(false)
const selectedOrder = ref(null)
const orderFilter = ref('All')
const search = ref('')
const toast = ref('')

function notify(message) {
  toast.value = message
  setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, 3000)
}

const formatMoney = value =>
  Number(value || 0).toLocaleString('en-OM', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })

// ==========================================
// SPENDING INTELLIGENCE
// ==========================================

const chart = computed(() =>
  getSpendingTrend(spendRange.value)
)

const maxSpend = computed(() =>
  Math.max(1, ...chart.value.map(item => item.amount))
)

// ==========================================
// SMART REORDER ENGINE
// ==========================================

const smartReorders = computed(() =>
  state.inventory
    .filter(item => item.stock <= item.reorderPoint)
    .map(item => ({
      ...item,
      daysLeft:
        Number(item.dailyUse) > 0
          ? Math.max(0, Math.floor(item.stock / item.dailyUse))
          : null
    }))
)

function openReorder(item) {
  Object.assign(form, {
    supplier: item.supplier,
    product: item.product,
    category: item.category,
    quantity: `${item.suggestedOrder} ${item.unit}`,
    amount: '',
    eta: '',
    location: state.locations[0]?.name || ''
  })

  showNewOrder.value = true
}

// ==========================================
// PRICE INTELLIGENCE
// ==========================================

const selectedProductId = ref(
  state.inventory[0]?.id ?? ''
)

const newUnitPrice = ref('')
const priceDate = ref(
  new Date().toLocaleDateString('en-CA')
)
const priceError = ref('')

const selectedInventoryItem = computed(() =>
  state.inventory.find(
    item =>
      String(item.id) === String(selectedProductId.value)
  ) || null
)

const selectedPriceInfo = computed(() =>
  priceIntelligence.value.find(
    item =>
      String(item.id) === String(selectedProductId.value)
  ) || null
)

const selectedPriceHistory = computed(() => {
  const item = selectedInventoryItem.value

  return item
    ? getProductPriceHistory(item.product, item.supplier)
    : []
})

const priceChartPoints = computed(() => {
  const item = selectedInventoryItem.value
  if (!item) return []

  return [
    ...selectedPriceHistory.value.map(entry => ({
      label: entry.date,
      price: entry.price
    })),
    {
      label: 'Current',
      price: Number(item.cost)
    }
  ].filter(
    entry =>
      Number.isFinite(entry.price) && entry.price >= 0
  )
})

const priceChartMax = computed(() =>
  Math.max(
    1,
    ...priceChartPoints.value.map(point => point.price)
  )
)

const selectedSupplierComparison = computed(() =>
  supplierPriceComparison.value.find(
    group =>
      group.product === selectedInventoryItem.value?.product
  )?.suppliers || []
)

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const parsed = new Date(`${value}T00:00:00Z`)

  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
}

function saveNewUnitPrice() {
  priceError.value = ''

  const item = selectedInventoryItem.value
  const next = Number(newUnitPrice.value)
  const previous = Number(item?.cost)

  if (
    !item ||
    newUnitPrice.value === '' ||
    !Number.isFinite(next) ||
    next < 0
  ) {
    priceError.value =
      'Select a product and enter a valid unit price.'
    return
  }

  if (!Number.isFinite(previous) || previous < 0) {
    priceError.value =
      'The existing inventory price is invalid.'
    return
  }

  const today = new Date().toLocaleDateString('en-CA')

  if (
    !validDate(priceDate.value) ||
    priceDate.value > today
  ) {
    priceError.value =
      'Enter a valid date that is not in the future.'
    return
  }

  if (next === previous) {
    priceError.value =
      'The new price matches the current price.'
    return
  }

  try {
    // Record the previous cost before updating it.
    recordProductPrice({
      product: item.product,
      supplier: item.supplier,
      price: previous,
      date: priceDate.value
    })

    // Update the inventory cost.
    item.cost = next

    // Save the updated inventory and price history.
    persist()

    newUnitPrice.value = ''

    notify(
      `${item.product}: OMR ${formatMoney(previous)} → OMR ${formatMoney(next)}`
    )
  } catch (error) {
    priceError.value =
      error?.message || 'Unable to save the price.'
  }
}

// ==========================================
// PURCHASE ORDER MANAGEMENT
// ==========================================

const form = reactive({
  supplier: '',
  product: '',
  category: '',
  quantity: '',
  amount: '',
  eta: '',
  location: ''
})

const orderStatuses = [
  'All',
  'Processing',
  'Confirmed',
  'Preparing',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
]

const filteredOrders = computed(() =>
  state.orders.filter(order => {
    const matchesStatus =
      orderFilter.value === 'All' ||
      order.status === orderFilter.value

    const query = search.value.trim().toLowerCase()

    const matchesSearch = [
      order.id,
      order.supplier,
      order.product,
      order.location,
      order.status
    ]
      .join(' ')
      .toLowerCase()
      .includes(query)

    return matchesStatus && matchesSearch
  })
)

function resetForm() {
  Object.assign(form, {
    supplier: '',
    product: '',
    category: '',
    quantity: '',
    amount: '',
    eta: '',
    location: ''
  })
}

function submit() {
  const amount = Number(form.amount)

  if (
    !form.supplier ||
    !form.product.trim() ||
    !form.location ||
    form.amount === '' ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    notify(
      'Supplier, product, valid amount and location are required.'
    )
    return
  }

  const order = createOrder({
    ...form,
    amount
  })

  resetForm()
  showNewOrder.value = false

  notify(`${order.id} created successfully.`)
}

function doCancel(order) {
  cancelOrder(
    order,
    'Cancelled from procurement dashboard'
  )

  selectedOrder.value = null

  notify(`${order.id} cancelled and moved to Exceptions.`)
}
</script>

<template>
  <div class="p-5 lg:p-8">

    <!-- PAGE HEADER -->
    <div
      class="flex flex-col justify-between gap-4 xl:flex-row xl:items-end"
    >
      <div>
        <h2 class="text-2xl font-black text-slate-900">
          Smart Procurement
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Intelligent purchasing, smart reordering,
          spending analytics, price monitoring and
          purchase-order management.
        </p>
      </div>

      <button
        @click="showNewOrder = true"
        class="rounded-xl bg-[#1595B6] px-5 py-3 text-sm font-bold text-white hover:bg-[#117E9E]"
      >
        + New Purchase Order
      </button>
    </div>

    <!-- PROCUREMENT KPI CARDS -->
    <section class="mt-6 grid gap-4 md:grid-cols-3">

      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-xs text-slate-500">
          Tracked Procurement Spend
        </p>

        <p class="mt-3 text-2xl font-black">
          OMR {{ formatMoney(procurementSpend) }}
        </p>

        <p class="mt-2 text-xs font-bold text-[#1595B6]">
          Non-cancelled order commitments · all dates
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-xs text-slate-500">Open Orders</p>

        <p class="mt-3 text-2xl font-black">
          {{ openOrders }}
        </p>

        <p class="mt-2 text-xs font-bold text-orange-500">
          Processing and ongoing deliveries
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-xs text-slate-500">
          Completed Order Value
        </p>

        <p class="mt-3 text-2xl font-black">
          OMR {{ formatMoney(completedSpend) }}
        </p>

        <p class="mt-2 text-xs font-bold text-emerald-600">
          Delivered orders only
        </p>
      </div>

    </section>

    <!-- SPENDING CHART AND REORDER ENGINE -->
    <section class="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">

      <!-- SPENDING CHART -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6">

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-bold">Procurement Spend</h3>

            <p class="mt-1 text-xs text-slate-500">
              Spending trends from recorded purchase orders.
            </p>
          </div>

          <div class="flex rounded-xl bg-slate-100 p-1">
            <button
              v-for="range in ['3M', '6M', '1Y']"
              :key="range"
              @click="spendRange = range"
              class="rounded-lg px-4 py-2 text-xs font-bold"
              :class="
                spendRange === range
                  ? 'bg-white text-[#117E9E] shadow'
                  : 'text-slate-500'
              "
            >
              {{ range }}
            </button>
          </div>
        </div>

        <div class="mt-7 flex h-64 items-end gap-2">
          <div
            v-for="entry in chart"
            :key="entry.month"
            class="flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <p class="mb-2 text-center text-[9px] text-slate-400">
              {{ Math.round(entry.amount / 1000) }}K
            </p>

            <div class="flex h-48 items-end rounded-xl bg-slate-50">
              <div
                class="w-full rounded-xl bg-gradient-to-t from-[#117E9E] to-[#45BED7]"
                :style="{
                  height:
                    entry.amount === 0
                      ? '0%'
                      : Math.max(
                          4,
                          (entry.amount / maxSpend) * 100
                        ) + '%'
                }"
              ></div>
            </div>

            <p class="mt-2 text-center text-[10px] text-slate-500">
              {{ entry.month.slice(5) }}/{{ entry.month.slice(2, 4) }}
            </p>
          </div>
        </div>
      </div>

      <!-- SMART REORDER ENGINE -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 class="font-bold">Smart Reorder Engine</h3>

        <p class="mt-1 text-xs text-slate-500">
          Inventory threshold recommendations based on stock
          and daily consumption estimates.
        </p>

        <div class="mt-4 space-y-3">
          <div
            v-for="item in smartReorders"
            :key="item.id"
            class="rounded-xl border border-slate-100 p-4"
          >
            <div class="flex justify-between gap-3">
              <div>
                <p class="text-sm font-bold">
                  {{ item.product }}
                </p>

                <p class="mt-1 text-xs text-slate-400">
                  {{ item.stock }} {{ item.unit }} left ·
                  {{
                    item.daysLeft === null
                      ? 'Usage unknown'
                      : `~${item.daysLeft} days coverage`
                  }}
                </p>
              </div>

              <span
                class="h-fit rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600"
              >
                REORDER
              </span>
            </div>

            <p class="mt-3 text-xs text-slate-500">
              Suggested:
              <strong>
                {{ item.suggestedOrder }} {{ item.unit }}
              </strong>
              from {{ item.supplier }}
            </p>

            <button
              @click="openReorder(item)"
              class="mt-3 rounded-lg bg-[#E9F7FB] px-3 py-2 text-xs font-bold text-[#117E9E]"
            >
              Create recommended order
            </button>
          </div>

          <p
            v-if="!smartReorders.length"
            class="text-sm text-slate-500"
          >
            No products currently below their reorder thresholds.
          </p>
        </div>
      </div>

    </section>

    <!-- SPENDING INTELLIGENCE -->
    <section class="mt-6 grid gap-5 lg:grid-cols-2">

      <!-- SPENDING BY CATEGORY -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 class="font-bold text-slate-900">
          Spending by Category
        </h3>

        <p class="mt-1 text-xs text-slate-500">
          Non-cancelled purchase order commitments.
        </p>

        <div
          v-if="spendingByCategory.length"
          class="mt-5 space-y-4"
        >
          <div
            v-for="item in spendingByCategory"
            :key="item.category"
          >
            <div class="flex justify-between gap-3 text-sm">
              <span>{{ item.category }}</span>

              <strong>
                OMR {{ formatMoney(item.amount) }}
              </strong>
            </div>

            <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-[#1595B6]"
                :style="{
                  width:
                    procurementSpend > 0
                      ? (item.amount / procurementSpend * 100) + '%'
                      : '0%'
                }"
              ></div>
            </div>
          </div>
        </div>

        <p v-else class="mt-5 text-sm text-slate-400">
          No eligible purchase orders yet.
        </p>
      </div>

      <!-- SPENDING BY SUPPLIER -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 class="font-bold text-slate-900">
          Spending by Supplier
        </h3>

        <p class="mt-1 text-xs text-slate-500">
          Identify suppliers receiving the most procurement spending.
        </p>

        <div
          v-if="spendingBySupplier.length"
          class="mt-5 space-y-3"
        >
          <div
            v-for="item in spendingBySupplier"
            :key="item.supplier"
            class="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 text-sm"
          >
            <span>{{ item.supplier }}</span>

            <strong class="shrink-0">
              OMR {{ formatMoney(item.amount) }}
            </strong>
          </div>
        </div>

        <p v-else class="mt-5 text-sm text-slate-400">
          No eligible purchase orders yet.
        </p>
      </div>

    </section>

    <!-- ====================================
         PRICE INTELLIGENCE
    ===================================== -->
    <section class="mt-6 space-y-5">

      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 class="text-xl font-black text-slate-900">
            Price Intelligence
          </h3>

          <p class="mt-1 text-xs text-slate-500">
            Monitor unit costs, record price changes,
            review history and compare suppliers.
          </p>
        </div>

        <span
          class="rounded-full bg-[#E9F7FB] px-3 py-2 text-xs font-bold text-[#117E9E]"
        >
          5% Price Alert Threshold
        </span>
      </div>

      <!-- PRICE KPI CARDS -->
      <div class="grid gap-4 md:grid-cols-3">

        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs text-slate-500">
            Products Monitored
          </p>

          <p class="mt-3 text-2xl font-black">
            {{ productsMonitored }}
          </p>

          <p class="mt-2 text-xs text-slate-500">
            Products in inventory
          </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs text-slate-500">
            Price Increase Alerts
          </p>

          <p
            class="mt-3 text-2xl font-black"
            :class="
              priceAlerts.length
                ? 'text-orange-600'
                : 'text-slate-900'
            "
          >
            {{ priceAlerts.length }}
          </p>

          <p class="mt-2 text-xs text-slate-500">
            Increases of at least 5%
          </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs text-slate-500">
            Average Price Change
          </p>

          <p class="mt-3 text-2xl font-black">
            {{
              averagePriceChange === null
                ? 'No history'
                : `${averagePriceChange >= 0 ? '+' : ''}${averagePriceChange.toFixed(2)}%`
            }}
          </p>

          <p class="mt-2 text-xs text-slate-500">
            Products with recorded comparisons
          </p>
        </div>

      </div>

      <!-- PRODUCT HISTORY AND PRICE ENTRY -->
      <div class="grid gap-5 xl:grid-cols-[1.4fr_1fr]">

        <!-- PRODUCT PRICE HISTORY -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6">

          <h4 class="font-bold text-slate-900">
            Product Price History
          </h4>

          <label
            for="price-product"
            class="mt-4 block text-xs font-bold text-slate-600"
          >
            Select Product
          </label>

          <select
            id="price-product"
            v-model="selectedProductId"
            class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option
              v-for="item in state.inventory"
              :key="item.id"
              :value="item.id"
            >
              {{ item.product }} — {{ item.supplier }}
            </option>
          </select>

          <template v-if="selectedInventoryItem">

            <div class="mt-5 grid gap-3 sm:grid-cols-3">

              <div class="rounded-xl bg-slate-50 p-4">
                <p class="text-xs text-slate-500">
                  Current Unit Price
                </p>

                <p class="mt-2 font-black">
                  OMR {{ formatMoney(selectedInventoryItem.cost) }}
                </p>
              </div>

              <div class="rounded-xl bg-slate-50 p-4">
                <p class="text-xs text-slate-500">
                  Previous Price
                </p>

                <p class="mt-2 font-black">
                  {{
                    selectedPriceInfo?.previousPrice == null
                      ? 'Not recorded'
                      : `OMR ${formatMoney(selectedPriceInfo.previousPrice)}`
                  }}
                </p>
              </div>

              <div class="rounded-xl bg-slate-50 p-4">
                <p class="text-xs text-slate-500">
                  Price Movement
                </p>

                <p
                  class="mt-2 font-black"
                  :class="
                    selectedPriceInfo?.alert
                      ? 'text-orange-600'
                      : 'text-slate-900'
                  "
                >
                  {{
                    selectedPriceInfo?.changePercent == null
                      ? 'Not available'
                      : `${selectedPriceInfo.changePercent >= 0 ? '+' : ''}${selectedPriceInfo.changePercent.toFixed(2)}%`
                  }}
                </p>
              </div>

            </div>

            <!-- PRICE HISTORY BAR CHART -->
            <p class="mt-5 text-xs text-slate-500">
              Recorded unit prices in OMR per
              {{ selectedInventoryItem.unit }}.
            </p>

            <div
              v-if="priceChartPoints.length"
              class="mt-3 flex h-48 items-end gap-2 overflow-x-auto rounded-xl bg-slate-50 p-4"
            >
              <div
                v-for="(point, index) in priceChartPoints"
                :key="`${point.label}-${index}`"
                class="flex h-full min-w-16 flex-1 flex-col items-center justify-end gap-1"
              >
                <span class="text-[10px] font-bold text-slate-600">
                  {{ formatMoney(point.price) }}
                </span>

                <div
                  class="w-full rounded-t-lg bg-[#1595B6]"
                  :style="{
                    height:
                      Math.max(
                        4,
                        point.price / priceChartMax * 100
                      ) + '%'
                  }"
                ></div>

                <span class="text-center text-[10px] text-slate-500">
                  {{ point.label }}
                </span>
              </div>
            </div>

            <p
              v-if="!selectedPriceHistory.length"
              class="mt-4 text-xs text-amber-700"
            >
              No historical price recorded yet.
              Record a price change to begin tracking.
            </p>

          </template>
        </div>

        <!-- RECORD NEW PRICE -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6">

          <h4 class="font-bold text-slate-900">
            Record New Unit Price
          </h4>

          <p class="mt-1 text-xs text-slate-500">
            Saves the previous inventory price to history
            before updating the current unit cost.
          </p>

          <form
            class="mt-5 space-y-4"
            @submit.prevent="saveNewUnitPrice"
          >

            <label class="block">
              <span class="text-xs font-bold">
                New Unit Price (OMR)
              </span>

              <input
                v-model="newUnitPrice"
                type="number"
                min="0"
                step="0.001"
                required
                placeholder="e.g. 7.600"
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>

            <label class="block">
              <span class="text-xs font-bold">
                Observation Date
              </span>

              <input
                v-model="priceDate"
                type="date"
                required
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>

            <p
              v-if="priceError"
              class="text-xs font-semibold text-red-600"
            >
              {{ priceError }}
            </p>

            <button
              type="submit"
              :disabled="!selectedInventoryItem"
              class="w-full rounded-xl bg-[#1595B6] px-4 py-3 text-sm font-bold text-white hover:bg-[#117E9E] disabled:opacity-50"
            >
              Save New Price
            </button>

          </form>

          <!-- PRICE ALERTS -->
          <div class="mt-6 border-t border-slate-100 pt-4">

            <h5 class="text-sm font-bold">
              Active Price Alerts
            </h5>

            <div
              v-if="priceAlerts.length"
              class="mt-3 space-y-2"
            >
              <div
                v-for="item in priceAlerts"
                :key="item.id"
                class="rounded-xl bg-orange-50 p-3 text-xs"
              >
                <p class="font-bold text-orange-800">
                  {{ item.product }}
                  · +{{ item.changePercent.toFixed(2) }}%
                </p>

                <p class="mt-1 text-orange-700">
                  {{ item.supplier }}
                </p>
              </div>
            </div>

            <p
              v-else
              class="mt-3 text-xs text-slate-500"
            >
              No price increases of 5% or more detected.
            </p>

          </div>
        </div>

      </div>

      <!-- SUPPLIER PRICE COMPARISON -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6">

        <h4 class="font-bold text-slate-900">
          Supplier Price Comparison
        </h4>

        <p class="mt-1 text-xs text-slate-500">
          Compare recorded prices for the same product
          across different suppliers. Verify matching
          specifications and units before purchasing.
        </p>

        <div
          v-if="selectedSupplierComparison.length > 1"
          class="mt-4 space-y-2"
        >
          <div
            v-for="supplier in selectedSupplierComparison"
            :key="supplier.supplier"
            class="flex justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm"
          >
            <span>{{ supplier.supplier }}</span>

            <strong>
              OMR {{ formatMoney(supplier.price) }}
            </strong>
          </div>
        </div>

        <p
          v-else
          class="mt-4 text-sm text-slate-500"
        >
          No multi-supplier price observations for
          this product yet.
        </p>

      </div>

    </section>

    <!-- ====================================
         PURCHASE ORDERS
    ===================================== -->
    <section
      class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >

      <div
        class="flex flex-col gap-4 border-b border-slate-100 p-6 xl:flex-row xl:items-center xl:justify-between"
      >
        <div>
          <h3 class="font-bold">Purchase Orders</h3>

          <p class="mt-1 text-xs text-slate-500">
            Create, search, inspect and cancel orders.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">

          <input
            v-model="search"
            placeholder="Search orders..."
            class="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1595B6]"
          />

          <button
            v-for="status in orderStatuses"
            :key="status"
            @click="orderFilter = status"
            class="rounded-lg px-3 py-2 text-xs font-bold"
            :class="
              orderFilter === status
                ? 'bg-[#1595B6] text-white'
                : 'bg-slate-100 text-slate-500'
            "
          >
            {{ status }}
          </button>

        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[1000px]">

          <thead class="bg-slate-50 text-[10px] uppercase text-slate-400">
            <tr>
              <th class="px-5 py-3 text-left">Order</th>
              <th class="px-5 py-3 text-left">Supplier</th>
              <th class="px-5 py-3 text-left">Product</th>
              <th class="px-5 py-3 text-left">Location</th>
              <th class="px-5 py-3 text-left">Amount</th>
              <th class="px-5 py-3 text-left">ETA</th>
              <th class="px-5 py-3 text-left">Status</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="border-t border-slate-100"
            >
              <td class="px-5 py-4 text-xs font-black text-[#117E9E]">
                {{ order.id }}
              </td>

              <td class="px-5 py-4 text-xs">
                {{ order.supplier }}
              </td>

              <td class="px-5 py-4 text-xs text-slate-500">
                {{ order.product }}
              </td>

              <td class="px-5 py-4 text-xs text-slate-500">
                {{ order.location }}
              </td>

              <td class="px-5 py-4 text-xs font-bold">
                OMR {{ formatMoney(order.amount) }}
              </td>

              <td class="px-5 py-4 text-xs text-slate-500">
                {{ order.eta }}
              </td>

              <td class="px-5 py-4">
                <span
                  class="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold"
                >
                  {{ order.status }}
                </span>
              </td>

              <td class="px-5 py-4">
                <button
                  @click="selectedOrder = order"
                  class="text-xs font-bold text-[#1595B6]"
                >
                  Details
                </button>
              </td>
            </tr>

            <tr v-if="!filteredOrders.length">
              <td
                colspan="8"
                class="px-5 py-8 text-center text-sm text-slate-500"
              >
                No matching purchase orders.
              </td>
            </tr>
          </tbody>

        </table>
      </div>
    </section>

    <!-- ====================================
         CREATE PURCHASE ORDER MODAL
    ===================================== -->
    <div
      v-if="showNewOrder"
      @click.self="showNewOrder = false"
      class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm"
    >
      <div
        class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div class="flex justify-between gap-3">
          <div>
            <h3 class="text-xl font-black">
              Create Purchase Order
            </h3>

            <p class="mt-1 text-xs text-slate-500">
              Purchase orders are stored in browser localStorage.
            </p>
          </div>

          <button @click="showNewOrder = false">
            ✕
          </button>
        </div>

        <form @submit.prevent="submit">

          <div class="mt-6 grid gap-4 sm:grid-cols-2">

            <label class="sm:col-span-2">
              <span class="text-xs font-bold">
                Supplier
              </span>

              <select
                v-model="form.supplier"
                required
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="">Select supplier</option>

                <option
                  v-for="supplier in state.suppliers"
                  :key="supplier.id"
                  :value="supplier.name"
                >
                  {{ supplier.name }}
                </option>
              </select>
            </label>

            <label>
              <span class="text-xs font-bold">Product</span>

              <input
                v-model="form.product"
                required
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>

            <label>
              <span class="text-xs font-bold">Category</span>

              <input
                v-model="form.category"
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>

            <label>
              <span class="text-xs font-bold">Quantity</span>

              <input
                v-model="form.quantity"
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>

            <label>
              <span class="text-xs font-bold">
                Amount (OMR)
              </span>

              <input
                v-model="form.amount"
                type="number"
                min="0.001"
                step="0.001"
                required
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>

            <label>
              <span class="text-xs font-bold">
                Location
              </span>

              <select
                v-model="form.location"
                required
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="">Select location</option>

                <option
                  v-for="location in state.locations"
                  :key="location.id"
                  :value="location.name"
                >
                  {{ location.name }}
                </option>
              </select>
            </label>

            <label>
              <span class="text-xs font-bold">
                Requested Delivery
              </span>

              <input
                v-model="form.eta"
                type="datetime-local"
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>

          </div>

          <button
            type="submit"
            class="mt-5 w-full rounded-xl bg-[#1595B6] py-3 text-sm font-bold text-white"
          >
            Create Purchase Order
          </button>

        </form>
      </div>
    </div>

    <!-- ====================================
         ORDER DETAILS MODAL
    ===================================== -->
    <div
      v-if="selectedOrder"
      @click.self="selectedOrder = null"
      class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"
    >
      <div class="w-full max-w-md rounded-3xl bg-white p-6">

        <div class="flex justify-between">
          <h3 class="text-xl font-black">
            {{ selectedOrder.id }}
          </h3>

          <button @click="selectedOrder = null">
            ✕
          </button>
        </div>

        <div class="mt-5 rounded-2xl bg-slate-50 p-4">
          <p class="font-bold">
            {{ selectedOrder.product }}
          </p>

          <p class="mt-1 text-sm text-slate-500">
            {{ selectedOrder.supplier }}
            · {{ selectedOrder.location }}
          </p>

          <p class="mt-3 text-lg font-black text-[#117E9E]">
            OMR {{ formatMoney(selectedOrder.amount) }}
          </p>
        </div>

        <div class="mt-5">

          <div class="flex justify-between text-xs">
            <span>Delivery Progress</span>

            <span>
              {{ selectedOrder.deliveryProgress }}%
            </span>
          </div>

          <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-[#1595B6]"
              :style="{
                width: selectedOrder.deliveryProgress + '%'
              }"
            ></div>
          </div>

          <p class="mt-3 text-xs text-slate-500">
            Status: {{ selectedOrder.status }}
          </p>
        </div>

        <button
          v-if="
            !['Delivered', 'Cancelled'].includes(
              selectedOrder.status
            )
          "
          @click="doCancel(selectedOrder)"
          class="mt-5 w-full rounded-xl border border-red-200 py-3 text-sm font-bold text-red-500"
        >
          Cancel Order
        </button>

      </div>
    </div>

    <!-- TOAST NOTIFICATIONS -->
    <transition name="fade">
      <div
        v-if="toast"
        class="fixed bottom-6 right-6 z-[60] rounded-xl bg-slate-900 px-5 py-4 text-sm text-white shadow-xl"
      >
        {{ toast }}
      </div>
    </transition>

  </div>
</template>
