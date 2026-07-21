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

      <!-- Report Builder and Preview Section -->
      <div class="dashboard-card" style="width: 100%; padding: 15px; display: flex; flex-direction: column; gap: 12px; margin: 0;">
        <h3 style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 6px; margin: 0;">
          DORA Compliance Report Builder
        </h3>
        
        <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 0.72rem; color: var(--text-secondary);">Select Report Template:</label>
            <div id="report-template-custom-select" style="position: relative; width: 280px; font-size: 0.72rem; display: inline-block;">
              <div id="report-template-selected" style="background: var(--color-bg-dark); border: 1px solid var(--border-color); padding: 5px 10px; border-radius: 4px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 38px;">
                <span id="report-template-selected-text" style="line-height: 1.25; display: block; text-align: left;">
                  <b>Operational Resilience Report</b><br><span style="color:var(--text-muted); font-size:0.62rem;">(IBS targets & recovery)</span>
                </span>
                <span style="font-size: 0.6rem; color: var(--text-muted); margin-left: 8px;">▼</span>
              </div>
              <div id="report-template-dropdown" class="hidden" style="position: absolute; top: 100%; left: 0; right: 0; background: #070a12; border: 1px solid var(--border-color); border-radius: 4px; margin-top: 4px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column;">
                <div class="report-template-option active" data-value="operational" style="padding: 6px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.03); line-height: 1.25; text-align: left;">
                  <b>Operational Resilience Report</b><br><span style="color:var(--text-muted); font-size:0.62rem;">(IBS targets & recovery)</span>
                </div>
                <div class="report-template-option" data-value="executive" style="padding: 6px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.03); line-height: 1.25; text-align: left;">
                  <b>Executive Summary Report</b><br><span style="color:var(--text-muted); font-size:0.62rem;">(C-Suite briefing & loss model)</span>
                </div>
                <div class="report-template-option" data-value="audit" style="padding: 6px 12px; cursor: pointer; line-height: 1.25; text-align: left;">
                  <b>Regulatory Audit Transcript</b><br><span style="color:var(--text-muted); font-size:0.62rem;">(Control evidence compliance)</span>
                </div>
              </div>
              <input type="hidden" id="report-template-select" value="operational">
            </div>
          </div>
          <button id="btn-generate-report" class="btn btn-primary btn-sm" style="font-weight: 700; height: 38px;">📄 Generate Report</button>
        </div>

        <div id="generated-report-preview" style="display: none; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255,255,255,0.06); padding: 20px; border-radius: 6px; flex-direction: column; gap: 15px; margin-top: 10px;">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  `;

  // Render KPI cards with popups
  createCard('reports-kpi-tests', {
    title: 'Total Tests Run',
    value: `${totalTests}`,
    subtext: 'Cumulative scenario simulations and sanity checks',
    icon: '📊',
    borderLeftColor: '#14b8a6',
    tooltip: 'Click to view breakdown of executed tests.',
    onclick: () => {
      const testsHtml = state.tests.map(t => `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.04); padding:6px 0; font-size:0.7rem;">
          <div>
            <b>${t.title || t.scenario || t.name || 'Resilience Test'}</b>
            <div style="font-size:0.64rem; color:var(--text-muted);">Execution Date: ${t.lastRun || t.date || '2026-07-18'}</div>
          </div>
          ${createStatusBadge(t.results === 'Passed' ? 'Compliant' : 'Non-Compliant')}
        </div>
      `).join('');
      window.showModal('Resilience Test Audit Trail', `<div style="display:flex; flex-direction:column; gap:8px; max-height:350px; overflow-y:auto;">${testsHtml}</div>`);
    }
  });

  createCard('reports-kpi-success', {
    title: 'Success Pass Rate',
    value: `${totalTests ? Math.round((passedTests / totalTests) * 100) : 100}%`,
    subtext: 'Ratio of passed integrity audits to total tests',
    icon: '✅',
    borderLeftColor: '#10b981',
    tooltip: 'Click to view pass/fail test ratio.',
    onclick: () => {
      const passRate = totalTests ? Math.round((passedTests / totalTests) * 100) : 100;
      window.showModal('Test Pass Rate Ratio', `
        <div style="font-size:0.75rem; line-height:1.5;">
          <b>Pass Rate Score: ${passRate}%</b><br/>
          Passed Integrity Audits: ${passedTests}<br/>
          Failed/Degraded Tests: ${totalTests - passedTests}<br/>
          Total Simulations: ${totalTests}
        </div>
      `);
    }
  });

  createCard('reports-kpi-incidents', {
    title: 'DORA Incidents Logged',
    value: `${totalIncidents}`,
    subtext: 'Outages matching DORA Article 19 classification',
    icon: '🚨',
    borderLeftColor: '#ef4444',
    tooltip: 'Click to view DORA Article 19 Incident Registry.',
    onclick: () => {
      const incHtml = state.incidents.map(i => `
        <div style="border-bottom:1px solid rgba(255,255,255,0.04); padding:6px 0; font-size:0.7rem; display:flex; flex-direction:column; gap:2px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${i.title || i.name || 'Disruption Incident'}</b>
            ${createStatusBadge(i.status === 'Closed' ? 'Compliant' : 'Non-Compliant')}
          </div>
          <div style="font-size:0.65rem; color:var(--text-secondary);">${i.description || i.rootCause || ('Service: ' + (i.serviceAffected || 'Infrastructure'))}</div>
          <div style="font-size:0.62rem; color:#ef4444; margin-top:2px;">Financial Loss: £${(i.financialLoss || 0).toLocaleString()} | Downtime: ${i.downtime || '30m'}</div>
        </div>
      `).join('');
      window.showModal('DORA Article 19 Incident Registry', `<div style="display:flex; flex-direction:column; gap:8px; max-height:350px; overflow-y:auto;">${incHtml}</div>`);
    }
  });

  createCard('reports-kpi-loss', {
    title: 'Estimated Loss Prevented',
    value: `£${totalLossPrevented.toLocaleString()}`,
    subtext: 'Financial impact mitigated via failover playbooks',
    icon: '🛡️',
    borderLeftColor: '#a855f7',
    tooltip: 'Click to view mitigated financial loss model.',
    onclick: () => {
      window.showModal('Mitigated Financial Loss Model', `
        <div style="font-size:0.75rem; line-height:1.5;">
          <b>Total Loss Prevented: £${totalLossPrevented.toLocaleString()}</b><br/><br/>
          Modeled against operational disruption baselines (£50,000/hr outage cost for payments clearing & £150,000 SLA backlog penalties) successfully mitigated by automated failover playbooks under DORA Article 11.
        </div>
      `);
    }
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

  // Bind Generate Report Click
  const btnGen = document.getElementById('btn-generate-report');
  const selectTemplate = document.getElementById('report-template-select');
  const previewBox = document.getElementById('generated-report-preview');

  if (btnGen && selectTemplate && previewBox) {
    btnGen.onclick = () => {
      const template = selectTemplate.value;
      previewBox.style.display = 'flex';
      
      const currentDate = new Date().toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      if (template === 'operational') {
        previewBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
            <div>
              <span style="font-size:0.6rem; text-transform:uppercase; color:var(--color-cyan); font-weight:700;">Operational Resilience Audit Report</span>
              <h2 style="font-size:1.1rem; font-weight:800; color:var(--text-primary); margin:0;">Important Business Services Resilience Transcript</h2>
            </div>
            <button id="btn-print-preview" class="btn btn-primary btn-sm" style="font-weight:700;">🖨️ Print Transcript</button>
          </div>
          
          <div style="font-size:0.72rem; color:var(--text-secondary); line-height:1.5; display:flex; flex-direction:column; gap:12px;">
            <div><b>Generated on:</b> ${currentDate} | <b>Authority:</b> Cypher Vantage Compliance Officer</div>
            
            <div>
              <h3 style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin:8px 0 4px 0;">1. Mapped Important Business Services (IBS)</h3>
              <table style="width:100%; border-collapse:collapse; font-size:0.68rem;">
                <thead>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                    <th style="padding:4px;">Service Name</th>
                    <th style="padding:4px;">Criticality</th>
                    <th style="padding:4px;">Target RTO</th>
                    <th style="padding:4px;">Max MTD</th>
                    <th style="padding:4px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.services.map(s => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                      <td style="padding:4px;"><b>${s.name}</b></td>
                      <td style="padding:4px;">${s.criticality}</td>
                      <td style="padding:4px;">${s.rto}</td>
                      <td style="padding:4px;">${s.mtd || s.rto}</td>
                      <td style="padding:4px; color:#10b981;">Active</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div>
              <h3 style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin:8px 0 4px 0;">2. Scenario Testing & Backup Validation</h3>
              <p>During the current regulatory reporting window, a total of <b>${totalTests}</b> scenarios were simulated. <b>${passedTests}</b> runs achieved secure failovers within threshold limits.</p>
              <ul>
                <li>DR failovers average latency: <b>15 minutes</b> (Limit: 4 hours).</li>
                <li>Immutable ledger backup status: <b>Fully Compliant</b> (100% integrity validation).</li>
              </ul>
            </div>

            <div style="border-top:1px dashed rgba(255,255,255,0.08); padding-top:10px; font-size:0.65rem; color:var(--text-muted); font-style:italic;">
              This document serves as formal evidence of operational resilience mapping under UK PRA and DORA regulatory frameworks.
            </div>
          </div>
        `;
      } else if (template === 'executive') {
        previewBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
            <div>
              <span style="font-size:0.6rem; text-transform:uppercase; color:var(--color-cyan); font-weight:700;">Executive Risk Briefing</span>
              <h2 style="font-size:1.1rem; font-weight:800; color:var(--text-primary); margin:0;">C-Suite Operational Exposure & Threat Analysis</h2>
            </div>
            <button id="btn-print-preview" class="btn btn-primary btn-sm" style="font-weight:700;">🖨️ Print Transcript</button>
          </div>
          
          <div style="font-size:0.72rem; color:var(--text-secondary); line-height:1.5; display:flex; flex-direction:column; gap:12px;">
            <div><b>Generated on:</b> ${currentDate} | <b>Security Clearance:</b> Level 3 (C-Suite)</div>

            <div>
              <h3 style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin:8px 0 4px 0;">1. Financial Outage Exposure</h3>
              <p>Cascading outage models map financial impact dynamically across service nodes:</p>
              <ul>
                <li><b>IBS Payments Clearing Outage:</b> £75,000/hr downtime exposure.</li>
                <li><b>CIS Identity lockouts:</b> £120,000/hr workforce downtime cost.</li>
                <li><b>Aggregate Outage Risk:</b> Modeled maximum financial exposure capped at £1,200,000 under severe incident clusters.</li>
              </ul>
            </div>

            <div>
              <h3 style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin:8px 0 4px 0;">2. Mitigation Index Summary</h3>
              <p>Active mitigation controls (redundant clusters, hot standbys, backup redirects) successfully protected <b>£${totalLossPrevented.toLocaleString()}</b> of modeled losses over the last 12 incidents.</p>
              <p><b>Executive Recommendation:</b> Invest in secondary directory routing links to reduce directory RTO under 15 minutes.</p>
            </div>
          </div>
        `;
      } else {
        previewBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
            <div>
              <span style="font-size:0.6rem; text-transform:uppercase; color:var(--color-cyan); font-weight:700;">Regulatory Audit Transcript</span>
              <h2 style="font-size:1.1rem; font-weight:800; color:var(--text-primary); margin:0;">DORA Section 19 & 28 Security Control Ledger</h2>
            </div>
            <button id="btn-print-preview" class="btn btn-primary btn-sm" style="font-weight:700;">🖨️ Print Transcript</button>
          </div>
          
          <div style="font-size:0.72rem; color:var(--text-secondary); line-height:1.5; display:flex; flex-direction:column; gap:12px;">
            <div><b>Generated on:</b> ${currentDate} | <b>Audit Standard:</b> DORA (Regulation EU 2022/2554)</div>

            <div>
              <h3 style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin:8px 0 4px 0;">1. Security Controls Verification</h3>
              <table style="width:100%; border-collapse:collapse; font-size:0.68rem;">
                <thead>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                    <th style="padding:4px;">Control ID</th>
                    <th style="padding:4px;">Control Title</th>
                    <th style="padding:4px;">Status</th>
                    <th style="padding:4px;">Coverage Mappings</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.controls.map(c => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                      <td style="padding:4px;"><code>${c.id}</code></td>
                      <td style="padding:4px;"><b>${c.title}</b></td>
                      <td style="padding:4px;">${c.status}</td>
                      <td style="padding:4px;">${c.relatedRisks.length ? c.relatedRisks.join(', ') : 'None'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div>
              <h3 style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin:8px 0 4px 0;">2. Evidence Registry Checks</h3>
              <p>Supplier compliance audits scanned in supplier vault: <b>8 active documents</b>. High coverage confirmed on sub-processing layers for AWS and Salesforce nodes.</p>
            </div>
          </div>
        `;
      }

      // Bind print button action
      document.getElementById('btn-print-preview').onclick = () => {
        window.print();
      };
    };
  }

  // Custom dropdown event handlers for multi-line report selection
  const customTrigger = document.getElementById('report-template-selected');
  const customDropdown = document.getElementById('report-template-dropdown');
  const hiddenInput = document.getElementById('report-template-select');
  const selectedText = document.getElementById('report-template-selected-text');
  
  if (customTrigger && customDropdown && hiddenInput && selectedText) {
    customTrigger.onclick = (e) => {
      e.stopPropagation();
      customDropdown.classList.toggle('hidden');
    };

    document.addEventListener('click', () => {
      customDropdown.classList.add('hidden');
    });

    const options = document.querySelectorAll('.report-template-option');
    options.forEach(opt => {
      opt.onclick = (e) => {
        e.stopPropagation();
        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        
        const value = opt.getAttribute('data-value');
        hiddenInput.value = value;
        selectedText.innerHTML = opt.innerHTML;
        customDropdown.classList.add('hidden');
      };
    });
  }
}
