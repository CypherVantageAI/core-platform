// ==========================================================================
// Cypher Vantage - Operational Resilience Scenario Simulation Engine (ES6)
// ==========================================================================

import { getState, saveState } from '../core/db.js';

let activeScenarioId = 'sim-cloud-outage';
let activeReadoutTab = 'executive';
let isCustomDesigning = false;

// Custom designer form state
let designerForm = {
  id: 'sim-custom-default',
  name: 'Custom Active Threat Scenario',
  description: 'Enterprise-wide critical gateway disruption simulated by risk coordinator.',
  threatCategory: 'Cyber',
  severity: 'Critical',
  likelihood: 3,
  impactRating: 4,
  servicesAffected: ['srv-001'],
  backupStrategy: 'Warm Standby',
  detectionDelay: 10,
  preventionEffectiveness: 80,
  recoveryReadiness: 70
};

// Interactive Control Override states
let controlOverrides = {
  mfa: true,
  endpoint: true,
  auditing: true,
  siem: true,
  anomaly: true,
  replication: true,
  container: true
};

export function renderSimulationTab(container) {
  const state = getState();
  const scenarios = state.scenarios || [];
  
  // Find current active scenario
  let activeScenario = scenarios.find(s => s.id === activeScenarioId);
  if (!activeScenario) {
    activeScenario = scenarios[0] || designerForm;
  }

  // Calculate dynamic simulation metrics
  const simResults = calculateSimulation(state, activeScenario);

  // Render HTML Structure
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- Section 1: Template Library & Custom Designer Toggle -->
      <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
        
        <!-- Left Panel: Template Cards Grid -->
        <div class="dashboard-card" style="flex: 2; min-width: 480px; padding: 15px; margin: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px;">
            <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
              Operational Resilience Scenario Templates
            </h3>
            <button id="btn-toggle-designer" class="btn btn-primary btn-xs" style="padding: 4px 10px; font-size: 0.65rem;">
              ${isCustomDesigning ? '✕ Close Designer' : '🛠️ Design Custom Scenario'}
            </button>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; max-height: 280px; overflow-y: auto; padding-right: 4px;">
            ${scenarios.map(sc => {
              const isActive = sc.id === activeScenarioId && !isCustomDesigning;
              const cardBorder = isActive ? '2px solid var(--color-danger)' : '1px solid var(--border-color)';
              const badgeBg = sc.severity === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
              const badgeColor = sc.severity === 'Critical' ? '#ef4444' : '#f59e0b';
              
              return `
                <div class="scenario-template-card" data-id="${sc.id}" style="border: ${cardBorder}; border-radius: 6px; padding: 10px; cursor: pointer; background: var(--bg-card); transition: all 0.2s ease; position: relative;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-primary); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${sc.name}
                    </span>
                    <span style="font-size: 0.55rem; padding: 1px 5px; border-radius: 3px; font-weight: 700; background: ${badgeBg}; color: ${badgeColor}; text-transform: uppercase;">
                      ${sc.severity}
                    </span>
                  </div>
                  <p style="font-size: 0.65rem; color: var(--text-secondary); line-height: 1.3; margin-bottom: 8px;">
                    ${sc.description.slice(0, 85)}${sc.description.length > 85 ? '...' : ''}
                  </p>
                  <div style="display: flex; justify-content: space-between; font-size: 0.58rem; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 6px;">
                    <span>Category: <b>${sc.threatCategory}</b></span>
                    <span>Likelihood: <b>${sc.likelihood}/5</b></span>
                  </div>
                  ${isActive ? `<div style="position: absolute; bottom: 6px; right: 10px; font-size: 0.8rem;">🎯</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right Panel: Dynamic Scenario Heatmap (5x5 Likelihood vs Impact) -->
        <div class="dashboard-card" style="flex: 1; min-width: 280px; padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
          <h3 style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin: 0;">
            Comparative Risk Heatmap
          </h3>
          <div style="flex: 1; display: flex; justify-content: center; align-items: center; padding: 5px;">
            <!-- 5x5 Heatmap Layout Grid -->
            <div style="display: flex; flex-direction: column; width: 100%; max-width: 220px;">
              <div style="display: flex; flex: 1; position: relative;">
                
                <!-- Y-axis Label -->
                <div style="writing-mode: vertical-lr; transform: rotate(180deg); font-size: 0.58rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; text-align: center; padding-right: 6px;">
                  Impact Severity →
                </div>
                
                <!-- The 5x5 Matrix Grid -->
                <div style="display: grid; grid-template-rows: repeat(5, 1fr); grid-template-columns: repeat(5, 1fr); gap: 2px; width: 100%; aspect-ratio: 1; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); position: relative;">
                  ${generateHeatmapCells(activeScenario, scenarios)}
                </div>
              </div>
              <!-- X-axis Label -->
              <div style="text-align: center; font-size: 0.58rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; padding-top: 6px; padding-left: 20px;">
                Likelihood Profile →
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Scenario Designer Drawer (rendered conditionally inside layout) -->
      ${isCustomDesigning ? renderDesignerForm(state) : ''}

      <!-- Section 2: Interactive Control Override Console & Dynamic Calculations -->
      <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
        
        <!-- Left: Control Performance Overrides -->
        <div class="dashboard-card" style="flex: 1; min-width: 320px; padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 12px;">
          <h3 style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin: 0;">
            🛡️ Control Performance Tuning
          </h3>
          <p class="panel-subtitle" style="margin-bottom: 5px;">Toggle active controls to simulate operational failures, test recovery strategies, and immediately view consequences on board metrics.</p>
          
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Preventive Controls Group -->
            <div style="border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 8px;">
              <span style="font-size: 0.58rem; font-weight: 700; color: #8b5cf6; text-transform: uppercase; letter-spacing: 0.04em;">Preventive Controls</span>
              <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 5px;">
                ${renderControlToggle('mfa', 'Advanced Tenant MFA & Zero Trust Auth', 'Restricts hijacked employee tokens propagation speed')}
                ${renderControlToggle('endpoint', 'Host Endpoint Intrusion Isolation', 'Blocks automated server-side encryption payloads')}
                ${renderControlToggle('auditing', 'Real-time Identity Audit Logging', 'Allows earlier detection boundaries')}
              </div>
            </div>

            <!-- Detective Controls Group -->
            <div style="border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 8px;">
              <span style="font-size: 0.58rem; font-weight: 700; color: var(--color-cyan); text-transform: uppercase; letter-spacing: 0.04em;">Detective Controls</span>
              <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 5px;">
                ${renderControlToggle('siem', 'AI-Driven SIEM Alerting Integration', 'Reduces detection delays from hours to minutes')}
                ${renderControlToggle('anomaly', 'Host Disk Write Anomaly Monitors', 'Triggers auto-isolation of target nodes')}
              </div>
            </div>

            <!-- Recovery Controls Group -->
            <div>
              <span style="font-size: 0.58rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.04em;">Recovery Controls</span>
              <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 5px;">
                ${renderControlToggle('replication', 'Multi-Zone Db Journal Sync', 'Provides warm database backups data consistency')}
                ${renderControlToggle('container', 'Kubernetes Node Failover Automations', 'Engages backup environments within seconds')}
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Real-time Impact Calculations Dashboard -->
        <div class="dashboard-card" style="flex: 2; min-width: 480px; padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 15px; border: 1px solid rgba(239, 68, 68, 0.25); background: linear-gradient(135deg, rgba(239, 68, 68, 0.03), rgba(0,0,0,0));">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
            <h3 style="font-size: 0.8rem; color: #ef4444; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; margin: 0;">
              ⚠️ Live Outage Impact Analysis
            </h3>
            <span style="font-size: 0.62rem; font-weight: 700; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">
              Active Scenario: ${activeScenario.name}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            
            <!-- Metric 1: Business Services Affected -->
            <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px;">
              <span style="font-size: 0.58rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Business Services affected</span>
              <div style="font-size: 1rem; font-weight: 800; color: var(--text-primary); margin: 4px 0 2px 0;">
                ${simResults.servicesAffectedCount} Service(s)
              </div>
              <div style="font-size: 0.62rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${simResults.servicesList}
              </div>
            </div>

            <!-- Metric 2: Customers Affected -->
            <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px;">
              <span style="font-size: 0.58rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Estimated Customer Impact</span>
              <div style="font-size: 1rem; font-weight: 800; color: var(--color-cyan); margin: 4px 0 2px 0;">
                ${simResults.customersAffected.toLocaleString()} Accounts
              </div>
              <div style="font-size: 0.62rem; color: var(--text-secondary);">
                Retail & institutional clients offline
              </div>
            </div>

            <!-- Metric 3: Downtime Revenue Loss -->
            <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px;">
              <span style="font-size: 0.58rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Estimated Revenue Impact</span>
              <div style="font-size: 1rem; font-weight: 800; color: #ef4444; margin: 4px 0 2px 0;">
                ${state.resilience.selectedCurrency === 'USD' ? '$' : (state.resilience.selectedCurrency === 'EUR' ? '€' : '£')}${simResults.totalRevenueLoss.toLocaleString()}
              </div>
              <div style="font-size: 0.62rem; color: var(--text-muted);">
                Loss rate: ${state.resilience.selectedCurrency === 'USD' ? '$' : (state.resilience.selectedCurrency === 'EUR' ? '€' : '£')}${simResults.hourlyLossRate.toLocaleString()}/hr
              </div>
            </div>

            <!-- Metric 4: Recovery Timeline -->
            <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; position: relative;">
              <span style="font-size: 0.58rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Recovery Timeline vs RTO</span>
              <div style="font-size: 1rem; font-weight: 800; color: ${simResults.rtoCheck === 'SLA Breach' ? '#ef4444' : '#10b981'}; margin: 4px 0 2px 0;">
                ${simResults.recoveryHours} Hrs ${simResults.recoveryMinutes} Mins
              </div>
              <div style="font-size: 0.62rem; color: var(--text-secondary);">
                Status: <b>${simResults.rtoCheck}</b> (Target: ${simResults.maxRtoText})
              </div>
            </div>
          </div>

          <!-- Bottom: Regulatory Risk Warnings & Recovery Confidence -->
          <div style="display: flex; gap: 12px; margin-top: 5px; flex-wrap: wrap;">
            
            <!-- Recovery Confidence Meter -->
            <div style="flex: 1; min-width: 200px; background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; justify-content: center; gap: 6px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">
                <span>Recovery Confidence Index</span>
                <span style="color: ${simResults.confidenceColor}; font-weight: 800;">${simResults.recoveryConfidence}%</span>
              </div>
              <div style="height: 6px; background: rgba(255,255,255,0.03); border-radius: 3px; overflow: hidden; width: 100%;">
                <div style="height: 100%; width: ${simResults.recoveryConfidence}%; background: ${simResults.confidenceColor};"></div>
              </div>
              <span style="font-size: 0.62rem; color: var(--text-secondary);">
                Failover Strategy: <b>${activeScenario.backupStrategy}</b>
              </span>
            </div>

            <!-- Regulatory Breach Notification -->
            <div style="flex: 1.5; min-width: 280px; background: rgba(239, 68, 68, 0.02); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.58rem; color: #ef4444; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em;">DORA Compliance Exposure</span>
              <p style="font-size: 0.65rem; color: var(--text-secondary); line-height: 1.35; margin: 0;">
                🚨 <b>${simResults.regulatoryBreach}</b>. Violated articles: DORA Chapter II (ICT Risk), DORA Art. 11 (Business Continuity), and Art. 26 (Resilience testing).
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Executive Readout Generation Panel -->
      <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
          <div>
            <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
              Executive Briefing & Readout Generator
            </h3>
            <p class="panel-subtitle" style="margin: 0; margin-top: 2px;">Generate board slide text, regulatory notifications, and engineering summaries dynamically from simulated performance.</p>
          </div>
          
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button id="btn-readout-executive" class="btn btn-secondary btn-xs ${activeReadoutTab === 'executive' ? 'active' : ''}">👔 Executive View</button>
            <button id="btn-readout-cro" class="btn btn-secondary btn-xs ${activeReadoutTab === 'cro' ? 'active' : ''}">⚖️ CRO View</button>
            <button id="btn-readout-coo" class="btn btn-secondary btn-xs ${activeReadoutTab === 'coo' ? 'active' : ''}">⚙️ COO View</button>
            <button id="btn-readout-ciso" class="btn btn-secondary btn-xs ${activeReadoutTab === 'ciso' ? 'active' : ''}">🛡️ CISO View</button>
            <button id="btn-readout-regulator" class="btn btn-secondary btn-xs ${activeReadoutTab === 'regulator' ? 'active' : ''}">📜 Regulator View</button>
            <button id="btn-copy-readout" class="btn btn-primary btn-xs" style="margin-left: 8px;">📋 Copy Brief</button>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.15); border: 1px solid var(--border-color); border-radius: 6px; padding: 15px; min-height: 180px; font-family: 'Courier New', Courier, monospace; font-size: 0.72rem; line-height: 1.45; overflow-y: auto; color: var(--text-primary); white-space: pre-wrap;" id="readout-text-panel">
          ${generateExecutiveReadoutText(state, activeScenario, simResults)}
        </div>
      </div>
    </div>
  `;

  // Bind scenario templates clicks
  document.querySelectorAll('.scenario-template-card').forEach(card => {
    card.onclick = () => {
      activeScenarioId = card.getAttribute('data-id');
      isCustomDesigning = false;
      renderSimulationTab(container);
    };
  });

  // Bind toggle designer button click
  const designerBtn = document.getElementById('btn-toggle-designer');
  if (designerBtn) {
    designerBtn.onclick = () => {
      isCustomDesigning = !isCustomDesigning;
      renderSimulationTab(container);
    };
  }

  // Bind control override toggles
  document.querySelectorAll('.control-toggle-checkbox').forEach(toggle => {
    toggle.onchange = () => {
      const key = toggle.getAttribute('data-key');
      controlOverrides[key] = toggle.checked;
      renderSimulationTab(container);
    };
  });

  // Bind executive brief tab switches
  const readoutTabs = ['executive', 'cro', 'coo', 'ciso', 'regulator'];
  readoutTabs.forEach(tab => {
    const btn = document.getElementById(`btn-readout-${tab}`);
    if (btn) {
      btn.onclick = () => {
        activeReadoutTab = tab;
        renderSimulationTab(container);
      };
    }
  });

  // Bind copy readout clipboard button
  const copyBtn = document.getElementById('btn-copy-readout');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const text = document.getElementById('readout-text-panel').innerText;
      navigator.clipboard.writeText(text).then(() => {
        const origText = copyBtn.innerText;
        copyBtn.innerText = '✓ Copied!';
        setTimeout(() => { copyBtn.innerText = origText; }, 1500);
      });
    };
  }

  // Bind Custom Scenario Designer Form submissions
  const customSubmit = document.getElementById('btn-custom-scenario-save');
  if (customSubmit) {
    customSubmit.onclick = (e) => {
      e.preventDefault();
      
      const scName = document.getElementById('custom-sc-name').value;
      const scDesc = document.getElementById('custom-sc-desc').value;
      const scCat = document.getElementById('custom-sc-category').value;
      const scSev = document.getElementById('custom-sc-severity').value;
      const scLike = parseInt(document.getElementById('custom-sc-likelihood').value) || 3;
      const scImp = parseInt(document.getElementById('custom-sc-impact').value) || 3;
      const scStrat = document.getElementById('custom-sc-strategy').value;
      const scDelay = parseInt(document.getElementById('custom-sc-delay').value) || 10;

      // Extract selected business services
      const selectedSrvs = [];
      document.querySelectorAll('.custom-sc-srv-chk').forEach(chk => {
        if (chk.checked) selectedSrvs.push(chk.value);
      });

      if (!scName) {
        alert("Please enter a scenario name.");
        return;
      }

      // Add to scenarios list in db state
      const newScenario = {
        id: `sim-custom-${Date.now()}`,
        name: scName,
        description: scDesc,
        threatCategory: scCat,
        severity: scSev,
        likelihood: scLike,
        impactRating: scImp,
        servicesAffected: selectedSrvs,
        backupStrategy: scStrat,
        detectionDelay: scDelay,
        preventionEffectiveness: 80,
        recoveryReadiness: 70
      };

      state.scenarios.push(newScenario);
      saveState();

      activeScenarioId = newScenario.id;
      isCustomDesigning = false;
      renderSimulationTab(container);
    };
  }
}

// ==========================================================================
// RENDER HELPERS
// ==========================================================================

function renderControlToggle(key, label, tooltip) {
  const isChecked = controlOverrides[key];
  return `
    <label style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 10px; font-size: 0.68rem; cursor: pointer; transition: all 0.15s ease;">
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span style="font-weight: 700; color: var(--text-primary);">${label}</span>
        <span style="font-size: 0.58rem; color: var(--text-muted);">${tooltip}</span>
      </div>
      <input type="checkbox" class="control-toggle-checkbox" data-key="${key}" ${isChecked ? 'checked' : ''} style="width: 14px; height: 14px; cursor: pointer; accent-color: #8b5cf6;">
    </label>
  `;
}

function renderDesignerForm(state) {
  const services = state.services || [];
  return `
    <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border-color);">
      <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin: 0;">
        🛠️ Custom Scenario Designer Form
      </h3>
      
      <form style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;" id="designer-scenario-form">
        <!-- Left Col: General Configuration -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">Scenario Title / Name</label>
            <input type="text" id="custom-sc-name" value="${designerForm.name}" style="padding: 6px 10px; font-size: 0.72rem; border-radius: 4px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); color: var(--text-primary);">
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">Outage Description</label>
            <textarea id="custom-sc-desc" style="padding: 6px 10px; font-size: 0.72rem; border-radius: 4px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); color: var(--text-primary); min-height: 50px; resize: vertical;">${designerForm.description}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">Threat Category</label>
              <select id="custom-sc-category" class="dropdown-control" style="padding: 5px 8px; font-size: 0.72rem;">
                <option value="Cyber">Cyber Breach</option>
                <option value="Infrastructure">Infrastructure Outage</option>
                <option value="Software">Software Bug</option>
                <option value="Data">Data Corruption</option>
                <option value="Vendor">Third-Party Failure</option>
              </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">Severity Rating</label>
              <select id="custom-sc-severity" class="dropdown-control" style="padding: 5px 8px; font-size: 0.72rem;">
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">Likelihood (1-5)</label>
              <select id="custom-sc-likelihood" class="dropdown-control" style="padding: 5px 8px; font-size: 0.72rem;">
                <option value="1">1 - Very Unlikely</option>
                <option value="2">2 - Unlikely</option>
                <option value="3" selected>3 - Possible</option>
                <option value="4">4 - Likely</option>
                <option value="5">5 - Frequent</option>
              </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">Impact Rating (1-5)</label>
              <select id="custom-sc-impact" class="dropdown-control" style="padding: 5px 8px; font-size: 0.72rem;">
                <option value="1">1 - Negligible</option>
                <option value="2">2 - Minor</option>
                <option value="3">3 - Moderate</option>
                <option value="4" selected>4 - Significant</option>
                <option value="5">5 - Disastrous</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Right Col: Services & Failover strategies -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">Target Mapped Services Affected</label>
            <div style="display: flex; flex-direction: column; gap: 4px; max-height: 100px; overflow-y: auto; background: rgba(0,0,0,0.15); border: 1px solid var(--border-color); padding: 6px; border-radius: 4px;">
              ${services.map(s => `
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.68rem; cursor: pointer; color: var(--text-primary);">
                  <input type="checkbox" class="custom-sc-srv-chk" value="${s.id}" checked style="cursor: pointer; width:12px; height:12px;">
                  <span>${s.name} (${s.criticality})</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">Resilience Strategy</label>
              <select id="custom-sc-strategy" class="dropdown-control" style="padding: 5px 8px; font-size: 0.72rem;">
                <option value="Active-Active">Active-Active Failover</option>
                <option value="Warm Standby">Warm Standby replication</option>
                <option value="None">None (Manual Restore)</option>
              </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">Detection Delay (Mins)</label>
              <input type="number" id="custom-sc-delay" value="${designerForm.detectionDelay}" style="padding: 5px 8px; font-size: 0.72rem; border-radius: 4px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); color: var(--text-primary);">
            </div>
          </div>

          <div style="margin-top: 15px; display: flex; justify-content: flex-end; gap: 10px;">
            <button type="submit" id="btn-custom-scenario-save" class="btn btn-primary" style="padding: 6px 16px; font-size: 0.74rem;">
              💾 Save & Run Simulation
            </button>
          </div>
        </div>
      </form>
    </div>
  `;
}

function generateHeatmapCells(activeScenario, scenarios) {
  let cellsHtml = '';
  // Matrix ranges from 5 (top) to 1 (bottom) for Impact
  // and 1 (left) to 5 (right) for Likelihood
  for (let imp = 5; imp >= 1; imp--) {
    for (let lik = 1; lik <= 5; lik++) {
      // Find all scenarios matching this cell
      const matches = scenarios.filter(s => s.likelihood === lik && s.impactRating === imp);
      
      // Determine background color based on position in risk matrix
      let cellBg = 'rgba(16, 185, 129, 0.06)'; // Low risk green
      if (lik + imp >= 8) {
        cellBg = 'rgba(239, 68, 68, 0.15)'; // High risk red
      } else if (lik + imp >= 6) {
        cellBg = 'rgba(245, 158, 11, 0.1)'; // Medium risk orange/yellow
      }
      
      cellsHtml += `
        <div style="background: ${cellBg}; border: 1px solid rgba(255,255,255,0.02); display: flex; align-items: center; justify-content: center; position: relative;">
          <!-- Static templates markers in this coordinate -->
          <div style="display: flex; gap: 2px; flex-wrap: wrap; justify-content: center; align-items: center;">
            ${matches.map(m => {
              const isTarget = m.id === activeScenario.id;
              if (isTarget) {
                return `<span class="heatmap-pulse-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444; display: block; border: 1px solid #ffffff; box-shadow: 0 0 8px #ef4444; z-index: 5;" title="${m.name} (Active)"></span>`;
              } else {
                return `<span style="width: 5px; height: 5px; border-radius: 50%; background: #f59e0b; display: block; opacity: 0.8;" title="${m.name}"></span>`;
              }
            }).join('')}
          </div>
          
          <!-- Heatmap grid coordinate tags -->
          <span style="position: absolute; bottom: 1px; right: 2px; font-size: 0.45rem; color: var(--text-muted); opacity: 0.35;">${lik},${imp}</span>
        </div>
      `;
    }
  }
  return cellsHtml;
}

// ==========================================================================
// SIMULATION ENGINE MATHEMATICAL CALCULATOR
// ==========================================================================

function calculateSimulation(state, scenario) {
  const services = state.services || [];
  const affectedServiceIds = scenario.servicesAffected || [];
  const affectedServices = services.filter(s => affectedServiceIds.includes(s.id));
  
  // 1. Business Services affected list
  const servicesAffectedCount = affectedServices.length;
  const servicesList = affectedServices.length > 0 
    ? affectedServices.map(s => s.name).join(', ') 
    : 'No services impacted.';

  // 2. Customers Affected
  let customersAffected = 0;
  affectedServices.forEach(s => {
    if (s.id === 'srv-001') customersAffected += 100000;
    else if (s.id === 'srv-002') customersAffected += 12000;
    else if (s.id === 'srv-003') customersAffected += 5000;
    else if (s.id === 'srv-004') customersAffected += 2500;
    else customersAffected += 1000; // custom default
  });

  // 3. Hourly Loss Rate & Total Revenue Loss
  let hourlyLossRate = 0;
  affectedServices.forEach(s => {
    if (s.id === 'srv-001') hourlyLossRate += 75000;
    else if (s.id === 'srv-002') hourlyLossRate += 50000;
    else if (s.id === 'srv-003') hourlyLossRate += 10000;
    else if (s.id === 'srv-004') hourlyLossRate += 120000;
    else hourlyLossRate += 15000;
  });

  // 4. Recovery Timeline (RTO vs actual)
  // Detection delay based on controls
  let simulatedDetection = scenario.detectionDelay || 10;
  if (!controlOverrides.siem) simulatedDetection += 60;
  if (!controlOverrides.anomaly) simulatedDetection += 30;

  // Failover/Restore duration based on backups and controls
  let simulatedRecovery = 0;
  if (scenario.backupStrategy === 'Active-Active') {
    simulatedRecovery = 5;
    if (!controlOverrides.container) simulatedRecovery += 45;
  } else if (scenario.backupStrategy === 'Warm Standby') {
    simulatedRecovery = 120;
    if (!controlOverrides.replication) simulatedRecovery += 180;
  } else {
    simulatedRecovery = 720;
    if (!controlOverrides.replication) simulatedRecovery += 480;
  }

  // Add preventive delays (if preventive controls fail, lateral spread takes longer to stop)
  if (!controlOverrides.mfa) simulatedRecovery += 60;
  if (!controlOverrides.endpoint) simulatedRecovery += 90;

  const totalMinutes = simulatedDetection + simulatedRecovery;
  const recoveryHours = Math.floor(totalMinutes / 60);
  const recoveryMinutes = totalMinutes % 60;

  // Compare recovery timeline against target service RTOs
  let maxRtoMins = 0;
  let maxRtoText = 'N/A';
  affectedServices.forEach(s => {
    const srvRtoVal = parseInt(s.rto.split(' ')[0]) || 4;
    const srvRtoMins = srvRtoVal * 60;
    if (srvRtoMins > maxRtoMins) {
      maxRtoMins = srvRtoMins;
      maxRtoText = s.rto;
    }
  });
  if (maxRtoMins === 0) {
    maxRtoMins = 4 * 60;
    maxRtoText = '4 Hours';
  }

  const rtoCheck = totalMinutes > maxRtoMins ? 'SLA Breach' : 'Within Target';
  const totalRevenueLoss = Math.round((totalMinutes / 60) * hourlyLossRate);

  // 5. Recovery Confidence Index
  let recoveryConfidence = 100;
  if (scenario.backupStrategy === 'None') recoveryConfidence -= 40;
  else if (scenario.backupStrategy === 'Warm Standby') recoveryConfidence -= 15;

  // Deduct for deactivated controls
  if (!controlOverrides.mfa) recoveryConfidence -= 10;
  if (!controlOverrides.endpoint) recoveryConfidence -= 10;
  if (!controlOverrides.auditing) recoveryConfidence -= 5;
  if (!controlOverrides.siem) recoveryConfidence -= 15;
  if (!controlOverrides.anomaly) recoveryConfidence -= 10;
  if (!controlOverrides.replication) recoveryConfidence -= 20;
  if (!controlOverrides.container) recoveryConfidence -= 15;

  recoveryConfidence = Math.max(Math.min(recoveryConfidence, 99), 10);
  const confidenceColor = recoveryConfidence >= 80 ? '#10b981' : (recoveryConfidence >= 50 ? '#f59e0b' : '#ef4444');

  // 6. Regulatory Breach Warning
  let regulatoryBreach = 'Nominal exposure';
  if (rtoCheck === 'SLA Breach') {
    regulatoryBreach = 'High risk of DORA violation (Article 11)';
  } else if (servicesAffectedCount > 1) {
    regulatoryBreach = 'Moderate exposure (Business Continuity review required)';
  }

  return {
    servicesAffectedCount,
    servicesList,
    customersAffected,
    hourlyLossRate,
    totalMinutes,
    recoveryHours,
    recoveryMinutes,
    maxRtoText,
    rtoCheck,
    totalRevenueLoss,
    recoveryConfidence,
    confidenceColor,
    regulatoryBreach
  };
}

// ==========================================================================
// EXECUTIVE READOUT TEXT GENERATOR
// ==========================================================================

function generateExecutiveReadoutText(state, scenario, sim) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const currencySymbol = state.resilience.selectedCurrency === 'USD' ? '$' : (state.resilience.selectedCurrency === 'EUR' ? '€' : '£');

  if (activeReadoutTab === 'cro') {
    return `================================================================================
CHIEF RISK OFFICER (CRO) BOARD BRIEFING
Ref: CRO-${scenario.id.toUpperCase()}-${Math.floor(Date.now()/1000)}
================================================================================
Timestamp: ${timestamp} UTC | Risk Profile: ${scenario.severity.toUpperCase()}
Scenario Triggered: ${scenario.name}

1. MULTI-DIMENSIONAL RISK MATRIX ANALYSIS
--------------------------------------------------------------------------------
* Likelihood Rating:         ${scenario.likelihood} / 5 (Enterprise Threat Register)
* Impact Severity Score:     ${scenario.impactRating} / 5 (Max Disruption Benchmark)
* Financial Revenue Impact:  ${currencySymbol}${sim.totalRevenueLoss.toLocaleString()} (${currencySymbol}${sim.hourlyLossRate.toLocaleString()}/hr)
* Risk Appetite Status:      ${sim.rtoCheck === 'SLA Breach' ? '🚨 OUTSIDE BOARD RISK APPETITE (RTO BREACH)' : '✅ WITHIN RISK TOLERANCE'}

2. COMPLIANCE & GOVERNANCE BREACH EVALUATION
--------------------------------------------------------------------------------
* Regulatory Fines Risk:     ${sim.rtoCheck === 'SLA Breach' ? 'HIGH EXPOSURE (DORA Art. 50 fines up to 2% global turnover)' : 'LOW / MANAGED'}
* DORA Article 11 Violation: ${sim.rtoCheck === 'SLA Breach' ? 'NON-COMPLIANT - Failover time exceeds RTO' : 'COMPLIANT - Failover within window'}
* Recovery Confidence Index: ${sim.recoveryConfidence}% (${sim.recoveryConfidence >= 80 ? 'High' : (sim.recoveryConfidence >= 50 ? 'Moderate' : 'Unacceptable Risk')})

3. CRO MANDATE & MITIGATION DIRECTIVES
--------------------------------------------------------------------------------
* Direct Risk Action:        ${sim.rtoCheck === 'SLA Breach' ? 'Mandate immediate capital expenditure for secondary hot-standby nodes.' : 'Maintain current control testing cadence.'}
* Board Sign-off Required:  Formal acceptance of residual risk for ${sim.servicesList}.
`;
  }

  if (activeReadoutTab === 'coo') {
    return `================================================================================
CHIEF OPERATING OFFICER (COO) OPERATIONAL READOUT
Ref: COO-${scenario.id.toUpperCase()}-${Math.floor(Date.now()/1000)}
================================================================================
Timestamp: ${timestamp} UTC | Operations Scope: Global Infrastructure
Scenario Triggered: ${scenario.name}

1. OPERATIONAL & BUSINESS SERVICE IMPACT
--------------------------------------------------------------------------------
* Impacted Services (${sim.servicesAffectedCount}): ${sim.servicesList}
* Customer / Client Outage:   ${sim.customersAffected.toLocaleString()} active account sessions locked
* Target RTO Window:         ${sim.maxRtoText}
* Estimated Recovery Time:   ${sim.recoveryHours} hours ${sim.recoveryMinutes} minutes (${sim.totalMinutes} mins total)
* Operational Status:        ${sim.rtoCheck === 'SLA Breach' ? '🔴 CRITICAL SERVICE DEGRADATION' : '🟢 OPERATIONAL CONTINUITY MAINTAINED'}

2. FAILOVER & RUNBOOK EXECUTION EFFICIENCY
--------------------------------------------------------------------------------
* Backup Strategy Active:    ${scenario.backupStrategy}
* Detection & Isolation:     ${sim.totalMinutes - (scenario.backupStrategy === 'Active-Active' ? 5 : 120)} mins (Controls: SIEM=${controlOverrides.siem ? 'ON' : 'OFF'}, Anomaly=${controlOverrides.anomaly ? 'ON' : 'OFF'})
* Container Failover:        ${controlOverrides.container ? 'AUTOMATED (Under 5s)' : 'MANUAL REROUTING REQUIRED (+45m delay)'}
* Database Sync Status:      ${controlOverrides.replication ? 'SYNCHRONIZED (0 RPO data loss)' : 'DESYNCHRONIZED (RPO data loss risk)'}

3. COO ACTIONABLE RUNBOOK DIRECTIVES
--------------------------------------------------------------------------------
* Immediate Operational Fix: ${!controlOverrides.replication ? 'Re-establish database journal replication link.' : 'Execute automated traffic rerouting playbook.'}
* Resource Allocation:      Mobilize L3 Infrastructure Engineers to backup standby datacenters.
`;
  }

  if (activeReadoutTab === 'ciso') {
    return `================================================================================
CHIEF INFORMATION SECURITY OFFICER (CISO) INCIDENT BRIEFING
Ref: CISO-${scenario.id.toUpperCase()}-${Math.floor(Date.now()/1000)}
================================================================================
Timestamp: ${timestamp} UTC | Threat Category: ${scenario.threatCategory.toUpperCase()}
Scenario Triggered: ${scenario.name}

1. CYBER THREAT & VECTOR ANALYSIS
--------------------------------------------------------------------------------
* Primary Attack Vector:     ${scenario.description}
* Vulnerability Severity:    ${scenario.severity} (CVSS 9.5+ Exploitation Vector)
* Identity / Auth Boundary:  ${controlOverrides.mfa ? 'MFA ENFORCED (Lateral movement blocked)' : '⚠️ MFA BYPASSED (Lateral movement undetected)'}
* Endpoint Intrusion Shield: ${controlOverrides.endpoint ? 'ENDPOINT ISOLATED (Malware payload contained)' : '⚠️ ENDPOINT SHIELD OFF (Spread uncontained)'}

2. DETECTIVE & PREVENTIVE CONTROL PERFORMANCE
--------------------------------------------------------------------------------
* SIEM Anomaly Detection:    ${controlOverrides.siem ? 'PASSED (0 min alert delay)' : 'FAILED (+60 min detection latency)'}
* Disk Anomaly Monitors:     ${controlOverrides.anomaly ? 'PASSED (Auto-isolation triggered)' : 'FAILED (+30 min containment delay)'}
* Calculated Cyber Containment Duration: ${sim.totalMinutes} minutes
* Technical Recovery Confidence:        ${sim.recoveryConfidence}%

3. CISO REMEDIATION & DEFENSE ROADMAP
--------------------------------------------------------------------------------
* Immediate Security Action: ${!controlOverrides.mfa ? 'Enforce mandatory hardware token MFA across all administrative domains.' : 'Conduct TIBER-EU red-team sweep.'}
* Threat Hunting Directive:  Scan memory dumps for credential harvesting and persistence mechanisms.
`;
  }

  if (activeReadoutTab === 'regulator') {
    return `================================================================================
DORA STATUTORY COMPLIANCE & SUPERVISORY NOTIFICATION
Ref: REG-DORA-${scenario.id.toUpperCase()}-${Math.floor(Date.now()/1000)}
================================================================================
Timestamp: ${timestamp} UTC
Recipients: European Banking Authority (EBA) / Financial Conduct Authority (FCA) / PRA
Entity: Cypher Vantage Core Platform (DORA Major ICT Service Provider)

1. MANDATORY INCIDENT CLASSIFICATION (DORA Art. 18)
--------------------------------------------------------------------------------
* Trigger Event:           ${scenario.name}
* Incident Category:       ${scenario.threatCategory} Disruption
* Statutory Impact Level:   Major ICT Incident (DORA Article 18 Criteria Met)
* Impacted Business (IBS): ${sim.servicesList}
* Affected Client Accounts: ${sim.customersAffected.toLocaleString()} accounts

2. IMPACT TOLERANCE & SLA COMPLIANCE EVALUATION
--------------------------------------------------------------------------------
* Maximum Tolerable Disruption (RTO Target): ${sim.maxRtoText}
* Actual Simulated Recovery Duration:        ${sim.recoveryHours} hours ${sim.recoveryMinutes} minutes
* DORA Article 11 (Continuity) Compliance:  ${sim.rtoCheck === 'SLA Breach' ? 'VIOLATED (Recovery exceeded RTO limit)' : 'COMPLIANT (Failover within window)'}
* DORA Article 26 (TLPT Testing) Status:    ${sim.rtoCheck === 'SLA Breach' ? 'NON-COMPLIANT (Scenario test failed)' : 'VERIFIED'}

3. REGULATORY ENFORCEMENT & SUPERVISORY SUMMARY
--------------------------------------------------------------------------------
* Statutory Fines Exposure: ${sim.rtoCheck === 'SLA Breach' ? 'HIGH RISK (Daily penalty under DORA Art. 50)' : 'NEGLIGIBLE'}
* Supervisory Action Plan: Submit 24-hour formal incident report update to FCA / EBA Joint Committee.
`;
  }

  // Default: Executive View (Board View)
  return `================================================================================
CYPHER VANTAGE EXECUTIVE BOARD SIMULATOR BRIEFING
Ref: EX-BOARD-${scenario.id.toUpperCase()}-${Math.floor(Date.now()/1000)}
================================================================================
Subject: Strategic Disruption Simulation: ${scenario.name}
Timestamp: ${timestamp} UTC | Target Readiness: ${sim.recoveryConfidence}%

1. EXECUTIVE SUMMARY & FINANCIAL EXPOSURE
--------------------------------------------------------------------------------
* Simulated Outage:             ${scenario.name}
* Root Threat Description:      ${scenario.description}
* Financial Downtime Loss Rate: ${currencySymbol}${sim.hourlyLossRate.toLocaleString()}/hour
* Total Simulated Revenue Loss: ${currencySymbol}${sim.totalRevenueLoss.toLocaleString()}

2. CUSTOMER & IMPACT TOLERANCE OUTCOME
--------------------------------------------------------------------------------
* Impacted Business Services:   ${sim.servicesList} (${sim.servicesAffectedCount} Services)
* Customer Accounts Offline:    ${sim.customersAffected.toLocaleString()} Accounts
* Maximum Tolerable Window (RTO): ${sim.maxRtoText}
* Simulated Recovery Duration:   ${sim.recoveryHours} hours ${sim.recoveryMinutes} minutes
* RTO Impact Tolerance SLA:      ${sim.rtoCheck === 'SLA Breach' ? '⚠️ CRITICAL IMPACT TOLERANCE BREACH' : '✅ WITHIN IMPACT TOLERANCE'}
* Recovery Confidence Score:     ${sim.recoveryConfidence}% (${sim.recoveryConfidence >= 80 ? 'High Confidence' : (sim.recoveryConfidence >= 50 ? 'Moderate Risk' : 'Severe Risk')})

3. EXECUTIVE STRATEGIC DECISION MANDATE
--------------------------------------------------------------------------------
* Strategic Recommendation:     ${sim.rtoCheck === 'SLA Breach' ? 'Approve emergency capital budget for automated secondary site failover clusters.' : 'Maintain quarterly resilience testing validation cadence.'}
* Executive Action Item:        Review and sign off operational resilience posture for upcoming audit cycle.
`;
}
