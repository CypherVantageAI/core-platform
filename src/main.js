// ==========================================================================
// Cypher Vantage - Main Application Bootstrap (ES6 Module Entry Point)
// ==========================================================================

import { loadState, getState, saveState } from './core/db.js';
import { switchTab, setPersona } from './core/router.js';

// Import app.js legacy operations module to bind its functions to window
import '../app.js';

// Bind routing controls to window for inline HTML onclick triggers
window.switchTab = switchTab;
window.setPersona = setPersona;

window.onload = function() {
  console.log("🚀 Cypher Vantage Core Platform Bootstrap Initiated");

  // 1. Initialize DB State
  const state = loadState();

  // 2. Set default active currency selector if elements exist
  const selector = document.getElementById('currency-selector');
  if (selector && state.resilience.selectedCurrency) {
    selector.value = state.resilience.selectedCurrency;
  }

  // 3. Initialize countdown SLA timers if declared in app.js
  if (typeof window.startManagerSlaCountdown === 'function') {
    window.startManagerSlaCountdown();
  }
  if (typeof window.startSupplierSlaCountdown === 'function') {
    window.startSupplierSlaCountdown();
  }

  // 4. Force first layout render & badge updates
  if (typeof window.updateManagerInboxBadge === 'function') {
    window.updateManagerInboxBadge();
  }

  // 5. Initialize the active persona context
  setPersona(state.activePersona || 'manager');

  // 6. Initialize Theme Selector
  initTheme(state);

  // 7. Global card click fallback delegate
  document.body.addEventListener('click', function(e) {
    const card = e.target.closest('[onclick]');
    if (card && card.getAttribute('onclick')) {
      const onclickAttr = card.getAttribute('onclick');
      if (onclickAttr.includes('showModal')) {
        // Handled natively by inline handler
      }
    }
  });
};

function initTheme(state) {
  const btn = document.getElementById('btn-theme-toggle');
  if (!btn) return;

  const icon = document.getElementById('theme-toggle-icon');

  function applyTheme(isLight) {
    if (isLight) {
      document.body.classList.add('light-mode');
      if (icon) icon.innerText = '🌙';
      btn.setAttribute('title', 'Switch to Dark Theme');
    } else {
      document.body.classList.remove('light-mode');
      if (icon) icon.innerText = '☀️';
      btn.setAttribute('title', 'Switch to Light Theme');
    }
  }

  // Initial apply from DB state
  applyTheme(state.theme === 'light');

  btn.onclick = () => {
    const isLightNow = document.body.classList.contains('light-mode');
    state.theme = isLightNow ? 'dark' : 'light';
    saveState();
    applyTheme(!isLightNow);
  };
}
