<script setup>



import { computed, onMounted, onUnmounted, ref } from 'vue'



import { useRouter } from 'vue-router'



import {

  collection,

  getDocs,

  doc,

  deleteDoc

} from 'firebase/firestore'







import { db } from '../firebase'



import { logoutUser } from '../services/authService'



import { getCategories } from '../services/categoryService'







import {



  subscribeToProducts,



  createProduct,



  updateProduct,



  setProductActive,



  removeProduct



} from '../services/productService'





import {

  trackAdminDashboardView,



  trackProductCreated,



  trackCategoryOpened



} from '../services/analyticsService'







const router = useRouter()







// ------------------------------------------



// ADMIN PAGE STATE



// ------------------------------------------







const activeSection = ref('overview')







const products = ref([])



const categories = ref([])



// IDs of category cards currently expanded

const expandedCategoryIds = ref([])



const users = ref([])







const loading = ref(true)



const saving = ref(false)



const errorMessage = ref('')



const successMessage = ref('')







const search = ref('')



const showProductForm = ref(false)



const editingProductId = ref(null)







let unsubscribeProducts = null







const emptyProduct = () => ({



  name: '',



  categoryID: '',



  price: 0,



  unit: 'piece'



})







const productForm = ref(emptyProduct())







// ------------------------------------------



// ADMIN MODULES



// ------------------------------------------







const modules = [



  {



    id: 'products',



    title: 'Products',



    description: 'Create, edit and manage the product catalog.',



    enabled: true



  },



  {



    id: 'categories',



    title: 'Categories',



    description: 'View product categories and subcategories.',



    enabled: true



  },



  {



    id: 'users',



    title: 'Users',



    description: 'View registered accounts and their roles.',



    enabled: true



  },



  {



    id: 'suppliers',



    title: 'Suppliers',



    description: 'Supplier registration and approval management.',



    enabled: false



  },



  {



    id: 'orders',



    title: 'Purchase Orders',



    description: 'Purchase order review and approval workflows.',



    enabled: false



  },



  {



    id: 'system',



    title: 'System',



    description: 'Platform settings and integration monitoring.',



    enabled: false



  }



]







// ------------------------------------------



// COMPUTED DATA



// ------------------------------------------







const filteredProducts = computed(() => {



  const query = search.value.trim().toLowerCase()







  if (!query) return products.value







  return products.value.filter(product =>



    product.name?.toLowerCase().includes(query) ||



    product.productCode?.toLowerCase().includes(query) ||



    product.id.toLowerCase().includes(query) ||



    product.categoryID?.toLowerCase().includes(query)



  )



})











const activeProductsCount = computed(() =>



  products.value.filter(product => product.active !== false).length



)







const adminCount = computed(() =>



  users.value.filter(user => user.role === 'admin').length



)







// Expand or collapse an individual category card.

function toggleCategory(categoryId) {

  expandedCategoryIds.value = expandedCategoryIds.value.includes(categoryId)

    ? expandedCategoryIds.value.filter(id => id !== categoryId)

    : [...expandedCategoryIds.value, categoryId]

}



function isCategoryExpanded(categoryId) {

  return expandedCategoryIds.value.includes(categoryId)

}



// Categories are linked using their existing Firestore parentID field.

function childCategories(categoryId) {

  return categories.value.filter(category => category.parentID === categoryId)

}





 // ==========================================

 // DELETE SUBCATEGORY

 // ==========================================



const deletingCategoryId = ref(null)



