// ==========================================================================
// Cypher Vantage - Third Party Risk Module (ES6 Module)
// ==========================================================================

import { getState } from '../core/db.js';
import { createTable, createCard, createStatusBadge } from '../components/ui.js';

let selectedSupplierId = 'aws';

export function renderThirdPartyModule() {
  const state = getState();
  const container = document.getElementById('view-manager-thirdparty');
  if (!container) return;

  const suppliersList = Object.values(state.suppliers || {});
  const totalSuppliers = suppliersList.length;
  const criticalSuppliers = suppliersList.filter(s => s.riskTier === 'Critical').length;
  const avgCompliance = totalSuppliers ? Math.round(suppliersList.reduce((sum, s) => sum + s.complianceScore, 0) / totalSuppliers) : 100;
  const activeGaps = state.actions.filter(a => a.status !== 'Closed').length;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- KPI stats row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; width: 100%;">
        <div id="tpr-kpi-total"></div>
        <div id="tpr-kpi-critical"></div>
        <div id="tpr-kpi-compliance"></div>
        <div id="tpr-kpi-gaps"></div>
      </div>

      <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
        <!-- Left Panel: Supplier Registry -->
        <div class="dashboard-card" style="flex: 1.5; min-width: 450px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0; min-height: 600px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
            <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
              Nth-Party Supplier Directory
            </h3>
            <button class="btn btn-secondary btn-xs" onclick="switchTab('manager-inbox')" style="padding: 4px 8px; font-size: 0.65rem; display: flex; align-items: center; gap: 4px;">
              🚨 Urgent Remediation Inbox
            </button>
          </div>

          <!-- Directory Table -->
          <div id="suppliers-table-container" style="width: 100%;"></div>
        </div>

        <!-- Right Panel: Profile & Subcontractors -->
        <div class="dashboard-card" style="flex: 1.2; min-width: 380px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0; min-height: 600px;">
          <div id="supplier-detail-header" style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <!-- Populated dynamically -->
          </div>

          <div id="supplier-detail-body" style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Render KPI cards
  createCard('tpr-kpi-total', {
    title: 'Total Suppliers Mapped',
    value: `${totalSuppliers}`,
    icon: '🏢',
    borderLeftColor: '#14b8a6'
  });

  createCard('tpr-kpi-critical', {
    title: 'Critical-Tier Vendors',
    value: `${criticalSuppliers}`,
    subtext: 'Requires real-time RTO alerts',
    icon: '⚠️',
    borderLeftColor: '#ef4444'
  });

  createCard('tpr-kpi-compliance', {
    title: 'Average Compliance Score',
    value: `${avgCompliance}%`,
    subtext: 'Across Supplier Control Obligations',
    icon: '📊',
    borderLeftColor: '#10b981'
  });

  createCard('tpr-kpi-gaps', {
    title: 'Active Remediation Gaps',
    value: `${activeGaps}`,
    subtext: 'Awaiting response/remediation',
    icon: '🚨',
    borderLeftColor: '#eab308'
  });

  renderSuppliersTable();
  renderSupplierDetails();
}

/**
 * Render list of suppliers in the left grid
 */
function renderSuppliersTable() {
  const state = getState();
  const columns = [
    { key: 'name', label: 'Supplier Name', render: (row) => `<b>${row.name}</b>` },
    { key: 'riskTier', label: 'Risk Tier', render: (row) => createStatusBadge(row.riskTier) },
    { 
      key: 'complianceScore', 
      label: 'Compliance', 
      render: (row) => `
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-weight:700; color: ${row.complianceScore >= 90 ? '#10b981' : (row.complianceScore >= 75 ? '#eab308' : '#ef4444')}">${row.complianceScore}%</span>
          <div style="flex:1; width:50px; height:4px; background:rgba(255,255,255,0.04); border-radius:2px; overflow:hidden;">
            <div style="width: ${row.complianceScore}%; height:100%; background: ${row.complianceScore >= 90 ? '#10b981' : (row.complianceScore >= 75 ? '#eab308' : '#ef4444')}"></div>
          </div>
        </div>
      `
    },
    { key: 'contactName', label: 'Contact Rep', render: (row) => `<span style="font-size:0.7rem; color:var(--text-secondary);">${row.contactName}</span>` },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => `
        <button class="btn btn-secondary btn-xs select-sup-btn" data-id="${row.id}" style="padding: 2px 6px;">Select</button>
      `
    }
  ];

  const suppliersList = Object.values(state.suppliers || {});
  createTable('suppliers-table-container', suppliersList, columns, {
    searchPlaceholder: 'Search suppliers directory...',
    pageSize: 6,
    selectedRowId: selectedSupplierId,
    onRowClick: (row) => {
      selectedSupplierId = row.id;
      renderSupplierDetails();
      renderSuppliersTable();
    }
  });
}

