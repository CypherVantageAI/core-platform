// ==========================================================================
// Cypher Vantage - ICT Risk Module (ES6 Module)
// ==========================================================================

import { getState } from '../core/db.js';
import { createTable, createCard, createStatusBadge, createRiskHeatmap } from '../components/ui.js';

let filterLikelihood = null;
let filterImpact = null;

export function renderIctRiskModule() {
  const state = getState();
  const container = document.getElementById('view-manager-risk');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- Top Action bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.01); padding: 10px 15px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04);">
        <div>
          <strong style="color: var(--text-primary); font-size: 0.8rem; display: block;">Advanced ICT &amp; AI Security Audits</strong>
          <span style="font-size: 0.65rem; color: var(--text-muted);">Manage platform risk vectors and access LLM DLP Gateway defenses.</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="switchTab('manager-ai-risk')" style="font-size: 0.68rem; padding: 4px 10px; display: flex; align-items: center; gap: 4px;">
          🤖 Open AI Security &amp; DLP Audit Suite ➔
        </button>
      </div>

      <!-- Main Columns: 5x5 Heatmap & Risk Register -->
      <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
        <!-- Left: Heatmap Grid -->
        <div class="dashboard-card" style="flex: 1; min-width: 320px; display: flex; flex-direction: column; justify-content: center; padding: 15px; margin: 0; min-height: 380px;">
          <div id="risk-heatmap-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;"></div>
          
          <div id="active-heatmap-filter-indicator" style="text-align: center; font-size: 0.65rem; color: var(--color-cyan); margin-top: 10px; font-weight: 600; min-height: 20px;">
            <!-- Populated dynamically -->
          </div>
        </div>

        <!-- Right: Risk Register -->
        <div class="dashboard-card" style="flex: 2; min-width: 480px; padding: 15px; display: flex; flex-direction: column; gap: 10px; margin: 0; min-height: 380px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 6px;">
            <h3 style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
              Operational ICT Risk Register
            </h3>
            <button id="btn-clear-heatmap-filter" class="btn btn-secondary btn-xs hidden" style="padding: 2px 8px;">Clear Grid Filter</button>
          </div>
          
          <div id="risk-register-table-container" style="width: 100%;"></div>
        </div>
      </div>
    </div>
  `;

  // Bind clear filter button
  const clearBtn = document.getElementById('btn-clear-heatmap-filter');
  if (clearBtn) {
    clearBtn.onclick = () => {
      filterLikelihood = null;
      filterImpact = null;
      renderHeatmapAndTable();
    };
  }

  renderHeatmapAndTable();
}

/**
 * Handle rendering of both the heatmap and the table container
 */
function renderHeatmapAndTable() {
  const state = getState();
  const filterIndicator = document.getElementById('active-heatmap-filter-indicator');
  const clearBtn = document.getElementById('btn-clear-heatmap-filter');

  // Update filter indicators
  if (filterLikelihood !== null && filterImpact !== null) {
    if (filterIndicator) {
      filterIndicator.innerHTML = `⚠️ Active Filter: Likelihood = <b>${filterLikelihood}</b> | Impact = <b>${filterImpact}</b>`;
    }
    if (clearBtn) clearBtn.classList.remove('hidden');
  } else {
    if (filterIndicator) filterIndicator.innerHTML = '💡 Click on any occupied heatmap cell to filter risks by severity coordinates.';
    if (clearBtn) clearBtn.classList.add('hidden');
  }

  // Draw heatmap
  createRiskHeatmap('risk-heatmap-container', state.risks, (l, i) => {
    filterLikelihood = l;
    filterImpact = i;
    renderHeatmapAndTable();
  });

  // Filter risk array
  let filteredRisks = [...state.risks];
  if (filterLikelihood !== null && filterImpact !== null) {
    filteredRisks = filteredRisks.filter(r => parseInt(r.likelihood) === filterLikelihood && parseInt(r.impact) === filterImpact);
  }

  // Render Table
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Risk Vector', render: (row) => `<b>${row.title}</b>` },
    { key: 'category', label: 'Category' },
    { 
      key: 'score', 
      label: 'L x I', 
      render: (row) => `<span style="font-weight: 700; color: ${row.likelihood * row.impact >= 15 ? '#ef4444' : (row.likelihood * row.impact >= 10 ? '#f97316' : '#eab308')}">${row.likelihood} × ${row.impact} = <b>${row.likelihood * row.impact}</b></span>`
    },
    { key: 'owner', label: 'Owner', render: (row) => `<span style="font-size:0.7rem; color:var(--text-secondary);">${row.owner}</span>` },
    { key: 'status', label: 'Status', render: (row) => createStatusBadge(row.status) },
    { 
      key: 'mitigation', 
      label: 'Mitigation Controls', 
      render: (row) => `<span style="font-size:0.68rem; color:var(--text-secondary); line-height:1.25; display:block;">${row.mitigation}</span>` 
    }
  ];

  createTable('risk-register-table-container', filteredRisks, columns, {
    searchPlaceholder: 'Search risk registry...',
    pageSize: 5
  });
}
