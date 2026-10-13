
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { logoutUser } from '../services/authService'
import { procurementHealth } from '../data/store'

const router = useRouter()

// ========================================
// LOGOUT FUNCTIONALITY
// ========================================

const isLoggingOut = ref(false)

async function handleLogout() {
  if (isLoggingOut.value) return

  try {
    isLoggingOut.value = true

    await logoutUser()
    await router.replace('/login')

  } catch (error) {
    console.error('Logout failed:', error)
    alert('Unable to log out. Please try again.')

  } finally {
    isLoggingOut.value = false
  }
}

// ========================================
// SIDEBAR NAVIGATION
// ========================================

const items = [
  { name: 'Overview', path: '/', icon: 'overview' },
  { name: 'Smart Procurement', path: '/procurement', icon: 'smart' },
  { name: 'Suppliers', path: '/suppliers', icon: 'suppliers' },
  { name: 'Inventory', path: '/inventory', icon: 'inventory' },
  { name: 'Deliveries', path: '/deliveries', icon: 'deliveries' },
  { name: 'Finance', path: '/finance', icon: 'finance' },
  { name: 'Locations', path: '/locations', icon: 'locations' },
  { name: 'Exceptions', path: '/exceptions', icon: 'exceptions' },
  { name: 'Analytics', path: '/analytics', icon: 'analytics' }
]

const iconPaths = {
  overview: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h7v7h-7z'],
  smart: ['M12 3v3', 'M12 18v3', 'M3 12h3', 'M18 12h3', 'M5.6 5.6l2.1 2.1', 'M16.3 16.3l2.1 2.1', 'M18.4 5.6l-2.1 2.1', 'M7.7 16.3l-2.1 2.1', 'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8'],
  suppliers: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  inventory: ['M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z', 'M3.3 7 12 12l8.7-5', 'M12 22V12'],
  deliveries: ['M10 17h4V5H2v12h3', 'M14 9h4l4 4v4h-3', 'M14 17h1', 'M5 17a2 2 0 1 0 4 0a2 2 0 0 0-4 0', 'M15 17a2 2 0 1 0 4 0a2 2 0 0 0-4 0'],
  finance: ['M3 3v18h18', 'M7 16l4-5 4 3 5-7'],
  locations: ['M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0', 'M12 10a2 2 0 1 0 0 4a2 2 0 0 0 0-4'],
  exceptions: ['M12 9v4', 'M12 17h.01', 'M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0'],
  analytics: ['M3 3v18h18', 'M7 17v-4', 'M12 17V8', 'M17 17v-7']
}
</script>

<template>
  <aside
    class="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block"
  >
    <div class="flex h-full flex-col p-5">

      <!-- MADAD FLOW BRANDING -->
      <div class="mb-8 flex items-center gap-3">
        <div
          class="grid h-11 w-11 place-items-center rounded-xl bg-[#1595B6] text-xl font-black text-white"
        >
          M
        </div>

        <div>
          <h2 class="text-xl font-black tracking-tight text-[#117E9E]">
            MADAD
            <span class="font-medium text-slate-400">Flow</span>
          </h2>
          <p class="text-xs text-slate-400">HoReCa Command Center</p>
        </div>
      </div>

      <!-- NAVIGATION -->
      <nav
        aria-label="Main navigation"
        class="min-h-0 flex-1 space-y-1 overflow-y-auto"
      >
        <RouterLink
          v-for="item in items"
          :key="item.path"
          :to="item.path"
          class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          active-class="!bg-[#E9F7FB] !text-[#117E9E]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="shrink-0"
            aria-hidden="true"
          >
            <path
              v-for="(path, index) in iconPaths[item.icon]"
              :key="index"
              :d="path"
            />
          </svg>

          <span class="flex-1">{{ item.name }}</span>

          <span
            v-if="item.icon === 'smart'"
            class="rounded-md bg-[#E9F7FB] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#117E9E]"
          >
            Smart
          </span>
        </RouterLink>
      </nav>

      <!-- PROCUREMENT HEALTH -->
      <div
        class="mt-4 rounded-2xl bg-gradient-to-br from-[#1595B6] to-[#087391] p-4 text-white"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="font-semibold">Procurement Health</p>
          <span class="text-xs font-bold">
            {{ procurementHealth }}%
          </span>
        </div>

        <p class="mt-1 text-xs text-white/75">
          Stock, supplier reliability and exceptions.
        </p>

        <div
          class="mt-4 h-2 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-label="Procurement health"
          :aria-valuenow="procurementHealth"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="h-full rounded-full bg-white transition-all duration-500"
            :style="{ width: procurementHealth + '%' }"
          ></div>
        </div>

        <p class="mt-2 text-xs text-white/80">
          Operational health score
        </p>
      </div>

      <!-- LOGOUT -->
      <div class="mt-4 border-t border-slate-200 pt-4">
        <button
          type="button"
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>

          <span>
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </span>
        </button>
      </div>

    </div>
  </aside>
</template>
