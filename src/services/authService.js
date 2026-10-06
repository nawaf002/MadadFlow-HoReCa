import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

import {
  doc,
  getDoc
} from 'firebase/firestore'

import {
  httpsCallable
} from 'firebase/functions'

import {
  auth,
  db,
  functions
} from '../firebase'


// ========================================
// CREATE ACCOUNT
// ========================================

export async function registerUser(
  name,
  email,
  password,
  company,
  role = 'user',
  adminCode = ''
) {

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    )

  const user = credential.user


  try {

    // Call the Cloud Function
    const createProfile =
      httpsCallable(
        functions,
        'createUserProfile'
      )


    await createProfile({

      name: name.trim(),

      company: company.trim(),

      role: role,

      adminCode: adminCode.trim()

    })


    return user

  } catch (error) {

    console.error(
      'Profile creation error:',
      error
    )


    // Remove the Authentication account
    // if Firestore profile creation fails.
    try {

      await user.delete()

    } catch (deleteError) {

      console.error(
        'Unable to remove incomplete account:',
        deleteError
      )

    }


    throw error

  }

}


// ========================================
// LOGIN
// ========================================

export async function loginUser(
  email,
  password
) {

  const credential =
    await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    )


  return credential.user

}


// ========================================
// LOGOUT
// ========================================

export async function logoutUser() {

  await signOut(auth)

}


// ========================================
// GET USER PROFILE FROM FIRESTORE
// ========================================

export async function getUserProfile(uid) {

  const userRef =
    doc(
      db,
      'users',
      uid
    )


  const snapshot =
    await getDoc(userRef)


  if (!snapshot.exists()) {

    return null

  }


  return {

    id: snapshot.id,

    ...snapshot.data()

  }

}


// ========================================
// WAIT FOR FIREBASE AUTHENTICATION
// ========================================

export function waitForAuth() {

  return new Promise(resolve => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        user => {

          unsubscribe()

          resolve(user)

        }
      )

  })

}