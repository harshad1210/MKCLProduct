<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import ProductCard from '@/components/ProductCard.vue'


const { data } = await useFetch('/api/content')

const heroBg = computed(() => data.value?.assets?.hero_bg || '/images/hero-bg.png')
const searchQuery = useState('searchQuery', () => '')

const products = computed(() => {
    let list = data.value?.products || []
    if (searchQuery.value) {
        const lower = searchQuery.value.toLowerCase()
        list = list.filter((p: any) => 
            p.name.toLowerCase().includes(lower) || 
            (p.description && p.description.toLowerCase().includes(lower))
        )
    }
    return list
})

const scrollToProducts = () => {
  const el = document.getElementById('products')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg" :style="{ backgroundImage: `url(${heroBg})` }"></div>
      <div class="container hero-content fade-in-up">
        


        <h1><span class="highlight">Transforming Lives through</span> <br/>Bridging the Digital Divide</h1>
        <p class="hero-subtitle">
          Through world-class High-Tech and High-Touch solutions for education and governance.
        </p>
        <div class="hero-actions">
          <button @click="scrollToProducts" class="btn btn-primary btn-lg">
            Explore Products
            <ArrowRight size="20" style="margin-left: 8px;" />
          </button>
          <a href="https://www.mkcl.org" target="_blank" class="btn btn-outline btn-lg orange-btn">Know More</a>
        </div>
      </div>
    </section>


    <!-- Products Section -->
    <section id="products" class="products-section">
      <div class="container">
        
        <div class="section-header">
           <h2>Product Showcase</h2>
           <div class="divider"></div>
        </div>

        <div class="product-grid">
          <ProductCard 
            v-for="(product, index) in products" 
            :key="product.id" 
            :product="product"
            :index="index" 
          />
        </div>

      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 8rem 0;
  text-align: left;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 0;
  animation: kenBurns 20s infinite alternate;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 2rem;
}

@keyframes kenBurns {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  max-width: 800px;
}

.highlight {
  color: #F37021 !important;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.products-section {
  padding: 4rem 0;
  background-color: #f9fafb; /* Added for contrast */
}

.section-header {
  margin-bottom: 3rem;
  text-align: center;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.divider {
  height: 4px;
  width: 60px;
  background: var(--mkcl-orange);
  margin: 0 auto;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr); /* Match source fixed 3 columns on large screens */
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.2rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
}

.orange-btn {
  color: var(--mkcl-orange) !important;
  border-color: var(--mkcl-orange) !important;
  background: white;
  font-weight: 600;
}

.orange-btn:hover {
  background-color: var(--mkcl-orange) !important;
  color: white !important;
}


</style>
