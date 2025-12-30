<script setup>
import { ref, onMounted, computed } from 'vue'
import { ArrowLeft, Upload, Trash2, Edit2, FileText, Download, Search } from 'lucide-vue-next'
import ProductFormModal from '@/components/ProductFormModal.vue'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const productId = route.params.id
const currentUser = useCookie('user')

const product = ref(null)
const loading = ref(false)
const uploading = ref(false)
const showEditModal = ref(false)

// Document Form
const docTypes = ['Product Presentation', 'Product Proposal', 'Draft Agreement', 'Product website', 'Product Demo']
const newDoc = ref({
  type: 'Product Presentation',
  file: null,
  url: ''
})
const fileInput = ref(null)

// Delete Modal
const showDeleteModal = ref(false)
const itemToDelete = ref(null)

// --- Fetching ---
const fetchProduct = async () => {
    loading.value = true
    try {
        // Use $fetch instead of useFetch to avoid caching issues after mount
        // Add timestamp to ensure fresh data
        const data = await $fetch(`/api/products?t=${new Date().getTime()}`)
        if(data) {
            product.value = data.find(p => p.id === parseInt(productId))
        }
    } catch(e) { console.error(e) }
    finally { loading.value = false }
}

onMounted(() => {
    fetchProduct()
})

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
}

// --- Actions ---
const handleFileSelect = (e) => {
    if (e.target.files[0]) newDoc.value.file = e.target.files[0]
}

const uploadDocument = async () => {
    if (!newDoc.value.type) return alert("Select Document Type")
    const isUrlType = ['Product website', 'Product Demo'].includes(newDoc.value.type)
    
    if (isUrlType) {
        if (!newDoc.value.url) return alert("Enter URL")
    } else {
        if (!newDoc.value.file) return alert("Select File")
        
        // Client-Side Extension Validation
        const ext = newDoc.value.file.name.split('.').pop().toLowerCase()
        const type = newDoc.value.type
        let valid = false
        
        if (type === 'Product Presentation') {
             if (['ppt', 'pptx', 'pdf'].includes(ext)) valid = true
        } else if (['Product Proposal', 'Draft Agreement'].includes(type)) {
             if (['doc', 'docx'].includes(ext)) valid = true
        }

        if (!valid) {
            return alert(`Invalid file type for ${type}.\n\nAllowed: ${type === 'Product Presentation' ? 'PPTX, PPT, PDF' : 'DOC, DOCX'}`)
        }
    }

    uploading.value = true
    try {
        const formData = new FormData()
        formData.append('type', newDoc.value.type)
        if (newDoc.value.url) formData.append('url', newDoc.value.url)
        if (newDoc.value.file) formData.append('documentFile', newDoc.value.file)
        const name = newDoc.value.file ? newDoc.value.file.name : newDoc.value.type
        formData.append('name', name)
        formData.append('performedBy', currentUser.value?.username || 'unknown')

        const res = await fetch(`/api/products/${productId}/documents`, { method: 'POST', body: formData })
        if (res.ok) {
            const uploadedDoc = await res.json()
            alert("Uploaded successfully!")
            
            // Update local state directly
            if (product.value) {
                if (!product.value.documents) product.value.documents = []
                product.value.documents.push(uploadedDoc)
            }
            
            // Clear form
            newDoc.value = { type: 'Product Presentation', file: null, url: '' }
            if (fileInput.value) fileInput.value.value = ''
            
            // Re-fetch in background to ensure consistency
            fetchProduct()
        } else {
            const err = await res.json()
            alert(err.statusMessage || "Upload failed")
        }
    } catch(e) { 
        console.error(e)
        alert("Upload error: " + e.message)
    }
    finally { uploading.value = false }
}

// Delete Logic
const initiateDelete = (item, type = 'document') => {
    itemToDelete.value = { ...item, type }
    showDeleteModal.value = true
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    itemToDelete.value = null
}

