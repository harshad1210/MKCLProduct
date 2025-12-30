<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const scrollToProducts = () => {
    const el = document.getElementById('products')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
<section class="jubilee-hero">
    <div class="waves-container">
        <!-- Abstract Wave Lines (Isohypses) -->
        <!-- Layer 1: Dark Blue (Deep Background) -->
        <svg class="wave wave-back" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path fill="rgba(37, 99, 235, 0.4)" d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,122.7C672,107,768,117,864,122.7C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>

        <!-- Layer 2: Mid Blue -->
        <svg class="wave wave-mid" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
             <path fill="rgba(37, 99, 235, 0.6)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        
        <!-- Layer 3: Silver/Light Blue (Foreground) -->
        <svg class="wave wave-front" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path fill="url(#silverGradient)" d="M0,96L48,112C96,128,192,160,288,176C384,192,480,192,576,176C672,160,768,128,864,138.7C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <defs>
                <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#C0C0C0;stop-opacity:0.8" />
                    <stop offset="50%" style="stop-color:#E0E0E0;stop-opacity:0.9" />
                    <stop offset="100%" style="stop-color:#C0C0C0;stop-opacity:0.8" />
                </linearGradient>
            </defs>
        </svg>
    </div>

    <!-- Content Overlay -->
    <div class="jubilee-content container">
        <div class="logo-area">
             <!-- Use the uploaded logo -->
             <img src="/images/jubilee_25.png" alt="25 Jubilee" class="jubilee-logo" />
        </div>
        
        <div class="text-area">
            <h1><span class="silver-text">Celebrating 25 Years</span> <br/>of Digital Empowerment</h1>
            <p class="hero-subtitle">
                MKCL's journey of transforming lives through High-Tech and High-Touch paradigms.
            </p>
            <div class="hero-actions">
                <button @click="scrollToProducts" class="btn btn-primary btn-lg shine-effect">
                    Explore Our Journey
                    <ArrowRight size="20" style="margin-left: 8px;" />
                </button>
                 <a href="https://www.mkcl.org" target="_blank" class="btn btn-outline btn-lg silver-btn">Know More</a>
            </div>
        </div>
    </div>
</section>
</template>

<style scoped>
.jubilee-hero {
    position: relative;
    min-height: 80vh; /* Capture entire hero area */
    background: radial-gradient(circle at top right, #0f172a, #1e3a8a); /* Dark Blue Theme */
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    color: white;
}

.waves-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
}

.wave {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%; /* Adjust height of waves */
}

.wave-back { animation: waveMove 15s linear infinite alternate; opacity: 0.5; }
.wave-mid { animation: waveMove 10s linear infinite alternate-reverse; opacity: 0.6; }
.wave-front { animation: waveMove 20s linear infinite alternate; height: 60%; }

@keyframes waveMove {
    0% { transform: translateX(-2%) scaleY(1); }
    100% { transform: translateX(2%) scaleY(1.1); }
}

.jubilee-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between; /* Split logo and text */
    width: 100%;
    padding: 2rem;
}

.logo-area {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.jubilee-logo {
    max-height: 400px; /* Large 25 */
    filter: drop-shadow(0 0 20px rgba(255,255,255,0.3));
    animation: float 6s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

.text-area {
    flex: 1;
    padding-left: 2rem;
    text-align: left;
}

h1 {
    font-size: 4rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    font-family: 'Segoe UI', sans-serif; /* Elegant font */
}

.silver-text {
    background: linear-gradient(to right, #C0C0C0, #FFFFFF, #C0C0C0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: #e2e8f0; /* Light silver/grey */
    margin-bottom: 2.5rem;
    max-width: 600px;
}

.hero-actions {
    display: flex;
    gap: 1rem;
}

.btn-lg {
    padding: 1rem 2rem;
    font-size: 1.1rem;
}

.shine-effect {
    position: relative;
    overflow: hidden;
}

.shine-effect::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
    transform: rotate(30deg);
    animation: shine 3s infinite;
}

@keyframes shine {
    0% { left: -100%; }
    20% { left: 100%; }
    100% { left: 100%; }
}

.silver-btn {
    border-color: #C0C0C0;
    color: #C0C0C0;
}
.silver-btn:hover {
    background: #C0C0C0;
    color: #1e3a8a; /* Dark blue text on hover */
}

@media (max-width: 768px) {
    .jubilee-content {
        flex-direction: column;
        text-align: center;
    }
    .text-area { padding-left: 0; margin-top: 2rem; }
    .hero-actions { justify-content: center; }
    h1 { font-size: 2.5rem; }
    .jubilee-logo { max-height: 250px; }
}
</style>
