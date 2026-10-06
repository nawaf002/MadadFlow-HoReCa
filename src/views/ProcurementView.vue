<script setup>
import { computed, reactive, ref } from 'vue'
import { state, createOrder, cancelOrder, monthlySpend, openOrders } from '../data/store'

const spendRange = ref('6M')
const showNewOrder = ref(false)
const selectedOrder = ref(null)
const orderFilter = ref('All')
const search = ref('')
const toast = ref('')

const spendData = {
  '3M': [{ month: 'Jul', amount: 34700 }, { month: 'Aug', amount: 38100 }, { month: 'Sep', amount: 42680 }],
  '6M': [{ month: 'Apr', amount: 29100 }, { month: 'May', amount: 33400 }, { month: 'Jun', amount: 31800 }, { month: 'Jul', amount: 34700 }, { month: 'Aug', amount: 38100 }, { month: 'Sep', amount: 42680 }],
  '1Y': [{ month: 'Oct', amount: 22800 }, { month: 'Nov', amount: 25100 }, { month: 'Dec', amount: 28700 }, { month: 'Jan', amount: 26400 }, { month: 'Feb', amount: 30100 }, { month: 'Mar', amount: 31200 }, { month: 'Apr', amount: 29100 }, { month: 'May', amount: 33400 }, { month: 'Jun', amount: 31800 }, { month: 'Jul', amount: 34700 }, { month: 'Aug', amount: 38100 }, { month: 'Sep', amount: 42680 }],
}
const chart = computed(() => spendData[spendRange.value])
const maxSpend = computed(() => Math.max(...chart.value.map(x => x.amount)))

const form = reactive({ supplier: '', product: '', category: '', quantity: '', amount: '', eta: '', location: '' })
const smartReorders = computed(() => state.inventory.filter(i => i.stock <= i.reorderPoint).map(i => ({ ...i, daysLeft: Math.max(1, Math.round(i.stock / i.dailyUse)) })))
const filteredOrders = computed(() => state.orders.filter(o => {
  const matchesStatus = orderFilter.value === 'All' || o.status === orderFilter.value
  const q = search.value.toLowerCase()
  return matchesStatus && [o.id, o.supplier, o.product, o.location, o.status].join(' ').toLowerCase().includes(q)
}))

function openReorder(item) {
  Object.assign(form, { supplier: item.supplier, product: item.product, category: item.category, quantity: `${item.suggestedOrder} ${item.unit}`, amount: '', eta: '', location: state.locations[0].name })
  showNewOrder.value = true
}
function submit() {
  if (!form.supplier || !form.product || !form.amount || !form.location) return notify('Supplier, product, amount and location are required.')
  const order = createOrder({ ...form })
  Object.assign(form, { supplier: '', product: '', category: '', quantity: '', amount: '', eta: '', location: '' })
  showNewOrder.value = false
  notify(`${order.id} created and added to the dashboard.`)
}
function doCancel(order) {
  cancelOrder(order, 'Cancelled from procurement dashboard')
  selectedOrder.value = null
  notify(`${order.id} cancelled and moved to Exceptions.`)
}
function notify(message) {
  toast.value = message
  setTimeout(() => toast.value = '', 3000)
}
</script>

