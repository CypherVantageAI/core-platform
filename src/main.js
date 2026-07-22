// ==========================================================================
// Cypher Vantage - Main Application Bootstrap (ES6 Module Entry Point)
// ==========================================================================

import { loadState, getState, saveState } from './core/db.js';
import { switchTab, setPersona } from './core/router.js';

// Import app.js legacy operations module to bind its functions to window
import '../app.js';

import { showModal } from './components/ui.js';
import { showPaneHelp } from './modules/panehelp.js';

// Bind routing controls to window for inline HTML onclick triggers
window.switchTab = switchTab;
window.setPersona = setPersona;
window.showModal = showModal;
window.showPaneHelp = showPaneHelp;

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

  // 7. Global listener for ESC key or native fullscreen exit
  document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
      document.querySelectorAll('.view-fullscreen-mode').forEach(pane => {
        pane.classList.remove('view-fullscreen-mode');
      });
      const sidebar = document.querySelector('.app-sidebar');
      if (sidebar) sidebar.style.display = '';
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

    // Refresh DORT outage graph if visible
    const mapBox = document.getElementById('twin-propagation-map');
    if (mapBox && typeof window.refreshCurrentTwinOutageGraph === 'function') {
      window.refreshCurrentTwinOutageGraph();
    }
  };
}
