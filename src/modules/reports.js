// ==========================================================================
// Cypher Vantage - Reports & Incident Registry Module (ES6 Module)
// ==========================================================================

import { getState, saveState } from '../core/db.js';
import { createTable, createCard, createStatusBadge } from '../components/ui.js';

export function renderReportsModule() {
  const state = getState();
  const container = document.getElementById('view-manager-reports');
  if (!container) return;

  // Calculate metric values
  const totalTests = state.tests.length;
  const passedTests = state.tests.filter(t => t.results === 'Passed').length;
  const totalIncidents = state.incidents.length;
  const totalLossPrevented = state.incidents.reduce((sum, i) => sum + (i.financialLoss || 0), 0);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- KPI stats row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; width: 100%;">
        <div id="reports-kpi-tests"></div>
        <div id="reports-kpi-success"></div>
        <div id="reports-kpi-incidents"></div>
        <div id="reports-kpi-loss"></div>
      </div>

      <!-- Historical Logs & Incident Grid -->
      <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
        <!-- Left: Completed Tests and Audit Trail -->
        <div class="dashboard-card" style="flex: 1.2; min-width: 400px; padding: 15px; display: flex; flex-direction: column; gap: 10px; margin: 0;">
          <h3 style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 6px; margin: 0;">
            Resilience Test Audit Log
          </h3>
          <div id="completed-tests-table-container" style="width: 100%;"></div>
        </div>

        <!-- Right: Mapped Incidents -->
        <div class="dashboard-card" style="flex: 1.2; min-width: 400px; padding: 15px; display: flex; flex-direction: column; gap: 10px; margin: 0;">
          <h3 style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 6px; margin: 0;">
            DORA Article 19 Incident Registry
          </h3>
          <div id="historical-incidents-table-container" style="width: 100%;"></div>
        </div>
      </div>
    </div>
  `;

  // Render KPI cards
  createCard('reports-kpi-tests', {
    title: 'Total Tests Run',
    value: `${totalTests}`,
    icon: '📊',
    borderLeftColor: '#14b8a6'
  });

  createCard('reports-kpi-success', {
    title: 'Success Pass Rate',
    value: `${totalTests ? Math.round((passedTests / totalTests) * 100) : 100}%`,
    subtext: 'Passed integrity audits',
    icon: '✅',
    borderLeftColor: '#10b981'
  });

  createCard('reports-kpi-incidents', {
    title: 'DORA Incidents Logged',
    value: `${totalIncidents}`,
    icon: '🚨',
    borderLeftColor: '#ef4444'
  });

  createCard('reports-kpi-loss', {
    title: 'Estimated Loss Prevented',
    value: `£${totalLossPrevented.toLocaleString()}`,
    subtext: 'Through automated failovers',
    icon: '💰',
    borderLeftColor: '#eab308'
  });

  // Render Completed Tests Table
  const testColumns = [
    { key: 'title', label: 'Resilience Test Run', render: (row) => `<b>${row.title}</b>` },
    { key: 'type', label: 'Type' },
    { key: 'lastRun', label: 'Execution Date' },
    { key: 'results', label: 'Audited Results', render: (row) => createStatusBadge(row.results) }
  ];
  createTable('completed-tests-table-container', state.tests, testColumns, {
    showSearch: false,
    pageSize: 3
  });

  // Render Incidents Table with Print Action
  const incidentColumns = [
    { key: 'title', label: 'Operational Outage / Threat Event', render: (row) => `<b>${row.title}</b>` },
    { key: 'serviceAffected', label: 'Affected Service' },
    { key: 'financialLoss', label: 'Prevented Loss', render: (row) => `£${row.financialLoss.toLocaleString()}` },
    { 
      key: 'actions', 
      label: 'DORA Report', 
      render: (row) => `
        <button class="btn btn-secondary btn-xs print-dora-report-btn" data-id="${row.id}" style="padding:2px 6px;">📄 ESA Report</button>
      ` 
    }
  ];
  createTable('historical-incidents-table-container', state.incidents, incidentColumns, {
    showSearch: false,
    pageSize: 3
  });

  // Bind report printing triggers
  document.querySelectorAll('.print-dora-report-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      if (typeof window.openDoraIncidentReport === 'function') {
        window.openDoraIncidentReport(id);
      }
    };
  });
}
