<script setup>
import { ref, watch, computed } from 'vue'
import { Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  editMode: Boolean,
  userData: {
    type: Object,
    default: () => ({})
  },
  currentUserRole: String
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  employeeName: '',
  mobileNumber: '',
  email: '',
  username: '',
  password: '',
  role: 'SPC'
})

const showPassword = ref(false)
const errors = ref({})

// Populate form on edit
// Populate form on edit or reset on open
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    errors.value = {}
    if (props.editMode && props.userData) {
      form.value = { ...props.userData, password: '' }
    } else {
      resetForm()
      generatePassword()
    }
  }
})

const resetForm = () => {
  form.value = {
    employeeName: '',
    mobileNumber: '',
    email: '',
    username: '',
    password: '',
    role: 'SPC'
  }
}

const generatePassword = () => {
    // Ensure at least one of each required type
    const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    const numbers = "23456789"
    const specials = "!@#$%"
    const others = "abcdefghjkmnpqrstuvwxyz"
    
    let pass = ""
    pass += uppers.charAt(Math.floor(Math.random() * uppers.length))
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length))
    pass += specials.charAt(Math.floor(Math.random() * specials.length))
    
    const allChars = uppers + numbers + specials + others
    for (let i = 0; i < 7; i++) { // Fill rest to reach 10
        pass += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    
    // Shuffle
    form.value.password = pass.split('').sort(() => 0.5 - Math.random()).join('')
    showPassword.value = true
    errors.value.password = null
}

const validate = () => {
    const errs = {}
    let isValid = true

    // Name: Min 5 alphabets
    if (!/^[a-zA-Z\s]{5,}$/.test(form.value.employeeName)) {
        errs.employeeName = "Name must have at least 5 alphabets"
        isValid = false
    }

    // Username: Min 5 chars
    if (form.value.username.length < 5) {
        errs.username = "Username must be at least 5 characters"
        isValid = false
    }

    // Mobile: 10 digits
    if (!/^[0-9]{10}$/.test(form.value.mobileNumber)) {
        errs.mobileNumber = "Mobile must be exactly 10 digits"
        isValid = false
    }

    // Email: Standard Regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errs.email = "Invalid email format"
        isValid = false
    }

    // Password Validation
    // Required on Create. Optional on Edit (unless typed)
    const pass = form.value.password
    if (!props.editMode && !pass) {
        errs.password = "Password is required"
        isValid = false
    } else if (pass) {
        // If password is present (Create or Reset), enforce complexity
        // Min 8, 1 Upper, 1 Number, 1 Special
        const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?])[A-Za-z\d!@#$%^&*?]{8,}$/
        if (!strongRegex.test(pass)) {
             errs.password = "Must contain 1 Upper, 1 Number, 1 Special (!@#$%), Min 8 chars"
             isValid = false
        }
    }

    errors.value = errs
    return isValid
}

