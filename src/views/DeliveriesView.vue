<script setup>
import { computed, ref } from 'vue'
import { state, advanceDelivery, cancelOrder } from '../data/store'

const selected = ref(null)
const toast = ref('')
const activeDeliveries = computed(() => state.orders.filter(o => !['Delivered','Cancelled'].includes(o.status)))
const delivered = computed(() => state.orders.filter(o => o.status === 'Delivered'))
const cancelled = computed(() => state.orders.filter(o => o.status === 'Cancelled'))
const stages = ['Processing','Confirmed','Preparing','In Transit','Out for Delivery','Delivered']
function update(order) { advanceDelivery(order); toast.value=`${order.id} updated to ${order.status}.`; setTimeout(()=>toast.value='',2500) }
function cancel(order) { cancelOrder(order,'Cancelled from delivery operations'); toast.value=`${order.id} cancelled.`; selected.value=null; setTimeout(()=>toast.value='',2500) }
</script>

<template>
  <div class="p-5 lg:p-8">
    <div><h2 class="text-2xl font-black">Delivery Command Center</h2><p class="mt-1 text-sm text-slate-500">Track supplier fulfilment from processing to final delivery and manage delays or cancellations.</p></div>

    <section class="mt-6 grid gap-4 md:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-xs text-slate-500">Active Deliveries</p><p class="mt-3 text-2xl font-black">{{ activeDeliveries.length }}</p></div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-xs text-slate-500">Delivered</p><p class="mt-3 text-2xl font-black text-emerald-600">{{ delivered.length }}</p></div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-xs text-slate-500">Avg Delivery Time</p><p class="mt-3 text-2xl font-black">2h 34m</p><p class="mt-2 text-xs font-bold text-emerald-600">↓ 14 min vs last month</p></div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-xs text-slate-500">Cancelled</p><p class="mt-3 text-2xl font-black text-red-500">{{ cancelled.length }}</p></div>
    </section>

    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div><h3 class="font-bold">Live Delivery Process</h3><p class="mt-1 text-xs text-slate-500">Use “Advance status” to simulate real-time supplier and driver updates.</p></div>
      <div class="mt-5 space-y-4">
        <article v-for="order in activeDeliveries" :key="order.id" class="rounded-2xl border border-slate-100 p-5">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div><div class="flex items-center gap-2"><p class="font-black text-[#117E9E]">{{ order.id }}</p><span class="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700">{{ order.status }}</span></div><p class="mt-1 text-sm font-semibold">{{ order.product }} · {{ order.supplier }}</p><p class="mt-1 text-xs text-slate-400">{{ order.location }} · ETA {{ order.eta }}</p></div>
            <div class="flex gap-2"><button @click="selected=order" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold">Details</button><button @click="update(order)" class="rounded-lg bg-[#1595B6] px-3 py-2 text-xs font-bold text-white">Advance status</button></div>
          </div>
          <div class="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-[#1595B6] transition-all" :style="{width:order.deliveryProgress+'%'}"></div></div>
          <div class="mt-3 grid grid-cols-6 text-center text-[9px] text-slate-400"><span v-for="stage in stages" :key="stage">{{ stage }}</span></div>
        </article>
      </div>
    </section>

    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6"><h3 class="font-bold">Cancelled Orders</h3><p class="mt-1 text-xs text-slate-500">Visible separately for operational review.</p><div class="mt-4 grid gap-3 md:grid-cols-2"><div v-for="o in cancelled" :key="o.id" class="rounded-xl border border-red-100 bg-red-50/40 p-4"><div class="flex justify-between"><p class="text-sm font-black">{{ o.id }} · {{ o.product }}</p><span class="text-[10px] font-bold text-red-500">CANCELLED</span></div><p class="mt-1 text-xs text-slate-500">{{ o.supplier }} · {{ o.location }}</p><p class="mt-3 text-xs text-red-600">Reason: {{ o.cancelReason || 'No reason recorded' }}</p></div></div></section>

    <div v-if="selected" @click.self="selected=null" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"><div class="w-full max-w-md rounded-3xl bg-white p-6"><div class="flex justify-between"><div><p class="text-xs text-slate-400">Delivery</p><h3 class="text-xl font-black">{{ selected.id }}</h3></div><button @click="selected=null">✕</button></div><div class="mt-5 rounded-xl bg-slate-50 p-4"><p class="font-bold">{{ selected.product }}</p><p class="mt-1 text-xs text-slate-500">{{ selected.supplier }}</p><p class="mt-1 text-xs text-slate-500">Deliver to {{ selected.location }}</p><p class="mt-3 text-sm font-black text-[#117E9E]">ETA {{ selected.eta }}</p></div><button @click="update(selected)" class="mt-5 w-full rounded-xl bg-[#1595B6] py-3 text-sm font-bold text-white">Advance delivery status</button><button @click="cancel(selected)" class="mt-2 w-full rounded-xl border border-red-200 py-3 text-sm font-bold text-red-500">Cancel delivery</button></div></div>
    <transition name="fade"><div v-if="toast" class="fixed bottom-6 right-6 z-[60] rounded-xl bg-slate-900 px-5 py-4 text-sm text-white">{{ toast }}</div></transition>
  </div>
</template>
