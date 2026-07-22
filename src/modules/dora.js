// ==========================================================================
// Cypher Vantage - DORA Compliance Module (ES6 Module)
// ==========================================================================

import { getState, saveState } from '../core/db.js';
import { createTable, createCard, createStatusBadge, showModal } from '../components/ui.js';

let selectedObligationId = 'ob-001';
let activePillarFilter = 'all';

export function renderDoraModule() {
  const state = getState();
  const container = document.getElementById('view-manager-dora');
  if (!container) return;

  // Calculate scores
  const total = state.obligations.length;
  const compliant = state.obligations.filter(ob => ob.status === 'Compliant').length;
  const partial = state.obligations.filter(ob => ob.status === 'Partial').length;
  const score = Math.round(((compliant + (partial * 0.5)) / total) * 100);

  const totalControls = state.controls.length;
  const metControls = state.controls.filter(c => c.status === 'Met').length;
  const totalGaps = state.obligations.filter(ob => ob.status !== 'Compliant').length;
  const totalEvidence = state.evidence.length;

  let wrapper = container.querySelector('#dora-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'dora-wrapper';
    wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 20px; width: 100%;';
    
    wrapper.innerHTML = `
      <!-- KPI stats row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; width: 100%;">
        <div id="dora-kpi-score"></div>
        <div id="dora-kpi-controls"></div>
        <div id="dora-kpi-gaps"></div>
        <div id="dora-kpi-evidence"></div>
      </div>

      <!-- Main Layout splitting catalog and detail pane -->
      <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
        <!-- Left Column: DORA Pillar Catalog -->
        <div class="dashboard-card" style="flex: 1.2; min-width: 400px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0; min-height: 500px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
            <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
              DORA Articles Catalogue
            </h3>
            <span style="font-size: 0.62rem; color: var(--text-muted); font-weight: 600;">Framework Version: <b>2026 Ref v1</b></span>
          </div>

          <!-- Pillar Filter Dropdown -->
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <label for="dora-pillar-select" style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">Filter by DORA Pillar:</label>
            <select id="dora-pillar-select" class="dropdown-control" style="width: 100%; padding: 6px 10px; font-size: 0.72rem;">
              <option value="all">All Pillars (Complete Scope)</option>
              <option value="Risk Management">Pillar 1: ICT Risk Management</option>
              <option value="Incident Reporting">Pillar 2: ICT-Related Incident Reporting</option>
              <option value="Resilience Testing">Pillar 3: Digital Operational Resilience Testing</option>
              <option value="Third-Party Risk">Pillar 4: ICT Third-Party Risk Management</option>
              <option value="Information Sharing">Pillar 5: Information Sharing Arrangements</option>
            </select>
          </div>

          <!-- Catalog List Container -->
          <div id="dora-catalog-list" style="display: flex; flex-direction: column; gap: 8px; flex: 1; overflow-y: auto; max-height: 450px;"></div>
        </div>

        <!-- Right Column: Selected Obligation Detail & Controls -->
        <div id="dora-detail-container" style="flex: 1.8; min-width: 450px; display: flex; flex-direction: column; gap: 15px;">
          <div id="dora-detail-header" style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <!-- Populated dynamically -->
          </div>
          <div id="dora-detail-body" style="display: flex; flex-direction: column; gap: 15px;">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>
    // Append after view-header
    const header = container.querySelector('.view-header');
    if (header) {
      header.after(wrapper);
    } else {
      container.appendChild(wrapper);
    }
  }

  // Render KPI cards with tooltips and interactive drill-downs
  createCard('dora-kpi-score', {
    title: 'DORA Compliance Score',
    value: `${score}%`,
    trendText: '+5% MoM',
    trendClass: 'positive',
    icon: '📜',
    borderLeftColor: '#14b8a6',
    tooltip: 'Weighted index: (Compliant Articles + 0.5 * Partially Compliant Articles) / Total. Click to see the breakdown formula.',
    onclick: () => {
      const breakdownHtml = `
        <div style="display:flex; flex-direction:column; gap:10px;">
          <p><b>DORA Compliance Index Formula:</b></p>
          <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:4px; font-family:monospace; font-size:0.75rem; text-align:center;">
            Score = ((Compliant + 0.5 * Partial) / Total) * 100
          </div>
          <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:0.72rem;">
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:6px 0;">✅ <b>Compliant Articles</b></td><td style="text-align:right;">${compliant}</td></tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:6px 0;">⚠️ <b>Partially Compliant</b></td><td style="text-align:right;">${partial}</td></tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:6px 0;">❌ <b>Non-Compliant Articles</b></td><td style="text-align:right;">${total - compliant - partial}</td></tr>
            <tr style="font-weight:bold; border-top:1px solid rgba(255,255,255,0.1);"><td style="padding:6px 0;">📊 Total Articles</td><td style="text-align:right;">${total}</td></tr>
          </table>
          <p style="margin-top:5px; font-size:0.68rem; color:var(--text-muted);">Weighted compliance scores reward partial safeguards while mandating clean remediations to achieve 100% compliance.</p>
        </div>
      `;
      showModal('DORA Compliance Score Breakdown', breakdownHtml);
    }
  });

  createCard('dora-kpi-controls', {
    title: 'Mapped Controls',
    value: `${metControls}/${totalControls}`,
    subtext: 'Operational safeguards met',
    icon: '🛠️',
    borderLeftColor: '#10b981',
    tooltip: 'Active operational controls mapped to DORA requirements. Click to view mapped controls status.',
    onclick: () => {
      const controlsHtml = state.controls.map(c => `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.03); padding:6px 0; font-size:0.7rem;">
          <div>
            <b>${c.id}</b> - <span style="color:var(--text-secondary);">${c.title}</span>
            <div style="font-size:0.62rem; color:var(--text-muted);">${c.type}</div>
          </div>
          ${createStatusBadge(c.status)}
        </div>
      `).join('');
      showModal('Mapped Control Safeguards', `
        <div style="display:flex; flex-direction:column; gap:10px; max-height:350px; overflow-y:auto; padding-right:5px;">
          ${controlsHtml}
        </div>
      `);
    }
  });

  createCard('dora-kpi-gaps', {
    title: 'Requirement Gaps',
    value: `${totalGaps}`,
    subtext: 'Non-compliant Articles',
    icon: '⚠️',
    borderLeftColor: '#ef4444',
    tooltip: 'Articles failing full compliance mapping. Click to review compliance gaps.',
    onclick: () => {
      const gaps = state.obligations.filter(ob => ob.status !== 'Compliant');
      const gapsHtml = gaps.length > 0 ? gaps.map(g => `
        <div style="border-bottom:1px solid rgba(255,255,255,0.04); padding:6px 0; font-size:0.7rem; display:flex; flex-direction:column; gap:2px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${g.article}: ${g.title}</b>
            ${createStatusBadge(g.status)}
          </div>
          <div style="color:var(--text-secondary); font-size:0.68rem;">${g.description}</div>
          <div style="color:var(--color-cyan); font-size:0.62rem; margin-top:2px;">Pillar: ${g.pillar}</div>
        </div>
      `).join('') : '<div style="text-align:center; padding:15px; color:var(--text-muted);">No gaps logged! 100% compliance achieved.</div>';
      showModal('Active Compliance Gaps', `
        <div style="display:flex; flex-direction:column; gap:10px; max-height:350px; overflow-y:auto; padding-right:5px;">
          ${gapsHtml}
        </div>
      `);
    }
  });

  createCard('dora-kpi-evidence', {
    title: 'Evidence Repository',
    value: `${totalEvidence}`,
    subtext: 'Cryptographic files validated',
    icon: '📂',
    borderLeftColor: '#6366f1',
    tooltip: 'Cryptographic proof hashes validated on the ledger. Click to browse files.',
    onclick: () => {
      const evidenceHtml = state.evidence.map(e => `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.03); padding:6px 0; font-size:0.7rem;">
          <div>
            <b>📂 ${e.name}</b>
            <div style="font-size:0.62rem; color:var(--text-muted);">Hash: <span style="font-family:monospace;">${(e.fileHash || e.hash || 'SHA-256').slice(0, 16)}...</span></div>
          </div>
          <span style="font-size:0.65rem; color:var(--color-cyan); font-weight:600;">Uploaded: ${e.uploadedDate || e.uploaded || '2026-07-01'}</span>
        </div>
      `).join('');
      showModal('Cryptographic Evidence Vault', `
        <div style="display:flex; flex-direction:column; gap:10px; max-height:350px; overflow-y:auto; padding-right:5px;">
          ${evidenceHtml}
        </div>
      `);
    }
  });

  // Bind pillar dropdown filter
  const pillarSelect = document.getElementById('dora-pillar-select');
  if (pillarSelect) {
    pillarSelect.value = activePillarFilter;
    pillarSelect.onchange = (e) => {
      activePillarFilter = e.target.value;
      
      // Auto-select the first obligation in the filtered catalog
      let obligations = [...state.obligations];
      if (activePillarFilter !== 'all') {
        obligations = obligations.filter(ob => ob.pillar === activePillarFilter);
      }
      if (obligations.length > 0) {
        selectedObligationId = obligations[0].id;
      }
      
      renderCatalogue();
      renderObligationDetails();
    };
  }

  renderCatalogue();
  renderObligationDetails();
}

/**
 * Render list of obligations based on selected pillar filter
 */
function renderCatalogue() {
  const state = getState();
  const listContainer = document.getElementById('dora-catalog-list') || document.getElementById('dora-articles-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  let obligations = [...state.obligations];
  if (activePillarFilter !== 'all') {
    obligations = obligations.filter(ob => ob.pillar === activePillarFilter);
  }

  obligations.forEach(ob => {
    const isActive = ob.id === selectedObligationId;
    const item = document.createElement('div');
    item.className = `navigator-list-item ${isActive ? 'active' : ''}`;
    item.style.padding = '10px';
    item.style.cursor = 'pointer';
    item.onclick = () => {
      selectedObligationId = ob.id;
      renderCatalogue();
      renderObligationDetails();
    };

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span style="font-weight: 700; font-size: 0.76rem; color: var(--text-primary);">${ob.article}: ${ob.title}</span>
        ${createStatusBadge(ob.status)}
      </div>
      <div style="font-size: 0.65rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 3px;">
        ${ob.description}
      </div>
    `;

    listContainer.appendChild(item);
  });
}

