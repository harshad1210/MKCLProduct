<script setup>
import { ref, onMounted, computed } from 'vue'
import { Upload, Trash2, FileText, Globe, Video, ExternalLink, Loader2, Plus, Search } from 'lucide-vue-next'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue'

definePageMeta({ layout: 'admin' })

// --- Data ---
const uploading = ref(false)
const products = ref([]) 
const documents = ref([])
const loadingDocs = ref(false)
const currentUser = useCookie('user')

// Delete Modal State
const showDeleteModal = ref(false)
const documentToDelete = ref(null)

const form = ref({
    productId: '',
    type: 'Product Presentation',
    url: '',
    file: null,
    fileName: ''
})

const fileInput = ref(null)

const docTypes = [
    'Product Presentation', 
    'Product Proposal', 
    'Draft Agreement', 
    'Product website', 
    'Product Demo'
]

// --- Computed ---
const isUrlType = computed(() => {
    return ['Product website', 'Product Demo'].includes(form.value.type) 
})

const fileAcceptHtml = computed(() => {
    if(form.value.type === 'Product Presentation') return ".pptx, .ppt, .pdf"
    if(form.value.type === 'Product Proposal') return ".doc, .docx"
    if(form.value.type === 'Draft Agreement') return ".doc, .docx"
    return "*"
})

const helperText = computed(() => {
    if(form.value.type === 'Product Presentation') return "Allowed types: .pptx, .ppt, .pdf"
    if(form.value.type === 'Product Proposal') return "Allowed types: .doc, .docx"
    if(form.value.type === 'Draft Agreement') return "Allowed types: .doc, .docx"
    return "Enter valid URL"
})

// --- Actions ---

onMounted(async () => {
    // Load Products for Dropdown
    await fetchProducts()
    // Load All Documents
    fetchAllDocuments()
})

const fetchProducts = async () => {
    try {
        const { data } = await useFetch('/api/content') // Assuming this returns all products for now
        if (data.value && data.value.products) {
            products.value = data.value.products
        }
    } catch(e) { console.error(e) }
}

// --- Search & Pagination ---
    const searchQuery = ref('')

    // List State
    const itemsPerPage = 6
    const currentPage = ref(1)

    const filteredDocuments = computed(() => {
        if (!searchQuery.value) return documents.value
        const lower = searchQuery.value.toLowerCase()
        return documents.value.filter(doc => 
            doc.name.toLowerCase().includes(lower) || 
            (doc.product?.name && doc.product.name.toLowerCase().includes(lower)) ||
            doc.type.toLowerCase().includes(lower)
        )
    })

    watch(searchQuery, () => { currentPage.value = 1 })

    const totalPages = computed(() => Math.ceil(filteredDocuments.value.length / itemsPerPage))

    const paginatedDocuments = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage
        const end = start + itemsPerPage
        return filteredDocuments.value.slice(start, end)
    })

    const nextPage = () => {
        if(currentPage.value < totalPages.value) currentPage.value++
    }

    const prevPage = () => {
        if(currentPage.value > 1) currentPage.value--
    }

    // Refresh List
    const fetchAllDocuments = async () => {
        loadingDocs.value = true
        try {
            const res = await fetch(`/api/documents`)
            if (res.ok) {
                documents.value = await res.json()
                // Reset to page 1 on refresh/new upload to see latest
                currentPage.value = 1 
            }
        } catch(e) { console.error(e) }
        finally { loadingDocs.value = false }
    }

const handleFileChange = (e) => {
    const file = e.target.files[0]
    if(file) {
        form.value.file = file
        form.value.fileName = file.name
    }
}

const handleUpload = async () => {
    // Validation
    if(!form.value.productId) return alert("Please select a Product")
    if(isUrlType.value && !form.value.url) return alert("Please enter URL")
    if(!isUrlType.value && !form.value.file) return alert("Please select a file")

    uploading.value = true
    try {
        const formData = new FormData()
        formData.append('type', form.value.type)
        if(form.value.url) formData.append('url', form.value.url)
        if(form.value.file) {
             formData.append('documentFile', form.value.file)
        }
        formData.append('performedBy', currentUser.value?.username || 'unknown')

        const res = await fetch(`/api/products/${form.value.productId}/documents`, {
            method: 'POST',
            body: formData
        })

        if(res.ok) {
            alert("Uploaded Successfully")
            // Reset Form but keep product selected for convenience? Or reset all?
            form.value.file = null
            form.value.fileName = ''
            form.value.url = ''
            if(fileInput.value) fileInput.value.value = ''
            
            // Refresh List
            fetchAllDocuments()
        } else {
            alert("Upload Failed")
        }

    } catch(e) {
        console.error(e)
        alert("Server Error")
    } finally {
        uploading.value = false
    }
}

