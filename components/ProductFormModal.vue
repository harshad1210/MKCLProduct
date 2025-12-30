<script setup>
import { ref, watch, computed } from 'vue'
import { X, UploadCloud, Loader2, FileText, Globe, Video, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-vue-next'
import DeleteConfirmationModal from './DeleteConfirmationModal.vue'

const props = defineProps({
  isOpen: Boolean,
  editData: Object // Null for new, Product Object for edit
})

const emit = defineEmits(['close', 'refresh'])

const isEditing = computed(() => !!props.editData)
const currentStep = ref(1)
const submitting = ref(false)

// Form Data
const formData = ref({
  id: null,
  name: '',
  description: '',
  url: '',
  logo: null
})

// Documents Data
const documents = ref([])
const newDoc = ref({ type: 'Product Presentation', name: '', url: '', file: null })
const docTypes = ['Product Presentation', 'Product Proposal', 'Draft Agreement', 'Product website', 'Product Demo']

const logoPreview = ref(null)
const docFileInput = ref(null)

// Delete Modal State
const showDeleteModal = ref(false)
const documentToDelete = ref(null)

// --- Watchers to Init/Reset ---
watch(() => props.isOpen, (val) => {
  if (val) {
    if (props.editData) {
      // Edit Mode
      currentStep.value = 1
      formData.value = {
        id: props.editData.id,
        name: props.editData.name,
        description: props.editData.description,
        url: props.editData.url || '',
        logo: null
      }
      logoPreview.value = props.editData.logoUrl || props.editData.logo // Handle logoUrl naming
      documents.value = props.editData.documents || []
    } else {
      // Add Mode
      resetForm()
    }
  } else {
    resetForm()
  }
})

const resetForm = () => {
  currentStep.value = 1
  formData.value = { id: null, name: '', description: '', url: '', logo: null }
  logoPreview.value = null
  documents.value = []
  resetDocForm()
}

const resetDocForm = () => {
  newDoc.value = { type: 'Product Presentation', name: '', url: '', file: null }
  if (docFileInput.value) docFileInput.value.value = ''
}

const closeModal = () => {
  emit('close')
}

// --- Steps Navigation ---
const nextStep = () => {
  // Validate Step 1
  if (!formData.value.name || !formData.value.description || !formData.value.url) {
      alert("All fields are mandatory (Name, Description, URL)")
      return
  }
  
  // Save Product immediately to proceed to docs
  saveProductInfo(true)
}

const skipStep = () => {
    closeModal()
}

// --- Info Operations ---
// --- User Context ---
const currentUser = useCookie('user')

// --- Info Operations ---
const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.value.logo = file
    const reader = new FileReader()
    reader.onload = (e) => logoPreview.value = e.target.result
    reader.readAsDataURL(file)
  }
}

const saveProductInfo = async (goToNext = false) => {
  submitting.value = true
  try {
    const data = new FormData()
    data.append('name', formData.value.name)
    data.append('description', formData.value.description)
    data.append('url', formData.value.url)
    data.append('performedBy', currentUser.value?.username || 'unknown') // Audit Context
    if (formData.value.logo) data.append('logoFile', formData.value.logo)

    let url = `/api/products`
    let method = 'POST'
    if (formData.value.id) {
      url = `/api/products/${formData.value.id}` // Ensure this endpoint supports PUT/POST update
      method = 'PUT' 
    }

    // Nuxt 3 useFetch/fetch wrapper might be better, but native fetch works fine with FormData
    // useFetch doesn't handle FormData perfectly without tweaks, so standard fetch is safe here.
    const response = await fetch(url, { method, body: data })
    if (response.ok) {
      const savedProduct = await response.json()
      formData.value.id = savedProduct.id // Store ID for doc uploads
      
      emit('refresh') // Notify parent to refresh list

      if (goToNext) {
        currentStep.value = 2
        // Refresh docs if editing existing, though usually docs are loaded from prop.
        // But if we just created a NEW product, documents array is empty.
         if(savedProduct.documents) documents.value = savedProduct.documents
      } else {
        closeModal()
      }
    } else {
      alert('Failed to save product info')
    }
  } catch (error) {
    console.error('Error saving product:', error)
    alert('An error occurred while communicating with the server.')
  } finally {
    submitting.value = false
  }
}

// --- Document Operations ---
const handleDocUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    newDoc.value.file = file
    newDoc.value.name = file.name 
  }
}

