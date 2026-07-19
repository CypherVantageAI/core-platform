// ==========================================================================
// Cypher Vantage - Reports & Simulation Audit Module (ES6 Module)
// ==========================================================================

import { getState, saveState } from '../core/db.js';
import { createTable, createCard, createStatusBadge } from '../components/ui.js';

let activeTlptInterval = null;

export function renderReportsModule() {
  const state = getState();
  const container = document.getElementById('view-manager-reports');
  if (!container) return;

  // Initialize tlpt state if missing
  if (!state.tlpt) {
    state.tlpt = {
      status: 'Ready',
      currentPhase: 'Threat Intelligence',
      selectedScenario: 'Ransomware on Identity Gateways',
      logHistory: [],
      mitigationActions: []
    };
  }

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

      <!-- Retained TIBER-EU / TLPT Red Team Simulator (Advanced Tool) -->
      <div class="dashboard-card" style="padding: 15px; width: 100%; display: flex; flex-direction: column; gap: 12px; border-left: 4px solid #ef4444;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 8px;">
          <div>
            <h3 style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 6px;">
              ⚔️ Advanced: TIBER-EU / TLPT Red Team &amp; BAS Simulator
            </h3>
            <span style="font-size: 0.62rem; color: var(--text-muted);">Audits operational resilience under DORA Article 26 testing criteria.</span>
          </div>
          <div>
            <span id="tlpt-status-badge" class="badge" style="font-size: 0.6rem; padding: 2px 6px; font-family: monospace;">READY</span>
          </div>
        </div>

        <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
          <!-- Simulator Controls -->
          <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 10px;">
            <div class="form-group">
              <label style="font-size: 0.68rem; font-weight: 600; color: var(--text-secondary);">Select Target Scenario</label>
              <select id="tlpt-scenario-selector" class="dropdown-control mt-1" style="width: 100%; font-size: 0.72rem;">
                <option value="Ransomware on Identity Gateways">Ransomware on Identity Gateways (Active Directory lockout)</option>
                <option value="Supply Chain Compromise">Supply Chain Compromise (Infosys Database Tampering)</option>
                <option value="DDoS Volumetric Flooding">DDoS Volumetric Flooding (Payments Router isolation)</option>
              </select>
            </div>

            <!-- TIBER Phases -->
            <div style="display: flex; flex-direction: column; gap: 4px; background: rgba(0,0,0,0.15); padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.03);">
              <div style="font-size: 0.62rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em;">TIBER-EU Phase Progress</div>
              <div id="tiber-phase-tracker" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; text-align: center; font-size: 0.58rem; margin-top: 4px;">
                <span class="phase-step active" style="padding: 2px; border-radius: 2px; background: rgba(255,255,255,0.04); color: var(--text-muted);">Scope</span>
                <span class="phase-step" style="padding: 2px; border-radius: 2px; background: rgba(255,255,255,0.04); color: var(--text-muted);">Intel</span>
                <span class="phase-step" style="padding: 2px; border-radius: 2px; background: rgba(255,255,255,0.04); color: var(--text-muted);">Exec</span>
                <span class="phase-step" style="padding: 2px; border-radius: 2px; background: rgba(255,255,255,0.04); color: var(--text-muted);">Replay</span>
              </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 5px;">
              <button id="btn-launch-tlpt" class="btn btn-primary btn-sm" style="flex: 1; font-size: 0.7rem; padding: 6px;">Launch Simulation</button>
              <button id="btn-abort-tlpt" class="btn btn-danger btn-sm hidden" style="flex: 1; font-size: 0.7rem; padding: 6px;">Abort Simulation</button>
            </div>
          </div>

          <!-- Simulator Output Console -->
          <div style="flex: 2; min-width: 380px; display: flex; flex-direction: column; gap: 6px;">
            <div style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em;">Live Simulation Terminal Console</div>
            <div id="tlpt-simulation-console" style="height: 140px; overflow-y: auto; font-family: monospace; font-size: 0.7rem; color: #38bdf8; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.04); border-radius: 4px; line-height: 1.45;">
              <span style="color: var(--text-muted);">Select a target scenario and click "Launch Simulation" to audit failover defenses...</span>
            </div>
          </div>
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
    value: `${Math.round((passedTests / totalTests) * 100)}%`,
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

  // Bind simulator buttons
  const btnLaunch = document.getElementById('btn-launch-tlpt');
  const btnAbort = document.getElementById('btn-abort-tlpt');
  const selector = document.getElementById('tlpt-scenario-selector');

  if (btnLaunch) {
    btnLaunch.onclick = () => {
      startTlptSimulationLocal(selector.value);
    };
  }
  if (btnAbort) {
    btnAbort.onclick = () => {
      stopTlptSimulationLocal();
    };
  }

  // Update status UI state on redraw
  updateTlptUiState();
}

/**
 * Update simulator UI components
 */
