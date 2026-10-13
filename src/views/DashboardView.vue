<script setup>
import { computed, ref, onMounted } from 'vue'
import {
  state,
  monthlySpend,
  openOrders,
  cancelledOrders,
  procurementHealth,
  simulateAvailability
} from '../data/store'
import { getCategories } from '../services/categoryService'
import LiveProducts from '../components/LiveProducts.vue'
import {
  trackDashboardView,
  trackCategoryOpened
} from '../services/analyticsService'
// ======================================================
// GENERAL DASHBOARD STATE
// ======================================================
const toast = ref('')
const selected = ref(null)
// ======================================================
// FIREBASE / FIRESTORE STATE
// ======================================================
const firebaseCategories = ref([])
const selectedCategory = ref(null)
const firebaseLoading = ref(true)
const firebaseError = ref('')
// ======================================================
// DASHBOARD KPIs
// ======================================================
const kpis = computed(() => [
  {
    title: 'Monthly Spend',
    value: `OMR ${monthlySpend.value.toLocaleString()}`,
    change: '↑ 8.2%',
    help: 'Total procurement spend is 8.2% higher than the previous comparable month.'
  },
  {
    title: 'Active Suppliers',
    value: state.suppliers.length,
    change: '+3 this quarter',
    help: 'Three additional suppliers became active compared with the previous quarter.'
  },
  {
    title: 'Open Orders',
    value: openOrders.value,
    change: '5 urgent',
    help: 'Orders that are not delivered or cancelled. Five currently require attention.'
  },
  {
    title: 'On-time Delivery',
    value: '94.6%',
    change: '↑ 2.4 pts',
    help: 'On-time delivery improved by 2.4 percentage points versus the previous period.'
  },
  {
    title: 'Cancelled Orders',
    value: cancelledOrders.value,
    change: '↓ 25%',
    help: 'Cancellation count is 25% lower than the previous comparable period.'
  },
  {
    title: 'Operational Health',
    value: `${procurementHealth.value}%`,
    change: 'Healthy',
    help: 'Weighted score based on stock coverage, supplier delivery performance and unresolved exceptions.'
  }
])
// ======================================================
// FIRESTORE CATEGORY LOGIC
// ======================================================
// Main categories have no parent.
// Example:
// CAT001 = Beverages
// CAT002 = Meat
const mainCategories = computed(() =>
  firebaseCategories.value.filter(
    category => category.parentID === null
  )
)
// Child categories belong to whichever main category
// the user selects.
//
// Example:
// CAT004 Juices -> parentID CAT001
// CAT005 Water  -> parentID CAT001
const childCategories = computed(() => {
  if (!selectedCategory.value) {
    return []
  }
  return firebaseCategories.value.filter(
    category =>
      category.parentID === selectedCategory.value.id
  )
})
// ======================================================
// CATEGORY SELECTION + ANALYTICS
// ======================================================
function selectMainCategory(category) {
  selectedCategory.value = category
  trackCategoryOpened(category.id)
}