<template>
  <div class="p-5 lg:p-8">
    <div class="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
      <div><h2 class="text-2xl font-black text-slate-900">Procurement</h2><p class="mt-1 text-sm text-slate-500">Spend analysis, smart reorder recommendations and purchase-order management.</p></div>
      <button @click="showNewOrder=true" class="rounded-xl bg-[#1595B6] px-5 py-3 text-sm font-bold text-white hover:bg-[#117E9E]">+ New Purchase Order</button>
    </div>

    <section class="mt-6 grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-xs text-slate-500">Tracked Procurement Spend</p><p class="mt-3 text-2xl font-black">OMR {{ monthlySpend.toLocaleString() }}</p><p class="mt-2 text-xs font-bold text-[#1595B6]">↑ 8.2% vs previous month</p></div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-xs text-slate-500">Open Orders</p><p class="mt-3 text-2xl font-black">{{ openOrders }}</p><p class="mt-2 text-xs font-bold text-orange-500">Includes processing and deliveries</p></div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-xs text-slate-500">Potential Reorder Savings</p><p class="mt-3 text-2xl font-black">OMR 485</p><p class="mt-2 text-xs font-bold text-emerald-600">From timing + supplier comparison</p></div>
    </section>

    <section class="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <div class="rounded-2xl border border-slate-200 bg-white p-6">
        <div class="flex flex-wrap items-center justify-between gap-3"><div><h3 class="font-bold">Procurement Spend</h3><p class="mt-1 text-xs text-slate-500">Switch between 3 months, 6 months and 1 year.</p></div><div class="flex rounded-xl bg-slate-100 p-1"><button v-for="range in ['3M','6M','1Y']" :key="range" @click="spendRange=range" class="rounded-lg px-4 py-2 text-xs font-bold" :class="spendRange===range ? 'bg-white text-[#117E9E] shadow' : 'text-slate-500'">{{ range }}</button></div></div>
        <div class="mt-7 flex h-64 items-end gap-2"><div v-for="entry in chart" :key="entry.month" class="flex h-full flex-1 flex-col justify-end"><p class="mb-2 text-center text-[9px] text-slate-400">{{ Math.round(entry.amount/1000) }}K</p><div class="flex h-48 items-end rounded-xl bg-slate-50"><div class="w-full rounded-xl bg-gradient-to-t from-[#117E9E] to-[#45BED7]" :style="{height: Math.max(15,(entry.amount/maxSpend)*100)+'%'}"></div></div><p class="mt-2 text-center text-[10px] text-slate-500">{{ entry.month }}</p></div></div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6">
        <div><h3 class="font-bold">Smart Reorder Engine</h3><p class="mt-1 text-xs text-slate-500">Recommends quantity and supplier using stock coverage.</p></div>
        <div class="mt-4 space-y-3">
          <div v-for="item in smartReorders" :key="item.id" class="rounded-xl border border-slate-100 p-4">
            <div class="flex justify-between gap-3"><div><p class="text-sm font-bold">{{ item.product }}</p><p class="mt-1 text-xs text-slate-400">{{ item.stock }} {{ item.unit }} left · ~{{ item.daysLeft }} days coverage</p></div><span class="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">REORDER</span></div>
            <p class="mt-3 text-xs text-slate-500">Suggested: <strong>{{ item.suggestedOrder }} {{ item.unit }}</strong> from {{ item.supplier }}</p>
            <button @click="openReorder(item)" class="mt-3 rounded-lg bg-[#E9F7FB] px-3 py-2 text-xs font-bold text-[#117E9E]">Create recommended order</button>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div class="flex flex-col gap-4 border-b border-slate-100 p-6 xl:flex-row xl:items-center xl:justify-between"><div><h3 class="font-bold">Purchase Orders</h3><p class="mt-1 text-xs text-slate-500">New orders update this table immediately.</p></div><div class="flex flex-wrap gap-2"><input v-model="search" placeholder="Search..." class="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1595B6]"/><button v-for="f in ['All','Processing','Confirmed','In Transit','Delivered','Cancelled']" :key="f" @click="orderFilter=f" class="rounded-lg px-3 py-2 text-xs font-bold" :class="orderFilter===f ? 'bg-[#1595B6] text-white' : 'bg-slate-100 text-slate-500'">{{ f }}</button></div></div>
      <div class="overflow-x-auto"><table class="w-full min-w-[1000px]"><thead class="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th class="px-5 py-3 text-left">Order</th><th class="px-5 py-3 text-left">Supplier</th><th class="px-5 py-3 text-left">Product</th><th class="px-5 py-3 text-left">Location</th><th class="px-5 py-3 text-left">Amount</th><th class="px-5 py-3 text-left">ETA</th><th class="px-5 py-3 text-left">Status</th><th></th></tr></thead><tbody><tr v-for="o in filteredOrders" :key="o.id" class="border-t border-slate-100"><td class="px-5 py-4 text-xs font-black text-[#117E9E]">{{ o.id }}</td><td class="px-5 py-4 text-xs">{{ o.supplier }}</td><td class="px-5 py-4 text-xs text-slate-500">{{ o.product }}</td><td class="px-5 py-4 text-xs text-slate-500">{{ o.location }}</td><td class="px-5 py-4 text-xs font-bold">OMR {{ o.amount.toLocaleString() }}</td><td class="px-5 py-4 text-xs text-slate-500">{{ o.eta }}</td><td class="px-5 py-4"><span class="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold">{{ o.status }}</span></td><td class="px-5 py-4"><button @click="selectedOrder=o" class="text-xs font-bold text-[#1595B6]">Details</button></td></tr></tbody></table></div>
    </section>

    <div v-if="showNewOrder" @click.self="showNewOrder=false" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><div class="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"><div class="flex justify-between"><div><h3 class="text-xl font-black">Create Purchase Order</h3><p class="mt-1 text-xs text-slate-500">The new order is stored in localStorage.</p></div><button @click="showNewOrder=false">✕</button></div><div class="mt-6 grid gap-4 sm:grid-cols-2"><label class="sm:col-span-2"><span class="text-xs font-bold">Supplier</span><select v-model="form.supplier" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">Select supplier</option><option v-for="s in state.suppliers" :key="s.id">{{ s.name }}</option></select></label><label><span class="text-xs font-bold">Product</span><input v-model="form.product" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"/></label><label><span class="text-xs font-bold">Category</span><input v-model="form.category" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"/></label><label><span class="text-xs font-bold">Quantity</span><input v-model="form.quantity" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"/></label><label><span class="text-xs font-bold">Amount (OMR)</span><input v-model="form.amount" type="number" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"/></label><label><span class="text-xs font-bold">Location</span><select v-model="form.location" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">Select location</option><option v-for="l in state.locations" :key="l.id">{{ l.name }}</option></select></label><label><span class="text-xs font-bold">Requested Delivery</span><input v-model="form.eta" type="datetime-local" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"/></label></div><button @click="submit" class="mt-5 w-full rounded-xl bg-[#1595B6] py-3 text-sm font-bold text-white">Create Purchase Order</button></div></div>

    <div v-if="selectedOrder" @click.self="selectedOrder=null" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"><div class="w-full max-w-md rounded-3xl bg-white p-6"><div class="flex justify-between"><h3 class="text-xl font-black">{{ selectedOrder.id }}</h3><button @click="selectedOrder=null">✕</button></div><div class="mt-5 rounded-2xl bg-slate-50 p-4"><p class="font-bold">{{ selectedOrder.product }}</p><p class="mt-1 text-sm text-slate-500">{{ selectedOrder.supplier }} · {{ selectedOrder.location }}</p><p class="mt-3 text-lg font-black text-[#117E9E]">OMR {{ selectedOrder.amount.toLocaleString() }}</p></div><div class="mt-5"><div class="flex justify-between text-xs"><span>Delivery progress</span><span>{{ selectedOrder.deliveryProgress }}%</span></div><div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-[#1595B6]" :style="{width:selectedOrder.deliveryProgress+'%'}"></div></div></div><button v-if="!['Delivered','Cancelled'].includes(selectedOrder.status)" @click="doCancel(selectedOrder)" class="mt-5 w-full rounded-xl border border-red-200 py-3 text-sm font-bold text-red-500">Cancel order</button></div></div>

    <transition name="fade"><div v-if="toast" class="fixed bottom-6 right-6 z-[60] rounded-xl bg-slate-900 px-5 py-4 text-sm text-white shadow-xl">{{ toast }}</div></transition>
  </div>
</template>
