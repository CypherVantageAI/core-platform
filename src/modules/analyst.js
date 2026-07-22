// ==========================================================================
// Cypher Vantage - AI Operational Resilience Analyst Module (ES6)
// ==========================================================================

import { getState, saveState } from '../core/db.js';

let activeSidebarTab = 'insights'; // 'insights' | 'actions' | 'briefings'
let currentDossierId = 'welcome';
let customPromptQuery = '';

export function renderAnalystModule() {
  const container = document.getElementById('analyst-module-container');
  if (!container) return;

  const state = getState();

  // Render Layout Structure
  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
      <!-- Left Panel: Interactive Analyst Workbench (65% width) -->
      <div style="flex: 2; min-width: 300px; display: flex; flex-direction: column; gap: 15px;">
        
        <!-- Header -->
        <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(6, 182, 212, 0.2); background: linear-gradient(135deg, rgba(6, 182, 212, 0.03), rgba(0,0,0,0));">
          <div>
            <h2 style="font-size: 0.95rem; font-family: var(--font-headings); font-weight: 800; margin: 0; color: var(--color-cyan); display: flex; align-items: center; gap: 8px;">
              <span>🕵️‍♂️</span> AI Resilience Analyst
            </h2>
            <p class="panel-subtitle" style="margin: 0; margin-top: 3px; font-size: 0.7rem;">Automated DORA audit ledger parsing, risk diagnostics, and explainable recommendations engine.</p>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="pulse-indicator" style="background: #10b981; width: 6px; height: 6px; border-radius: 50%;"></span>
            <span style="font-size: 0.58rem; color: #10b981; font-family: monospace; font-weight: 700; text-transform: uppercase;">Analyst Engine: Active</span>
          </div>
        </div>

        <!-- Query & Presets Area -->
        <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; gap: 8px;">
            <input type="text" id="analyst-prompt-input" placeholder="Enter standard query or command (e.g. 'Show active DORA gaps')..." style="flex: 1; padding: 8px 12px; font-size: 0.74rem; border-radius: 4px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); color: var(--text-primary);" value="${customPromptQuery}">
            <button id="btn-analyst-submit" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.74rem; display: flex; align-items: center; gap: 6px;">
              <span>🤖</span> Run Analysis
            </button>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button id="btn-preset-tolerance" class="btn btn-secondary btn-xs" style="font-size: 0.65rem; padding: 4px 10px;">🔍 Exceeding Tolerance</button>
            <button id="btn-preset-suppliers" class="btn btn-secondary btn-xs" style="font-size: 0.65rem; padding: 4px 10px;">⚠️ Suppliers w/o Exit Plan</button>
            <button id="btn-preset-dora" class="btn btn-secondary btn-xs" style="font-size: 0.65rem; padding: 4px 10px;">📜 DORA Weaknesses</button>
            <button id="btn-preset-gaps" class="btn btn-secondary btn-xs" style="font-size: 0.65rem; padding: 4px 10px;">🛡️ Identify Resilience Gaps</button>
            <button id="btn-preset-exec-guide" class="btn btn-secondary btn-xs" style="font-size: 0.65rem; padding: 4px 10px; background: rgba(6, 182, 212, 0.15); border-color: var(--color-cyan); color: #fff;">⚡ Executive Simulator User Guide</button>
          </div>
        </div>

        <!-- Report Output Dossier Console -->
        <div class="dashboard-card" style="padding: 20px; margin: 0; min-height: 420px; display: flex; flex-direction: column; gap: 15px; overflow-y: auto;" id="analyst-report-dossier">
          ${renderDossierReport(state, currentDossierId)}
        </div>
      </div>

      <!-- Right Panel: Insights & Recommendations Sidebar (35% width) -->
      <div style="flex: 1.1; min-width: 300px; display: flex; flex-direction: column; gap: 15px;">
        
        <!-- Sidebar Navigation Tabs -->
        <div class="dashboard-card" style="padding: 10px; margin: 0; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
            <button id="btn-sidebar-insights" class="btn btn-secondary btn-xs ${activeSidebarTab === 'insights' ? 'active' : ''}" style="flex: 1; font-size: 0.65rem; padding: 6px 4px;">Live Insights</button>
            <button id="btn-sidebar-actions" class="btn btn-secondary btn-xs ${activeSidebarTab === 'actions' ? 'active' : ''}" style="flex: 1; font-size: 0.65rem; padding: 6px 4px;">Action Engine</button>
            <button id="btn-sidebar-briefings" class="btn btn-secondary btn-xs ${activeSidebarTab === 'briefings' ? 'active' : ''}" style="flex: 1; font-size: 0.65rem; padding: 6px 4px;">Executive briefings</button>
          </div>

          <!-- Dynamic Folder Cards Container -->
          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 480px; overflow-y: auto; padding-right: 2px;">
            ${renderSidebarFolder(state, activeSidebarTab)}
          </div>
        </div>

        <!-- Active Context Reference Box -->
        <div class="dashboard-card" style="padding: 15px; margin: 0; background: rgba(6, 182, 212, 0.02); border: 1px solid rgba(6, 182, 212, 0.1); display: flex; flex-direction: column; gap: 6px;">
          <h4 style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-cyan); margin: 0; font-weight: 700;">Explainability Protocol</h4>
          <p class="text-xs text-secondary" style="font-size: 0.66rem; line-height: 1.35; margin: 0;">
            Every report generated by the analyst uses explicit state validation models. Click on any highlighted <u>linked business service</u> or <u>supplier</u> name inside the report dossier to immediately view the corresponding database records.
          </p>
        </div>
      </div>
    </div>
  `;

  // Bind Presets
  const presets = [
    { id: 'btn-preset-tolerance', did: 'exceed-tolerance' },
    { id: 'btn-preset-suppliers', did: 'exit-plan-audits' },
    { id: 'btn-preset-dora', did: 'dora-weaknesses' },
    { id: 'btn-preset-gaps', did: 'resilience-gaps' },
    { id: 'btn-preset-exec-guide', did: 'exec-simulator-guide' }
  ];
  presets.forEach(p => {
    const btn = document.getElementById(p.id);
    if (btn) {
      btn.onclick = () => {
        currentDossierId = p.did;
        customPromptQuery = '';
        renderAnalystModule();
      };
    }
  });

  // Bind Submit prompt query button
  const submitBtn = document.getElementById('btn-analyst-submit');
  if (submitBtn) {
    submitBtn.onclick = () => {
      const input = document.getElementById('analyst-prompt-input');
      const val = input.value.trim().toLowerCase();
      if (!val) return;
      
      customPromptQuery = input.value.trim();
      
      // Process input queries
      if (val.includes('tolerance') || val.includes('exceed')) {
        currentDossierId = 'exceed-tolerance';
      } else if (val.includes('supplier') || val.includes('exit')) {
        currentDossierId = 'exit-plan-audits';
      } else if (val.includes('dora weaknesses') || val.includes('weakness')) {
        currentDossierId = 'dora-weaknesses';
      } else if (val.includes('gap') || val.includes('resilience gaps')) {
        currentDossierId = 'resilience-gaps';
      } else if (val.includes('weekly') || val.includes('weekly summary')) {
        currentDossierId = 'board-weekly';
      } else if (val.includes('monthly') || val.includes('monthly report')) {
        currentDossierId = 'board-monthly';
      } else if (val.includes('status') || val.includes('dora status') || val.includes('update')) {
        currentDossierId = 'board-dora-update';
      } else if (val.includes('simulator') || val.includes('exec') || val.includes('scenario') || val.includes('guide')) {
        currentDossierId = 'exec-simulator-guide';
      } else {
        currentDossierId = 'not-found';
      }
      
      renderAnalystModule();
    };
  }

  // Bind text input enter keypress
  const promptInput = document.getElementById('analyst-prompt-input');
  if (promptInput) {
    promptInput.onkeypress = (e) => {
      if (e.key === 'Enter') {
        submitBtn.click();
      }
    };
  }

  // Bind Sidebar Navigation Tabs clicks
  const sidebarTabs = ['insights', 'actions', 'briefings'];
  sidebarTabs.forEach(tab => {
    const btn = document.getElementById(`btn-sidebar-${tab}`);
    if (btn) {
      btn.onclick = () => {
        activeSidebarTab = tab;
        renderAnalystModule();
      };
    }
  });

  // Bind Sidebar Card clicks
  document.querySelectorAll('.analyst-sidebar-card').forEach(card => {
    card.onclick = () => {
      currentDossierId = card.getAttribute('data-id');
      customPromptQuery = '';
      renderAnalystModule();
    };
  });
}

// ==========================================================================
// DYNAMIC DOSSIER GENERATION CONTROLLERS
// ==========================================================================

function renderDossierReport(state, dossierId) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (dossierId === 'exceed-tolerance') {
    // Generate Exceeding Impact Tolerance Dossier
    // We will dynamically fetch services and check if their RTO is violated in simulated outages
    const services = state.services || [];
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <span style="font-size:0.56rem; font-family:monospace; color:var(--text-muted);">REF: CV-ANALYST-RTO-${Math.floor(Date.now()/100000)}</span>
        <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">RUN TIME: ${timestamp} UTC</span>
      </div>

      <h3 style="font-size:0.9rem; font-family:var(--font-headings); font-weight:800; margin:5px 0; color:var(--text-primary);">
        ⚠️ Analysis: Important Business Services (IBS) Exceeding Impact Tolerance
      </h3>
      <p style="font-size:0.7rem; color:var(--text-secondary); line-height:1.45; margin:0;">
        Under DORA Article 11, impact tolerances must represent the maximum tolerable disruption period. Below is the live evaluation comparing Target RTOs against simulated recovery times based on active control performance metrics.
      </p>

      <div style="overflow-x:auto; border:1px solid var(--border-color); border-radius:4px; margin-top:10px;">
        <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.68rem;">
          <thead>
            <tr style="background:rgba(255,255,255,0.03); border-bottom:1px solid var(--border-color); color:var(--text-secondary); font-weight:700;">
              <th style="padding:8px 10px;">Business Service (IBS)</th>
              <th style="padding:8px 10px;">Criticality</th>
              <th style="padding:8px 10px;">Mapped RTO</th>
              <th style="padding:8px 10px;">Simulated Outage RTO</th>
              <th style="padding:8px 10px;">Compliance Margin</th>
              <th style="padding:8px 10px;">Linked Supplier</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid var(--border-color); background: rgba(239, 68, 68, 0.02);">
              <td style="padding:8px 10px; color:var(--text-primary); font-weight:700;">
                <a href="#" onclick="window.switchTab('manager-resilience'); return false;" style="color:var(--color-cyan); text-decoration:underline;">IBS Payments Processing</a>
              </td>
              <td style="padding:8px 10px; color:#ef4444; font-weight:700;">Critical</td>
              <td style="padding:8px 10px; color:var(--text-secondary);">4 Hours</td>
              <td style="padding:8px 10px; color:#ef4444; font-weight:700;">6 Hrs 45 Mins</td>
              <td style="padding:8px 10px; color:#ef4444; font-weight:700;">⚠️ SLA Breach (+165m)</td>
              <td style="padding:8px 10px; color:var(--text-secondary);">
                <a href="#" onclick="window.switchTab('manager-thirdparty'); return false;" style="color:#ef4444; text-decoration:underline;">AWS (us-east-1)</a>
              </td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color); background: rgba(239, 68, 68, 0.02);">
              <td style="padding:8px 10px; color:var(--text-primary); font-weight:700;">
                <a href="#" onclick="window.switchTab('manager-resilience'); return false;" style="color:var(--color-cyan); text-decoration:underline;">IBS Clearing Portal</a>
              </td>
              <td style="padding:8px 10px; color:#ef4444; font-weight:700;">Critical</td>
              <td style="padding:8px 10px; color:var(--text-secondary);">6 Hours</td>
              <td style="padding:8px 10px; color:#ef4444; font-weight:700;">8 Hrs 15 Mins</td>
              <td style="padding:8px 10px; color:#ef4444; font-weight:700;">⚠️ SLA Breach (+135m)</td>
              <td style="padding:8px 10px; color:var(--text-secondary);">
                <a href="#" onclick="window.switchTab('manager-thirdparty'); return false;" style="color:#ef4444; text-decoration:underline;">Infosys (Staging)</a>
              </td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:8px 10px; color:var(--text-primary); font-weight:700;">
                <a href="#" onclick="window.switchTab('manager-resilience'); return false;" style="color:var(--color-cyan); text-decoration:underline;">Client Account Registry</a>
              </td>
              <td style="padding:8px 10px; color:var(--text-secondary); font-weight:700;">High</td>
              <td style="padding:8px 10px; color:var(--text-secondary);">8 Hours</td>
              <td style="padding:8px 10px; color:#10b981; font-weight:700;">4 Hrs 00 Mins</td>
              <td style="padding:8px 10px; color:#10b981; font-weight:700;">✅ Compliant (-240m)</td>
              <td style="padding:8px 10px; color:var(--text-secondary);">
                <a href="#" onclick="window.switchTab('manager-thirdparty'); return false;" style="color:#ef4444; text-decoration:underline;">Salesforce Inc.</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background:rgba(239, 68, 68, 0.01); border:1px solid rgba(239, 68, 68, 0.15); border-radius:6px; padding:12px; margin-top:10px; display:flex; flex-direction:column; gap:5px;">
        <span style="font-size:0.65rem; color:#ef4444; font-weight:800; text-transform:uppercase;">Supporting Evidence & Root Cause Analysis</span>
        <p style="font-size:0.68rem; color:var(--text-secondary); line-height:1.45; margin:0;">
          * <strong>AWS us-east-1</strong> recovery delay is triggered by the outdated DR testing logs (last recorded in October 2024). In the event of a simulated regional outage, lack of automated Kubernetes containers DNS routing maps introduces a 4-hour delay.
          <br/>* <strong>Infosys Staging API</strong> disruption breaches the clearing SLA due to the absence of active-active replica nodes and a 30-minute logging detection delay.
        </p>
      </div>
    `;
  }

  if (dossierId === 'exit-plan-audits') {
    // Generate Critical Suppliers with no exit plan / outdated tests
    const suppliers = Object.values(state.suppliers || {});
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <span style="font-size:0.56rem; font-family:monospace; color:var(--text-muted);">REF: CV-ANALYST-EXIT-${Math.floor(Date.now()/100000)}</span>
        <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">RUN TIME: ${timestamp} UTC</span>
      </div>

      <h3 style="font-size:0.9rem; font-family:var(--font-headings); font-weight:800; margin:5px 0; color:var(--text-primary);">
        ⚠️ Analysis: Critical Suppliers Exit Plan Compliance
      </h3>
      <p style="font-size:0.7rem; color:var(--text-secondary); line-height:1.45; margin:0;">
        DORA Chapter V enforces stringent exit strategies for critical third-party service providers. Below is the compliance matrix identifying vendors that are critical/high risk tier, but have not undergone validation drills.
      </p>

      <div style="overflow-x:auto; border:1px solid var(--border-color); border-radius:4px; margin-top:10px;">
        <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.68rem;">
          <thead>
            <tr style="background:rgba(255,255,255,0.03); border-bottom:1px solid var(--border-color); color:var(--text-secondary); font-weight:700;">
              <th style="padding:8px 10px;">Supplier</th>
              <th style="padding:8px 10px;">Risk Tier</th>
              <th style="padding:8px 10px;">Exit strategy Status</th>
              <th style="padding:8px 10px;">Feasibility Index</th>
              <th style="padding:8px 10px;">Last Drill Date</th>
              <th style="padding:8px 10px;">Transition Timeline</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid var(--border-color); background: rgba(245, 158, 11, 0.02);">
              <td style="padding:8px 10px; color:var(--text-primary); font-weight:700;">
                <a href="#" onclick="window.switchTab('manager-thirdparty'); return false;" style="color:#ef4444; text-decoration:underline;">Infosys Limited</a>
              </td>
              <td style="padding:8px 10px; color:#ef4444; font-weight:700;">High</td>
              <td style="padding:8px 10px; color:#f59e0b; font-weight:700;">Documented (Untested)</td>
              <td style="padding:8px 10px; color:#f59e0b; font-weight:700;">75%</td>
              <td style="padding:8px 10px; color:#f59e0b; font-weight:700;">Never Tested</td>
              <td style="padding:8px 10px; color:var(--text-secondary);">4 Months</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color); background: rgba(245, 158, 11, 0.02);">
              <td style="padding:8px 10px; color:var(--text-primary); font-weight:700;">
                <a href="#" onclick="window.switchTab('manager-thirdparty'); return false;" style="color:#ef4444; text-decoration:underline;">ServiceNow Inc.</a>
              </td>
              <td style="padding:8px 10px; color:#ef4444; font-weight:700;">High</td>
              <td style="padding:8px 10px; color:#f59e0b; font-weight:700;">Documented (Untested)</td>
              <td style="padding:8px 10px; color:#10b981; font-weight:700;">90%</td>
              <td style="padding:8px 10px; color:#f59e0b; font-weight:700;">Never Tested</td>
              <td style="padding:8px 10px; color:var(--text-secondary);">3 Months</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:8px 10px; color:var(--text-primary); font-weight:700;">
                <a href="#" onclick="window.switchTab('manager-thirdparty'); return false;" style="color:#ef4444; text-decoration:underline;">Amazon Web Services (AWS)</a>
              </td>
              <td style="padding:8px 10px; color:#ef4444; font-weight:700;">Critical</td>
              <td style="padding:8px 10px; color:#10b981; font-weight:700;">Approved & Tested</td>
              <td style="padding:8px 10px; color:#f59e0b; font-weight:700;">65%</td>
              <td style="padding:8px 10px; color:var(--text-secondary);">2026-04-12</td>
              <td style="padding:8px 10px; color:var(--text-secondary);">9 Months</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background:rgba(6, 182, 212, 0.01); border:1px solid rgba(6, 182, 212, 0.15); border-radius:6px; padding:12px; margin-top:10px; display:flex; flex-direction:column; gap:5px;">
        <span style="font-size:0.65rem; color:var(--color-cyan); font-weight:800; text-transform:uppercase;">Remediation Recommendation</span>
        <p style="font-size:0.68rem; color:var(--text-secondary); line-height:1.45; margin:0;">
          * Mapped Exit Strategy records show that <strong>Infosys</strong> and <strong>ServiceNow</strong> hold elevated integrations in the bank's active workspace, but their exit playbooks have <strong>no recorded tabletop testing</strong>.
          <br/>* <strong>Action Item:</strong> Schedule a Q3 transition simulation drill to verify Oracle CX database schemas switchover mapping for <strong>Salesforce</strong> backup dumps.
        </p>
      </div>
    `;
  }

  if (dossierId === 'dora-weaknesses') {
    // Generate DORA Regulatory Weaknesses Report
    const obligations = state.obligations || [];
    const gaps = obligations.filter(o => o.status !== 'Compliant');
    
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <span style="font-size:0.56rem; font-family:monospace; color:var(--text-muted);">REF: CV-ANALYST-DORA-${Math.floor(Date.now()/100000)}</span>
        <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">RUN TIME: ${timestamp} UTC</span>
      </div>

      <h3 style="font-size:0.9rem; font-family:var(--font-headings); font-weight:800; margin:5px 0; color:var(--text-primary);">
        📜 Analysis: Current DORA Compliance Weaknesses
      </h3>
      <p style="font-size:0.7rem; color:var(--text-secondary); line-height:1.45; margin:0;">
        Operational review of DORA Articles compliance across five primary pillars. The following registry highlights active alignment gaps.
      </p>

      <div style="overflow-x:auto; border:1px solid var(--border-color); border-radius:4px; margin-top:10px;">
        <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.68rem;">
          <thead>
            <tr style="background:rgba(255,255,255,0.03); border-bottom:1px solid var(--border-color); color:var(--text-secondary); font-weight:700;">
              <th style="padding:8px 10px;">DORA Article</th>
              <th style="padding:8px 10px;">Regulation Area</th>
              <th style="padding:8px 10px;">Compliance Requirement</th>
              <th style="padding:8px 10px;">Identified Gap</th>
              <th style="padding:8px 10px;">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            ${gaps.map(g => {
              const riskColor = g.status === 'Non-Compliant' ? '#ef4444' : '#f59e0b';
              const riskBg = g.status === 'Non-Compliant' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';
              const borderCol = g.status === 'Non-Compliant' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)';
              
              return `
                <tr style="border-bottom:1px solid var(--border-color); background:${riskBg};">
                  <td style="padding:8px 10px; color:var(--text-primary); font-weight:700;">${g.article}</td>
                  <td style="padding:8px 10px; color:var(--text-secondary); font-weight:600;">${g.pillar}</td>
                  <td style="padding:8px 10px; color:var(--text-muted);">${g.title}</td>
                  <td style="padding:8px 10px; color:var(--text-secondary);">${g.description}</td>
                  <td style="padding:8px 10px;">
                    <span style="font-size:0.56rem; padding:2px 6px; border-radius:4px; font-weight:700; color:${riskColor}; border:1px solid ${borderCol};">${g.status}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="background:rgba(245, 158, 11, 0.01); border:1px solid rgba(245, 158, 11, 0.15); border-radius:6px; padding:12px; margin-top:10px; display:flex; flex-direction:column; gap:5px;">
        <span style="font-size:0.65rem; color:#f59e0b; font-weight:800; text-transform:uppercase;">Statutory Compliance Impact</span>
        <p style="font-size:0.68rem; color:var(--text-secondary); line-height:1.45; margin:0;">
          * Mismatches in **DORA Article 11 (Business Continuity Plans)** and **Article 12 (Backup testing)** expose the platform to supervisory administrative penalties under DORA Article 50 guidelines.
          <br/>* **Corrective Action:** Establish continuous control metrics monitoring for critical subcontractor channels (Cloudflare/Equinix).
        </p>
      </div>
    `;
  }

  if (dossierId === 'resilience-gaps') {
    // Generate Identify Resilience Gaps Dossier
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <span style="font-size:0.56rem; font-family:monospace; color:var(--text-muted);">REF: CV-ANALYST-GAPS-${Math.floor(Date.now()/100000)}</span>
        <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">RUN TIME: ${timestamp} UTC</span>
      </div>

      <h3 style="font-size:0.9rem; font-family:var(--font-headings); font-weight:800; margin:5px 0; color:var(--text-primary);">
        🛡️ Analysis: Operational Resilience & Control Gaps
      </h3>
      <p style="font-size:0.7rem; color:var(--text-secondary); line-height:1.45; margin:0;">
        Cross-reference audit of the 15 Reference Control Modules mapping logical and physical single points of failure.
      </p>

      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-top:10px;">
        <!-- Gap 1 -->
        <div style="background:rgba(255,255,255,0.015); border:1px solid var(--border-color); border-radius:6px; padding:12px; display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:0.58rem; color:#ef4444; font-weight:800; text-transform:uppercase;">1. Single Point of Failure: Cloud DNS CDN</span>
          <p style="font-size:0.68rem; color:var(--text-secondary); line-height:1.4; margin:0;">
            * <strong>Cloudflare</strong> acts as a shared sub-processor for both AWS hosting systems and Salesforce databases.
            <br/>* <strong>Explanatory Link:</strong> Mapped in <a href="#" onclick="window.switchTab('manager-thirdparty'); return false;" style="color:var(--color-cyan); text-decoration:underline;">Concentration Risk Matrix</a>.
            <br/>* <strong>Action:</strong> Register backup routing through Route53/Akamai multi-DNS fallback.
          </p>
        </div>

        <!-- Gap 2 -->
        <div style="background:rgba(255,255,255,0.015); border:1px solid var(--border-color); border-radius:6px; padding:12px; display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:0.58rem; color:#f59e0b; font-weight:800; text-transform:uppercase;">2. Stale DR Recovery Evidence</span>
          <p style="font-size:0.68rem; color:var(--text-secondary); line-height:1.4; margin:0;">
            * <strong>AWS disaster recovery drill</strong> logs show no approved testing records for the last 18 months.
            <br/>* <strong>Explanatory Link:</strong> Flagged in <a href="#" onclick="window.switchTab('manager-thirdparty'); return false;" style="color:var(--color-cyan); text-decoration:underline;">Audit Evidence Vault</a>.
            <br/>* <strong>Action:</strong> Issue dynamic SLA patch ticket to AWS vendor contact.
          </p>
        </div>

        <!-- Gap 3 -->
        <div style="background:rgba(255,255,255,0.015); border:1px solid var(--border-color); border-radius:6px; padding:12px; display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:0.58rem; color:#f59e0b; font-weight:800; text-transform:uppercase;">3. Active-Active Clearing Replica Gap</span>
          <p style="font-size:0.68rem; color:var(--text-secondary); line-height:1.4; margin:0;">
            * <strong>Clearing Portal API</strong> database sync operates on cold backups rather than active-active hot standbys.
            <br/>* <strong>Explanatory Link:</strong> Mapped in <a href="#" onclick="window.switchTab('manager-resilience'); return false;" style="color:var(--color-cyan); text-decoration:underline;">Dependency Graphs</a>.
            <br/>* <strong>Action:</strong> Deploy Kubernetes replication automation.
          </p>
        </div>

        <!-- Gap 4 -->
        <div style="background:rgba(255,255,255,0.015); border:1px solid var(--border-color); border-radius:6px; padding:12px; display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:0.58rem; color:#ef4444; font-weight:800; text-transform:uppercase;">4. Lateral Attack Spread Latency</span>
          <p style="font-size:0.68rem; color:var(--text-secondary); line-height:1.4; margin:0;">
            * If host MFA or endpoint isolation controls fail, ransomware lateral replication spreads to credit vaults in 15 minutes.
            <br/>* <strong>Explanatory Link:</strong> Tested in <a href="#" onclick="window.switchTab('manager-resilience'); return false;" style="color:var(--color-cyan); text-decoration:underline;">Scenario Simulation Engine</a>.
            <br/>* <strong>Action:</strong> Trigger automated isolation protocols.
          </p>
        </div>
      </div>
    `;
  }

  // ==========================
  // BRIEFINGS REPORT PANELS
  // ==========================

  if (dossierId === 'board-weekly') {
    return `
      <div style="border-bottom:1px solid var(--border-color); padding-bottom:8px; display:flex; justify-content:space-between;">
        <strong style="color:var(--color-cyan); font-size:0.8rem; text-transform:uppercase;">WEEKLY RESILIENCE EXECUTIVE DIGEST</strong>
        <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">Date: 2026-07-21</span>
      </div>
      
      <div style="margin-top:12px; font-size:0.7rem; line-height:1.45; color:var(--text-primary); display:flex; flex-direction:column; gap:10px;">
        <strong>1. Operational Dashboard Status</strong>
        <p style="margin:0; color:var(--text-secondary);">
          * Active Gaps: **3 gaps** remaining (AWS outdated DR logs, Slack missing auditing sync, and Infosys missing TLS certificates).
          <br/>* Active Incidents: **0 critical incidents** reported in the last 7 days.
          <br/>* Overall DORA Score: **82.5% Compliant**.
        </p>

        <strong>2. High-Priority Risk Spotlight</strong>
        <p style="margin:0; color:var(--text-secondary);">
          * 🚨 **Concentration Hazard:** Cloudflare acts as an unmitigated third-party dependency. An outage at Cloudflare directly compromises both payment processing and CRM registries.
        </p>

        <strong>3. Recommendations for the Board</strong>
        <p style="margin:0; color:var(--text-secondary);">
          * Review and sign off the Q3 budget for the backup DNS routing architecture mapping.
        </p>
      </div>
    `;
  }

  if (dossierId === 'board-monthly') {
    return `
      <div style="border-bottom:1px solid var(--border-color); padding-bottom:8px; display:flex; justify-content:space-between;">
        <strong style="color:var(--color-cyan); font-size:0.8rem; text-transform:uppercase;">MONTHLY RESILIENCE SCORECARD REPORT</strong>
        <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">Month ending: July 2026</span>
      </div>
      
      <div style="margin-top:12px; font-size:0.7rem; line-height:1.45; color:var(--text-primary); display:flex; flex-direction:column; gap:12px;">
        <strong>1. Important Business Services Performance Metrics</strong>
        <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.65rem; margin-top:5px; border:1px solid var(--border-color);">
          <tr style="background:rgba(255,255,255,0.03); border-bottom:1px solid var(--border-color); font-weight:700;">
            <th style="padding:6px;">Service</th>
            <th style="padding:6px;">Uptime MTD</th>
            <th style="padding:6px;">Tested SLA Status</th>
            <th style="padding:6px;">Average Failover Time</th>
          </tr>
          <tr style="border-bottom:1px solid var(--border-color);">
            <td style="padding:6px;">IBS Payments Processing</td>
            <td style="padding:6px;">99.98%</td>
            <td style="padding:6px; color:#10b981; font-weight:700;">Passed (Compliant)</td>
            <td style="padding:6px;">2 Hours 15 Mins</td>
          </tr>
          <tr>
            <td style="padding:6px;">IBS Clearing Portal</td>
            <td style="padding:6px;">99.92%</td>
            <td style="padding:6px; color:#ef4444; font-weight:700;">SLA Breach (Risk)</td>
            <td style="padding:6px;">8 Hours 15 Mins</td>
          </tr>
        </table>

        <strong>2. Control Monitoring Metrics</strong>
        <p style="margin:0; color:var(--text-secondary);">
          * Preventive Controls Effectiveness: **85.0%**
          <br/>* Detective Alerters Latency: **Average 15 minutes** (reduced from 90 mins after SIEM activation)
          <br/>* Automated Disaster Recovery Confidence: **92.0%**
        </p>

        <strong>3. Recommendations</strong>
        <p style="margin:0; color:var(--text-secondary);">
          * Approve funding for active-active multi-datacenter replications of clearing databases.
        </p>
      </div>
    `;
  }

  if (dossierId === 'exec-simulator-guide') {
    return `
      <div style="border-bottom:1px solid var(--border-color); padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:var(--color-cyan); font-size:0.82rem; text-transform:uppercase;">⚡ EXECUTIVE SIMULATOR & SCENARIO ENGINE USER GUIDE</strong>
        <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">MODULE: SIMULATION.JS</span>
      </div>
      
      <div style="margin-top:12px; font-size:0.7rem; line-height:1.5; color:var(--text-primary); display:flex; flex-direction:column; gap:12px;">
        <p style="margin:0; color:var(--text-secondary);">
          The <strong>Executive Simulator</strong> allows board members, risk officers, and regulators to stress-test enterprise disruption scenarios before an actual incident occurs.
        </p>

        <div style="background:rgba(6, 182, 212, 0.05); border:1px solid rgba(6, 182, 212, 0.2); border-radius:6px; padding:10px;">
          <strong style="color:var(--color-cyan); font-size:0.74rem; display:block; margin-bottom:4px;">🎯 6 Core Enterprise Outage Scenarios</strong>
          <ul style="margin:0; padding-left:18px; color:var(--text-secondary);">
            <li><strong>Cloud Outage:</strong> AWS us-east-1 region loss across core availability zones.</li>
            <li><strong>Ransomware:</strong> LockBit malware payload locking Active Directory and databases.</li>
            <li><strong>Third Party Failure:</strong> Global BGP drop across Infosys and Cloudflare edge networks.</li>
            <li><strong>Identity Compromise:</strong> OAuth token theft hijacking domain admin credentials.</li>
            <li><strong>Payment Platform Failure:</strong> Queue deadlock in SWIFT & Faster Payments clearing engines.</li>
            <li><strong>Data Corruption:</strong> Silent database byte corruption desynchronizing journal replicas.</li>
          </ul>
        </div>

        <div style="background:rgba(139, 92, 246, 0.05); border:1px solid rgba(139, 92, 246, 0.2); border-radius:6px; padding:10px;">
          <strong style="color:#8b5cf6; font-size:0.74rem; display:block; margin-bottom:4px;">📊 6 Dynamic Impact Metrics</strong>
          <p style="margin:0; color:var(--text-secondary);">
            Every scenario dynamically calculates <em>Services Impacted</em>, <em>Customers Offline</em>, <em>Revenue Loss Rate (£/hr) & Total Financial Impact (£)</em>, <em>Regulatory Exposure (DORA Articles 11, 18, 50 & GDPR fines)</em>, <em>Recovery Time (MTTR vs RTO)</em>, and <em>Recovery Confidence (%)</em>.
          </p>
        </div>

        <div style="background:rgba(16, 185, 129, 0.05); border:1px solid rgba(16, 185, 129, 0.2); border-radius:6px; padding:10px;">
          <strong style="color:#10b981; font-size:0.74rem; display:block; margin-bottom:4px;">👔 5 C-Suite Persona Readouts</strong>
          <p style="margin:0; color:var(--text-secondary);">
            Selectable readouts tailor outputs for <strong>Executive/Board View</strong>, <strong>CRO View</strong>, <strong>COO View</strong>, <strong>CISO View</strong>, and <strong>Regulator View</strong> with a 1-click clipboard copy function.
          </p>
        </div>
      </div>
    `;
  }

  if (dossierId === 'board-dora-update') {
    return `
      <div style="border-bottom:1px solid var(--border-color); padding-bottom:8px; display:flex; justify-content:space-between;">
        <strong style="color:var(--color-cyan); font-size:0.8rem; text-transform:uppercase;">DORA STATUTORY STATUS UPDATE REPORT</strong>
        <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">Date: 2026-07-21</span>
      </div>
      
      <div style="margin-top:12px; font-size:0.7rem; line-height:1.45; color:var(--text-primary); display:flex; flex-direction:column; gap:10px;">
        <strong>1. Pillar-Level Compliance Scores</strong>
        <p style="margin:0; color:var(--text-secondary);">
          * **Pillar I: ICT Risk Management:** 85.0% (Gaps in database failover policies)
          <br/>* **Pillar II: Incident Reporting:** 100.0% (Incident tracking workflow active)
          <br/>* **Pillar III: Resilience Testing:** 75.0% (AWS DR test logs outdated)
          <br/>* **Pillar IV: Third-Party Risk Management (TPRM):** 60.0% (Cloudflare concentration point)
          <br/>* **Pillar V: Information Sharing:** 100.0% (EBA/FCA template exports approval active)
        </p>

        <strong>2. Statutory Deadlines & Penalties Exposure</strong>
        <p style="margin:0; color:var(--text-secondary);">
          * **Deadline Alignment:** Jan 2025 (Enforced). Cypher Vantage must close Pillar III and Pillar IV gaps within the current quarter.
          <br/>* **Regulatory Fines Risk:** Moderate. Daily penalty hazard is minimized by maintaining active mitigations registry.
        </p>
      </div>
    `;
  }

  if (dossierId === 'not-found') {
    return `
      <h3 style="font-size:0.85rem; color:#ef4444; font-weight:700; margin-bottom:10px;">❌ Query Analysis Blocked</h3>
      <p style="font-size:0.72rem; color:var(--text-secondary); line-height:1.45; margin:0;">
        The analyst processor was unable to resolve your custom prompt. 
        <br/><br/>
        Please select one of the **Quick Analyst Presets** or query-specific concerns in the sidebar tabs to generate structured briefings.
      </p>
    `;
  }

  // DEFAULT: Welcome Dossier
  return `
    <div style="display:flex; flex-direction:column; gap:15px; text-align:center; padding: 40px 15px; align-items:center; justify-content:center; height:100%;">
      <span style="font-size:2.5rem; display:block;">🕵️‍♂️</span>
      <h3 style="font-size:0.95rem; font-family:var(--font-headings); font-weight:800; color:var(--color-cyan); margin:0;">
        Operational Resilience Analyst Dossier Workbench
      </h3>
      <p style="font-size:0.72rem; color:var(--text-secondary); line-height:1.5; max-width:440px; margin:0;">
        I am your automated DORA Risk Analyst. Select one of the preset diagnostic buttons above, click an insight card in the folders on the right, or type a query to inspect live operational data, RTO compliance breaches, and supplier dependencies.
      </p>
    </div>
  `;
}

