<script setup>
import { ExternalLink, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  index: { // Accepting index to assign consistent color
    type: Number,
    default: 0
  }
})

const pastelColors = [
  '#FFF5E6', // Light Orange (MKCL tint)
  '#E6F4FF', // Light Blue
  '#F0FFF4', // Light Green
  '#FFF0F5', // Light Pink
  '#F5F0FF', // Light Purple
  '#FFFFE0', // Light Yellow
]

const cardColor = computed(() => {
  // Use product ID or passed index to select color deterministically
  const idx = props.product.id ? props.product.id : props.index
  return pastelColors[idx % pastelColors.length]
})

const openProduct = (url) => {
  if (!url) return
  
  // Logic: Allow absolute URLs (http/https) OR internal paths (starting with /)
  // Otherwise, assume it's a domain (e.g. www.google.com) and prepend https://
  let finalUrl = url
  if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      finalUrl = 'https://' + url
  }
  window.open(finalUrl, '_blank')
}
</script>

<template>
  <div class="product-card" @click="openProduct(product.url)">
    <div class="card-header" :style="{ background: cardColor }">
      <img :src="product.logoUrl" :alt="product.name" class="product-logo" />
      <div class="overlay">
        <ExternalLink color="white" size="24" />
      </div>
    </div>
    <div class="card-content">
      <div class="content-top">
        <!-- Badge Removed as per request -->
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
      </div>
      <div class="content-bottom">
        <span class="learn-more">
          Know More <ChevronRight size="16" class="arrow-icon"/>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.product-card:hover {
  transform: translateY(-10px) rotateX(2deg) rotateY(2deg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-color: var(--mkcl-orange);
  z-index: 10;
}

.card-header {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: none;
  transition: background 0.5s ease;
  position: relative;
  height: 180px;
  overflow: hidden;
}

.product-card:hover .card-header {
  filter: brightness(0.98);
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

/* Background Shine Effect */
.card-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-25deg);
  transition: left 0.7s;
  z-index: 1;
}

.product-card:hover .card-header::after {
  left: 125%;
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
  background: #fff;
  transition: transform 0.5s;
}

.product-card:hover .card-content {
  transform: translateZ(10px);
}

.category-badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--mkcl-blue);
  background: var(--mkcl-light-blue);
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 12px;
  display: inline-block;
  font-weight: 600;
}

h3 {
  margin: 0.5rem 0 0.8rem 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: -0.5px;
  transition: color 0.3s;
}

.product-card:hover h3 {
  color: var(--mkcl-orange);
}

p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}


.learn-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: transparent;
  color: var(--mkcl-orange);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 10px 20px;
  border: 1px solid var(--mkcl-orange);
  border-radius: 50px; /* Pill shape */
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: auto;
  width: fit-content;
}

.product-card:hover .learn-more {
  background-color: var(--mkcl-orange);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(243, 112, 33, 0.3); /* Orange shadow */
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.product-card:hover .arrow-icon {
  transform: translateX(4px);
}
</style>
