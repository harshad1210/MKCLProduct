<script setup>
import { computed } from 'vue'
import { LayoutDashboard, FileText, LogOut, User } from 'lucide-vue-next'

const route = useRoute()
const user = useCookie('user')
const router = useRouter()

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { 
        method: 'POST', 
        body: { username: user.value?.username, userId: user.value?.id } 
    })
  } catch (e) {
      console.error(e)
  }
  user.value = null
  router.push('/')
}
</script>

<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Workspace</h2>
        <p class="role-badge" :class="user?.role?.toLowerCase()">{{ user?.role || 'Admin' }}</p>
      </div>

      <nav class="sidebar-nav">
        <!-- Dashboard Home -->
        <NuxtLink to="/admin/products" class="nav-item home-link" :class="{ active: route.path === '/admin/products' && !route.params.id }">
          <LayoutDashboard :size="18" />
          <span>Manage Products</span>
        </NuxtLink>

        <NuxtLink to="/admin/documents" class="nav-item home-link" :class="{ active: route.path === '/admin/documents' }">
          <FileText :size="18" />
          <span>Manage Documents</span>
        </NuxtLink>

          <!-- Product List -->

        <NuxtLink 
            v-if="['ADMIN', 'SYSADMIN'].includes(user?.role)"
            to="/admin/users" 
            class="nav-item home-link" 
            :class="{ active: route.path === '/admin/users' }"
        >
          <User :size="18" />
          <span>Manage Users</span>
        </NuxtLink>

        <!-- System Logs -->
        <NuxtLink 
            v-if="user?.role === 'ADMIN'"
            to="/admin/logs" 
            class="nav-item home-link" 
            :class="{ active: route.path === '/admin/logs' }"
        >
          <FileText :size="18" />
          <span>System Logs</span>
        </NuxtLink>

      </nav>

      <div class="sidebar-footer">
        <div class="user-section">
            <div class="user-details">
              <span class="user-name">{{ user?.name || 'Admin' }}</span>
              <span class="user-id">{{ user?.username || 'admin' }}</span>
            </div>
            <button @click="handleLogout" class="logout-btn" title="Logout">
              <LogOut :size="18" />
            </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
  overflow: hidden; 
}

.sidebar {
  width: 280px;
  background-color: #fff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100%; 
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.role-badge {
  font-size: 0.75rem;
  background-color: #2563eb;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
}

.sidebar-nav {
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto; 
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  color: #334155;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #f1f5f9;
  color: #2563eb;
}

.nav-item.active {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 500;
  border-right: 3px solid #2563eb;
}

.home-link {
  margin-bottom: 0.5rem;
  justify-content: flex-start;
  gap: 10px;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.user-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}
.user-details { display: flex; flex-direction: column; }
.user-name { font-size: 0.95rem; font-weight: 600; color: #1e293b; }
.user-id { font-size: 0.75rem; color: #64748b; }

.logout-btn {
  padding: 8px;
  color: #64748b;
  border-radius: 6px;
  background: #f1f5f9;
  border: none;
  cursor: pointer;
}
.logout-btn:hover { background-color: #fee2e2; color: #ef4444; }

.dashboard-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
.product-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 180px;
}
</style>