async function deleteSubcategory(category) {

  errorMessage.value = ''

  successMessage.value = ''



  // Only allow subcategories to be deleted.

  if (!category.parentID) {

    errorMessage.value = 'Main categories cannot be deleted here.'

    return

  }



  // Prevent deleting a category containing products.

  const assignedProducts = products.value.filter(

    product => product.categoryID === category.id

  )



  if (assignedProducts.length > 0) {

    errorMessage.value =

      `Cannot delete "${category.name}". ` +

      `It contains ${assignedProducts.length} product(s). ` +

      'Move or delete those products first.'

    return

  }



  // Prevent deleting a category containing child categories.

  const nestedCategories = categories.value.filter(

    item => item.parentID === category.id

  )



  if (nestedCategories.length > 0) {

    errorMessage.value =

      `Cannot delete "${category.name}". ` +

      'Delete its child categories first.'

    return

  }



  // Ask the administrator for confirmation.

  const confirmed = window.confirm(

    `Are you sure you want to permanently delete ` +

    `"${category.name}" (${category.id})?`

  )



  if (!confirmed) return



  deletingCategoryId.value = category.id



  try {

    // Delete the document from Cloud Firestore.

    await deleteDoc(

      doc(db, 'categories', category.id)

    )



    // Refresh the displayed categories.

    categories.value = await getCategories()



    successMessage.value =

      `"${category.name}" was deleted successfully.`



  } catch (error) {

    console.error(

      'Subcategory deletion failed:',

      error

    )



    errorMessage.value =

      `Unable to delete subcategory: ${error.message}`



  } finally {

    deletingCategoryId.value = null

  }

}





// Products come from the existing real-time Firestore products listener.

function productsForCategory(categoryId) {

  return products.value.filter(product => product.categoryID === categoryId)

}



function categoryProductCount(categoryId) {

  const childIds = childCategories(categoryId).map(category => category.id)

  return products.value.filter(product =>

    product.categoryID === categoryId || childIds.includes(product.categoryID)

  ).length

}



const categoryName = categoryID =>



  categories.value.find(category => category.id === categoryID)?.name



  ?? categoryID



  ?? 'Unassigned'







const formatPrice = price =>



  Number(price ?? 0).toLocaleString('en-OM', {



    minimumFractionDigits: 3,



    maximumFractionDigits: 3



  })







// ------------------------------------------



// LOAD FIREBASE DATA



// ------------------------------------------







async function loadAdminData() {



  loading.value = true



  errorMessage.value = ''







  try {



    const [categoryData, userSnapshot] = await Promise.all([



      getCategories(),



      getDocs(collection(db, 'users'))



    ])







    categories.value = categoryData







    users.value = userSnapshot.docs.map(document => ({



      id: document.id,



      ...document.data()



    }))



  } catch (error) {



    console.error('Admin data loading failed:', error)



    errorMessage.value = `Unable to load admin data: ${error.message}`



  } finally {



    loading.value = false



  }



}







onMounted(() => {

  trackAdminDashboardView()



  loadAdminData()



  unsubscribeProducts = subscribeToProducts(



    updatedProducts => {



      products.value = updatedProducts



    },



    error => {



      errorMessage.value = `Products connection error: ${error.message}`



    }



  )



})







onUnmounted(() => {



  if (unsubscribeProducts) {



    unsubscribeProducts()



  }



})







// ------------------------------------------



// PRODUCT FORM



// ------------------------------------------







function openCreateProduct() {



  editingProductId.value = null



  productForm.value = emptyProduct()



  showProductForm.value = true



  errorMessage.value = ''



}







function openEditProduct(product) {



  editingProductId.value = product.id







  productForm.value = {



    name: product.name ?? '',



    categoryID: product.categoryID ?? '',



    price: product.price ?? 0,



    unit: product.unit ?? 'piece'



  }







  showProductForm.value = true



  errorMessage.value = ''



}







function closeProductForm() {



  showProductForm.value = false



  editingProductId.value = null



}







