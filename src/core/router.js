// ==========================================================================
// Cypher Vantage - Core Navigation Router (ES6 Module)
// ==========================================================================

import { getState, saveState } from './db.js';

// Import module renderers dynamically to trigger view refreshes
import { renderExecutiveDashboard } from '../modules/dashboard.js';
import { renderResilienceModule } from '../modules/resilience.js';
import { renderDoraModule } from '../modules/dora.js';
import { renderIctRiskModule } from '../modules/ictrisk.js';
import { renderThirdPartyModule } from '../modules/thirdparty.js';
import { renderReportsModule } from '../modules/reports.js';
import { renderAiGovernanceModule } from '../modules/aigovernance.js';
import { renderAnalystModule } from '../modules/analyst.js';


export function switchTab(tabId) {
  // Redirect legacy tabs to new modular pages
  if (tabId === 'manager-suppliers') {
    tabId = 'manager-thirdparty';
  } else if (tabId === 'manager-compliance') {
    tabId = 'manager-dora';
  }

  const state = getState();
  console.log(`[Router] Routing to tab: ${tabId}`);

  // Hide all content panes
  document.querySelectorAll('.content-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  // Deactivate all nav links (items and sub-items)
  document.querySelectorAll('.nav-item, .nav-sub-item').forEach(item => {
    item.classList.remove('active');
  });

  // Show target content pane
  const targetPane = document.getElementById(`view-${tabId}`);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  // Set active class on navbar link
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeNav) {
    activeNav.classList.add('active');
  }

  // Trigger module-specific rendering pipelines
  switch (tabId) {
    case 'manager-dashboard':
      renderExecutiveDashboard();
      break;
    case 'manager-resilience':
      renderResilienceModule();
      break;
    case 'manager-dora':
      renderDoraModule();
      break;
    case 'manager-risk':
      renderIctRiskModule();
      break;
    case 'manager-thirdparty':
      renderThirdPartyModule();
      break;
    case 'manager-reports':
      renderReportsModule();
      break;

    // Advanced legacy modules retained inside the shell
    case 'manager-navigator':
      if (typeof window.renderServiceNavigator === 'function') {
        window.renderServiceNavigator();
      }
      break;
    case 'manager-actions':
      if (typeof window.renderManagerActions === 'function') {
        window.renderManagerActions();
      }
      break;
    case 'manager-collector':
      if (typeof window.updateCollectorDropdown === 'function') {
        window.updateCollectorDropdown();
      }
      break;
    case 'manager-advisor':
      renderAnalystModule();
      break;
    case 'manager-ai-risk':
      renderAiGovernanceModule();
      break;
    case 'manager-obligations':
      if (typeof window.renderSCOAccordion === 'function') {
        window.renderSCOAccordion();
      }
      break;
    case 'manager-inbox':
      if (typeof window.renderManagerInbox === 'function') {
        window.renderManagerInbox();
      }
      break;

    // Supplier Persona Tabs
    case 'supplier-vulns':
    case 'supplier-compliance':
      state.activeSupplierSubTab = tabId === 'supplier-vulns' ? 'vulns' : 'compliance';
      const supplierDashboard = document.getElementById('view-supplier-dashboard');
      if (supplierDashboard) supplierDashboard.classList.add('active');
      const supplierNav = document.getElementById(`nav-${tabId}`);
      if (supplierNav) supplierNav.classList.add('active');
      
      if (typeof window.renderSupplierPortalDashboard === 'function') {
        window.renderSupplierPortalDashboard();
      }
      break;
    case 'supplier-evidence':
      if (typeof window.renderSupplierVaultTable === 'function') {
        window.renderSupplierVaultTable();
      }
      break;
    case 'supplier-obligations':
      if (typeof window.renderSCOAccordion === 'function') {
        window.renderSCOAccordion();
      }
      break;
  }

  // Scroll details back to top
  const mainContent = document.querySelector('.main-content');
  if (mainContent) mainContent.scrollTop = 0;
}

/**
 * Handle Switching Personas (Risk Manager vs Supplier Portal)
 */
export function setPersona(persona) {
  const state = getState();
  state.activePersona = persona;

  const btnManager = document.getElementById('btn-persona-manager');
  const btnSupplier = document.getElementById('btn-persona-supplier');
  const navManager = document.getElementById('nav-group-manager');
  const navSupplier = document.getElementById('nav-group-supplier');
  const supplierSelector = document.getElementById('supplier-selector-container');
  const userRoleText = document.getElementById('user-role-name');
  const userAvatar = document.querySelector('.user-avatar');

  const brandTagline = document.querySelector('.brand-tagline');

  if (persona === 'manager') {
    if (btnManager) btnManager.classList.add('active');
    if (btnSupplier) btnSupplier.classList.remove('active');
    if (navManager) navManager.classList.remove('hidden');
    if (navSupplier) navSupplier.classList.add('hidden');
    if (supplierSelector) supplierSelector.containerId ? null : supplierSelector.classList.add('hidden');
    if (brandTagline) brandTagline.style.display = 'block';
    if (userRoleText) userRoleText.innerText = 'Sarah Jenkins';
    if (userAvatar) {
      userAvatar.innerText = 'RM';
      userAvatar.style.background = 'var(--gradient-accent)';
    }
    switchTab('manager-dashboard');
  } else {
    if (btnManager) btnManager.classList.remove('active');
    if (btnSupplier) btnSupplier.classList.add('active');
    if (navManager) navManager.classList.add('hidden');
    if (navSupplier) navSupplier.classList.remove('hidden');
    if (supplierSelector) supplierSelector.classList.remove('hidden');
    if (brandTagline) brandTagline.style.display = 'none';
    
    if (typeof window.populateSupplierPortalSwitcher === 'function') {
      window.populateSupplierPortalSwitcher();
      window.updateSupplierPortalIdentity();
    }
    switchTab('supplier-vulns');
  }
  saveState();
}

// Bind to window for global inline event triggers
window.switchTab = switchTab;
window.setPersona = setPersona;
