<script setup>

import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { registerUser } from '../services/authService'


const router = useRouter()


// ========================================
// FORM DATA
// ========================================

const name = ref('')

const email = ref('')

const company = ref('')

const password = ref('')

const confirmPassword = ref('')

const accountType = ref('user')

const adminCode = ref('')


// ========================================
// STATE
// ========================================

const loading = ref(false)

const errorMessage = ref('')

const successMessage = ref('')


// ========================================
// REGISTER
// ========================================

async function handleRegister() {

  errorMessage.value = ''

  successMessage.value = ''


  // ----------------------------------------
  // Validate fields
  // ----------------------------------------

  if (
    !name.value.trim() ||
    !email.value.trim() ||
    !company.value.trim() ||
    !password.value ||
    !confirmPassword.value
  ) {

    errorMessage.value =
      'Please complete all fields.'

    return

  }


  // ----------------------------------------
  // Check passwords
  // ----------------------------------------

  if (
    password.value !==
    confirmPassword.value
  ) {

    errorMessage.value =
      'Passwords do not match.'

    return

  }


  // ----------------------------------------
  // Password length
  // ----------------------------------------

  if (password.value.length < 6) {

    errorMessage.value =
      'Password must be at least 6 characters.'

    return

  }


  // ----------------------------------------
  // Admin code
  // ----------------------------------------

  if (
    accountType.value === 'admin' &&
    !adminCode.value.trim()
  ) {

    errorMessage.value =
      'Admin registration requires an admin code.'

    return

  }


  loading.value = true


  try {

    await registerUser(

      name.value,

      email.value,

      password.value,

      company.value,

      accountType.value,

      adminCode.value

    )


    successMessage.value =
      'Account created successfully!'


    setTimeout(() => {

      router.replace('/')

    }, 1500)


  } catch (error) {

    console.error(
      'Registration error:',
      error
    )


    if (
      error.code ===
      'auth/email-already-in-use'
    ) {

      errorMessage.value =
        'An account with this email already exists.'

    } else {

      errorMessage.value =
        error.message ||
        'Unable to create account.'

    }

  } finally {

    loading.value = false

  }

}

</script>


<template>

  <div
    class="min-h-screen bg-[#F6FAFC] flex items-center justify-center px-4 py-10"
  >

    <div
      class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >

      <!-- LOGO -->

      <div class="text-center">

        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#169CBD] text-xl font-black text-white"
        >
          M
        </div>


        <h1
          class="mt-5 text-2xl font-black text-slate-900"
        >
          Create your Madad account
        </h1>


        <p
          class="mt-2 text-sm text-slate-500"
        >
          Join the Madad HoReCa Operations Platform
        </p>

      </div>


      <!-- ERROR -->

      <div
        v-if="errorMessage"
        class="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600"
      >
        {{ errorMessage }}
      </div>


      <!-- SUCCESS -->

      <div
        v-if="successMessage"
        class="mt-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700"
      >
        {{ successMessage }}
      </div>


      <!-- FORM -->

      <form
        class="mt-8 space-y-5"
        @submit.prevent="handleRegister"
      >

        <!-- NAME -->

        <div>

          <label
            class="mb-2 block text-sm font-bold text-slate-800"
          >
            Full Name
          </label>

          <input
            v-model="name"
            type="text"
            placeholder="Enter your full name"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#169CBD] focus:ring-2 focus:ring-cyan-100"
          />

        </div>


        <!-- EMAIL -->

        <div>

          <label
            class="mb-2 block text-sm font-bold text-slate-800"
          >
            Email Address
          </label>

          <input
            v-model="email"
            type="email"
            placeholder="name@company.com"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#169CBD] focus:ring-2 focus:ring-cyan-100"
          />

        </div>


        <!-- COMPANY -->

        <div>

          <label
            class="mb-2 block text-sm font-bold text-slate-800"
          >
            Company / Restaurant
          </label>

          <input
            v-model="company"
            type="text"
            placeholder="Company, hotel, restaurant or cafe"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#169CBD] focus:ring-2 focus:ring-cyan-100"
          />

        </div>


        <!-- ACCOUNT TYPE -->

        <div>

          <label
            class="mb-3 block text-sm font-bold text-slate-800"
          >
            Account Type
          </label>


          <div
            class="grid grid-cols-2 gap-3"
          >

            <!-- USER -->

            <button
              type="button"
              @click="accountType = 'user'"
              class="rounded-xl border p-4 text-left transition"
              :class="
                accountType === 'user'
                  ? 'border-[#169CBD] bg-cyan-50 ring-2 ring-cyan-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              "
            >

              <div
                class="font-bold text-slate-900"
              >
                User
              </div>

              <div
                class="mt-1 text-xs text-slate-500"
              >
                Access the platform
              </div>

            </button>


            <!-- ADMIN -->

            <button
              type="button"
              @click="accountType = 'admin'"
              class="rounded-xl border p-4 text-left transition"
              :class="
                accountType === 'admin'
                  ? 'border-[#169CBD] bg-cyan-50 ring-2 ring-cyan-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              "
            >

              <div
                class="font-bold text-slate-900"
              >
                Admin
              </div>

              <div
                class="mt-1 text-xs text-slate-500"
              >
                Administrative access
              </div>

            </button>

          </div>

        </div>


        <!-- ADMIN CODE -->

        <div
          v-if="accountType === 'admin'"
          class="rounded-xl border border-amber-200 bg-amber-50 p-4"
        >

          <label
            class="mb-2 block text-sm font-bold text-slate-800"
          >
            Admin Registration Code
          </label>

          <input
            v-model="adminCode"
            type="password"
            placeholder="Enter admin code"
            class="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#169CBD]"
          />

          <p
            class="mt-2 text-xs text-amber-700"
          >
            An administrator code is required to create an admin account.
          </p>

        </div>


        <!-- PASSWORD -->

        <div>

          <label
            class="mb-2 block text-sm font-bold text-slate-800"
          >
            Password
          </label>

          <input
            v-model="password"
            type="password"
            placeholder="Create a password"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#169CBD] focus:ring-2 focus:ring-cyan-100"
          />

        </div>


        <!-- CONFIRM PASSWORD -->

        <div>

          <label
            class="mb-2 block text-sm font-bold text-slate-800"
          >
            Confirm Password
          </label>

          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#169CBD] focus:ring-2 focus:ring-cyan-100"
          />

        </div>


        <!-- REGISTER BUTTON -->

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-xl bg-[#169CBD] py-3 font-bold text-white transition hover:bg-[#1289a8] disabled:cursor-not-allowed disabled:opacity-60"
        >

          {{
            loading
              ? 'Creating account...'
              : 'Create Account'
          }}

        </button>

      </form>


      <!-- BACK TO LOGIN -->

      <div class="mt-6 text-center">

        <span
          class="text-sm text-slate-500"
        >
          Already have an account?
        </span>

        <RouterLink
          to="/login"
          class="ml-1 text-sm font-bold text-[#169CBD] hover:underline"
        >
          Sign in
        </RouterLink>

      </div>

    </div>

  </div>

</template>