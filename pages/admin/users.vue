<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { Plus, User, Pencil, Trash2, Search } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

const users = ref([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editMode = ref(false)
const selectedUser = ref(null)
const currentUser = useCookie('user')

// Pagination & Search State
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 6

// Filtering
const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    const lower = searchQuery.value.toLowerCase()
    return users.value.filter(u => 
        u.username.toLowerCase().includes(lower) || 
        u.employeeName.toLowerCase().includes(lower) ||
        (u.email && u.email.toLowerCase().includes(lower))
    )
})

// Pagination Computed
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredUsers.value.slice(start, end)
})

// Navigation
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }

// Reset page on search
watch(searchQuery, () => { currentPage.value = 1 })

// Fetch Users
const fetchUsers = async () => {
  try {
    const data = await $fetch('/api/users')
    users.value = data
  } catch (e) {
    alert('Failed to load users')
  }
}

// Open Create Modal
const openCreateModal = () => {
  selectedUser.value = null
  editMode.value = false
  showModal.value = true
}

// Open Edit Modal
const openEdit = (user) => {
  selectedUser.value = user
  editMode.value = true
  showModal.value = true
}

// Handle Form Submit (Create/Update)
const handleFormSubmit = async (formData) => {
  try {
    const payload = {
        ...formData,
        performedBy: currentUser.value.username
    }

    if (editMode.value) {
      await $fetch(`/api/users/${selectedUser.value.id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $fetch('/api/users', {
        method: 'POST',
        body: payload
      })
    }
    showModal.value = false
    fetchUsers()
  } catch (e) {
    alert(e.data?.statusMessage || 'Operation failed')
  }
}

// Toggle Status Logic
const confirmToggleStatus = (user) => {
    if(confirm(`Are you sure you want to ${user.isActive ? 'DEACTIVATE' : 'ACTIVATE'} ${user.username}?`)) {
        toggleStatus(user)
    }
}

const toggleStatus = async (user) => {
    try {
        await $fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            body: { 
                isActive: !user.isActive,
                performedBy: currentUser.value.username 
            }
        })
        fetchUsers()
    } catch (e) {
        alert('Status update failed')
    }
}

const handleDelete = async () => {
   alert("Hard delete is disabled.")
}

onMounted(() => {
    // Basic FE protection - Redirect if SPC
    if (currentUser.value?.role === 'SPC') {
        navigateTo('/admin/products')
    }
    fetchUsers()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>User Management</h1>
        <p>Manage access and permissions for the dashboard.</p>
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="actions-bar">
      <div class="search-container">
          <Search class="search-icon" size="18" />
          <input 
            type="text" 
            placeholder="Search users..." 
            v-model="searchQuery"
            class="search-input"
          />
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <Plus :size="20" /> Add New User
      </button>
    </div>

    <!-- Users Table -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Username</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td>
              <div class="user-cell">
                <div class="avatar">{{ user.employeeName.charAt(0) }}</div>
                <div class="info">
                    <span class="name">{{ user.employeeName }}</span>
                    <span class="email">{{ user.email }}</span>
                </div>
              </div>
            </td>
            <td>{{ user.username }}</td>
            <td>
              <span class="role-badge" :class="user.role.toLowerCase()">{{ user.role }}</span>
            </td>
            <td>
               <span class="status-indicator" :class="{ inactive: !user.isActive }">
                   {{ user.isActive ? 'Active' : 'Inactive' }}
               </span>
            </td>
            <td class="actions-cell">
              <button class="btn-icon edit" @click="openEdit(user)" title="Edit">
                <Pencil :size="18" />
              </button>
              
              <!-- TOGGLE BUTTON INSTEAD OF DELETE -->
              <button 
                v-if="currentUser.role === 'ADMIN' && user.username?.toLowerCase() !== 'admin'" 
                class="btn-icon toggle" 
                :class="{ active: user.isActive }"
                @click="confirmToggleStatus(user)" 
                :title="user.isActive ? 'Deactivate User' : 'Activate User'"
              >
                <svg v-if="user.isActive" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="text-center text-muted">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination-controls" v-if="filteredUsers.length > 0">
        <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>

    <UserFormModal 
      :show="showModal" 
      :edit-mode="editMode" 
      :user-data="selectedUser"
      @close="showModal = false"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #64748b;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.table-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: #eff6ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.info {
    display: flex; 
    flex-direction: column;
}
.name { font-weight: 500; }
.email { font-size: 0.8rem; color: #64748b; }

.role-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.admin { background-color: #fee2e2; color: #dc2626; }
.role-badge.sysadmin { background-color: #fef3c7; color: #d97706; }
.role-badge.spc { background-color: #dcfce7; color: #16a34a; }

.status-indicator {
  color: #16a34a; /* Green */
  font-size: 0.875rem;
  display: flex; align-items: center; gap: 6px; font-weight: 500;
}
.status-indicator::before {
  content: ''; display: block; width: 8px; height: 8px; background-color: #16a34a; border-radius: 50%;
}
.status-indicator.inactive {
    color: #94a3b8; /* Grey for inactive text */
}
.status-indicator.inactive::before {
    background-color: #cbd5e1; /* Grey dot */
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.btn-icon:hover { background-color: #f1f5f9; }
.btn-icon.edit:hover { color: #2563eb; }

.btn-icon.toggle {
   color: #16a34a; /* Green power button */
}
.btn-icon.toggle:hover {
    background: #dcfce7;
}
.btn-icon.toggle:not(.active) {
    color: #64748b; 
}

/* Actions Bar & Search */
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
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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
    border-color: #2563eb;
    color: #2563eb;
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

.text-center { text-align: center; }
.text-muted { color: #94a3b8; }
</style>