function updateTlptUiState() {
  const state = getState();
  const statusBadge = document.getElementById('tlpt-status-badge');
  const btnLaunch = document.getElementById('btn-launch-tlpt');
  const btnAbort = document.getElementById('btn-abort-tlpt');
  const tracker = document.getElementById('tiber-phase-tracker');

  if (!statusBadge) return;

  statusBadge.innerText = state.tlpt.status.toUpperCase();
  if (state.tlpt.status === 'Active') {
    statusBadge.style.background = 'rgba(239, 68, 68, 0.12)';
    statusBadge.style.color = '#ef4444';
    statusBadge.style.border = '1px solid rgba(239, 68, 68, 0.2)';
    if (btnLaunch) btnLaunch.classList.add('hidden');
    if (btnAbort) btnAbort.classList.remove('hidden');
  } else {
    statusBadge.style.background = 'rgba(16, 185, 129, 0.12)';
    statusBadge.style.color = '#10b981';
    statusBadge.style.border = '1px solid rgba(16, 185, 129, 0.2)';
    if (btnLaunch) btnLaunch.classList.remove('hidden');
    if (btnAbort) btnAbort.classList.add('hidden');
  }

  // Phase highlights
  if (tracker) {
    const phases = ['Prep', 'Intel', 'Exec', 'Replay'];
    const activeIndex = ['Prep & Scope', 'Threat Intelligence', 'Red Team Execution', 'Closure & Replay'].indexOf(state.tlpt.currentPhase);
    
    tracker.innerHTML = phases.map((phase, idx) => {
      const activeStyle = idx === activeIndex 
        ? 'background: #ef4444; color: #fff; font-weight:700;' 
        : 'background: rgba(255,255,255,0.04); color: var(--text-muted);';
      return `<span style="padding: 2px 4px; border-radius: 2px; ${activeStyle}">${phase}</span>`;
    }).join('');
  }
}

/**
 * Start the local TIBER-EU/TLPT Red Team simulation logs loop
 */
function startTlptSimulationLocal(scenario) {
  const state = getState();
  const consoleLog = document.getElementById('tlpt-simulation-console');

  state.tlpt.status = 'Active';
  state.tlpt.selectedScenario = scenario;
  state.tlpt.currentPhase = 'Prep & Scope';
  state.tlpt.logHistory = [];
  
  if (consoleLog) {
    consoleLog.innerHTML = `<span style="color:#ef4444;">[TIBER-EU INIT] Setting up scope boundaries for: "${scenario}"...</span><br/>`;
  }

  updateTlptUiState();
  saveState();

  const scriptLogs = [
    { phase: 'Prep & Scope', text: `[TIBER-EU Scope] Targeting mapping logs...`, delay: 1000 },
    { phase: 'Threat Intelligence', text: `[Threat Intel] Harvesting external vulnerabilities for targeted domains...`, delay: 2000 },
    { phase: 'Threat Intelligence', text: `[Threat Intel] Target found: CVE-2026-9912 active node vulnerability.`, delay: 4000 },
    { phase: 'Red Team Execution', text: `[Exploitation] Executing remote connection exploit payload to primary node...`, delay: 6000 },
    { phase: 'Red Team Execution', text: `[Exploitation] Active compromise: Access gained to Spring Core Gateway.`, delay: 8000 },
    { phase: 'Red Team Execution', text: `[Defense Handoff] Warning raised! Cypher Vantage IDS detects unauthorized writes.`, delay: 10000 },
    { phase: 'Closure & Replay', text: `[Resiliency Verification] Success: Multi-region traffic diverted to backup nodes.`, delay: 12000 },
    { phase: 'Closure & Replay', text: `[TIBER-EU Done] Simulation complete. Vulnerabilities logged in Findings list.`, delay: 13000 }
  ];

  let logIndex = 0;
  
  function triggerNextLog() {
    if (state.tlpt.status !== 'Active') return;
    
    if (logIndex < scriptLogs.length) {
      const log = scriptLogs[logIndex];
      state.tlpt.currentPhase = log.phase;
      
      const p = document.createElement('div');
      p.innerHTML = `<span style="color:var(--text-muted);">${new Date().toLocaleTimeString()}</span> <span style="color:${log.text.includes('Success') || log.text.includes('Done') ? '#10b981' : '#38bdf8'}">${log.text}</span>`;
      if (consoleLog) {
        consoleLog.appendChild(p);
        consoleLog.scrollTop = consoleLog.scrollHeight;
      }
      
      state.tlpt.logHistory.push(p.innerHTML);
      updateTlptUiState();
      saveState();
      
      logIndex++;
      activeTlptInterval = setTimeout(triggerNextLog, 2500);
    } else {
      state.tlpt.status = 'Ready';
      updateTlptUiState();
      saveState();
    }
  }

  triggerNextLog();
}

/**
 * Abort active simulation
 */
function stopTlptSimulationLocal() {
  const state = getState();
  if (activeTlptInterval) {
    clearTimeout(activeTlptInterval);
  }
  state.tlpt.status = 'Ready';
  state.tlpt.currentPhase = 'Prep & Scope';
  
  const consoleLog = document.getElementById('tlpt-simulation-console');
  if (consoleLog) {
    consoleLog.innerHTML += `<div style="color:#ef4444; font-weight:700;">[ABORTED] Simulation aborted by Risk Manager Sarah Jenkins.</div>`;
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }
  
  updateTlptUiState();
  saveState();
}
