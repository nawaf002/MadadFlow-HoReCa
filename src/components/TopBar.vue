<script setup>
import { ref } from 'vue'
import { state, unreadNotifications, markNotificationsRead } from '../data/store'
const open = ref(false)
function toggle() {
  open.value = !open.value
  if (open.value) markNotificationsRead()
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur lg:px-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#1595B6]">Concept Prototype</p>
        <h1 class="mt-1 text-xl font-bold text-slate-900">{{ $route.meta.title || 'MADAD Flow' }}</h1>
      </div>
      <div class="relative">
        <button @click="toggle" class="relative rounded-xl border border-slate-200 bg-white px-4 py-2.5 hover:bg-slate-50">
          🔔
          <span v-if="unreadNotifications" class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{{ unreadNotifications }}</span>
        </button>
        <div v-if="open" class="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div class="flex items-center justify-between"><h3 class="font-bold">Notifications</h3><button @click="open=false" class="text-slate-400">✕</button></div>
          <div class="mt-3 max-h-96 space-y-2 overflow-y-auto">
            <div v-for="n in state.notifications" :key="n.id" class="rounded-xl bg-slate-50 p-3">
              <p class="text-sm font-semibold">{{ n.title }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ n.message }}</p>
              <p class="mt-2 text-[10px] text-slate-400">{{ n.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