const submitDocument = async () => {
    console.log("submitDocument clicked", newDoc.value)
    if (!newDoc.value.type) return alert("Select type")
    
    const isUrlType = ['Product website', 'Product Demo'].includes(newDoc.value.type)
    if (isUrlType && !newDoc.value.url) return alert("Enter URL")
    if (!isUrlType && !newDoc.value.file) return alert("Upload File")

    await addDocument(true) 
}

    const addDocument = async (closeAfter = false) => {
      console.log("addDocument called", { newDoc: newDoc.value, closeAfter })
      submitting.value = true
      try {
        const data = new FormData()
        data.append('type', newDoc.value.type)
        if (newDoc.value.url) data.append('url', newDoc.value.url) 
        data.append('performedBy', currentUser.value?.username || 'unknown') // Audit Context
        
        if (newDoc.value.file) {
            data.append('documentFile', newDoc.value.file)
            data.append('name', newDoc.value.name || newDoc.value.file.name) 
        } else {
             data.append('name', newDoc.value.name || newDoc.value.type)
        }
    
        const response = await fetch(`/api/products/${formData.value.id}/documents`, {
          method: 'POST',
          body: data
        })
    
    
        if (response.ok) {
            // Success Alert (Blocking)
            alert("Uploaded successfully!")

            await refreshLocalProduct()
            emit('refresh')
    
            if (closeAfter) {
                closeModal()
            } else {
                resetDocForm()
            }
        } else {
            console.error("Response not OK", response.status, response.statusText)
            const err = await response.json()
            console.error("Error payload", err)
            alert(err.statusMessage || "Upload failed (Check Console)")
        }
      } catch (error) {
        console.error("Doc upload exception", error)
        alert("Exception: " + error.message)
      } finally {
        submitting.value = false
      }
    }
    
    // Secure Delete Logic
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
        try {
            const response = await fetch(`/api/documents/${documentToDelete.value.id}`, { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    password,
                    username: currentUser.value?.username // Send current user for pwd verification
                })
            })
        
        if(response.ok) {
            await refreshLocalProduct()
            emit('refresh')
            closeDeleteModal()
        } else {
             const err = await response.json()
             alert(err.error || "Delete failed")
        }
    } catch (e) { console.error(e) }
}

const refreshLocalProduct = async () => {
    if(!formData.value.id) return
    try {
        // Add timestamp to prevent caching
        const res = await fetch(`/api/products?t=${new Date().getTime()}`)
        if (res.ok) {
            const all = await res.json()
            // Use loose comparison just in case (though both should be numbers)
            const p = all.find(x => x.id == formData.value.id)
            if(p) {
                documents.value = p.documents
                console.log('Documents refreshed:', p.documents)
            } else {
                console.warn('Product not found in refresh list', formData.value.id)
            }
        }
    } catch(e) { console.error(e) }
}
</script>

