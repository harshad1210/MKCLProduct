<script setup>
import { ref, onMounted, computed } from 'vue'
import { Loader2, RefreshCw } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const logs = ref([])
const loading = ref(false)
const currentUser = useCookie('user')

onMounted(() => {
    fetchLogs()
})

const fetchLogs = async () => {
    loading.value = true
    try {
        const data = await $fetch('/api/system-logs')
        logs.value = data
    } catch (e) {
        console.error(e)
        alert("Failed to fetch logs")
    } finally {
        loading.value = false
    }
}

const formatDate = (dateStr) => {
    try {
        return new Date(dateStr).toLocaleString()
    } catch {
        return dateStr
    }
}

const groupedLogs = computed(() => {
    const groups = {}
    logs.value.forEach(log => {
        const d = new Date(log.timestamp)
        // Simple YYYY-MM-DD key (local time approx)
        const dateKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
        
        if (!groups[dateKey]) groups[dateKey] = []
        groups[dateKey].push(log)
    })
    // Return sorted keys (desc)
    return Object.keys(groups).sort().reverse().map(date => ({
        date,
        items: groups[date]
    }))
})
</script>

<template>
    <div class="logs-page">
        <div class="header">
            <div>
                <h1>System Logs</h1>
                <p>Viewing logs for the last 5 days. (Stored in DB & File)</p>
            </div>
            <button @click="fetchLogs" class="refresh-btn">
                <Loader2 v-if="loading" class="spin" />
                <RefreshCw v-else size="18" />
                Refresh
            </button>
        </div>

        <div class="logs-container fade-in-up">
            <div v-if="loading && logs.length === 0" class="loading-state">
                <Loader2 class="spin" size="32" />
                <p>Loading logs...</p>
            </div>

            <div v-else-if="logs.length === 0" class="empty-state">
                <p>No logs found for the last 5 days.</p>
            </div>

            <div v-else v-for="group in groupedLogs" :key="group.date" class="log-group">
                <h3 class="date-header">{{ new Date(group.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</h3>
                
                <div class="table-card">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 150px;">Time</th>
                                <th style="width: 120px;">User</th>
                                <th style="width: 100px;">Action</th>
                                <th style="width: 120px;">Entity</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="log in group.items" :key="log.id">
                                <td class="timestamp">{{ new Date(log.timestamp).toLocaleTimeString() }}</td>
                                <td class="user-cell">
                                    <span class="user-badge" :class="{ 'me': log.performedBy === currentUser?.username }">
                                        {{ log.performedBy }}
                                    </span>
                                </td>
                                <td>
                                    <span class="action-tag" :class="log.action.toLowerCase()">{{ log.action }}</span>
                                </td>
                                <td>{{ log.entity }} <span v-if="log.entityId">#{{ log.entityId }}</span></td>
                                <td class="details-cell">{{ log.details }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.logs-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Inter', sans-serif;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.header h1 { margin: 0; font-size: 1.8rem; color: #1e293b; }
.header p { margin: 5px 0 0; color: #64748b; }

.refresh-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 16px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 6px;
    color: #475569;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}
.refresh-btn:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

.loading-state, .empty-state {
    text-align: center;
    padding: 4rem;
    color: #94a3b8;
}

.date-header {
    font-size: 1.1rem;
    color: #475569;
    margin: 2rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.table-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

table { width: 100%; border-collapse: collapse; }
th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 0.9em; }
th { background: #f8fafc; font-weight: 600; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase; font-size: 0.8em; }
tr:last-child td { border-bottom: none; }
tr:hover { background: #f8fafc; }

.timestamp { color: #64748b; font-family: 'Roboto Mono', monospace; }
.details-cell { color: #334155; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.user-badge {
    background: #f1f5f9; padding: 2px 8px; border-radius: 12px; font-weight: 500; color: #475569;
}
.user-badge.me { background: #dbeafe; color: #2563eb; }

.action-tag {
    font-weight: 600; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px;
}
.action-tag.login { background: #dcfce7; color: #166534; }
.action-tag.logout { background: #f1f5f9; color: #64748b; }
.action-tag.create { background: #dbeafe; color: #1e40af; }
.action-tag.delete { background: #fee2e2; color: #b91c1c; }
.action-tag.update { background: #ffedd5; color: #9a3412; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
