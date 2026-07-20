// ==========================================================================
// Cypher Vantage - ICT Risk Module (ES6 Module)
// ==========================================================================

import { getState } from '../core/db.js';
import { createTable, createStatusBadge, createRiskHeatmap } from '../components/ui.js';

let filterLikelihood = null;
let filterImpact = null;

let thresholdMedium = 5;
let thresholdHigh = 10;
let thresholdCritical = 15;

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
        <!-- Left: Heatmap Grid (Shrunk and configured width) -->
        <div class="dashboard-card" style="width: 340px; flex: none; display: flex; flex-direction: column; padding: 12px; margin: 0; min-height: 380px;">
          <div id="risk-heatmap-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;"></div>
          
          <div id="active-heatmap-filter-indicator" style="text-align: center; font-size: 0.65rem; color: var(--color-cyan); margin-top: 10px; font-weight: 600; min-height: 20px;">
            <!-- Populated dynamically -->
          </div>

          <!-- Configuration Controls -->
          <div style="margin-top: 15px; width: 100%; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-weight: 700; color: var(--text-secondary); text-transform: uppercase; font-size: 0.62rem; letter-spacing: 0.05em;">Threshold Configurations</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="display: flex; justify-content: space-between; align-items: center; color: var(--text-secondary);">
                <span>Medium Severity (Score ≥):</span>
                <input type="number" id="input-thresh-med" value="${thresholdMedium}" min="1" max="25" style="width: 50px; background: #0c101b; border: 1px solid rgba(255,255,255,0.1); color: var(--text-primary); text-align: center; border-radius: 3px; font-size: 0.7rem; padding: 2px;"/>
              </label>
              <label style="display: flex; justify-content: space-between; align-items: center; color: var(--text-secondary);">
                <span>High Severity (Score ≥):</span>
                <input type="number" id="input-thresh-high" value="${thresholdHigh}" min="1" max="25" style="width: 50px; background: #0c101b; border: 1px solid rgba(255,255,255,0.1); color: var(--text-primary); text-align: center; border-radius: 3px; font-size: 0.7rem; padding: 2px;"/>
              </label>
              <label style="display: flex; justify-content: space-between; align-items: center; color: var(--text-secondary);">
                <span>Critical Severity (Score ≥):</span>
                <input type="number" id="input-thresh-crit" value="${thresholdCritical}" min="1" max="25" style="width: 50px; background: #0c101b; border: 1px solid rgba(255,255,255,0.1); color: var(--text-primary); text-align: center; border-radius: 3px; font-size: 0.7rem; padding: 2px;"/>
              </label>
            </div>
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

  // Bind threshold settings
  const inputMed = document.getElementById('input-thresh-med');
  const inputHigh = document.getElementById('input-thresh-high');
  const inputCrit = document.getElementById('input-thresh-crit');

  if (inputMed) {
    inputMed.onchange = (e) => {
      thresholdMedium = Math.max(1, parseInt(e.target.value) || 5);
      renderHeatmapAndTable();
    };
  }
  if (inputHigh) {
    inputHigh.onchange = (e) => {
      thresholdHigh = Math.max(1, parseInt(e.target.value) || 10);
      renderHeatmapAndTable();
    };
  }
  if (inputCrit) {
    inputCrit.onchange = (e) => {
      thresholdCritical = Math.max(1, parseInt(e.target.value) || 15);
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
      filterIndicator.innerHTML = `⚠️ Filtered: L = <b>${filterLikelihood}</b> | I = <b>${filterImpact}</b>`;
    }
    if (clearBtn) clearBtn.classList.remove('hidden');
  } else {
    if (filterIndicator) filterIndicator.innerHTML = '💡 Click on any occupied cell to filter by severity coordinates.';
    if (clearBtn) clearBtn.classList.add('hidden');
  }

  // Draw heatmap with thresholds
  createRiskHeatmap('risk-heatmap-container', state.risks, (l, i) => {
    filterLikelihood = l;
    filterImpact = i;
    renderHeatmapAndTable();
  }, {
    medium: thresholdMedium,
    high: thresholdHigh,
    critical: thresholdCritical
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
      label: 'Risk score ( L x I )', 
      render: (row) => {
        const score = row.likelihood * row.impact;
        let color = '#10b981'; // Low (Green)
        if (score >= thresholdCritical) color = '#ef4444'; // Critical (Red)
        else if (score >= thresholdHigh) color = '#f97316'; // High (Orange)
        else if (score >= thresholdMedium) color = '#eab308'; // Medium (Yellow)
        return `<span style="font-weight: 700; color: ${color}">${row.likelihood} × ${row.impact} = <b>${score}</b></span>`;
      }
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
