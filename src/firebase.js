
import { initializeApp } from 'firebase/app'

import {
  getFirestore
} from 'firebase/firestore'

import {
  getAuth
} from 'firebase/auth'

import {
  getFunctions,
  connectFunctionsEmulator
} from 'firebase/functions'

import {
  getAnalytics,
  isSupported
} from 'firebase/analytics'

// ========================================
// 1. FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyAAcaxlVeSSOiYWwOczW-gW-NucWVrubbo",
  authDomain: "madad-horeca-command-center.firebaseapp.com",
  projectId: "madad-horeca-command-center",
  storageBucket: "madad-horeca-command-center.firebasestorage.app",
  messagingSenderId: "336363149686",
  appId: "1:336363149686:web:29988416f9b7de1baac257",
  measurementId: "G-HDW7XFLKDK"
}

// ========================================
// 2. INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig)

// ========================================
// 3. CLOUD FIRESTORE
// ========================================

const db = getFirestore(app)

// ========================================
// 4. FIREBASE AUTHENTICATION
// ========================================

const auth = getAuth(app)

// ========================================
// 5. GOOGLE CLOUD FUNCTIONS
// ========================================

const functions = getFunctions(app, 'us-central1')

// Connect to your local Functions emulator
// when running the Vue development server.

if (import.meta.env.DEV) {
  connectFunctionsEmulator(
    functions,
    '127.0.0.1',
    5001
  )
}

// ========================================
// 6. GOOGLE ANALYTICS
// ========================================

let analytics = null

async function initializeAnalytics() {
  try {
    // Check whether the browser supports Analytics.
    const supported = await isSupported()

    if (!supported) {
      console.log(
        'Google Analytics is not supported in this environment.'
      )
      return null
    }

    // Disable collection in local development.
    // This avoids mixing test activity with real users.
    if (
  import.meta.env.DEV &&
  import.meta.env.VITE_ENABLE_ANALYTICS_TEST !== 'true'
) {
  console.log(
    'Google Analytics collection is disabled in development.'
  )
  return null
}

    analytics = getAnalytics(app)

    console.log(
      'Google Analytics initialized successfully.'
    )

    return analytics

  } catch (error) {
    console.error(
      'Google Analytics initialization failed:',
      error
    )

    return null
  }
}

// Initialize Analytics asynchronously.
const analyticsReady = initializeAnalytics()

// Access Analytics from other components.
function getAnalyticsInstance() {
  return analytics
}

// ========================================
// 7. EXPORT FIREBASE SERVICES
// ========================================

export {
  app,
  db,
  auth,
  functions,
  analyticsReady,
  getAnalyticsInstance
}
