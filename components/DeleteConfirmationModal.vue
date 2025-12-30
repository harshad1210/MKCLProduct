<script setup>
import { ref, watch } from 'vue'
import { AlertTriangle, Lock, X } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  productName: String
})

const emit = defineEmits(['close', 'confirm'])

const step = ref(1) // 1: Warning, 2: Password
const password = ref('')
const error = ref('')

watch(() => props.isOpen, (val) => {
    if(val) reset()
})

const nextStep = () => {
  step.value = 2
}

const confirmDelete = () => {
  if (!password.value) {
    error.value = 'Password is required'
    return
  }
  emit('confirm', password.value)
}

const reset = () => {
  step.value = 1
  password.value = ''
  error.value = ''
}

const close = () => {
  reset()
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      
      <!-- Header -->
      <div class="modal-header" :class="{ 'warning-bg': step === 1, 'danger-bg': step === 2 }">
        <h3 v-if="step === 1"><AlertTriangle size="20" /> Confirm Deletion</h3>
        <h3 v-else><Lock size="20" /> Authentication Required</h3>
        <button @click="close" class="close-btn"><X size="20" /></button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        
        <!-- Step 1: Warning -->
        <div v-if="step === 1" class="text-center">
            <p>Do you want to delete <strong>{{ productName }}</strong> permanently?</p>
            <p class="sub-text">All information and documents related to this product will be removed from the database.</p>
            <p class="question">Do you want to proceed?</p>
        </div>

        <!-- Step 2: Password -->
        <div v-if="step === 2">
            <p class="instruction">Please enter your admin password to confirm deletion.</p>
            <div class="input-group">
                <input 
                    type="password" 
                    v-model="password" 
                    placeholder="Enter Admin Password" 
                    @keyup.enter="confirmDelete"
                    class="password-input"
                />
            </div>
            <p v-if="error" class="error-msg">{{ error }}</p>
        </div>

      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <div v-if="step === 1" class="buttons">
             <button @click="close" class="btn btn-secondary">No, Cancel</button>
             <button @click="nextStep" class="btn btn-danger">Yes, I understand</button>
        </div>
        <div v-if="step === 2" class="buttons">
             <button @click="step = 1" class="btn btn-secondary">Back</button>
             <button @click="confirmDelete" class="btn btn-danger">Confirm Delete</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1100; /* Higher than other modals */
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}
.warning-bg { background: #f59e0b; }
.danger-bg { background: #dc2626; }

.modal-header h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    font-weight: 600;
}
.close-btn { background: none; border: none; color: white; cursor: pointer; }

.modal-body { padding: 1.5rem; }

.text-center { text-align: center; }
.sub-text { font-size: 0.9rem; color: #666; margin: 10px 0; }
.question { font-weight: 600; margin-top: 15px; }

.instruction { margin-bottom: 10px; font-weight: 500; }
.password-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
.error-msg { color: #dc2626; font-size: 0.85rem; margin-top: 5px; }

.modal-footer {
    padding: 1rem 1.5rem;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
}

.buttons { display: flex; gap: 10px; justify-content: flex-end; }
.btn { padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; border: none; }
.btn-secondary { background: #e5e7eb; color: #374151; }
.btn-secondary:hover { background: #d1d5db; }
.btn-danger { background: #dc2626; color: white; }
.btn-danger:hover { background: #b91c1c; }
</style>
