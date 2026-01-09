<script setup>
import { ExternalLink, ChevronRight } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  index: { 
    type: Number,
    default: 0
  }
})

const isFlipped = ref(false)

const pastelColors = [
  '#FFF5E6', // Light Orange (MKCL tint)
  '#E6F4FF', // Light Blue
  '#F0FFF4', // Light Green
  '#FFF0F5', // Light Pink
  '#F5F0FF', // Light Purple
  '#FFFFE0', // Light Yellow
]

const cardColor = computed(() => {
  const idx = props.product.id ? props.product.id : props.index
  return pastelColors[idx % pastelColors.length]
})

const truncatedDescription = computed(() => {
  const desc = props.product.description || ''
  if (desc.length <= 108) return desc
  return desc.substring(0, 108) + '...'
})

const openProduct = (url) => {
  if (!url) return
  
  let finalUrl = url
  if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      finalUrl = 'https://' + url
  }
  window.open(finalUrl, '_blank')
}

const toggleFlip = (e) => {
  e.stopPropagation() // Prevent card click event
  isFlipped.value = !isFlipped.value
}
</script>

<template>
  <div class="product-card" @mouseleave="isFlipped = false">
    <div class="card-inner" :class="{ 'is-flipped': isFlipped }">
      
      <!-- FRONT SIDE -->
      <div class="card-face card-front" @click="openProduct(product.url)">
        <div class="card-header" :style="{ background: cardColor }">
          <img :src="product.logoUrl" :alt="product.name" class="product-logo" />
          <div class="overlay">
            <ExternalLink color="white" size="24" />
          </div>
        </div>
        <div class="card-content">
          <div class="content-top">
            <h3>{{ product.name }}</h3>
            <p>
              {{ truncatedDescription }}
              <span 
                v-if="product.description && product.description.length > 108" 
                class="read-more-link" 
                @click="toggleFlip"
              >
                Read More
              </span>
            </p>
          </div>
          <div class="content-bottom">
            <span class="learn-more">
              Know More <ChevronRight size="16" class="arrow-icon"/>
            </span>
          </div>
        </div>
      </div>

      <!-- BACK SIDE -->
      <div class="card-face card-back">
        <div class="back-content">
          <h3>{{ product.name }}</h3>
          <div class="scrollable-desc">
             <p>{{ product.description }}</p>
          </div>
          <button class="btn-flip-back" @click="isFlipped = false">Go Back</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: transparent;
  width: 100%;
  height: 420px; /* Fixed height to ensure uniform flip axis */
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
}

.card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

/* FRONT SPECIFIC */
.card-front {
  z-index: 2;
}

.product-card:hover .card-inner {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-color: var(--mkcl-orange);
}

.card-header {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.5s ease;
  position: relative;
  height: 180px;
  flex-shrink: 0;
}

.product-logo {
  height: 80px;
  width: auto;
  object-fit: contain;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
  position: relative;
}

.product-card:hover .product-logo {
  transform: scale(1.15) translateZ(20px);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 3;
}

.product-card:hover .overlay {
  opacity: 1;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
}

h3 {
  margin: 0.5rem 0 0.8rem 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #2c3e50;
  transition: color 0.3s;
}

.product-card:hover h3 {
  color: var(--mkcl-orange);
}

p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.read-more-link {
  color: red;
  font-weight: bold;
  cursor: pointer;
  margin-left: 4px;
  text-decoration: underline;
}

.read-more-link:hover {
  color: darkred;
}

.learn-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--mkcl-orange);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 8px 16px;
  border: 1px solid var(--mkcl-orange);
  border-radius: 50px;
  margin-top: auto;
  width: fit-content;
  transition: all 0.3s ease;
}

.product-card:hover .learn-more {
  background-color: var(--mkcl-orange);
  color: white;
}

/* BACK SPECIFIC */
.card-back {
  transform: rotateY(180deg);
  padding: 2rem;
  text-align: left;
  background: #fff; /* Ensure generic white background */
}

.back-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.scrollable-desc {
  flex: 1;
  overflow-y: auto;
  margin: 1rem 0;
  padding-right: 5px;
}

/* Scrollbar styling for back content */
.scrollable-desc::-webkit-scrollbar {
  width: 4px;
}
.scrollable-desc::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 4px;
}

.btn-flip-back {
  align-self: flex-start;
  background: none;
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: auto;
}
.btn-flip-back:hover {
  background: #f5f5f5;
}
</style>
