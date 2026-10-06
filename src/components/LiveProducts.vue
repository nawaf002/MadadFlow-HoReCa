<script setup>
import {
  ref,
  onMounted,
  onUnmounted
} from 'vue'

import {
  subscribeToProducts
} from '../services/productService'

const products = ref([])

const loading = ref(true)

const errorMessage = ref('')

const connectionStatus = ref('Connecting...')

let unsubscribe = null


onMounted(() => {

  unsubscribe = subscribeToProducts(

    (updatedProducts) => {

      products.value = updatedProducts

      loading.value = false

      errorMessage.value = ''

      connectionStatus.value = 'Live'

    },

    (error) => {

      loading.value = false

      connectionStatus.value = 'Error'

      errorMessage.value = error.message

    }

  )

})


onUnmounted(() => {

  if (unsubscribe) {
    unsubscribe()
  }

})
</script>


<template>

  <div
    class="rounded-2xl border border-slate-200 bg-white p-6"
  >

    <!-- ========================================
         HEADER
    ========================================= -->

    <div
      class="mb-6 flex flex-wrap items-center justify-between gap-4"
    >

      <div>

        <h2
          class="text-xl font-black text-slate-900"
        >
          Live Firestore Products
        </h2>

        <p
          class="mt-1 text-sm text-slate-500"
        >
          Products synchronized with Firebase Cloud Firestore.
        </p>

      </div>


      <!-- CONNECTION INDICATOR -->

      <div
        class="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2"
      >

        <span
          class="h-2 w-2 rounded-full"
          :class="
            connectionStatus === 'Live'
              ? 'bg-green-500'
              : connectionStatus === 'Error'
                ? 'bg-red-500'
                : 'bg-yellow-500'
          "
        ></span>

        <span
          class="text-xs font-bold"
          :class="
            connectionStatus === 'Live'
              ? 'text-green-700'
              : connectionStatus === 'Error'
                ? 'text-red-700'
                : 'text-yellow-700'
          "
        >
          {{ connectionStatus }}
        </span>

      </div>

    </div>


    <!-- ========================================
         LOADING
    ========================================= -->

    <p
      v-if="loading"
      class="py-8 text-center text-sm text-slate-500"
    >
      Loading products from Firestore...
    </p>


    <!-- ========================================
         ERROR
    ========================================= -->

    <p
      v-else-if="errorMessage"
      class="rounded-xl bg-red-50 p-4 text-sm text-red-600"
    >
      {{ errorMessage }}
    </p>


    <!-- ========================================
         PRODUCTS TABLE
    ========================================= -->

    <div
      v-else
      class="overflow-x-auto"
    >

      <table class="w-full text-left">

        <thead>

          <tr
            class="border-b border-slate-200 text-xs uppercase text-slate-400"
          >

           
            <th class="px-4 py-3">
              Product Code
            </th>

            <th class="px-4 py-3">
              Product Name
            </th>

            <th class="px-4 py-3">
              Category ID
            </th>

          </tr>

        </thead>


        <tbody>

          <tr
            v-for="product in products"
            :key="product.id"
            class="border-b border-slate-100 transition hover:bg-slate-50"
          >

            <!-- ========================================
                 PRODUCT CODE
            ========================================= -->

            <td
              class="px-4 py-4 text-sm font-bold text-sky-700"
            >
              {{ product.productCode || product.id }}
            </td>


            <!-- PRODUCT NAME -->

            <td
              class="px-4 py-4 text-sm font-semibold text-slate-900"
            >
              {{ product.name }}
            </td>


            <!-- CATEGORY -->

            <td
              class="px-4 py-4 text-sm font-medium text-slate-500"
            >
              {{ product.categoryID }}
            </td>

          </tr>

        </tbody>

      </table>


      <!-- ========================================
           EMPTY STATE
      ========================================= -->

      <p
        v-if="products.length === 0"
        class="py-8 text-center text-sm text-slate-500"
      >
        No products found in Firestore.
      </p>


      <!-- ========================================
           PRODUCT COUNT
      ========================================= -->

      <div
        v-if="products.length > 0"
        class="mt-4 flex items-center justify-between"
      >

        <p
          class="text-xs font-medium text-slate-400"
        >
          Total Products: {{ products.length }}
        </p>

        <p
          class="text-xs font-medium text-green-600"
        >
          Live from Firestore
        </p>

      </div>

    </div>

  </div>

</template>