const confirmDelete = async (password) => {
    if(!itemToDelete.value) return 
    try {
        const endpoint = itemToDelete.value.type === 'document' 
            ? `/api/documents/${itemToDelete.value.id}`
            : `/api/products/${itemToDelete.value.id}`
        
        const res = await fetch(endpoint, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                password,
                username: currentUser.value?.username 
            })
        })

        if(res.ok) {
             if(itemToDelete.value.type === 'product') {
                 router.push('/admin/products')
             } else {
                 await fetchProduct()
             }
             closeDeleteModal()
        } else {
             const err = await res.json()
             alert(err.statusMessage || "Delete failed")
        }
    } catch(e) { console.error(e) }
}
    // Download Tracking
    const trackDownload = async (doc) => {
        try {
            await fetch(`/api/documents/${doc.id}/track`, { 
                method: 'POST',
                body: JSON.stringify({ performedBy: currentUser.value?.username || 'Guest' }) 
            })
            // Refetch to show updated count
            await fetchProduct()
        } catch (e) {
            console.error('Track download failed', e)
        }
    }

// --- Document Pagination & Search ---
const docSearchQuery = ref('')
const docCurrentPage = ref(1)
const docItemsPerPage = 6

const filteredDocuments = computed(() => {
    const docs = product.value?.documents || []
    if (!docSearchQuery.value) return docs
    const lower = docSearchQuery.value.toLowerCase()
    return docs.filter(d => 
        d.name.toLowerCase().includes(lower) || 
        d.type.toLowerCase().includes(lower)
    )
})

const docTotalPages = computed(() => Math.ceil(filteredDocuments.value.length / docItemsPerPage))

const paginatedDocuments = computed(() => {
    const start = (docCurrentPage.value - 1) * docItemsPerPage
    const end = start + docItemsPerPage
    return filteredDocuments.value.slice(start, end)
})

const nextDocPage = () => { if (docCurrentPage.value < docTotalPages.value) docCurrentPage.value++ }
const prevDocPage = () => { if (docCurrentPage.value > 1) docCurrentPage.value-- }

watch(docSearchQuery, () => { docCurrentPage.value = 1 })