/**
 * Render details of selected obligation in the right-hand panel
 */
function renderObligationDetails() {
  const state = getState();
  const headerContainer = document.getElementById('dora-detail-header');
  const bodyContainer = document.getElementById('dora-detail-body');
  if (!headerContainer || !bodyContainer) return;

  const ob = state.obligations.find(o => o.id === selectedObligationId);
  if (!ob) {
    headerContainer.innerHTML = `<h3 style="font-size:0.8rem; margin:0;">No Article Selected</h3>`;
    bodyContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">Please select a DORA Article from the catalogue.</div>`;
    return;
  }

  // Find mapped controls and evidence
  const mappedControls = state.controls.filter(c => ob.controls && ob.controls.includes(c.id));
  
  // Render Header
  headerContainer.innerHTML = `
    <div>
      <span style="font-size: 0.58rem; font-weight: 700; text-transform: uppercase; color: var(--color-cyan); letter-spacing: 0.05em; background: rgba(255,255,255,0.03); padding: 2px 6px; border-radius: 4px;">
        ${ob.pillar}
      </span>
      <h2 style="font-size: 1.05rem; font-weight: 700; margin-top: 4px; color: var(--text-primary);">${ob.article}: ${ob.title}</h2>
    </div>
    <div>
      ${createStatusBadge(ob.status)}
    </div>
  `;

  // Render controls & evidence list
  let controlsHtml = '';
  if (mappedControls.length > 0) {
    controlsHtml = mappedControls.map(ctrl => {
      // Find evidence mapped to control
      const matchingEvidence = state.evidence.filter(ev => ctrl.implementationDetails.includes(ev.name.split('_')[0]) || ev.name.includes(ctrl.id));
      
      let evidenceListHtml = '';
      if (matchingEvidence.length > 0) {
        evidenceListHtml = matchingEvidence.map(ev => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: rgba(255,255,255,0.02); border-radius: 4px; margin-top: 4px;">
            <span style="font-size:0.68rem; color: var(--text-primary);">📄 ${ev.name} <span style="font-size:0.58rem; color:var(--text-muted);">(Uploaded: ${ev.uploadedDate})</span></span>
            <div style="display:flex; gap:6px; align-items:center;">
              <span style="font-size:0.58rem; font-family: monospace; background:rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 3px; color:var(--text-muted);" title="Cryptographic SHA-256 Ledger Hash">${ev.fileHash.slice(0, 8)}...</span>
              ${createStatusBadge(ev.status)}
            </div>
          </div>
        `).join('');
      } else {
        evidenceListHtml = `<div style="font-size:0.65rem; color:var(--text-muted); font-style:italic;">No cryptographic evidence documents uploaded for this control.</div>`;
      }

      return `
        <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 6px; margin-top: 5px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.74rem; color: var(--text-primary);">${ctrl.id}: ${ctrl.title}</span>
            ${createStatusBadge(ctrl.status)}
          </div>
          <div style="font-size: 0.7rem; color: var(--text-secondary); line-height: 1.35;">
            ${ctrl.description}
          </div>
          <div style="font-size: 0.68rem; color: var(--text-muted); border-top: 1px dashed rgba(255,255,255,0.04); padding-top: 4px; margin-top: 2px;">
            <b>Implementation Status:</b> ${ctrl.implementationDetails}
          </div>
          <div style="margin-top: 6px;">
            <div style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.03em; margin-bottom: 4px;">Mapped Evidence Logs</div>
            ${evidenceListHtml}
          </div>
        </div>
      `;
    }).join('');
  } else {
    controlsHtml = `<div style="text-align:center; padding:15px; color:var(--text-muted); font-style:italic;">No controls mapped to this article.</div>`;
  }

  bodyContainer.innerHTML = `
    <div style="font-size: 0.74rem; color: var(--text-secondary); line-height: 1.45;">
      <b>Regulatory Obligation Scope:</b><br/>
      ${ob.description}
    </div>

    <!-- Integrations & Action Buttons -->
    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 5px;">
      <button class="btn btn-secondary btn-sm" onclick="switchTab('manager-collector')" style="font-size: 0.65rem; padding: 4px 8px;">
        🤖 Open AI Evidence Collector
      </button>
      <button class="btn btn-secondary btn-sm" onclick="switchTab('manager-reports')" style="font-size: 0.65rem; padding: 4px 8px;">
        🔒 Verify Evidence File Hash
      </button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
      <h4 style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 4px; margin: 0;">
        Mapped Control Objectives & Audits
      </h4>
      ${controlsHtml}
    </div>
  `;
}
