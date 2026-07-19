// ==========================================================================
// Cypher Vantage - Main Application Bootstrap (ES6 Module Entry Point)
// ==========================================================================

import { loadState, getState, saveState } from './core/db.js';
import { switchTab, setPersona } from './core/router.js';

// Import app.js legacy operations module to bind its functions to window
import '../app.js';

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
};