// ======================================================
// EXISTING AVAILABILITY SIMULATION
// ======================================================
function availability() {
  const item = simulateAvailability()
  toast.value = item
    ? `${item.product} is now available from ${item.supplier}.`
    : 'All watched products are already available.'
  setTimeout(() => {
    toast.value = ''
  }, 3000)
}
// ======================================================
// LOAD FIRESTORE DATA WHEN DASHBOARD OPENS
// ======================================================
onMounted(async () => {
  // Track a dashboard visit when Analytics collection is enabled.
  trackDashboardView()

  try {
    firebaseLoading.value = true
    firebaseError.value = ''
    firebaseCategories.value = await getCategories()
    console.log('Firestore categories loaded:')
    console.table(firebaseCategories.value)
  } catch (error) {
    console.error(
      'Firebase connection error:',
      error
    )
    firebaseError.value = error.message
  } finally {
    firebaseLoading.value = false
  }
})
</script>
<template>
  <div class="p-5 lg:p-8">
    <!-- ================================================= -->
    <!-- PAGE HEADER -->
    <!-- ================================================= -->
    <div
      class="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end"
    >
      <div>
        <h2
          class="text-2xl font-black tracking-tight text-slate-900"
        >
          HoReCa Operations Command Center
        </h2>
        <p class="mt-1 text-sm text-slate-500">
          Procurement, supply availability, locations, deliveries,
          finance and operational exceptions in one view.
        </p>
      </div>
      <div
        class="rounded-xl bg-[#E9F7FB] px-4 py-3 text-xs font-semibold text-[#117E9E]"
      >
        Live demo data · Firestore connected
      </div>
    </div>
    <!-- HELLO WORLD CARD -->
    <section
      class="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <p class="text-lg font-bold text-slate-900">
        hellow world
      </p>
    </section>
    <!-- ================================================= -->
    <!-- FIRESTORE CATEGORY TEST -->
    <!-- ================================================= -->
    <section
      class="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <!-- HEADER -->
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h3 class="font-bold text-slate-900">
            Firestore Categories
          </h3>
          <p class="mt-1 text-xs text-slate-500">
            Categories loaded directly from Cloud Firestore
          </p>
        </div>
        <span
          class="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600"
        >
          FIREBASE LIVE
        </span>
      </div>
      <!-- LOADING -->
      <div
        v-if="firebaseLoading"
        class="mt-5 rounded-xl bg-slate-50 p-4"
      >
        <p class="text-sm text-slate-500">
          Loading categories from Firebase...
        </p>
      </div>
      <!-- ERROR -->
      <div
        v-else-if="firebaseError"
        class="mt-5 rounded-xl bg-red-50 p-4"
      >
        <p class="text-sm font-bold text-red-600">
          Firestore Error
        </p>
        <p class="mt-1 text-xs text-red-500">
          {{ firebaseError }}
        </p>
      </div>
      <!-- FIRESTORE DATA -->
      <div v-else class="mt-5">
        <!-- MAIN CATEGORIES -->
        <p
          class="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500"
        >
          Main Categories
        </p>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="category in mainCategories"
            :key="category.id"
            @click="selectMainCategory(category)"
            class="rounded-xl border px-5 py-3 text-left transition"
            :class="
              selectedCategory?.id === category.id
                ? 'border-[#1595B6] bg-[#E9F7FB] text-[#117E9E]'
                : 'border-slate-200 bg-white text-slate-700 hover:border-[#1595B6] hover:text-[#1595B6]'
            "
          >
            <p class="text-sm font-bold">
              {{ category.name }}
            </p>
            <p class="mt-1 text-[10px] opacity-60">
              {{ category.id }}
            </p>
          </button>
        </div>
        <!-- CHILD CATEGORIES -->
        <div
          v-if="selectedCategory"
          class="mt-6 border-t border-slate-100 pt-5"
        >
          <p
            class="text-xs font-bold uppercase tracking-wide text-slate-500"
          >
            {{ selectedCategory.name }} Subcategories
          </p>
          <div
            v-if="childCategories.length"
            class="mt-3 flex flex-wrap gap-3"
          >
            <div
              v-for="child in childCategories"
              :key="child.id"
              class="rounded-xl bg-[#E9F7FB] px-5 py-3"
            >
              <p
                class="text-sm font-bold text-[#117E9E]"
              >
                {{ child.name }}
              </p>
              <p
                class="mt-1 text-[10px] text-slate-400"
              >
                {{ child.id }}
              </p>
            </div>
          </div>
          <p
            v-else
            class="mt-3 text-sm text-slate-400"
          >
            No subcategories found.
          </p>
        </div>
      </div>
    </section>
    <!-- ================================================= -->
    <!-- LIVE FIRESTORE PRODUCTS -->
    <!-- ================================================= -->
    <section class="mb-6">
      <LiveProducts />
    </section>
    <!-- ================================================= -->
    <!-- KPI CARDS -->
    <!-- ================================================= -->
    <section
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <button
        v-for="kpi in kpis"
        :key="kpi.title"
        @click="
          selected =
            selected?.title === kpi.title
              ? null
              : kpi
        "
        class="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex justify-between">
          <p class="text-sm font-medium text-slate-500">
            {{ kpi.title }}
          </p>
          <span class="text-slate-300">
            ⓘ
          </span>
        </div>
        <p
          class="mt-4 text-2xl font-black text-slate-900"
        >
          {{ kpi.value }}
        </p>
        <p
          class="mt-2 text-xs font-bold text-[#1595B6]"
        >
          {{ kpi.change }}
        </p>
      </button>
    </section>
    <!-- KPI INFORMATION -->
    <div
      v-if="selected"
      class="mt-3 rounded-xl border border-[#BCE8F2] bg-[#EFFBFE] px-4 py-3 text-sm text-slate-600"
    >
      <strong class="text-[#117E9E]">
        {{ selected.title }}:
      </strong>
      {{ selected.help }}
    </div>
    <!-- ================================================= -->
    <!-- SMART INSIGHTS + AVAILABILITY -->
    <!-- ================================================= -->
    <section
      class="mt-6 grid gap-5 xl:grid-cols-[1.15fr_.85fr]"
    >
      <!-- SMART INSIGHTS -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div
          class="flex items-center justify-between"
        >
          <div>
            <h3 class="font-bold text-slate-900">
              Smart Insights
            </h3>
            <p class="mt-1 text-xs text-slate-500">
              Recommended actions from operational signals
            </p>
          </div>
          <RouterLink
            to="/analytics"
            class="text-xs font-bold text-[#1595B6]"
          >
            Open analytics →
          </RouterLink>
        </div>
        <div
          class="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3"
        >
          <div
            v-for="insight in state.insights"
            :key="insight.id"
            class="rounded-xl bg-slate-50 p-4"
          >
            <p class="text-sm font-bold">
              {{ insight.title }}
            </p>
            <p
              class="mt-2 text-xs leading-5 text-slate-500"
            >
              {{ insight.description }}
            </p>
            <div
              class="mt-3 flex items-center justify-between gap-2"
            >
              <span
                class="text-[11px] font-bold text-emerald-600"
              >
                {{ insight.impact }}
              </span>
              <span
                class="rounded-full bg-white px-2 py-1 text-[10px] text-slate-400"
              >
                {{ insight.confidence }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- AVAILABILITY WATCH -->
      <div
        class="rounded-2xl bg-gradient-to-br from-[#1595B6] to-[#087391] p-6 text-white"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-bold">
              Availability Watch
            </h3>
            <p class="mt-1 text-xs text-white/70">
              Monitor requested products across suppliers.
            </p>
          </div>
          <span
            class="h-2 w-2 animate-pulse rounded-full bg-emerald-300"
          ></span>
        </div>
        <div class="mt-5 space-y-3">
          <div
            v-for="item in state.watchlist.slice(0, 3)"
            :key="item.id"
            class="rounded-xl bg-white/10 p-3"
          >
            <div
              class="flex justify-between gap-3"
            >
              <p class="text-sm font-semibold">
                {{ item.product }}
              </p>
              <span
                class="text-[10px] font-bold"
                :class="
                  item.available
                    ? 'text-emerald-200'
                    : 'text-amber-200'
                "
              >
                {{
                  item.available
                    ? 'AVAILABLE'
                    : 'WATCHING'
                }}
              </span>
            </div>
            <p class="mt-1 text-xs text-white/65">
              {{
                item.available
                  ? `${item.supplier} · ${item.stock}`
                  : `Watching ${item.suppliersWatching} suppliers`
              }}
            </p>
          </div>
        </div>
        <button
          @click="availability"
          class="mt-4 w-full rounded-xl bg-white py-2.5 text-xs font-bold text-[#117E9E]"
        >
          Simulate supplier availability
        </button>
      </div>
    </section>
    <!-- ================================================= -->
    <!-- LOCATIONS + EXCEPTIONS -->
    <!-- ================================================= -->
    <section
      class="mt-6 grid gap-5 xl:grid-cols-2"
    >
      <!-- LOCATIONS -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div class="flex justify-between">
          <div>
            <h3 class="font-bold">
              Multi-location Demand
            </h3>
            <p class="mt-1 text-xs text-slate-500">
              Demand and stock health across your outlets
            </p>
          </div>
          <RouterLink
            to="/locations"
            class="text-xs font-bold text-[#1595B6]"
          >
            View all →
          </RouterLink>
        </div>
        <div class="mt-4 space-y-3">
          <div
            v-for="location in state.locations.slice(0, 4)"
            :key="location.id"
            class="flex items-center gap-4 rounded-xl border border-slate-100 p-3"
          >
            <div
              class="grid h-10 w-10 place-items-center rounded-xl bg-[#E9F7FB] text-sm font-black text-[#117E9E]"
            >
              {{ location.type[0] }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold">
                {{ location.name }}
              </p>
              <p class="text-xs text-slate-400">
                {{ location.openOrders }}
                open orders · OMR
                {{ location.spend.toLocaleString() }}
                spend
              </p>
            </div>
            <span
              class="text-xs font-black"
              :class="
                location.stockHealth < 80
                  ? 'text-orange-500'
                  : 'text-emerald-600'
              "
            >
              {{ location.stockHealth }}%
            </span>
          </div>
        </div>
      </div>
      <!-- EXCEPTION CENTER -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div class="flex justify-between">
          <div>
            <h3 class="font-bold">
              Exception Center
            </h3>
            <p class="mt-1 text-xs text-slate-500">
              Problems requiring operations attention
            </p>
          </div>
          <RouterLink
            to="/exceptions"
            class="text-xs font-bold text-[#1595B6]"
          >
            Manage →
          </RouterLink>
        </div>
        <div class="mt-4 space-y-3">
          <div
            v-for="issue in state.exceptions.slice(0, 4)"
            :key="issue.id"
            class="rounded-xl border border-slate-100 p-3"
          >
            <div
              class="flex justify-between gap-3"
            >
              <p class="text-sm font-bold">
                {{ issue.type }} · {{ issue.order }}
              </p>
              <span
                class="rounded-full px-2 py-1 text-[10px] font-bold"
                :class="
                  issue.status === 'Resolved'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-orange-50 text-orange-600'
                "
              >
                {{ issue.status }}
              </span>
            </div>
            <p
              class="mt-1 text-xs text-slate-500"
            >
              {{ issue.detail }}
            </p>
          </div>
        </div>
      </div>
    </section>
    <!-- ================================================= -->
    <!-- TOAST -->
    <!-- ================================================= -->
    <transition name="fade">
      <div
        v-if="toast"
        class="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-4 text-sm text-white shadow-xl"
      >
        {{ toast }}
      </div>
    </transition>
  </div>
</template>