const ensureUrl = (url) => {
    if (!url) return '#'
    if (/^https?:\/\//i.test(url) || url.startsWith('/')) return url
    return 'https://' + url
}
</script>

<template>
  <div class="product-page">
    <div v-if="loading && !product" class="loading">Loading...</div>
    
    <div v-else-if="product" class="content"> 
      <!-- Header: Logo & Name -->
      <div class="header-section">
          <div class="page-title-box">Product Page</div>
          <div class="logo-box">
              <img :src="product.logoUrl || product.logo || 'https://placehold.co/150'" alt="Product Logo" class="main-logo" />
          </div>
          <h1 class="product-title">{{ product.name }}</h1>
      </div>

      <!-- TABLE 1: Product Info -->
      <div class="section-table">
          <table>
              <thead>
                  <tr>
                      <th>Product Name</th>
                      <th>Description</th>
                      <th>Logo URL</th>
                      <th>Product website URL</th>
                      <th>Delete</th>
                      <th>Edit</th>
                      <th>Uploaded / Modified By</th>
                      <th>Date and Time</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>{{ product.name }}</td>
                      <td>{{ product.description }}</td>
                      <td class="truncate" :title="product.logoUrl">{{ product.logoUrl || '-' }}</td>
                      <td><a :href="ensureUrl(product.url)" target="_blank">{{ product.url || '-' }}</a></td>
                      <td><button v-if="currentUser?.role === 'ADMIN'" @click="initiateDelete(product, 'product')" class="icon-btn danger"><Trash2 :size="16"/></button></td>
                      <td><button @click="showEditModal = true" class="icon-btn"><Edit2 :size="16"/></button></td>
                      <td>{{ product.user?.username || 'Admin' }}</td>
                      <td>{{ formatDate(product.updatedAt) }}</td>
                  </tr>
              </tbody>
          </table>
      </div>

      <!-- UPLOAD SECTION -->
      <div class="upload-section">
          <div class="upload-row">
              <label>Upload Document</label>
              <div class="input-group">
                  <span class="label-sm">Select Document Type</span>
                  <select v-model="newDoc.type">
                      <option v-for="t in docTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
              </div>
          </div>
          
          <div class="upload-row">
              <label></label>
              <div class="input-group">
                   <template v-if="['Product website', 'Product Demo'].includes(newDoc.type)">
                       <input v-model="newDoc.url" type="text" placeholder="Enter URL here" class="text-input" />
                       <span class="helper-text">Enter valid {{ newDoc.type.includes('Video') ? 'Video' : 'Website' }} URL</span>
                   </template>
                   <template v-else>
                       <input 
                            type="file" 
                            ref="fileInput" 
                            @change="handleFileSelect" 
                            class="file-input" 
                            :accept="newDoc.type === 'Product Presentation' ? '.pptx, .ppt, .pdf' : '.doc, .docx'"
                        />
                        <span class="helper-text" v-if="newDoc.type === 'Product Presentation'">Allowed: PPTX, PPT, PDF</span>
                        <span class="helper-text" v-else>Allowed: DOC, DOCX</span>
                   </template>
                   
                   <button @click="uploadDocument" :disabled="uploading" class="upload-btn">
                       <Upload :size="16"/> {{ uploading ? 'Uploading...' : 'Browse/ Upload' }}
                   </button>
              </div>
          </div>
      </div>

      <!-- TABLE 2: Documents List -->
      <div class="section-table-wrapper">
          <div class="table-header-actions">
               <h3>Product Documents</h3>
               <div class="search-sm">
                   <Search :size="14" class="search-icon"/>
                   <input v-model="docSearchQuery" placeholder="Search docs..." />
               </div>
          </div>
          
          <div class="section-table">
              <table>
                  <thead>
                      <tr>
                          <th>Sr. No.</th>
                          <th>Document Type</th>
                          <th>Name of Upload file (Click to Download)</th>
                          <th>Delete</th>
                          <th>Uploaded/ Modified By</th>
                          <th>Date and Time</th>
                          <th>Download Count</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(doc, index) in paginatedDocuments" :key="doc.id">
                          <td>{{ (docCurrentPage - 1) * docItemsPerPage + index + 1 }}</td>
                          <td>{{ doc.type }}</td>
                          <td><a :href="ensureUrl(doc.url)" target="_blank" class="download-link" @click="trackDownload(doc)">{{ doc.name }}</a></td>
                          <td><button @click="initiateDelete(doc, 'document')" class="icon-btn danger"><Trash2 :size="16"/></button></td>
                          <td>{{ doc.uploadedBy || 'Admin' }}</td>
                          <td>{{ formatDate(doc.createdAt) }}</td>
                          <td>{{ doc.downloadCount || 0 }}</td>
                      </tr>
                      <tr v-if="filteredDocuments.length === 0">
                          <td colspan="7" class="text-center">No documents found.</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          <!-- Doc Pagination -->
          <div class="pagination-controls" v-if="filteredDocuments.length > 0">
               <button class="page-btn sm" @click="prevDocPage" :disabled="docCurrentPage === 1">Prev</button>
               <span class="page-info sm">Page {{ docCurrentPage }} of {{ docTotalPages }}</span>
               <button class="page-btn sm" @click="nextDocPage" :disabled="docCurrentPage === docTotalPages">Next</button>
          </div>
      </div>

      <ProductFormModal 
        :isOpen="showEditModal" 
        :editData="product" 
        @close="showEditModal = false" 
        @refresh="fetchProduct" 
      />

       <DeleteConfirmationModal
           :isOpen="showDeleteModal"
           :productName="itemToDelete?.name"
           @close="closeDeleteModal"
           @confirm="confirmDelete"
       />

    </div>
    <div v-else class="not-found">Product not found</div>
  </div>
</template>


<style scoped>
/* MKCL Orange Theme for Product Page */
.product-page {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #333;
}

.header-section {
    text-align: center;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
}

.page-title-box {
    text-transform: uppercase;
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 1px;
    border-bottom: 2px solid #F37021;
    padding-bottom: 0.25rem;
}

.logo-box {
    width: 200px;
    height: 120px;
    padding: 1rem;
    background: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
}
.main-logo { max-width: 100%; max-height: 100%; object-fit: contain; }

.product-title {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
}

/* Modern Tables */
.section-table {
    margin-bottom: 2.5rem;
    overflow-x: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
}
table { width: 100%; border-collapse: collapse; }
th, td { 
    padding: 1rem 1.5rem; 
    text-align: left; 
    border-bottom: 1px solid #e2e8f0;
}
th { 
    background-color: #F37021; /* MKCL Orange */
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;
}
td { 
    color: #475569; 
    font-size: 0.95rem;
    vertical-align: middle;
    text-align: center; 
}
tr:last-child td { border-bottom: none; }
tr:hover { background-color: #FFF0E6; } /* Light Orange Hover */

/* Buttons */
.icon-btn { 
    border: 1px solid #e2e8f0; 
    background: white; 
    cursor: pointer; 
    color: #64748b; 
    padding: 6px; 
    border-radius: 6px; 
    transition: all 0.2s;
}
.icon-btn:hover { background: #F37021; color: white; border-color: #F37021; }
.icon-btn.danger:hover { background: #ef4444; color: white; border-color: #ef4444; }

.download-link { 
    color: #F37021; 
    font-weight: 600; 
    text-decoration: none; 
}
.download-link:hover { text-decoration: underline; color: #d65a0e; }

/* Upload Section */
.upload-section { 
    margin: 2.5rem 0; 
    padding: 2rem; 
    background: #FFF8F3; /* Very Light Orange tint */
    border: 1px dashed #F37021; 
    border-radius: 12px;
}
.upload-row { display: flex; align-items: center; gap: 2rem; margin-bottom: 1.5rem; }
.upload-row:last-child { margin-bottom: 0; }
.upload-row label { width: 180px; font-weight: 600; text-align: right; color: #334155; }
.input-group { display: flex; align-items: center; gap: 1rem; flex: 1; }
.label-sm { font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase;}

select, .text-input { 
    padding: 0.6rem 1rem; 
    border: 1px solid #cbd5e1; 
    border-radius: 6px; 
    min-width: 300px;
    outline: none;
    transition: border-color 0.2s;
}
select:focus, .text-input:focus { border-color: #F37021; ring: 2px solid #ffd6bc; }

.upload-btn { 
    padding: 0.6rem 1.5rem; 
    background: #F37021; 
    color: white;
    border: none; 
    font-weight: 600; 
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    border-radius: 6px;
    transition: background 0.2s;
}
.upload-btn:hover { background: #d65a0e; }
.upload-btn:disabled { background: #cbd5e1; cursor: not-allowed; }

.truncate { 
    max-width: 200px; 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
    display: block; 
    margin: 0 auto;
}
.text-center { text-align: center; }

/* Table Actions & Pagination */
.table-header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}
.table-header-actions h3 { font-size: 1.2rem; color: #334155; margin: 0; }

.search-sm {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 4px 8px;
    width: 200px;
}
.search-sm input { border: none; outline: none; width: 100%; font-size: 0.9rem; padding-left: 5px; }
.search-sm .search-icon { color: #94a3b8; }
.search-sm:focus-within { border-color: #F37021; }

.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}
.page-btn.sm { padding: 4px 12px; font-size: 0.85rem; }
.page-info.sm { font-size: 0.85rem; }

.page-btn {
    background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; color: #475569;
}
.page-btn:hover:not(:disabled) { border-color: #F37021; color: #F37021; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

</style>
