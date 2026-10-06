<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function returnToDashboard() {
  router.push({ name: 'dashboard' })
}
</script>

<template>

  <div
    class="flex min-h-screen items-center justify-center bg-slate-50 px-4"
  >

    <div
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
    >

      <div
        class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50"
      >
        <span class="text-2xl">
          
        </span>
      </div>

      <h1 class="mt-5 text-2xl font-black text-slate-900">
        Access Restricted
      </h1>

      <p class="mt-3 text-sm leading-6 text-slate-500">
        Your account does not have permission to access this page.
        Administrator privileges are required.
      </p>

      <button
        @click="returnToDashboard"
        class="mt-6 rounded-xl bg-[#1595B6] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#117E9E]"
      >
        Return to Dashboard
      </button>

    </div>

  </div>

</template>