/**
 * Render detailed profiles and subcontractor layouts
 */
function renderSupplierDetails() {
  const state = getState();
  const headerContainer = document.getElementById('supplier-detail-header');
  const bodyContainer = document.getElementById('supplier-detail-body');
  if (!headerContainer || !bodyContainer) return;

  const sup = (state.suppliers && state.suppliers[selectedSupplierId]) || null;
  if (!sup) {
    headerContainer.innerHTML = `<h3 style="font-size:0.8rem; margin:0;">No Supplier Selected</h3>`;
    bodyContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">Please select a supplier from the registry.</div>`;
    return;
  }

  // Header display
  headerContainer.innerHTML = `
    <div>
      <span style="font-size:0.56rem; text-transform:uppercase; color:var(--color-cyan); font-weight:700;">Supplier Profile</span>
      <h2 style="font-size:1.05rem; font-weight:700; margin-top:2px; color:var(--text-primary);">${sup.name}</h2>
    </div>
    <div>
      ${createStatusBadge(sup.riskTier)}
    </div>
  `;

  // Filter subcontractor rows
  const subsHtml = sup.subcontractors && sup.subcontractors.length > 0 ? sup.subcontractors.map(sub => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.02); font-size:0.7rem;">
      <td style="padding:6px 8px; color:var(--text-primary);"><b>${sub.name}</b></td>
      <td style="padding:6px 8px; color:var(--text-secondary);">${sub.role}</td>
      <td style="padding:6px 8px; color:var(--text-muted);">${sub.primaryLocation}</td>
      <td style="padding:6px 8px; color:var(--text-muted);">${sub.secondaryLocation || '--'}</td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="4" style="padding:10px; text-align:center; color:var(--text-muted); font-size:0.68rem; font-style:italic;">No mapped downstream subcontractors.</td>
    </tr>
  `;

  // Filter compliance gaps specific to supplier
  const supplierRisks = state.risks.filter(r => r.owner.includes(sup.contactName) || r.title.includes(sup.id.toUpperCase()) || r.title.includes(sup.name.split(' ')[0]));
  const supplierGapsHtml = supplierRisks.length > 0 ? supplierRisks.map(r => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(239,68,68,0.02); border:1px solid rgba(239,68,68,0.1); border-radius:4px; padding:6px 10px; font-size:0.68rem;">
      <span style="color:var(--text-primary);">⚠️ ${r.title}</span>
      ${createStatusBadge(r.status)}
    </div>
  `).join('') : `<div style="font-size:0.68rem; color:var(--text-muted); font-style:italic;">No active compliance gaps logged.</div>`;

  bodyContainer.innerHTML = `
    <div style="font-size:0.72rem; color:var(--text-secondary); line-height:1.45;">
      <b>Business Impact Context:</b><br/>
      ${sup.riskTierExplanation}
    </div>

    <!-- Contact Info Block -->
    <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.04); padding:10px; border-radius:6px; font-size:0.7rem; display:flex; flex-direction:column; gap:4px;">
      <div>💼 <b>Account Lead:</b> ${sup.contactName} (${sup.contactEmail})</div>
      <div>📍 <b>Primary Location:</b> ${sup.primarySupportLocation || 'N/A'}</div>
      <div>🌎 <b>Secondary Operations Location:</b> ${sup.secondarySupportLocation || 'N/A'}</div>
    </div>

    <!-- Active Compliance Gaps -->
    <div style="display:flex; flex-direction:column; gap:6px;">
      <h4 style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; font-weight: 700; margin: 0;">
        Active Compliance Gaps & Risks
      </h4>
      ${supplierGapsHtml}
    </div>

    <!-- Downstream Subprocessor Grid -->
    <div style="display:flex; flex-direction:column; gap:6px;">
      <h4 style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 4px; margin: 0;">
        Downstream Subcontractor Chain (Tier 4 / Nth-Party)
      </h4>
      <div style="overflow-x:auto; width:100%; border:1px solid rgba(255,255,255,0.03); border-radius:4px;">
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="background:rgba(255,255,255,0.02); border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.68rem; font-weight:600; color:var(--text-secondary);">
              <th style="padding:6px 8px;">Subcontractor</th>
              <th style="padding:6px 8px;">Role</th>
              <th style="padding:6px 8px;">Primary Location</th>
              <th style="padding:6px 8px;">Failover Location</th>
            </tr>
          </thead>
          <tbody>
            ${subsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