async function saveProduct() {



  errorMessage.value = ''



  successMessage.value = ''







  if (!productForm.value.name.trim()) {



    errorMessage.value = 'Please enter a product name.'



    return



  }







  if (!productForm.value.categoryID) {



    errorMessage.value = 'Please select a category.'



    return



  }







  if (



    productForm.value.price === '' ||



    !Number.isFinite(Number(productForm.value.price)) ||



    Number(productForm.value.price) < 0



  ) {



    errorMessage.value = 'Please enter a valid price.'



    return



  }







  if (!productForm.value.unit.trim()) {



    errorMessage.value = 'Please enter a unit.'



    return



  }







  saving.value = true







  try {



    if (editingProductId.value) {



      await updateProduct(



        editingProductId.value,



        productForm.value



      )







      successMessage.value = 'Product updated successfully.'



    } else {

  await createProduct(productForm.value)



  trackProductCreated()



  successMessage.value = 'Product created successfully.'

}







    closeProductForm()



  } catch (error) {



    console.error('Product save failed:', error)



    errorMessage.value = `Unable to save product: ${error.message}`



  } finally {



    saving.value = false



  }



}







// ------------------------------------------



// PRODUCT STATUS



// ------------------------------------------







async function toggleProductStatus(product) {



  errorMessage.value = ''



  successMessage.value = ''







  const nextStatus = product.active === false







  try {



    await setProductActive(product.id, nextStatus)







    successMessage.value = nextStatus



      ? 'Product activated.'



      : 'Product deactivated.'



  } catch (error) {



    errorMessage.value = `Unable to change status: ${error.message}`



  }



}







// ------------------------------------------



// DELETE PRODUCT



// ------------------------------------------







async function deleteProduct(product) {



  const confirmed = window.confirm(



    `Permanently delete "${product.name}"? This cannot be undone.`



  )







  if (!confirmed) return







  errorMessage.value = ''



  successMessage.value = ''







  try {



    await removeProduct(product.id)



    successMessage.value = 'Product deleted successfully.'



  } catch (error) {



    errorMessage.value = `Unable to delete product: ${error.message}`



  }



}







// ------------------------------------------



// LOGOUT



// ------------------------------------------







async function handleLogout() {



  try {



    await logoutUser()



    await router.replace('/login')



  } catch (error) {



    errorMessage.value = `Logout failed: ${error.message}`



  }



}



</script>







