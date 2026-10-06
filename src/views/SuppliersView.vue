<script setup>
import { computed, ref } from 'vue'
import { state } from '../data/store'

const selectedProduct = ref('Arabica Coffee Beans')
const quantity = ref(25)
const sortBy = ref('recommended')

const catalog = {
  'Arabica Coffee Beans': [
    { supplier: 'Prime Coffee Oman', price: 4.8, stock: 120, etaHours: 2, moq: 10, fee: 6.5 },
    { supplier: 'Muscat Hospitality Supply', price: 4.55, stock: 80, etaHours: 5, moq: 20, fee: 9 },
    { supplier: 'Gulf Beverage Solutions', price: 4.95, stock: 50, etaHours: 3, moq: 10, fee: 5 },
    { supplier: 'Desert Spice Trading', price: 4.6, stock: 35, etaHours: 6, moq: 25, fee: 7.5 },
  ],
  'Premium Basmati Rice': [
    { supplier: 'Muscat Hospitality Supply', price: 1.35, stock: 420, etaHours: 3, moq: 25, fee: 5 },
    { supplier: 'Al Noor Food Trading', price: 1.28, stock: 220, etaHours: 5, moq: 50, fee: 8 },
    { supplier: 'Desert Spice Trading', price: 1.42, stock: 310, etaHours: 4, moq: 25, fee: 6 },
  ],
  'Fresh Salmon': [
    { supplier: 'Ocean Catch Foods', price: 5.8, stock: 90, etaHours: 2.5, moq: 10, fee: 8 },
    { supplier: 'Muscat Hospitality Supply', price: 6.15, stock: 40, etaHours: 4, moq: 10, fee: 6 },
    { supplier: 'Oman Harvest Produce', price: 6.05, stock: 25, etaHours: 3.5, moq: 5, fee: 7 },
    
  ],
}

const rows = computed(() => {
  const q = Math.max(1, Number(quantity.value || 1))
  return (catalog[selectedProduct.value] || []).map(row => {
    const supplier = state.suppliers.find(s => s.name === row.supplier) || { score: 80, delivery: 80, quality: 4 }
    const total = (row.price * q) + row.fee
    const valueScore = Math.round((supplier.score * .45) + (supplier.delivery * .25) + ((5 - Math.min(5, total / 50)) * 10) - (row.etaHours * 1.5))
    return { ...row, total, supplierScore: supplier.score, delivery: supplier.delivery, quality: supplier.quality, valueScore }
  }).sort((a,b) => {
    if (sortBy.value === 'price') return a.total - b.total
    if (sortBy.value === 'speed') return a.etaHours - b.etaHours
    if (sortBy.value === 'rating') return b.supplierScore - a.supplierScore
    return b.valueScore - a.valueScore
  })
})
const recommendation = computed(() => rows.value[0])
</script>

<template>
  <div class="p-5 lg:p-8">
    <div><h2 class="text-2xl font-black text-slate-900">Supplier Network & Comparison</h2><p class="mt-1 text-sm text-slate-500">Compare price, stock, ETA, MOQ, delivery fees and reliability before purchasing.</p></div>

    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div><h3 class="font-bold">Supplier Product Comparison</h3><p class="mt-1 text-xs text-slate-500">A buyer can compare the total landed cost instead of unit price alone.</p></div>
        <div class="grid gap-3 sm:grid-cols-3">
          <label><span class="text-[10px] font-bold uppercase text-slate-400">Product</span><select v-model="selectedProduct" class="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"><option v-for="(_, product) in catalog" :key="product">{{ product }}</option></select></label>
          <label><span class="text-[10px] font-bold uppercase text-slate-400">Quantity</span><input v-model="quantity" type="number" min="1" class="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"/></label>
          <label><span class="text-[10px] font-bold uppercase text-slate-400">Sort by</span><select v-model="sortBy" class="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"><option value="recommended">Recommended</option><option value="price">Lowest total</option><option value="speed">Fastest ETA</option><option value="rating">Highest score</option></select></label>
        </div>
      </div>

      <div v-if="recommendation" class="mt-5 rounded-2xl bg-[#E9F7FB] p-4"><p class="text-[10px] font-black uppercase tracking-wider text-[#117E9E]">Recommended supplier</p><div class="mt-2 flex flex-wrap items-center justify-between gap-3"><div><p class="font-black text-slate-900">{{ recommendation.supplier }}</p><p class="mt-1 text-xs text-slate-500">Best balance of landed cost, delivery speed and supplier reliability.</p></div><p class="text-xl font-black text-[#117E9E]">OMR {{ recommendation.total.toFixed(2) }}</p></div></div>

      <div class="mt-5 overflow-x-auto"><table class="w-full min-w-[900px]"><thead class="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th class="px-4 py-3 text-left">Supplier</th><th class="px-4 py-3 text-left">Price/unit</th><th class="px-4 py-3 text-left">Stock</th><th class="px-4 py-3 text-left">ETA</th><th class="px-4 py-3 text-left">MOQ</th><th class="px-4 py-3 text-left">Delivery fee</th><th class="px-4 py-3 text-left">Supplier score</th><th class="px-4 py-3 text-left">Total cost</th></tr></thead><tbody><tr v-for="row in rows" :key="row.supplier" class="border-t border-slate-100" :class="row.supplier===recommendation?.supplier ? 'bg-cyan-50/40' : ''"><td class="px-4 py-4 text-xs font-bold">{{ row.supplier }}</td><td class="px-4 py-4 text-xs">OMR {{ row.price.toFixed(2) }}</td><td class="px-4 py-4 text-xs">{{ row.stock }}</td><td class="px-4 py-4 text-xs">{{ row.etaHours }}h</td><td class="px-4 py-4 text-xs">{{ row.moq }}</td><td class="px-4 py-4 text-xs">OMR {{ row.fee.toFixed(2) }}</td><td class="px-4 py-4 text-xs font-bold text-[#117E9E]">{{ row.supplierScore }}/100</td><td class="px-4 py-4 text-xs font-black">OMR {{ row.total.toFixed(2) }}</td></tr></tbody></table></div>
    </section>

    <section class="mt-6">
      <div class="flex items-end justify-between"><div><h3 class="font-bold">Supplier Scorecards</h3><p class="mt-1 text-xs text-slate-500">Reliability, fulfilment, quality and average delivery time.</p></div><span class="text-xs text-slate-400">{{ state.suppliers.length }} active suppliers</span></div>
      <div class="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <article v-for="s in state.suppliers" :key="s.id" class="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex justify-between gap-3"><div><p class="font-black">{{ s.name }}</p><p class="mt-1 text-xs text-slate-400">{{ s.category }}</p></div><div class="grid h-12 w-12 place-items-center rounded-xl bg-[#E9F7FB] text-sm font-black text-[#117E9E]">{{ s.score }}</div></div>
          <div class="mt-5 grid grid-cols-3 gap-3"><div><p class="text-[9px] font-bold uppercase text-slate-400">On-time</p><p class="mt-1 text-sm font-black">{{ s.delivery }}%</p></div><div><p class="text-[9px] font-bold uppercase text-slate-400">Fulfilment</p><p class="mt-1 text-sm font-black">{{ s.fulfilment }}%</p></div><div><p class="text-[9px] font-bold uppercase text-slate-400">Quality</p><p class="mt-1 text-sm font-black">{{ s.quality }}/5</p></div></div>
          <div class="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">Average delivery: <strong class="text-slate-800">{{ s.avgDelivery }}</strong></div>
        </article>
      </div>
    </section>
  </div>
</template>
