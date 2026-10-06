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

    // Sign out from Firebase Authentication
    await logoutUser()

    // Redirect to the login page
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
  ['Overview', '/'],
  ['Procurement', '/procurement'],
  ['Suppliers', '/suppliers'],
  ['Inventory', '/inventory'],
  ['Deliveries', '/deliveries'],
  ['Finance', '/finance'],
  ['Locations', '/locations'],
  ['Exceptions', '/exceptions'],
  ['Analytics', '/analytics'],
]
</script>


<template>

  <aside
    class="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block"
  >

    <div class="flex h-full flex-col p-5">

      <!-- ===================================== -->
      <!-- MADAD LOGO -->
      <!-- ===================================== -->

      <div class="mb-8 flex items-center gap-3">

        <div
          class="grid h-11 w-11 place-items-center rounded-xl bg-[#1595B6] text-xl font-black text-white"
        >
          M
        </div>

        <div>

          <h2
            class="text-xl font-black tracking-tight text-[#117E9E]"
          >
            MADAD
            <span class="font-medium text-slate-400">
              Flow
            </span>
          </h2>

          <p class="text-xs text-slate-400">
            HoReCa Command Center
          </p>

        </div>

      </div>


      <!-- ===================================== -->
      <!-- NAVIGATION MENU -->
      <!-- ===================================== -->

      <nav class="min-h-0 flex-1 space-y-1 overflow-y-auto">

        <RouterLink
          v-for="item in items"
          :key="item[1]"
          :to="item[1]"
          class="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          active-class="!bg-[#E9F7FB] !text-[#117E9E]"
        >
          {{ item[0] }}
        </RouterLink>

      </nav>


      <!-- ===================================== -->
      <!-- PROCUREMENT HEALTH -->
      <!-- ===================================== -->

      <div
        class="mt-4 rounded-2xl bg-gradient-to-br from-[#1595B6] to-[#087391] p-4 text-white"
      >

        <p class="font-semibold">
          Procurement Health
        </p>

        <p class="mt-1 text-xs text-white/75">
          Stock, supplier reliability and exceptions.
        </p>

        <div
          class="mt-4 h-2 overflow-hidden rounded-full bg-white/20"
        >

          <div
            class="h-full rounded-full bg-white"
            :style="{ width: procurementHealth + '%' }"
          ></div>

        </div>

        <p class="mt-2 text-xs">
          {{ procurementHealth }}% operational health
        </p>

      </div>


      <!-- ===================================== -->
      <!-- LOGOUT SECTION -->
      <!-- ===================================== -->

      <div class="mt-4 border-t border-slate-200 pt-4">

        <button
          type="button"
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >

          <!-- Logout Icon -->

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
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
            />

            <polyline
              points="16 17 21 12 16 7"
            />

            <line
              x1="21"
              y1="12"
              x2="9"
              y2="12"
            />
          </svg>


          <!-- Logout Text -->

          <span>
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </span>

        </button>

      </div>

    </div>

  </aside>

</template>