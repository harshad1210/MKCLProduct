<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Edit2, Trash2, Loader2, Search } from 'lucide-vue-next'
import ProductFormModal from '@/components/ProductFormModal.vue'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue'

// Basic layout for admin pages if we had a dedicated layout
definePageMeta({
  layout: 'admin' 
})

const router = useRouter()
const products = ref([])
// ... (rest of imports)

const handleCardClick = (id) => {
    router.push(`/admin/products/${id}`)
}
//... (in template)

const loading = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const editingProduct = ref(null)

// Delete Modal State
const showDeleteModal = ref(false)
const productToDelete = ref(null)

// --- Fetching ---
const fetchProducts = async () => {
  loading.value = true
  try {
     const data = await $fetch('/api/content')
     if (data && data.products) {
         products.value = data.products
     }
  } catch (e) {
      console.error(e)
  } finally {
      loading.value = false
  }
}

// Initial Fetch
fetchProducts()

// Filtering
const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value
    const lower = searchQuery.value.toLowerCase()
    return products.value.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        (p.description && p.description.toLowerCase().includes(lower))
    )
})

// Pagination
const itemsPerPage = ref(5)
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value))

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredProducts.value.slice(start, end)
})

const nextPage = () => {
    if(currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
    if(currentPage.value > 1) currentPage.value--
}

// Watch search to reset page
watch([searchQuery, itemsPerPage], () => {
    currentPage.value = 1
})

// --- Modal Management ---
const openAddModal = () => {
  editingProduct.value = null
  showModal.value = true
}

const openEditModal = (product) => {
  editingProduct.value = product
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const initiateDelete = (product) => {
    productToDelete.value = product
    showDeleteModal.value = true
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    productToDelete.value = null
}

const currentUser = useCookie('user')

const confirmDelete = async (password) => {
  if (!productToDelete.value) return

  try {
    const response = await fetch(`/api/products/${productToDelete.value.id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            password,
            username: currentUser.value?.username
        })
    })
    
    if (response.ok) {
        closeDeleteModal()
        fetchProducts()
    } else {
        const err = await response.json()
        alert(err.error || "Delete failed")
    }
  } catch (error) { 
      console.error(error) 
      alert("Server error")
  }
}
// Reordering
import { ArrowUp, ArrowDown, Save } from 'lucide-vue-next'

const hasUnsavedChanges = ref(false)

const moveUp = async (relativeIndex) => {
    if(searchQuery.value) return 

    const realIndex = (currentPage.value - 1) * itemsPerPage.value + relativeIndex

    if (realIndex === 0) return
    const items = [...products.value]
    
    // Swap
    const temp = items[realIndex]
    items[realIndex] = items[realIndex - 1]
    items[realIndex - 1] = temp
    
    products.value = items
    hasUnsavedChanges.value = true
}

const moveDown = async (relativeIndex) => {
    if(searchQuery.value) return 

    const realIndex = (currentPage.value - 1) * itemsPerPage.value + relativeIndex

    if (realIndex === products.value.length - 1) return
    const items = [...products.value]
    
    // Swap
    const temp = items[realIndex]
    items[realIndex] = items[realIndex + 1]
    items[realIndex + 1] = temp
    
    products.value = items
    hasUnsavedChanges.value = true
}

const saveReorder = async () => {
    const payload = products.value.map((p, i) => ({
        id: p.id,
        displayOrder: i
    }))

    try {
        await $fetch('/api/products/reorder', {
            method: 'POST',
            body: { items: payload, username: currentUser.value?.username }
        })
        hasUnsavedChanges.value = false
        alert("Sequence saved!")
    } catch (e) {
        console.error("Reorder failed", e)
        alert("Failed to save order")
    }
}

</script>

<template>
  <div class="product-manager">
    <header class="page-header">
      <div class="header-left">
        <h1>Product Manager</h1>
        <p>Manage your portfolio</p>
      </div>
    </header>

    <!-- Actions Bar -->
    <div class="actions-bar">
      <!-- Search -->
      <div class="search-container">
          <Search class="search-icon" size="18" />
          <input 
            type="text" 
            placeholder="Search products..." 
            v-model="searchQuery"
            class="search-input"
          />
      </div>

      <button class="btn btn-primary" @click="openAddModal">
         <Plus size="20" /> Add New Product
      </button>
      
      <button v-if="hasUnsavedChanges" class="btn btn-warning" @click="saveReorder" title="Save new order">
         <Save size="20" /> Save Sequence
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <Loader2 class="spin" size="40" />
    </div>

    <!-- Product Grid (Cards) -->
    <div v-else class="product-grid fade-in-up">
      <div 
        v-for="(product, index) in paginatedProducts" 
        :key="product.id" 
        class="product-card-compact clickable-card"
        @click="handleCardClick(product.id)"
      >
        <div class="card-content">
          <img :src="product.logoUrl || product.logo || 'https://placehold.co/100'" :alt="product.name" class="product-logo" />
          <h3 :title="product.name">{{ product.name }}</h3>
        </div>
        
        <div class="card-actions-hover">
             <button @click.stop="moveUp(index)" class="action-btn" title="Move Up" 
                v-if="!searchQuery && ((currentPage - 1) * itemsPerPage + index) > 0">
                <ArrowUp :size="16"/>
             </button>
             <button @click.stop="moveDown(index)" class="action-btn" title="Move Down" 
                v-if="!searchQuery && ((currentPage - 1) * itemsPerPage + index) < products.length - 1">
                <ArrowDown :size="16"/>
             </button>
             <button @click.stop="openEditModal(product)" class="action-btn edit" title="Edit Product Info"><Edit2 :size="16"/></button>
             <button v-if="currentUser?.role === 'ADMIN'" @click.stop="initiateDelete(product)" class="action-btn delete" title="Delete"><Trash2 :size="16"/></button>
        </div>
      </div>
       <div v-if="filteredProducts.length === 0" class="empty-placeholder">
          No products found.
       </div>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination-controls" v-if="filteredProducts.length > 0">
        <label class="page-size-label">
            Rows: 
            <select v-model="itemsPerPage" class="page-size-select">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="15">15</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
            </select>
        </label>

        <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>

    <!-- Reusable Modal -->
    <ProductFormModal 
        :isOpen="showModal" 
        :editData="editingProduct" 
        @close="closeModal" 
        @refresh="fetchProducts" 
    />
    
    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
        :isOpen="showDeleteModal"
        :productName="productToDelete?.name"
        @close="closeDeleteModal"
        @confirm="confirmDelete"
    />

  </div>
</template>

<style scoped>
.product-manager {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left h1 { font-size: 1.8rem; font-weight: 700; color: #333; }
.header-left p { color: #666; }

.actions-bar {
  display: flex;
  justify-content: space-between; 
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.search-container {
    position: relative;
    display: flex;
    align-items: center;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    width: 300px;
    transition: all 0.2s;
}

.search-container:focus-within {
    border-color: #F37021;
    box-shadow: 0 0 0 3px rgba(243, 112, 33, 0.1);
}

.search-icon {
    color: #94a3b8;
    margin-right: 0.5rem;
}

.search-input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.95rem;
    color: #333;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
  gap: 1.5rem;
}

/* Compact Card */
.product-card-compact {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  transition: all 0.2s;
  height: 180px; 
}

.clickable-card {
    cursor: pointer;
}

.product-card-compact:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(243, 112, 33, 0.15); /* Orange Shadow */
  border-color: #F37021;
}

.card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.product-logo {
  max-height: 60px;
  max-width: 80%;
  object-fit: contain;
  margin-bottom: 1rem;
}

.product-card-compact h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hover Actions */
.card-actions-hover {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s;
}

.product-card-compact:hover .card-actions-hover {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f1f5f9;
  color: #64748b;
}
.action-btn:hover { background: #fee2e2; color: #ef4444; } /* Delete default red */
.action-btn.edit:hover { background: #fff7ed; color: #F37021; } /* Edit orange */


.loading-state { text-align: center; color: #F37021; padding: 2rem; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.empty-placeholder { grid-column: 1/-1; text-align: center; color: #777; padding: 2rem; }

/* Animations */
.fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
  transform: translateY(0);
  }
}

.card-content-link {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

/* Pagination */
.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
}

.page-btn {
    padding: 8px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #475569;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    border-color: #F37021;
    color: #F37021;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f1f5f9;
}

.page-info {
    font-size: 0.9rem;
    color: #475569;
    font-weight: 500;
}

.page-size-label {
    font-size: 0.9rem;
    color: #64748b;
    margin-right: 1rem;
}

.page-size-select {
    padding: 4px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    color: #333;
    cursor: pointer;
}

.btn-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f59e0b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-warning:hover { background-color: #d97706; }
</style>
```
