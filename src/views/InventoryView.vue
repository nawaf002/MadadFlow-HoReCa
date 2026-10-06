<script setup>
import { computed, ref } from 'vue'
import { state, simulateConsumption, createOrder } from '../data/store'

const toast = ref('')
const selectedCategory = ref('All')
const categories = computed(() => ['All', ...new Set(state.inventory.map(i => i.category))])
const filtered = computed(() => selectedCategory.value === 'All' ? state.inventory : state.inventory.filter(i => i.category === selectedCategory.value))
const lowStock = computed(() => state.inventory.filter(i => i.stock <= i.reorderPoint))
const expiryRisk = computed(() => state.inventory.filter(i => i.expiryDays <= 7).sort((a,b) => a.expiryDays-b.expiryDays))

function daysLeft(item) { return Math.max(1, Math.round(item.stock / item.dailyUse)) }
function reorder(item) {
  const order = createOrder({ supplier: item.supplier, product: item.product, category: item.category, quantity: `${item.suggestedOrder} ${item.unit}`, amount: Number((item.suggestedOrder * item.cost).toFixed(2)), eta: 'Next available slot', location: state.locations[0].name })
  toast.value = `${order.id} created for ${item.product}.`
  setTimeout(() => toast.value='', 3000)
}
function refresh() {
  simulateConsumption()
  toast.value = 'Live stock consumption simulated.'
  setTimeout(() => toast.value='', 3000)
}
</script>

<template>
  <div class="p-5 lg:p-8">
    <div class="flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><h2 class="text-2xl font-black">Inventory & Smart Reorder</h2><p class="mt-1 text-sm text-slate-500">Live stock coverage, reorder thresholds and expiry/waste risk.</p></div><button @click="refresh" class="rounded-xl bg-[#1595B6] px-5 py-3 text-sm font-bold text-white">Refresh live stock</button></div>

    <section class="mt-6 grid gap-4 md:grid-cols-3"><div class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-xs text-slate-500">Tracked SKUs</p><p class="mt-3 text-2xl font-black">{{ state.inventory.length }}</p></div><div class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-xs text-slate-500">Low Stock</p><p class="mt-3 text-2xl font-black text-orange-500">{{ lowStock.length }}</p><p class="mt-2 text-xs text-slate-400">At or below reorder threshold</p></div><div class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-xs text-slate-500">Expiry Risk</p><p class="mt-3 text-2xl font-black text-red-500">{{ expiryRisk.length }}</p><p class="mt-2 text-xs text-slate-400">Items with ≤7 days shelf life</p></div></section>

    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div class="flex flex-wrap items-center justify-between gap-3"><div><h3 class="font-bold">Live Inventory</h3><p class="mt-1 text-xs text-slate-500">Stock level is compared with reorder point and daily consumption.</p></div><select v-model="selectedCategory" class="rounded-lg border border-slate-200 px-3 py-2 text-xs"><option v-for="c in categories" :key="c">{{ c }}</option></select></div>
      <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="item in filtered" :key="item.id" class="rounded-2xl border border-slate-100 p-5">
          <div class="flex justify-between gap-3"><div><p class="font-black">{{ item.product }}</p><p class="mt-1 text-xs text-slate-400">{{ item.category }} · {{ item.supplier }}</p></div><span class="rounded-full px-2 py-1 text-[10px] font-black" :class="item.stock<=item.reorderPoint ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'">{{ item.stock<=item.reorderPoint ? 'LOW' : 'HEALTHY' }}</span></div>
          <div class="mt-5 flex items-end justify-between"><div><p class="text-2xl font-black">{{ item.stock }} <span class="text-sm font-medium text-slate-400">{{ item.unit }}</span></p><p class="mt-1 text-xs text-slate-400">~{{ daysLeft(item) }} days coverage</p></div><button @click="reorder(item)" class="rounded-lg bg-[#E9F7FB] px-3 py-2 text-xs font-bold text-[#117E9E]">Reorder {{ item.suggestedOrder }}</button></div>
          <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full" :class="item.stock<=item.reorderPoint ? 'bg-orange-500' : 'bg-[#1595B6]'" :style="{width:Math.min(100,(item.stock/(item.reorderPoint*2))*100)+'%'}"></div></div>
          <div class="mt-4 grid grid-cols-2 gap-2 text-xs"><div class="rounded-xl bg-slate-50 p-3"><p class="text-[9px] font-bold uppercase text-slate-400">Daily use</p><p class="mt-1 font-black">{{ item.dailyUse }} {{ item.unit }}</p></div><div class="rounded-xl bg-slate-50 p-3"><p class="text-[9px] font-bold uppercase text-slate-400">Shelf life</p><p class="mt-1 font-black" :class="item.expiryDays<=7 ? 'text-red-500' : ''">{{ item.expiryDays }} days</p></div></div>
        </article>
      </div>
    </section>

    <section class="mt-6 grid gap-5 xl:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-white p-6"><h3 class="font-bold">Smart Reorder Recommendations</h3><p class="mt-1 text-xs text-slate-500">Prioritized by stock coverage and operational urgency.</p><div class="mt-4 space-y-3"><div v-for="item in lowStock" :key="item.id" class="rounded-xl bg-slate-50 p-4"><div class="flex justify-between gap-3"><div><p class="text-sm font-bold">{{ item.product }}</p><p class="mt-1 text-xs text-slate-500">Order {{ item.suggestedOrder }} {{ item.unit }} · {{ item.supplier }}</p></div><button @click="reorder(item)" class="text-xs font-bold text-[#1595B6]">Create order →</button></div></div></div></div>
      <div class="rounded-2xl border border-slate-200 bg-white p-6"><h3 class="font-bold">Expiry & Waste Risk</h3><p class="mt-1 text-xs text-slate-500">Perishable stock that should be used, transferred or reordered carefully.</p><div class="mt-4 space-y-3"><div v-for="item in expiryRisk" :key="item.id" class="rounded-xl bg-red-50/50 p-4"><div class="flex justify-between"><div><p class="text-sm font-bold">{{ item.product }}</p><p class="mt-1 text-xs text-slate-500">{{ item.stock }} {{ item.unit }} in stock</p></div><span class="text-xs font-black text-red-500">{{ item.expiryDays }} days</span></div><p class="mt-3 text-xs text-slate-500">Suggested action: prioritize menu usage or transfer excess stock to another location before placing a new order.</p></div></div></div>
    </section>

    <transition name="fade"><div v-if="toast" class="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-4 text-sm text-white">{{ toast }}</div></transition>
  </div>
</template>
