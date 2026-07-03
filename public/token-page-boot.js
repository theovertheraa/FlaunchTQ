// token-page-boot.js — Next.js SPA shim
// Re-fires DOMContentLoaded so token-page.js init runs after dynamic script injection
document.dispatchEvent(new Event('DOMContentLoaded'));