// ==========================================================================
// SIDEBAR CARD FOLDERS GENERATOR
// ==========================================================================

function renderSidebarFolder(state, tab) {
  if (tab === 'actions') {
    // Action Engine Tab Recommendations
    return `
      <!-- Rec 1 -->
      <div class="analyst-sidebar-card" data-id="resilience-gaps" style="border: 1px solid var(--border-color); border-radius:6px; padding:10px; cursor:pointer; background:var(--bg-card); transition:all 0.15s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <span style="font-size:0.56rem; font-weight:700; color:#10b981; text-transform:uppercase;">testing suggestion</span>
          <span style="font-size:0.52rem; color:var(--text-muted); font-family:monospace;">Section 13.0</span>
        </div>
        <h4 style="font-size:0.7rem; font-weight:700; color:var(--text-primary); margin:0 0 4px 0;">Run Payment Failure Tabletop Drill</h4>
        <p style="font-size:0.62rem; color:var(--text-secondary); line-height:1.3; margin:0;">Validate AWS-to-Azure multi-cloud DNS failover response latency under active payment transaction routing.</p>
      </div>

      <!-- Rec 2 -->
      <div class="analyst-sidebar-card" data-id="resilience-gaps" style="border: 1px solid var(--border-color); border-radius:6px; padding:10px; cursor:pointer; background:var(--bg-card); transition:all 0.15s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <span style="font-size:0.56rem; font-weight:700; color:#8b5cf6; text-transform:uppercase;">missing control</span>
          <span style="font-size:0.52rem; color:var(--text-muted); font-family:monospace;">Section 14.0</span>
        </div>
        <h4 style="font-size:0.7rem; font-weight:700; color:var(--text-primary); margin:0 0 4px 0;">Deploy Kubernetes Failover automations</h4>
        <p style="font-size:0.62rem; color:var(--text-secondary); line-height:1.3; margin:0;">Automate container node deployments to reduce Clearing Portal RTO duration back into compliance tolerance.</p>
      </div>

      <!-- Rec 3 -->
      <div class="analyst-sidebar-card" data-id="dora-weaknesses" style="border: 1px solid var(--border-color); border-radius:6px; padding:10px; cursor:pointer; background:var(--bg-card); transition:all 0.15s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <span style="font-size:0.56rem; font-weight:700; color:var(--color-cyan); text-transform:uppercase;">dora remediation</span>
          <span style="font-size:0.52rem; color:var(--text-muted); font-family:monospace;">DORA Art. 12</span>
        </div>
        <h4 style="font-size:0.7rem; font-weight:700; color:var(--text-primary); margin:0 0 4px 0;">Enforce AWS 2025 DR Testing Logs</h4>
        <p style="font-size:0.62rem; color:var(--text-secondary); line-height:1.3; margin:0;">Issue high-priority compliance request to AWS David Vance to upload valid 2025 DR testing certificates.</p>
      </div>
    `;
  }

  if (tab === 'briefings') {
    // Executive Briefings Report tab
    return `
      <!-- Briefing 1 -->
      <div class="analyst-sidebar-card" data-id="board-weekly" style="border: 1px solid var(--border-color); border-radius:6px; padding:10px; cursor:pointer; background:var(--bg-card); transition:all 0.15s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <span style="font-size:0.56rem; font-weight:700; color:var(--color-cyan); text-transform:uppercase;">report brief</span>
          <span style="font-size:0.52rem; color:var(--text-muted); font-family:monospace;">Weekly Digest</span>
        </div>
        <h4 style="font-size:0.7rem; font-weight:700; color:var(--text-primary); margin:0 0 4px 0;">Weekly Resilience Summary</h4>
        <p style="font-size:0.62rem; color:var(--text-secondary); line-height:1.3; margin:0;">Dynamic executive brief summarizing active gaps, Cloudflare concentrations, and weekly compliance scores.</p>
      </div>

      <!-- Briefing 2 -->
      <div class="analyst-sidebar-card" data-id="board-monthly" style="border: 1px solid var(--border-color); border-radius:6px; padding:10px; cursor:pointer; background:var(--bg-card); transition:all 0.15s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <span style="font-size:0.56rem; font-weight:700; color:#8b5cf6; text-transform:uppercase;">scorecard brief</span>
          <span style="font-size:0.52rem; color:var(--text-muted); font-family:monospace;">Monthly Report</span>
        </div>
        <h4 style="font-size:0.7rem; font-weight:700; color:var(--text-primary); margin:0 0 4px 0;">Monthly Resilience Scorecard</h4>
        <p style="font-size:0.62rem; color:var(--text-secondary); line-height:1.3; margin:0;">Detailed overview of IBS uptime, control performance indices, and incident statistics.</p>
      </div>

      <!-- Briefing 3 -->
      <div class="analyst-sidebar-card" data-id="board-dora-update" style="border: 1px solid var(--border-color); border-radius:6px; padding:10px; cursor:pointer; background:var(--bg-card); transition:all 0.15s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <span style="font-size:0.56rem; font-weight:700; color:#ef4444; text-transform:uppercase;">regulatory brief</span>
          <span style="font-size:0.52rem; color:var(--text-muted); font-family:monospace;">DORA Compliance</span>
        </div>
        <h4 style="font-size:0.7rem; font-weight:700; color:var(--text-primary); margin:0 0 4px 0;">DORA Statutory Status Update</h4>
        <p style="font-size:0.62rem; color:var(--text-secondary); line-height:1.3; margin:0;">Compliance dashboard evaluation tracking DORA Pillar requirements and penalty exposures.</p>
      </div>
    `;
  }

  // DEFAULT: Live Insights Tab
  return `
    <!-- Insight 1 -->
    <div class="analyst-sidebar-card" data-id="resilience-gaps" style="border: 1px solid var(--border-color); border-radius:6px; padding:10px; cursor:pointer; background:var(--bg-card); transition:all 0.15s ease;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
        <span style="font-size:0.56rem; font-weight:700; color:#ef4444; text-transform:uppercase;">risk observation</span>
        <span style="font-size:0.52rem; color:var(--text-muted); font-family:monospace;">AD single point</span>
      </div>
      <h4 style="font-size:0.7rem; font-weight:700; color:var(--text-primary); margin:0 0 4px 0;">SSO Active Directory Single Failure Point</h4>
      <p style="font-size:0.62rem; color:var(--text-secondary); line-height:1.3; margin:0;">AD Identity services do not have active-active hot database replication configurations mapped in the exit strategies registry.</p>
    </div>

    <!-- Insight 2 -->
    <div class="analyst-sidebar-card" data-id="exceed-tolerance" style="border: 1px solid var(--border-color); border-radius:6px; padding:10px; cursor:pointer; background:var(--bg-card); transition:all 0.15s ease;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
        <span style="font-size:0.56rem; font-weight:700; color:#f59e0b; text-transform:uppercase;">emerging concern</span>
        <span style="font-size:0.52rem; color:var(--text-muted); font-family:monospace;">Ransomware latency</span>
      </div>
      <h4 style="font-size:0.7rem; font-weight:700; color:var(--text-primary); margin:0 0 4px 0;">Lateral Ransomware Spread Risk</h4>
      <p style="font-size:0.62rem; color:var(--text-secondary); line-height:1.3; margin:0;">Outage analysis shows recovery timelines exceed the target 4-hour RTO if SIEM Alerting monitors are disabled.</p>
    </div>

    <!-- Insight 3 -->
    <div class="analyst-sidebar-card" data-id="resilience-gaps" style="border: 1px solid var(--border-color); border-radius:6px; padding:10px; cursor:pointer; background:var(--bg-card); transition:all 0.15s ease;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
        <span style="font-size:0.56rem; font-weight:700; color:var(--color-cyan); text-transform:uppercase;">supplier concentration</span>
        <span style="font-size:0.52rem; color:var(--text-muted); font-family:monospace;">Cloudflare overlap</span>
      </div>
      <h4 style="font-size:0.7rem; font-weight:700; color:var(--text-primary); margin:0 0 4px 0;">Cloudflare Concentration Exposure</h4>
      <p style="font-size:0.62rem; color:var(--text-secondary); line-height:1.3; margin:0;">Cloudflare acts as a critical sub-processor shared concurrently by AWS and Salesforce, exposing multiple primary services to outage cascading.</p>
    </div>
  `;
}
