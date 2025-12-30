<script setup lang="ts">
import { LogOut, User, Search, Menu, X } from 'lucide-vue-next'
const { data } = await useFetch('/api/content')
const logoUrl = computed(() => data.value?.assets?.header_logo || '/images/mkcl-official.png')

const user = useCookie<any>('user')
const router = useRouter()
const searchQuery = useState('searchQuery', () => '')
const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
}

// Close menu on route change
watch(
  () => router.currentRoute.value,
  () => {
    isMobileMenuOpen.value = false
  }
)

const handleLogout = () => {
    const cookie = useCookie('user')
    cookie.value = null
    user.value = null // Reactive update
    window.location.href = '/' // Hard reload to clear state
}
</script>

<template>
  <header class="app-header">
    <div class="container header-container">
      <div class="logo-section">
        <NuxtLink to="/" class="logo-link">
          <img :src="logoUrl" alt="MKCL Logo" class="main-logo" />
        </NuxtLink>
      </div>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav">
        <NuxtLink to="/" class="nav-item">Home</NuxtLink>
        <NuxtLink to="/#products" class="nav-item">Products</NuxtLink>
        <a href="https://www.mkcl.org" target="_blank" class="nav-item">About MKCL</a>
        <NuxtLink v-if="user" to="/admin/products" class="nav-item">Dashboard</NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="header-actions">
         <!-- Search Input -->
         <div class="search-block desktop-only" v-if="!isLoginPage">
             <Search :size="18" class="search-icon" />
             <input type="text" v-model="searchQuery" placeholder="Search products..." class="search-input" />
         </div>

         <template v-if="user && user.username">
            <div class="user-block desktop-only">
                <User :size="16" />
                <span class="username">{{ user.username || 'User' }}</span>
                <button @click="handleLogout" class="btn-icon" title="Logout">
                   <LogOut :size="18" />
                </button>
            </div>
         </template>
         <template v-else>
             <NuxtLink to="/login" class="btn btn-primary login-btn desktop-only">
                <span>MKCL Login</span>
             </NuxtLink>
         </template>
         
         <!-- Mobile Menu Toggle -->
         <button class="menu-toggle" @click="toggleMobileMenu">
             <X v-if="isMobileMenuOpen" :size="24" />
             <Menu v-else :size="24" />
         </button>

      </div>
      
    </div>
    
    <!-- Mobile Navigation Drawer -->
    <transition name="slide-down">
        <div v-if="isMobileMenuOpen" class="mobile-menu">
            <div class="mobile-search" v-if="!isLoginPage">
                 <Search :size="18" class="search-icon" />
                 <input type="text" v-model="searchQuery" placeholder="Search products..." class="search-input" />
            </div>
            
            <NuxtLink to="/" class="mobile-nav-item" @click="closeMobileMenu">Home</NuxtLink>
            <NuxtLink to="/#products" class="mobile-nav-item" @click="closeMobileMenu">Products</NuxtLink>
            <a href="https://www.mkcl.org" target="_blank" class="mobile-nav-item" @click="closeMobileMenu">About MKCL</a>
            <NuxtLink v-if="user" to="/admin/products" class="mobile-nav-item" @click="closeMobileMenu">Dashboard</NuxtLink>
            
            <div class="mobile-footer-actions">
                <template v-if="user && user.username">
                    <div class="user-block mobile-user">
                        <User :size="16" />
                        <span class="username">{{ user.username || 'User' }}</span>
                        <button @click="handleLogout" class="btn-icon">
                           <LogOut :size="18" />
                        </button>
                    </div>
                 </template>
                 <template v-else>
                     <NuxtLink to="/login" class="btn btn-primary login-btn mobile-login-btn" @click="closeMobileMenu">
                        <span>MKCL Login</span>
                     </NuxtLink>
                 </template>
            </div>
        </div>
    </transition>
  </header>
</template>

<style scoped>


.app-header {
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.main-logo {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.desktop-nav {
  display: flex;
  align-items: center;
}

.nav-item {
  margin: 0 16px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
}

.nav-item:hover {
  color: var(--mkcl-orange);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-btn {
  /* .btn-primary is mostly handled by main.css, but we can keep overrides if needed */
  padding: 8px 20px;
  border-radius: 20px;
  text-decoration: none;
}

.user-block {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f1f5f9;
    padding: 6px 12px;
    border-radius: 20px;
    color: #475569;
    font-weight: 500;
}

.username {
    margin-right: 5px;
    font-size: 0.9rem;
}

.btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    color: #ef4444;
    transition: all 0.2s;
}
.btn-icon:hover {
    background: #fee2e2;
    border-color: #ef4444;
}

.search-block {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 20px; /* Rounded pill like login button */
    padding: 6px 12px;
    width: 200px;
    transition: all 0.2s;
}

.search-block:focus-within {
    border-color: #F37021;
    box-shadow: 0 0 0 2px rgba(243, 112, 33, 0.1);
    width: 240px; /* Expand on focus */
}

.search-icon { color: #94a3b8; margin-right: 8px; }
.search-input {
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
    font-size: 0.9rem;
    color: #334155;
}

/* Mobile Menu Styles */
.menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-primary);
    padding: 4px;
}

.mobile-menu {
    position: absolute;
    top: 70px;
    left: 0;
    width: 100%;
    background: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-top: 1px solid #e2e8f0;
}

.mobile-nav-item {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text-primary);
    text-decoration: none;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
}

.mobile-search {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
}

.mobile-footer-actions {
    margin-top: 10px;
    display: flex;
    justify-content: center;
}

.mobile-login-btn {
    width: 100%;
    text-align: center;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-in-out;
  transform-origin: top;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: scaleY(0);
  opacity: 0;
}

@media (max-width: 768px) {
    .desktop-nav { display: none; }
    .desktop-only { display: none !important; } /* Force hide search/login on mobile header bar */
    .menu-toggle { display: block; }
    
    .search-block:focus-within {
        width: 100%;
    }
}
</style>