<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            {{ isEditing ? 'Edit Product' : 'New Product Page' }}
            <span class="step-indicator" v-if="!isEditing">Step {{ currentStep }}/2</span>
          </h2>
          <button @click="closeModal" class="close-btn"><X size="24" /></button>
        </div>
        
        <!-- STEP 1: Info -->
        <div v-if="currentStep === 1" class="step-content">
            <div class="form-group">
                <label>Product Name</label>
                <input v-model="formData.name" type="text" placeholder="Enter Product Name" />
            </div>
             <div class="form-group">
                <label>Description</label>
                <textarea v-model="formData.description" rows="3" placeholder="Enter Description"></textarea>
            </div>
             <div class="form-group">
                <label>Logo URL (Upload below) </label>
                <div class="file-upload compact" :class="{ 'has-file': logoPreview }">
                  <input type="file" @change="handleLogoUpload" accept="image/*" />
                  <div class="placeholder" v-if="!logoPreview"><UploadCloud size="20"/> Select Logo File</div>
                  <img v-else :src="logoPreview" class="preview-mini" />
                </div>
            </div>
             <div class="form-group">
                <label>Product website URL</label>
                <input v-model="formData.url" type="text" placeholder="Enter Website URL" />
            </div>
            <div class="alert-text">* All Fields are Mandatory</div>
        </div>

        <!-- STEP 2: Documents -->
        <div v-if="currentStep === 2" class="step-content">
            <div class="docs-section">
                <!-- Add New Doc -->
                <div class="add-doc-box">
                    <h4>Upload Document</h4>
                     <div class="doc-form-stack">
                        <label>Select Document Type</label>
                        <select v-model="newDoc.type">
                            <option v-for="t in docTypes" :key="t">{{t}}</option>
                        </select>
                        
                        <label>Upload Document</label>
                        <!-- Dynamic Input based on type -->
                        <input 
                            v-if="['Product website', 'Product Demo'].includes(newDoc.type)" 
                            v-model="newDoc.url" 
                            type="text" 
                            placeholder="Enter URL" 
                            class="full-width-input"
                        />
                        <div v-else class="file-input-wrapper full-width-input">
                             <input type="file" ref="docFileInput" @change="handleDocUpload" style="padding: 10px; border: 1px solid #ccc; width: 100%; border-radius: 4px;" />
                        </div>
                     </div>
                </div>

                 <div class="docs-list-mini">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="doc in documents" :key="doc.id">
                                <td>{{ doc.type }}</td>
                                <td class="truncate" :title="doc.name">{{ doc.name }}</td>
                                <td>
                                    <button @click="initiateDelete(doc)" class="text-danger"><Trash2 size="14"/></button>
                                </td>
                            </tr>
                             <tr v-if="documents.length === 0"><td colspan="3" class="text-center">No documents yet.</td></tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
             <!-- Step 1 Footer -->
             <template v-if="currentStep === 1">
                 <div v-if="isEditing" class="flex-buttons" style="display:flex; width:100%; gap:10px;">
                    <button @click="nextStep" class="btn btn-secondary btn-half" :disabled="submitting">
                        Manage Docs
                    </button>
                    <button @click="saveProductInfo(false)" class="btn btn-primary btn-half" :disabled="submitting">
                        {{ submitting ? 'Saving...' : 'Save Changes' }}
                    </button>
                 </div>
                 <button v-else @click="nextStep" class="btn btn-primary btn-block" :disabled="submitting">
                     {{ submitting ? 'Saving...' : 'Submit & Next' }}
                 </button>
             </template>

             <!-- Step 2 Footer -->
             <template v-if="currentStep === 2">
                  <button @click="skipStep" class="btn btn-secondary btn-half">Skip</button>
                  <button @click="submitDocument" class="btn btn-primary btn-half" :disabled="submitting">
                      {{ submitting ? 'Uploading...' : 'Submit' }}
                  </button>
             </template>
        </div>
        
        <!-- Nested specific Delete Modal -->
         <DeleteConfirmationModal
            :isOpen="showDeleteModal"
            :productName="documentToDelete?.name"
            @close="closeDeleteModal"
            @confirm="confirmDelete"
        />

      </div>
    </div>
</template>

<style scoped>
/* Modal Styles Copied & Scoped */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1rem 1.5rem;
  background: #e0f2fe; 
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 { font-size: 1.1rem; font-weight: 600; color: #0284c7; }
.step-indicator { font-size: 0.9rem; color: #555; margin-left: 10px; }
.close-btn { border:none; background:none; cursor:pointer;}

.step-content {
    padding: 1.5rem;
    overflow-y: auto;
}

.modal-footer {
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    background: #f8fafc;
    border-radius: 0 0 12px 12px;
}

/* Forms */
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 500; font-size: 0.9rem; margin-bottom: 0.3rem; }
.form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }

.file-upload.compact {
    border: 1px dashed #ddd;
    padding: 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 60px;
    background: #f9fafb;
}
.file-upload input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;}
.preview-mini { height: 100%; object-fit: contain; }
.placeholder { display: flex; gap:5px; color: #777; font-size: 0.9rem; }

.alert-text { color: red; font-size: 0.85rem; margin-top: 5px; }

/* Docs Form Stack */
.doc-form-stack { display: flex; flex-direction: column; gap: 10px; }
.doc-form-stack select { padding: 10px; border-radius: 4px; border: 1px solid #ccc; width: 100%;}
.full-width-input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;}

.btn { padding: 10px 20px; border-radius: 6px; font-weight: 600; border: none; cursor: pointer; text-align: center;}
.btn-primary { background: #2563eb; color: white; } /* Hardcoded blue */
.btn-primary:hover { background: #1d4ed8; }
.btn-secondary { background: #f1f5f9; color: #333; border: 1px solid #ccc;}
.btn-block { width: 100%; }
.btn-half { width: 48%; }

/* Mini List */
.docs-list-mini { margin-top: 1rem; border-top: 1px solid #eee; padding-top: 1rem;}
.docs-list-mini table { width: 100%; border-collapse: collapse; font-size: 0.85rem;}
.docs-list-mini th, .docs-list-mini td { padding: 5px; text-align: left; border-bottom: 1px solid #eee;}
.text-danger { color: #dc2626; border: none; background: none; cursor:pointer;}
</style>
