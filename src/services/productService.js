
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore'

import { db } from '../firebase'

// ========================================
// FIRESTORE COLLECTION
// ========================================

const productsRef = collection(db, 'products')

// ========================================
// 1. REAL-TIME PRODUCT LISTENER
// ========================================

export function subscribeToProducts(onProductsChanged, onError) {
  return onSnapshot(
    productsRef,
    snapshot => {
      const products = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }))

      onProductsChanged(products)
    },
    error => {
      console.error('Products listener error:', error)

      if (onError) {
        onError(error)
      }
    }
  )
}

// ========================================
// 2. CREATE PRODUCT WITH CATEGORY CODE
// ========================================

export async function createProduct(product) {
  const categoryID = product.categoryID

  if (!categoryID) {
    throw new Error('Please select a product category.')
  }

  if (!product.name?.trim()) {
    throw new Error('Please enter a product name.')
  }

  const price = Number(product.price)

  if (
    product.price === '' ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new Error('Please enter a valid product price.')
  }

  if (!product.unit?.trim()) {
    throw new Error('Please select a product unit.')
  }

  // Reference to the selected category
  const categoryRef = doc(
    db,
    'categories',
    categoryID
  )

  // Each category has its own product counter
  const counterRef = doc(
    db,
    'productCounters',
    categoryID
  )

  // Generate an internal Firestore document ID
  const newProductRef = doc(productsRef)

  try {
    return await runTransaction(db, async transaction => {

      // ------------------------------------
      // READ CATEGORY AND COUNTER
      // ------------------------------------

      const categorySnapshot = await transaction.get(categoryRef)
      const counterSnapshot = await transaction.get(counterRef)

      if (!categorySnapshot.exists()) {
        throw new Error(
          `Category ${categoryID} does not exist.`
        )
      }

      const currentNumber = counterSnapshot.exists()
        ? counterSnapshot.data().lastNumber
        : 0

      const nextNumber = currentNumber + 1

      // ------------------------------------
      // GENERATE CATEGORY-BASED CODE
      // ------------------------------------

      // Example:
      // CAT007-P001
      // CAT007-P002
      // CAT004-P001

      const productCode =
        `${categoryID}-P${String(nextNumber).padStart(3, '0')}`

      // ------------------------------------
      // CREATE PRODUCT
      // ------------------------------------

      transaction.set(newProductRef, {
        name: product.name.trim(),
        categoryID,
        productCode,
        price,
        unit: product.unit.trim(),
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // ------------------------------------
      // UPDATE CATEGORY COUNTER
      // ------------------------------------

      transaction.set(counterRef, {
        lastNumber: nextNumber
      })

      return {
        id: newProductRef.id,
        productCode
      }
    })

  } catch (error) {
    console.error('Product creation failed:', error)
    throw error
  }
}

// ========================================
// 3. UPDATE EXISTING PRODUCT
// ========================================

export async function updateProduct(productId, product) {
  return updateDoc(doc(db, 'products', productId), {
    name: product.name.trim(),
    categoryID: product.categoryID,
    price: Number(product.price),
    unit: product.unit.trim(),
    updatedAt: serverTimestamp()
  })
}

// ========================================
// 4. ACTIVATE / DEACTIVATE PRODUCT
// ========================================

export async function setProductActive(productId, active) {
  return updateDoc(doc(db, 'products', productId), {
    active: Boolean(active),
    updatedAt: serverTimestamp()
  })
}

// ========================================
// 5. DELETE PRODUCT
// ========================================

export async function removeProduct(productId) {
  return deleteDoc(doc(db, 'products', productId))
}
