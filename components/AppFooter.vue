<script setup>
</script>

<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-left">
        <div class="footer-logo">MKCL</div>
        <p class="copyright">© {{ new Date().getFullYear() }} Maharashtra Knowledge Corporation Limited. All rights reserved.</p>
      </div>
      <div class="footer-links">
        <a href="https://www.mkcl.org" target="_blank">MKCL Website</a>
        <a href="#" class="disabled">Privacy Policy</a>
        <a href="#" class="disabled">Terms of Use</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #f1f3f5;
  border-top: 1px solid var(--border-color);
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.footer-logo {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.copyright {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: var(--mkcl-orange);
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
  
  .footer-left {
    text-align: left;
  }
}
</style>