// Secure Delete Actions
const initiateDelete = (doc) => {
    documentToDelete.value = doc
    showDeleteModal.value = true
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    documentToDelete.value = null
}

const confirmDelete = async (password) => {
    if(!documentToDelete.value) return 
    
    // Add username for RBAC verification
    const bodyPayload = { 
        password,
        username: currentUser.value?.username 
    }

    try {
        const res = await fetch(`/api/documents/${documentToDelete.value.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
        })

        if(res.ok) {
             fetchAllDocuments()
             closeDeleteModal()
        } else {
             const err = await res.json()
             alert(err.error || "Delete failed")
        }
    } catch(e) {
        console.error(e)
        alert("Server Error")
    }
}

const getIcon = (type) => {
    if(type.includes('Presentation')) return FileText
    if(type.includes('Proposal') || type.includes('Agreement')) return FileText 
    if(type.includes('website')) return Globe
    if(type.includes('Demo')) return Video
    return FileText
}

</script>

<template>
  <div class="document-manager">
    <div class="header">
        <h1>Document Manager</h1>
        <p>Centralized hub for all product documents.</p>
    </div>

    <div class="content-wrapper fade-in-up">
        <!-- Upload Card -->
        <div class="upload-card">
            <div class="card-header">
                <h2><Upload size="20"/> Upload New Document</h2>
            </div>
            <div class="card-body">
                
                <!-- Product Select -->
                <div class="form-group">
                    <label>Select Product</label>
                    <div class="select-wrapper">
                         <select v-model="form.productId">
                            <option value="" disabled>Choose a product...</option>
                            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                        </select>
                    </div>
                </div>

                <!-- Type Select -->
                <div class="form-group">
                    <label>Document Type</label>
                    <div class="select-wrapper">
                        <select v-model="form.type">
                            <option v-for="t in docTypes" :key="t">{{t}}</option>
                        </select>
                    </div>
                </div>

                <!-- Dynamic Input -->
                <div class="form-group">
                    <label v-if="isUrlType">Website / Video URL</label>
                    <label v-else>Upload File</label>
                    
                    <div v-if="isUrlType" class="input-wrapper">
                        <input type="text" v-model="form.url" placeholder="https://..." />
                        <span class="helper-text">{{ helperText }}</span>
                    </div>

                    <div v-else class="file-upload-area" :class="{ 'has-file': form.file }">
                        <input type="file" ref="fileInput" @change="handleFileChange" :accept="fileAcceptHtml"/>
                        <div class="upload-placeholder">
                            <template v-if="form.file">
                                <FileText size="24" class="text-primary"/>
                                <span class="filename">{{ form.fileName }}</span>
                            </template>
                            <template v-else>
                                <Plus size="24" class="icon-grey"/>
                                <span class="text-secondary">Click to browse</span>
                                <small>{{ helperText }}</small>
                            </template>
                        </div>
                    </div>
                </div>

                 <div class="form-actions">
                    <button class="btn btn-primary full-width" @click="handleUpload" :disabled="uploading">
                        <Loader2 v-if="uploading" class="spin" />
                        <span v-else>Upload Document</span>
                    </button>
                </div>

            </div>
        </div>

        <!-- List Section -->
        <div class="list-section">
            <div class="list-header">
                <h2>Uploaded Documents ({{ filteredDocuments.length }})</h2>
                
                <div class="header-actions">
                    <div class="search-box">
                        <Search :size="16" class="search-icon"/>
                        <input v-model="searchQuery" placeholder="Search documents..." />
                    </div>
                    <button @click="fetchAllDocuments" class="refresh-btn" title="Refresh List"><Loader2 v-if="loadingDocs" class="spin"/><span v-else>Refresh</span></button>
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Uploaded Only</th>
                             <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="doc in paginatedDocuments" :key="doc.id">
                            <td><span class="badge product-badge" v-if="doc.product">{{ doc.product.name }}</span></td>
                            <td>
                                <div class="type-cell">
                                    <component :is="getIcon(doc.type)" size="16" class="type-icon"/>
                                    {{ doc.type }}
                                </div>
                            </td>
                            <td>
                                <a :href="doc.url" target="_blank" class="doc-link">
                                    {{ doc.name }} 
                                    <ExternalLink size="12"/>
                                </a>
                            </td>
                             <td>{{ doc.uploadedBy || 'Admin' }}</td>
                             <td>
                                 <button
                                   v-if="doc.uploadedBy === currentUser?.username" 
                                   @click="initiateDelete(doc)" 
                                   class="action-btn delete" 
                                   title="Delete"
                                 >
                                     <Trash2 size="16"/>
                                 </button>
                             </td>
                        </tr>
                        <tr v-if="documents.length === 0">
                            <td colspan="5" class="empty-state">No documents found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
             <!-- Pagination Controls -->
            <div class="pagination-controls" v-if="totalPages > 1">
                <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">Previous</button>
                <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
                <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
            </div>
        </div>
    </div>

    <!-- Delete Modal -->
    <DeleteConfirmationModal 
        :isOpen="showDeleteModal"
        :productName="documentToDelete?.name"
        @close="closeDeleteModal"
        @confirm="confirmDelete"
    />

  </div>
</template>

<style scoped>
.document-manager {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Inter', sans-serif;
}

.header { margin-bottom: 2rem; }
.header h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
.header p { color: #64748b; font-size: 1rem; }

/* Upload Card styling */
.upload-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    margin-bottom: 3rem;
    overflow: hidden;
}

.card-header {
    background: #fff7ed; /* Light Orange Tint */
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #fed7aa;
}

.card-header h2 {
    margin: 0;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #c2410c; /* Dark Orange */
    font-weight: 600;
}

.card-body { padding: 2rem; }

.form-group { margin-bottom: 1.5rem; }
.form-group label { 
    display: block; 
    margin-bottom: 0.5rem; 
    font-weight: 500; 
    color: #334155; 
    font-size: 0.95rem;
}

/* Inputs & Selects */
select, input[type="text"] {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 0.95rem;
    background-color: #f8fafc;
    transition: all 0.2s;
    color: #334155;
}

select:focus, input[type="text"]:focus {
    outline: none;
    border-color: #F37021;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(243, 112, 33, 0.1);
}

.select-wrapper { position: relative; } /* Could add custom arrow here */

.helper-text { 
    font-size: 0.85rem; 
    color: #64748b; 
    margin-top: 5px; 
    display: block; 
}

/* File Upload Area */
.file-upload-area {
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    background-color: #f8fafc;
    transition: all 0.2s;
    position: relative;
}

.file-upload-area:hover {
    border-color: #F37021;
    background-color: #fff7ed;
}

.file-upload-area input[type="file"] {
    position: absolute;
    top: 0; 
    left: 0;
    width: 100%; 
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    pointer-events: none; /* Let clicks pass to input */
}

.upload-placeholder .icon-grey { color: #94a3b8; }
.text-secondary { font-weight: 500; color: #475569; }
.upload-placeholder small { color: #94a3b8; }

.has-file {
    border-color: #F37021;
    background-color: #fff7ed;
}

.filename {
    color: #c2410c;
    font-weight: 600;
}

.form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }

.full-width { width: 100%; justify-content: center; padding: 12px; font-size: 1rem; }

/* List Section */
.list-section { margin-top: 2rem; }
.list-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 1.5rem; 
}
.list-header h2 { font-size: 1.5rem; color: #1e293b; margin: 0; }

.header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.search-box {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 12px;
    width: 250px;
    transition: all 0.2s;
}
.search-box:focus-within { border-color: #F37021; box-shadow: 0 0 0 2px rgba(243, 112, 33, 0.1); }
.search-box input { border: none; outline: none; width: 100%; font-size: 0.95rem; color: #334155; margin-left: 8px; }
.search-box .search-icon { color: #94a3b8; }

.table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

table { width: 100%; border-collapse: collapse; }

th, td { 
    padding: 1rem 1.5rem; 
    text-align: left; 
    border-bottom: 1px solid #e2e8f0; 
    color: #334155;
}

th { 
    background: #f8fafc; 
    font-weight: 600; 
    color: #64748b; 
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
}

tr:hover { background-color: #fffaf0; }

/* Badges & Icons */
.badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
}

.product-badge {
    background-color: #e0f2fe;
    color: #0284c7;
}

.type-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.type-icon { color: #64748b; }

.doc-link {
    color: #F37021; 
    font-weight: 500; 
    display: inline-flex; 
    align-items: center; 
    gap: 6px;
    transition: color 0.2s;
}
.doc-link:hover { color: #c2410c; text-decoration: underline; }

.action-btn {
    width: 32px; height: 32px;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    border: none; background: transparent;
    color: #64748b;
    transition: all 0.2s;
}
.action-btn:hover { background: #fee2e2; color: #ef4444; }

.refresh-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 16px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 6px;
    color: #64748b;
    font-weight: 500;
    transition: all 0.2s;
}
.refresh-btn:hover {
    border-color: #F37021;
    color: #F37021;
    background: #fff7ed;
}

/* Animations */
.fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.empty-state { text-align: center; color: #94a3b8; padding: 3rem; }

/* Pagination */
.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
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

/* Responsive */
@media (max-width: 768px) {
    .document-manager { padding: 1rem; }
    .card-body { padding: 1.5rem; }
}
</style>
