<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Mail, Loader2 } from 'lucide-vue-next'

const router = useRouter()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    const response = await $fetch('/api/auth/login', {
       method: 'POST',
       body: { username: username.value, password: password.value }
    })

    if (response.success) {
       // Store user state (simple version)
       const userCookie = useCookie('user')
       userCookie.value = response.user
       router.push('/admin/products')
    }
  } catch (e) {
    console.error("Login Error:", e)
    error.value = e.statusMessage || e.data?.statusMessage || 'Invalid credentials or Server Error'
    isLoading.value = false
  }
}

const handleForgotPassword = () => {
    alert("Please call Harshad or send a mail to harshadt@mkcl.org")
}
</script>

<template>
  <div class="login-view">
    <div class="login-container fade-in">
      <div class="login-header">
        <h1>Employee Login</h1>
        <p>Enter your credentials to access the workspace.</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <Mail class="input-icon" size="20" />
            <input 
              type="text" 
              id="username" 
              v-model="username" 
              placeholder="Admin" 
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <Lock class="input-icon" size="20" />
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="••••••••" 
              required
            />
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">Forgot Password?</a>
          <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="spin" />
            <span v-else>Login</span>
          </button>
        </div>
      </form>
      
      <div class="login-footer">
        <p>Not an employee? <RouterLink to="/">Back to Home</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  min-height: calc(100vh - 70px - 200px); /* Adjust based on header/footer */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-light);
  padding: 2rem;
}

.login-container {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--text-secondary);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
}

input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--mkcl-orange);
  box-shadow: 0 0 0 3px rgba(243, 112, 33, 0.1);
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.forgot-password {
  text-align: right;
  font-size: 0.9rem;
  color: var(--mkcl-orange);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  background-color: var(--mkcl-orange);
  border-color: var(--mkcl-orange);
}

.btn-block:hover {
  background-color: #D65A0E !important;
  border-color: #D65A0E;
}


.login-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
}

.login-footer a {
  color: var(--mkcl-orange);
  font-weight: 500;
  text-decoration: none;
}

.login-footer a:hover {
   text-decoration: underline;
}

.spin {
  animation: spin 1s linear infinite;
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
