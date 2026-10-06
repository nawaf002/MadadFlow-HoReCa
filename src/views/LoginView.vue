```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  loginUser,
  getUserProfile
} from '../services/authService'

const router = useRouter()

const email = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref('')


// ========================================
// LOGIN
// ========================================

async function handleLogin() {

  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value =
      'Please enter your email and password.'

    return
  }

  try {

    loading.value = true

    const firebaseUser = await loginUser(
      email.value,
      password.value
    )

    const profile = await getUserProfile(
      firebaseUser.uid
    )

    if (!profile) {

      errorMessage.value =
        'Your account does not have a Madad user profile.'

      return
    }


    // ========================================
    // ADMIN
    // ========================================

    if (profile.role === 'admin') {

      router.push('/admin')

    }

    // ========================================
    // NORMAL USER
    // ========================================

    else {

      router.push('/dashboard')

    }

  } catch (error) {

    console.error(
      'Login error:',
      error
    )

    errorMessage.value =
      'Invalid email or password.'

  } finally {

    loading.value = false

  }

}


// ========================================
// GO TO REGISTRATION PAGE
// ========================================

function goToRegister() {

  router.push('/register')

}
</script>


<template>

  <div
    class="flex min-h-screen items-center justify-center bg-slate-50 px-4"
  >

    <div
      class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >

      <!-- ========================================
           BRAND
      ========================================= -->

      <div class="mb-8 text-center">

        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1595B6] text-xl font-black text-white"
        >
          M
        </div>

        <h1
          class="mt-4 text-2xl font-black text-slate-900"
        >
          Welcome to Madad
        </h1>

        <p
          class="mt-2 text-sm text-slate-500"
        >
          Sign in to access the HoReCa operations platform
        </p>

      </div>


      <!-- ========================================
           ERROR MESSAGE
      ========================================= -->

      <div
        v-if="errorMessage"
        class="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-600"
      >
        {{ errorMessage }}
      </div>


      <!-- ========================================
           LOGIN FORM
      ========================================= -->

      <form
        class="space-y-5"
        @submit.prevent="handleLogin"
      >

        <!-- EMAIL -->

        <div>

          <label
            class="mb-2 block text-sm font-bold text-slate-700"
          >
            Email Address
          </label>

          <input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="name@company.com"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#1595B6]"
          />

        </div>


        <!-- PASSWORD -->

        <div>

          <label
            class="mb-2 block text-sm font-bold text-slate-700"
          >
            Password
          </label>

          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter your password"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#1595B6]"
          />

        </div>


        <!-- ========================================
             SIGN IN BUTTON
        ========================================= -->

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-xl bg-[#1595B6] px-4 py-3 font-bold text-white transition hover:bg-[#117E9E] disabled:cursor-not-allowed disabled:opacity-60"
        >

          {{ loading ? 'Signing in...' : 'Sign In' }}

        </button>

      </form>


      <!-- ========================================
           REGISTER SECTION
      ========================================= -->

      <div
        class="my-6 flex items-center gap-3"
      >

        <div
          class="h-px flex-1 bg-slate-200"
        ></div>

        <span
          class="text-xs font-medium text-slate-400"
        >
          OR
        </span>

        <div
          class="h-px flex-1 bg-slate-200"
        ></div>

      </div>


      <div class="text-center">

        <p
          class="mb-3 text-sm text-slate-500"
        >
          Don't have a Madad account?
        </p>

        <button
          type="button"
          @click="goToRegister"
          class="w-full rounded-xl border border-[#1595B6] bg-white px-4 py-3 font-bold text-[#1595B6] transition hover:bg-[#1595B6] hover:text-white"
        >
          Create Account
        </button>

      </div>


      <!-- ========================================
           FOOTER
      ========================================= -->

      <p
        class="mt-6 text-center text-xs text-slate-400"
      >
        Madad HoReCa Operations Platform
      </p>

    </div>

  </div>

</template>
```