<template>



  <div class="min-h-screen bg-slate-50">







    <!-- HEADER -->



    <header class="border-b border-slate-200 bg-white">



      <div



        class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4"



      >



        <div>



          <h1 class="text-xl font-black text-slate-900">



            MADAD <span class="text-[#1595B6]">Admin</span>



          </h1>



          <p class="text-xs text-slate-500">



            HoReCa Platform Administration



          </p>



        </div>







        <button



          type="button"



          @click="handleLogout"



          class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"



        >



          Logout



        </button>



      </div>



    </header>







    <main class="mx-auto max-w-7xl space-y-6 px-5 py-8">







      <!-- PAGE TITLE -->



      <div>



        <p class="text-xs font-bold uppercase tracking-wider text-[#1595B6]">



          Administrator



        </p>







        <h2 class="mt-1 text-3xl font-black text-slate-900">



          Admin Dashboard



        </h2>







        <p class="mt-2 text-sm text-slate-500">



          Manage your platform's product catalog, categories and accounts.



        </p>



      </div>







      <!-- MESSAGES -->



      <div



        v-if="errorMessage"



        role="alert"



        class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"



      >



        {{ errorMessage }}



      </div>







      <div



        v-if="successMessage"



        role="status"



        class="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"



      >



        {{ successMessage }}



      </div>







      <!-- NAVIGATION -->



      <div class="flex flex-wrap gap-2">



        <button



          v-for="section in [



            ['overview', 'Overview'],



            ['products', 'Products'],



            ['categories', 'Categories'],



            ['users', 'Users']



          ]"



          :key="section[0]"



          type="button"



          @click="activeSection = section[0]"



          class="rounded-xl px-4 py-2 text-sm font-bold transition"



          :class="



            activeSection === section[0]



              ? 'bg-[#1595B6] text-white'



              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'



          "



        >



          {{ section[1] }}



        </button>



      </div>







      <!-- ===================================== -->



      <!-- OVERVIEW -->



      <!-- ===================================== -->







      <template v-if="activeSection === 'overview'">







        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">







          <div



            v-for="metric in [



              ['Total Products', products.length],



              ['Active Products', activeProductsCount],



              ['Categories', categories.length],



              ['Registered Users', users.length]



            ]"



            :key="metric[0]"



            class="rounded-2xl border border-slate-200 bg-white p-5"



          >



            <p class="text-sm font-medium text-slate-500">



              {{ metric[0] }}



            </p>







            <p class="mt-3 text-3xl font-black text-slate-900">



              {{ metric[1] }}



            </p>



          </div>







        </section>







        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">







          <button



            v-for="module in modules"



            :key="module.id"



            type="button"



            :disabled="!module.enabled"



            @click="activeSection = module.id"



            class="rounded-2xl border border-slate-200 bg-white p-6 text-left transition"



            :class="



              module.enabled



                ? 'hover:border-[#1595B6] hover:shadow-md'



                : 'cursor-not-allowed opacity-60'



            "



          >



            <div class="flex items-center justify-between gap-2">



              <h3 class="font-bold text-slate-900">



                {{ module.title }}



              </h3>







              <span



                class="rounded-full px-2 py-1 text-[10px] font-bold"



                :class="



                  module.enabled



                    ? 'bg-green-50 text-green-700'



                    : 'bg-slate-100 text-slate-500'



                "



              >



                {{ module.enabled ? 'Available' : 'Planned' }}



              </span>



            </div>







            <p class="mt-2 text-sm text-slate-500">



              {{ module.description }}



            </p>



          </button>







        </section>







      </template>







      <!-- ===================================== -->



      <!-- PRODUCT MANAGEMENT -->



      <!-- ===================================== -->







      <section



        v-else-if="activeSection === 'products'"



        class="rounded-2xl border border-slate-200 bg-white p-6"



      >







        <div



          class="flex flex-wrap items-center justify-between gap-4"



        >



          <div>



            <h3 class="text-xl font-black text-slate-900">



              Product Management



            </h3>







            <p class="mt-1 text-sm text-slate-500">



              Changes are saved to Cloud Firestore.



            </p>



          </div>







          <button



            type="button"



            @click="openCreateProduct"



            class="rounded-xl bg-[#1595B6] px-5 py-3 text-sm font-bold text-white hover:bg-[#117E9E]"



          >



            + Add Product



          </button>



        </div>







        <!-- SEARCH -->



        <input



          v-model="search"



          type="search"



          placeholder="Search by product name, ID or category..."



          class="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#1595B6]"



        />







        <!-- PRODUCT TABLE -->



        <div class="mt-5 overflow-x-auto">







          <table class="w-full text-left text-sm">







            <thead class="border-b border-slate-200 text-slate-500">



              <tr>



                <th class="px-3 py-3">Product</th>



                <th class="px-3 py-3">Category</th>



                <th class="px-3 py-3">Price</th>



                <th class="px-3 py-3">Status</th>



                <th class="px-3 py-3 text-right">Actions</th>



              </tr>



            </thead>







            <tbody>



              <tr



                v-for="product in filteredProducts"



                :key="product.id"



                class="border-b border-slate-100"



              >



                <td class="px-3 py-4">



                  <p class="font-bold text-slate-900">



                    {{ product.name }}



                  </p>



                  <p class="text-xs text-slate-400">



                    {{ product.productCode || product.id }}



                  </p>



                </td>







                <td class="px-3 py-4 text-slate-600">



                  {{ categoryName(product.categoryID) }}



                </td>







                <td class="px-3 py-4 text-slate-600">



                  <span v-if="product.price != null">



                    OMR {{ formatPrice(product.price) }}



                    / {{ product.unit || 'piece' }}



                  </span>







                  <span v-else class="text-slate-400">



                    Not set



                  </span>



                </td>







                <td class="px-3 py-4">



                  <span



                    class="rounded-full px-3 py-1 text-xs font-bold"



                    :class="



                      product.active === false



                        ? 'bg-slate-100 text-slate-500'



                        : 'bg-green-50 text-green-700'



                    "



                  >



                    {{



                      product.active === false



                        ? 'Inactive'



                        : 'Active'



                    }}



                  </span>



                </td>







                <td class="px-3 py-4">



                  <div class="flex flex-wrap justify-end gap-2">







                    <button



                      type="button"



                      @click="openEditProduct(product)"



                      class="rounded-lg bg-[#E9F7FB] px-3 py-2 text-xs font-bold text-[#117E9E]"



                    >



                      Edit



                    </button>







                    <button



                      type="button"



                      @click="toggleProductStatus(product)"



                      class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"



                    >



                      {{



                        product.active === false



                          ? 'Activate'



                          : 'Deactivate'



                      }}



                    </button>







                    <button



                      type="button"



                      @click="deleteProduct(product)"



                      class="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"



                    >



                      Delete



                    </button>







                  </div>



                </td>



              </tr>



            </tbody>







          </table>







          <p



            v-if="filteredProducts.length === 0"



            class="py-10 text-center text-sm text-slate-500"



          >



            No matching products found.



          </p>







        </div>



      </section>







      <!-- ===================================== -->

      <!-- CATEGORIES: INDIVIDUAL EXPANDABLE CARDS -->

      <!-- ===================================== -->



      <section

        v-else-if="activeSection === 'categories'"

        class="rounded-2xl border border-slate-200 bg-white p-6"

      >

        <div class="flex flex-wrap items-center justify-between gap-3">

          <div>

            <h3 class="text-xl font-black text-slate-900">Categories</h3>

            <p class="mt-1 text-sm text-slate-500">

              Click any category to view its available products and subcategories.

            </p>

          </div>

          <span class="rounded-full bg-sky-50 px-4 py-2 text-xs font-bold text-[#117E9E]">

            {{ categories.length }} Categories

          </span>

        </div>



        <div class="mt-5 grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <div

            v-for="category in categories"

            :key="category.id"

            class="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-sky-200"

          >

            <!-- The header of EACH card is its own dropdown button. -->

            <button

              type="button"

              :aria-expanded="isCategoryExpanded(category.id)"

              :aria-controls="`category-content-${category.id}`"

              @click="toggleCategory(category.id)"

              class="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-sky-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1595B6]"

            >

              <span class="min-w-0">

                <span class="block font-bold text-slate-900">{{ category.name }}</span>

                <span class="mt-1 block text-xs text-slate-500">

                  ID: {{ category.id }}

                </span>

                <span class="mt-1 block text-xs text-slate-500">

                  {{ category.parentID

                    ? `Parent: ${categoryName(category.parentID)}`

                    : 'Main category' }}

                </span>

                <span class="mt-2 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-[#117E9E]">

                  {{ categoryProductCount(category.id) }} products

                </span>

              </span>

              <svg

                class="h-5 w-5 shrink-0 text-[#1595B6] transition-transform duration-200"

                :class="isCategoryExpanded(category.id) ? 'rotate-180' : ''"

                viewBox="0 0 24 24"

                fill="none"

                stroke="currentColor"

                stroke-width="2"

                stroke-linecap="round"

                stroke-linejoin="round"

                aria-hidden="true"

              >

                <path d="m6 9 6 6 6-6" />

              </svg>

            </button>



            <div

              v-if="isCategoryExpanded(category.id)"

              :id="`category-content-${category.id}`"

              class="border-t border-slate-100 bg-slate-50/70 px-4 py-4"

            >

              <!-- Products assigned directly to this category. -->

              <div v-if="productsForCategory(category.id).length" class="space-y-2">

                <p class="text-xs font-bold uppercase tracking-wide text-slate-500">

                  Available products

                </p>

                <div

                  v-for="product in productsForCategory(category.id)"

                  :key="product.id"

                  class="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2"

                >

                  <div class="min-w-0">

                    <p class="truncate text-sm font-semibold text-slate-800">

                      {{ product.name }}

                    </p>

                    <p class="text-xs text-slate-500">

                      {{ product.productCode || 'Code not assigned' }}

                    </p>

                  </div>

                  <div class="flex shrink-0 items-center gap-2">
                    <span
  
                      class="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold"
  
                      :class="product.active === false
  
                        ? 'bg-slate-100 text-slate-500'
  
                        : 'bg-green-50 text-green-700'"
  
                    >
  
                      {{ product.active === false ? 'Inactive' : 'Active' }}
  
                    </span>
                    <button
                      type="button"
                      @click.stop="deleteProduct(product)"
                      class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>

                </div>

              </div>



              <!-- Parent cards also show their subcategories and their products. -->

              <div

                v-for="child in childCategories(category.id)"

                :key="child.id"

                class="mt-3 rounded-lg border border-slate-200 bg-white p-3 first:mt-0"

              >



