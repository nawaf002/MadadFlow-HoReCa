<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppSidebar from './components/AppSidebar.vue'
import TopBar from './components/TopBar.vue'

const route = useRoute()

const isStandalonePage = computed(() => {

  return [
    'login',
    'admin',
    'unauthorized'
  ].includes(route.name)

})
</script>


<template>

  <!-- LOGIN / ADMIN / UNAUTHORIZED -->

  <RouterView v-if="isStandalonePage" />


  <!-- NORMAL MADAD APPLICATION -->

  <div
    v-else
    class="min-h-screen bg-[#F6FAFC] text-slate-800"
  >

    <AppSidebar />

    <main class="lg:ml-64">

      <TopBar />

      <RouterView />

    </main>

  </div>

</template>