const handleSubmit = () => {
  if (validate()) {
      emit('submit', { ...form.value })
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>{{ editMode ? 'Edit User' : 'Create New User' }}</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="user-form">
          
          <!-- Name -->
          <div class="form-group">
            <label>Employee Name <span class="req">*</span></label>
            <input 
                v-model="form.employeeName" 
                type="text" 
                placeholder="Full Name (Min 5 letters)"
                :class="{ 'border-red': errors.employeeName }"
            />
            <span v-if="errors.employeeName" class="error-msg">{{ errors.employeeName }}</span>
          </div>

          <!-- Username & Role -->
          <div class="form-row">
            <div class="form-group">
               <label>Username <span class="req">*</span></label>
               <input 
                 v-model="form.username" 
                 type="text" 
                 placeholder="Min 5 chars" 
                 :class="{ 'border-red': errors.username }"
               />
               <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
            </div>
             <div class="form-group">
               <label>Role <span class="req">*</span></label>
               <select v-model="form.role">
                 <option value="SPC">SPC</option>
                 <option value="SYSADMIN">SYSADMIN</option>
                 <option value="ADMIN">ADMIN</option>
               </select>
            </div>
          </div>

          <!-- Contact -->
          <div class="form-row">
             <div class="form-group">
               <label>Mobile Number <span class="req">*</span></label>
               <input 
                 v-model="form.mobileNumber" 
                 type="tel" 
                 placeholder="10 Digits" 
                 :class="{ 'border-red': errors.mobileNumber }"
                />
               <span v-if="errors.mobileNumber" class="error-msg">{{ errors.mobileNumber }}</span>
            </div>
            <div class="form-group">
               <label>Email <span class="req">*</span></label>
               <input 
                 v-model="form.email" 
                 type="email" 
                 placeholder="email@example.com" 
                 :class="{ 'border-red': errors.email }"
                />
               <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
            </div>
          </div>

          <!-- Password Section -->
          <div class="form-group password-group">
            <label>
                {{ editMode ? 'Reset Password' : 'Password' }} 
                <span v-if="!editMode" class="req">*</span>
            </label>
            <div class="password-input-wrapper">
                <input 
                    v-model="form.password" 
                    :type="showPassword ? 'text' : 'password'" 
                    :placeholder="editMode ? 'Enter new password to reset' : 'Enter strong password'"
                    :class="{ 'border-red': errors.password }"
                />
                <!-- Toggle Visibility -->
                <button type="button" class="icon-btn" @click="showPassword = !showPassword" tabindex="-1">
                    <EyeOff v-if="showPassword" :size="18" />
                    <Eye v-else :size="18" />
                </button>
                <!-- Generate Button -->
                <button type="button" class="gen-btn" @click="generatePassword" title="Generate Strong Password">
                    <RefreshCw :size="16" /> Generate
                </button>
            </div>
            
            <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
            <p class="help-text">
                Rules: Min 8 chars, 1 Uppercase, 1 Number, 1 Special (@$!%*?&)
            </p>
            
            <p v-if="form.password && showPassword" class="pass-display">
                Password: <strong>{{ form.password }}</strong>
            </p>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">Cancel</button>
            <button type="submit" class="btn-submit">{{ editMode ? 'Update User' : 'Create User' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Previous modal styles preserved, adding specific new ones */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px);
}
.modal-card {
  background: white; width: 100%; max-width: 500px; border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; animation: slideIn 0.3s ease;
}
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
.modal-header h3 { margin: 0; font-size: 1.25rem; color: #1e293b; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
.modal-body { padding: 1.5rem; }
.user-form { display: flex; flex-direction: column; gap: 1.2rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-row { display: flex; gap: 1rem; }
.form-row .form-group { flex: 1; }
label { font-size: 0.875rem; font-weight: 500; color: #475569; }
.req { color: #ef4444; margin-left: 2px; }
input, select { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
input:focus, select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.border-red { border-color: #ef4444 !important; }
.error-msg { color: #ef4444; font-size: 0.75rem; }

/* Password Specifics */
.password-input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
}
.icon-btn {
    background: none; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; cursor: pointer; color: #64748b; display: flex;
}
.gen-btn {
    background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; cursor: pointer; 
    color: #0f172a; font-size: 0.8rem; font-weight: 500; display: flex; align-items: center; gap: 6px; white-space: nowrap;
}
.gen-btn:hover { background: #e2e8f0; }

.pass-display {
    margin: 4px 0 0 0;
    font-size: 0.9rem;
    color: #16a34a;
    background: #dcfce7;
    padding: 8px;
    border-radius: 6px;
    text-align: center;
}

.help-text {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 4px;
    font-style: italic;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.btn-cancel { padding: 0.75rem 1.5rem; background: white; border: 1px solid #cbd5e1; border-radius: 6px; color: #475569; cursor: pointer; font-weight: 500; }
.btn-submit { padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-submit:hover { background: #1d4ed8; }
@keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