<div class="flex items-center justify-between gap-2">



  <!-- Subcategory information -->

  <div class="min-w-0">

    <p class="text-sm font-bold text-[#117E9E]">

      {{ child.name }}

    </p>



    <p class="text-xs text-slate-400">

      {{ child.id }}

    </p>



    <p class="mt-1 text-xs text-slate-500">

      {{ productsForCategory(child.id).length }} products

    </p>

  </div>



  <!-- Delete subcategory button -->

  <button

    type="button"

    @click.stop="deleteSubcategory(child)"

    :disabled="deletingCategoryId === child.id"

    class="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"

  >

    {{

      deletingCategoryId === child.id

        ? 'Deleting...'

        : 'Delete'

    }}

  </button>



</div>



                <div

                  v-if="productsForCategory(child.id).length"

                  class="mt-2 space-y-2 border-t border-slate-100 pt-2"

                >

                  <div

                    v-for="product in productsForCategory(child.id)"

                    :key="product.id"

                    class="flex items-center justify-between gap-2 text-sm"

                  >

                    <div class="min-w-0">

                      <p class="truncate font-medium text-slate-700">{{ product.name }}</p>

                      <p class="text-xs text-slate-400">

                        {{ product.productCode || 'Code not assigned' }}

                      </p>

                    </div>

                    <div class="flex shrink-0 items-center gap-2">
                      <span
  
                        class="shrink-0 text-xs"
  
                        :class="product.active === false ? 'text-slate-400' : 'text-green-600'"
  
                      >
  
                        {{ product.active === false ? 'Inactive' : 'Active' }}
  
                      </span>
                      <button
                        type="button"
                        @click.stop="deleteProduct(product)"
                        class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>

                  </div>

                </div>

                <p v-else class="mt-2 text-xs text-slate-400">

                  No products in this subcategory yet.

                </p>

              </div>



              <p

                v-if="!productsForCategory(category.id).length && !childCategories(category.id).length"

                class="text-sm text-slate-500"

              >

                No products in this category yet.

              </p>

            </div>

          </div>

        </div>

      </section>



      <!-- ===================================== -->

      <!-- ===================================== -->



      <!-- USERS -->



      <!-- ===================================== -->







      <section



        v-else-if="activeSection === 'users'"



        class="rounded-2xl border border-slate-200 bg-white p-6"



      >



        <div class="flex flex-wrap justify-between gap-4">



          <div>



            <h3 class="text-xl font-black">



              User Management



            </h3>







            <p class="mt-1 text-sm text-slate-500">



              Firestore user profiles and assigned roles.



            </p>



          </div>







          <span class="text-sm font-bold text-[#1595B6]">



            {{ adminCount }} admin(s)



          </span>



        </div>







        <div class="mt-5 overflow-x-auto">







          <table class="w-full text-left text-sm">







            <thead class="border-b border-slate-200 text-slate-500">



              <tr>



                <th class="px-3 py-3">Name</th>



                <th class="px-3 py-3">Email</th>



                <th class="px-3 py-3">Role</th>



              </tr>



            </thead>







            <tbody>



              <tr



                v-for="user in users"



                :key="user.id"



                class="border-b border-slate-100"



              >



                <td class="px-3 py-4 font-semibold">



                  {{ user.name || 'Unnamed user' }}



                </td>







                <td class="px-3 py-4 text-slate-600">



                  {{ user.email || 'Not provided' }}



                </td>







                <td class="px-3 py-4">



                  <span



                    class="rounded-full px-3 py-1 text-xs font-bold"



                    :class="



                      user.role === 'admin'



                        ? 'bg-purple-50 text-purple-700'



                        : 'bg-blue-50 text-blue-700'



                    "



                  >



                    {{ user.role || 'Unassigned' }}



                  </span>



                </td>



              </tr>



            </tbody>







          </table>







          <p



            v-if="loading"



            class="py-6 text-sm text-slate-500"



          >



            Loading users...



          </p>







        </div>







        <p class="mt-4 text-xs text-slate-400">



          User creation and role changes will be implemented through



          a secured Cloud Function.



        </p>



      </section>







    </main>







    <!-- ===================================== -->



    <!-- ADD / EDIT PRODUCT MODAL -->



    <!-- ===================================== -->







    <div



      v-if="showProductForm"



      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"



      @click.self="closeProductForm"



    >







      <div



        role="dialog"



        aria-modal="true"



        aria-labelledby="product-form-title"



        class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"



      >







        <h3



          id="product-form-title"



          class="text-xl font-black text-slate-900"



        >



          {{



            editingProductId



              ? 'Edit Product'



              : 'Add New Product'



          }}



        </h3>







        <p class="mt-1 text-sm text-slate-500">



          Product information will be stored in Firestore.



        </p>







        <form



          class="mt-6 space-y-4"



          @submit.prevent="saveProduct"



        >







          <div>



            <label class="mb-1 block text-sm font-semibold">



              Product Name



            </label>







            <input



              v-model="productForm.name"



              required



              maxlength="120"



              type="text"



              placeholder="e.g. Fresh Orange Juice"



              class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#1595B6]"



            />



          </div>







          <div>



            <label class="mb-1 block text-sm font-semibold">



              Category



            </label>







            <select



              v-model="productForm.categoryID"



              required



              class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#1595B6]"



            >



              <option value="" disabled>



                Select category



              </option>







              <option



                v-for="category in categories"



                :key="category.id"



                :value="category.id"



              >



                {{ category.name }}



              </option>



            </select>



          </div>







          <div class="grid grid-cols-2 gap-4">







            <div>



              <label class="mb-1 block text-sm font-semibold">



                Price (OMR)



              </label>







              <input



                v-model.number="productForm.price"



                required



                type="number"



                min="0"



                step="0.001"



                class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#1595B6]"



              />



            </div>







            <div>



              <label class="mb-1 block text-sm font-semibold">



                Unit



              </label>







              <select



                v-model="productForm.unit"



                class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#1595B6]"



              >



                <option value="piece">Piece</option>



                <option value="kg">Kilogram</option>



                <option value="litre">Litre</option>



                <option value="box">Box</option>



                <option value="carton">Carton</option>



              </select>



            </div>







          </div>







          <div class="flex justify-end gap-3 pt-3">







            <button



              type="button"



              @click="closeProductForm"



              class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"



            >



              Cancel



            </button>







            <button



              type="submit"



              :disabled="saving"



              class="rounded-xl bg-[#1595B6] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"



            >



              {{



                saving



                  ? 'Saving...'



                  : editingProductId



                    ? 'Save Changes'



                    : 'Create Product'



              }}



            </button>







          </div>







        </form>







      </div>







    </div>







  </div>



</template>