<script setup>
import { useRouter } from 'vue-router'
import { logoutUser } from '../services/authService'

const router = useRouter()

async function handleLogout() {
  await logoutUser()
  router.push('/login')
}
</script>


<template>
 <div class="min-h-screen bg-slate-50">

<!-- HEADER -->

<header
  class="border-b border-slate-200 bg-white"
>

  <div
    class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
  >

    <div>

      <h1
        class="text-xl font-black text-slate-900"
      >
        Madad Admin
      </h1>

      <p
        class="text-xs text-slate-500"
      >
        Administration & System Management
      </p>

    </div>


    <button
      @click="handleLogout"
      class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
    >
      Logout
    </button>

  </div>

</header>


<!-- CONTENT -->

<main
  class="mx-auto max-w-7xl p-6"
>

  <div class="mb-8">

    <p
      class="text-xs font-bold uppercase tracking-wider text-[#1595B6]"
    >
      Administrator
    </p>

    <h2
      class="mt-1 text-3xl font-black text-slate-900"
    >
      Admin Dashboard
    </h2>

    <p
      class="mt-2 text-sm text-slate-500"
    >
      Manage Madad platform data and users.
    </p>

  </div>


  <!-- ADMIN FEATURES -->

  <div
    class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
  >

    <div
      class="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h3 class="font-bold text-slate-900">
        Categories
      </h3>

      <p class="mt-2 text-sm text-slate-500">
        Manage HoReCa product categories and subcategories.
      </p>
    </div>


    <div
      class="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h3 class="font-bold text-slate-900">
        Products
      </h3>

      <p class="mt-2 text-sm text-slate-500">
        Add, edit and manage products.
      </p>
    </div>


    <div
      class="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h3 class="font-bold text-slate-900">
        Users
      </h3>

      <p class="mt-2 text-sm text-slate-500">
        View platform users and their roles.
      </p>
    </div>


    <div
      class="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h3 class="font-bold text-slate-900">
        Suppliers
      </h3>

      <p class="mt-2 text-sm text-slate-500">
        Manage registered suppliers.
      </p>
    </div>


    <div
      class="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h3 class="font-bold text-slate-900">
        Purchase Orders
      </h3>

      <p class="mt-2 text-sm text-slate-500">
        Monitor purchase orders and procurement activity.
      </p>
    </div>


    <div
      class="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h3 class="font-bold text-slate-900">
        System
      </h3>

      <p class="mt-2 text-sm text-slate-500">
        Platform configuration and administration.
      </p>
    </div>

  </div>

</main>

</div>
  <div class="min-h-screen bg-slate-50">

    <!-- HEADER -->

    <header
      class="border-b border-slate-200 bg-white"
    >

      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
      >

        <div>

          <h1
            class="text-xl font-black text-slate-900"
          >
            Madad Admin
          </h1>

          <p
            class="text-xs text-slate-500"
          >
            Administration & System Management
          </p>

        </div>


        <button
          @click="handleLogout"
          class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          Logout
        </button>

      </div>

    </header>


    <!-- CONTENT -->

    <main
      class="mx-auto max-w-7xl p-6"
    >

      <div class="mb-8">

        <p
          class="text-xs font-bold uppercase tracking-wider text-[#1595B6]"
        >
          Administrator
        </p>

        <h2
          class="mt-1 text-3xl font-black text-slate-900"
        >
          Admin Dashboard
        </h2>

        <p
          class="mt-2 text-sm text-slate-500"
        >
          Manage Madad platform data and users.
        </p>

      </div>


      <!-- ADMIN FEATURES -->

      <div
        class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
      >

        <div
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h3 class="font-bold text-slate-900">
            Categories
          </h3>

          <p class="mt-2 text-sm text-slate-500">
            Manage HoReCa product categories and subcategories.
          </p>
        </div>


        <div
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h3 class="font-bold text-slate-900">
            Products
          </h3>

          <p class="mt-2 text-sm text-slate-500">
            Add, edit and manage products.
          </p>
        </div>


        <div
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h3 class="font-bold text-slate-900">
            Users
          </h3>

          <p class="mt-2 text-sm text-slate-500">
            View platform users and their roles.
          </p>
        </div>


        <div
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h3 class="font-bold text-slate-900">
            Suppliers
          </h3>

          <p class="mt-2 text-sm text-slate-500">
            Manage registered suppliers.
          </p>
        </div>


        <div
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h3 class="font-bold text-slate-900">
            Purchase Orders
          </h3>

          <p class="mt-2 text-sm text-slate-500">
            Monitor purchase orders and procurement activity.
          </p>
        </div>


        <div
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h3 class="font-bold text-slate-900">
            System
          </h3>

          <p class="mt-2 text-sm text-slate-500">
            Platform configuration and administration.
          </p>
        </div>

      </div>

    </main>

  </div>

</template>