// ==========================================================================
// Cypher Vantage - Executive Dashboard Module (ES6 Module)
// ==========================================================================

import { getState } from '../core/db.js';
import { createCard, createSVGChart, createStatusBadge, showModal } from '../components/ui.js';
import { renderResilienceGraph } from './knowledgegraph.js';

let activeDashboardSubTab = 'overview';

function renderDashboardContent() {
  const state = getState();
  const contentArea = document.getElementById('dashboard-tab-content');
  if (!contentArea) return;

  if (activeDashboardSubTab === 'overview') {
    // 1. Calculate stats dynamically from data models
    const totalServices = state.services.length;
    const activeServices = state.services.filter(s => s.status === 'Active').length;
    const openRisks = state.risks.filter(r => r.status === 'Open').length;
    const activeIncidents = state.incidents.filter(i => i.status === 'Active').length;
    const openFindings = state.findings.filter(f => f.status === 'Open').length;

    // Compute DORA score based on obligation compliance mapping
    const totalObligations = state.obligations.length;
    const compliantObligations = state.obligations.filter(ob => ob.status === 'Compliant').length;
    const partialObligations = state.obligations.filter(ob => ob.status === 'Partial').length;
    const doraScore = Math.round(((compliantObligations + (partialObligations * 0.5)) / totalObligations) * 100);

    // Compute Supplier risk index
    const suppliersList = Object.values(state.suppliers || {});
    const avgSupplierScore = suppliersList.length ? (suppliersList.reduce((sum, s) => sum + s.complianceScore, 0) / suppliersList.length) : 100;
    const supplierRiskScore = Math.round(avgSupplierScore);

    // Compute Resilience score
    const resilienceScore = Math.round(avgSupplierScore * 0.8 + (100 - openRisks * 5 - openFindings * 3) * 0.2);

    // Compute Recovery Readiness based on tests
    const totalTests = state.tests.length;
    const passedTests = state.tests.filter(t => t.results === 'Passed').length;
    const readinessScore = Math.round((passedTests / totalTests) * 100);

    // Compute Testing Coverage
    const plans = state.recoveryPlans || [];
    const testedPlans = plans.filter(p => p.status === 'Tested & Approved').length;
    const testingCoverage = plans.length ? Math.round((testedPlans / plans.length) * 100) : 100;

    contentArea.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
        
        <!-- Welcome Briefing Banner -->
        <div class="dashboard-card" style="padding: 15px; margin: 0; background: linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(0,0,0,0)); border: 1px solid rgba(6, 182, 212, 0.2); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 0.95rem; font-family: var(--font-headings); font-weight: 800; margin: 0; color: var(--text-primary);">
              Welcome Back, Sarah Jenkins <span style="font-weight: 400; font-size: 0.76rem; color: var(--text-secondary);">(Head of Operational Resilience)</span>
            </h3>
            <p class="panel-subtitle" style="margin: 0; margin-top: 3px; font-size: 0.7rem;">Morning briefing data compiled for Board Members, CRO, COO, and CISO audit oversight.</p>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-xs" onclick="window.triggerDynamicExport('pdf', 'board-pack')" style="font-size: 0.65rem; padding: 4px 8px;">🖨️ Board Pack PDF</button>
            <button class="btn btn-secondary btn-xs" onclick="window.triggerDynamicExport('pptx', 'board-pack')" style="font-size: 0.65rem; padding: 4px 8px;">📊 PPTX Slide Deck</button>
          </div>
        </div>

        <!-- 1. Executive Cockpit Dashboard Banner -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-secondary); margin: 0; font-weight: 700; letter-spacing: 0.05em;">🛡️ Executive Resilience Cockpit</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; width: 100%;">
            <!-- Metric 1: Resilience Score -->
            <div id="cockpit-kpi-resilience" class="dashboard-card" style="padding: 12px; border-left: 3px solid #10b981; display: flex; flex-direction: column; justify-content: space-between; min-height: 80px; cursor: pointer;" title="Click for score explanation">
              <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Resilience Score 🔍</span>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 5px;">
                <strong style="font-size: 1.25rem; color: #10b981;">${resilienceScore}%</strong>
                <span style="font-size: 0.58rem; color: #10b981; font-weight: 700;">Stable</span>
              </div>
              <div class="progress-bar-container" style="margin-top: 6px;"><div class="progress-bar-fill" style="width: ${resilienceScore}%; background:#10b981;"></div></div>
            </div>
            
            <!-- Metric 2: Recovery Readiness -->
            <div id="cockpit-kpi-readiness" class="dashboard-card" style="padding: 12px; border-left: 3px solid #14b8a6; display: flex; flex-direction: column; justify-content: space-between; min-height: 80px; cursor: pointer;" title="Click for readiness breakdown">
              <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Recovery Readiness 🔍</span>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 5px;">
                <strong style="font-size: 1.25rem; color: #14b8a6;">${readinessScore}%</strong>
                <span style="font-size: 0.58rem; color: #14b8a6; font-weight: 700;">+2% Drill</span>
              </div>
              <div class="progress-bar-container" style="margin-top: 6px;"><div class="progress-bar-fill" style="width: ${readinessScore}%; background:#14b8a6;"></div></div>
            </div>

            <!-- Metric 3: DORA Compliance -->
            <div id="cockpit-kpi-dora" class="dashboard-card" style="padding: 12px; border-left: 3px solid #a855f7; display: flex; flex-direction: column; justify-content: space-between; min-height: 80px; cursor: pointer;" title="Click for compliance breakdown">
              <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">DORA Compliance Score 🔍</span>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 5px;">
                <strong style="font-size: 1.25rem; color: #a855f7;">${doraScore}%</strong>
                <span style="font-size: 0.58rem; color: #10b981; font-weight: 700;">+5% MoM</span>
              </div>
              <div class="progress-bar-container" style="margin-top: 6px;"><div class="progress-bar-fill" style="width: ${doraScore}%; background:#a855f7;"></div></div>
            </div>

            <!-- Metric 4: Testing Coverage -->
            <div id="cockpit-kpi-testing" class="dashboard-card" style="padding: 12px; border-left: 3px solid #eab308; display: flex; flex-direction: column; justify-content: space-between; min-height: 80px; cursor: pointer;" title="Click for testing coverage details">
              <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Testing Coverage 🔍</span>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 5px;">
                <strong style="font-size: 1.25rem; color: #eab308;">${testingCoverage}%</strong>
                <span style="font-size: 0.58rem; color: #10b981; font-weight: 700;">Active</span>
              </div>
              <div class="progress-bar-container" style="margin-top: 6px;"><div class="progress-bar-fill" style="width: ${testingCoverage}%; background:#eab308;"></div></div>
            </div>

            <!-- Metric 5: Supplier Risk Index -->
            <div id="cockpit-kpi-supplier" class="dashboard-card" style="padding: 12px; border-left: 3px solid #f97316; display: flex; flex-direction: column; justify-content: space-between; min-height: 80px; cursor: pointer;" title="Click for supplier score details">
              <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Supplier Risk Score 🔍</span>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 5px;">
                <strong style="font-size: 1.25rem; color: #f97316;">${supplierRiskScore}%</strong>
                <span style="font-size: 0.58rem; color: #ef4444; font-weight: 700;">Gaps</span>
              </div>
              <div class="progress-bar-container" style="margin-top: 6px;"><div class="progress-bar-fill" style="width: ${supplierRiskScore}%; background:#f97316;"></div></div>
            </div>
          </div>
        </div>

        <!-- 2. Morning Briefing Workspace -->
        <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
          
          <!-- Left Column: Posture & Incidents Feed (60% width) -->
          <div style="flex: 1.5; min-width: 320px; display: flex; flex-direction: column; gap: 15px;">
            <!-- Posture card -->
            <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 10px;">
              <h4 style="font-size: 0.74rem; text-transform: uppercase; color: var(--text-secondary); margin: 0; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">🌞 Resilience Posture Overview</h4>
              <p style="font-size: 0.72rem; color: var(--text-secondary); line-height: 1.45; margin: 0;">
                The platform is maintaining a **92% Resilience Index** with all critical networks active. However, simulated failovers reveal that RTO tolerances for payments processing are exceeded by 165 minutes during ransomware scenarios due to outdated backup test certificates.
              </p>
            </div>

            <!-- Services at Risk card -->
            <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
              <h4 style="font-size: 0.74rem; text-transform: uppercase; color: #f97316; margin: 0; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">⚠️ Services Exceeding impact tolerance</h4>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(239, 68, 68, 0.02); border:1px solid rgba(239, 68, 68, 0.1); padding:6px 10px; border-radius:4px; font-size:0.7rem;">
                  <span style="font-weight:700; color:var(--text-primary);">IBS Payments Processing</span>
                  <span style="font-size:0.64rem; color:#ef4444; font-weight:700;">Simulated RTO: 6h 45m (Target: 4h)</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(239, 68, 68, 0.02); border:1px solid rgba(239, 68, 68, 0.1); padding:6px 10px; border-radius:4px; font-size:0.7rem;">
                  <span style="font-weight:700; color:var(--text-primary);">IBS Clearing Portal</span>
                  <span style="font-size:0.64rem; color:#ef4444; font-weight:700;">Simulated RTO: 8h 15m (Target: 6h)</span>
                </div>
              </div>
            </div>

            <!-- Major Incidents -->
            <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
              <h4 style="font-size: 0.74rem; text-transform: uppercase; color: #ef4444; margin: 0; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">🚨 Major Incidents Feed</h4>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${state.incidents.length ? state.incidents.map(inc => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 10px; font-size: 0.7rem;">
                    <div style="display: flex; gap: 6px; align-items: center;">
                      <span style="color: ${inc.status === 'Active' ? '#ef4444' : '#10b981'};">●</span>
                      <span style="font-weight: 600; color: var(--text-primary);">${inc.title}</span>
                    </div>
                    <span style="font-size:0.65rem; color:var(--text-muted);">Impact: <b>${inc.serviceAffected}</b></span>
                  </div>
                `).join('') : '<p style="font-size:0.68rem; color:var(--text-muted); margin:0;">Zero active operational incidents registered.</p>'}
              </div>
            </div>
          </div>

          <!-- Right Column: Alerts & DORA Issues (40% width) -->
          <div style="flex: 1; min-width: 260px; display: flex; flex-direction: column; gap: 15px;">
            <!-- Supplier Alerts -->
            <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
              <h4 style="font-size: 0.74rem; text-transform: uppercase; color: #f59e0b; margin: 0; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">📢 Critical Supplier Alerts</h4>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="background:rgba(255,255,255,0.015); border:1px solid var(--border-color); border-radius:4px; padding:8px; font-size:0.68rem;">
                  <strong style="color:var(--text-primary); display:block;">AWS us-east-1</strong>
                  <span style="color:#ef4444; font-weight:600; font-size:0.62rem;">Outdated DR Test logs certificates (Section 13.0)</span>
                </div>
                <div style="background:rgba(255,255,255,0.015); border:1px solid var(--border-color); border-radius:4px; padding:8px; font-size:0.68rem;">
                  <strong style="color:var(--text-primary); display:block;">Infosys Limited</strong>
                  <span style="color:#f59e0b; font-weight:600; font-size:0.62rem;">Developer TLS Certificate configuration gaps (Section 14.0)</span>
                </div>
              </div>
            </div>

            <!-- DORA Compliance Gaps -->
            <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
              <h4 style="font-size: 0.74rem; text-transform: uppercase; color: #a855f7; margin: 0; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">📜 Active DORA Issues Checklist</h4>
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <div style="display:flex; align-items:center; gap:8px; font-size:0.68rem; color:var(--text-secondary);">
                  <span style="color:#ef4444;">❌</span> <span><b>Article 11 (BCP):</b> missing critical suppliers tests</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; font-size:0.68rem; color:var(--text-secondary);">
                  <span style="color:#ef4444;">❌</span> <span><b>Article 14 (Subprocessors):</b> Infosys audit gaps</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; font-size:0.68rem; color:var(--text-secondary);">
                  <span style="color:#10b981;">✅</span> <span><b>Article 19 (Incidents):</b> tracking ledger active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Dynamic Reporting Ledger & One-Click Exports -->
        <div class="dashboard-card" style="padding: 20px; margin: 0;">
          <h3 style="font-size: 0.85rem; color: var(--color-cyan); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; margin-bottom: 15px;">
            📋 Executive Report Packs & One-Click Exports
          </h3>
          <p style="font-size: 0.7rem; color: var(--text-secondary); line-height: 1.45; margin: 0 0 15px 0;">
            Generate, preview, and download audit-ready compliance dossiers. All exports automatically incorporate live database state variables.
          </p>

          <div style="display:flex; flex-direction:column; gap:10px;">
            <!-- Report Row 1 -->
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid var(--border-color); border-radius:6px; background:rgba(255,255,255,0.01); flex-wrap:wrap; gap:10px;">
              <div>
                <strong style="font-size:0.75rem; color:var(--text-primary); display:block;">1. Executive Board Briefing Pack</strong>
                <span style="font-size:0.65rem; color:var(--text-muted);">Weighted scores summary, concentration risk cards, and budget requisitions.</span>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-secondary btn-xs" onclick="window.previewReportSummary('board-pack')" style="font-size:0.64rem;">🔍 Summary</button>
                <button class="btn btn-secondary btn-xs" onclick="window.triggerDynamicExport('pdf', 'board-pack')" style="font-size:0.64rem; color:var(--color-cyan);">📄 PDF</button>
                <button class="btn btn-secondary btn-xs" onclick="window.triggerDynamicExport('pptx', 'board-pack')" style="font-size:0.64rem; color:#8b5cf6;">📊 PPTX</button>
              </div>
            </div>

            <!-- Report Row 2 -->
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid var(--border-color); border-radius:6px; background:rgba(255,255,255,0.01); flex-wrap:wrap; gap:10px;">
              <div>
                <strong style="font-size:0.75rem; color:var(--text-primary); display:block;">2. Regulatory Compliance Audit Pack (DORA/FCA)</strong>
                <span style="font-size:0.65rem; color:var(--text-muted);">Statutory assessments against PRA SS2/21 and DORA Pillar guidelines.</span>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-secondary btn-xs" onclick="window.previewReportSummary('regulator-pack')" style="font-size:0.64rem;">🔍 Summary</button>
                <button class="btn btn-secondary btn-xs" onclick="window.triggerDynamicExport('pdf', 'regulator-pack')" style="font-size:0.64rem; color:var(--color-cyan);">📄 PDF</button>
                <button class="btn btn-secondary btn-xs" onclick="window.triggerDynamicExport('pptx', 'regulator-pack')" style="font-size:0.64rem; color:#8b5cf6;">📊 PPTX</button>
              </div>
            </div>

            <!-- Report Row 3 -->
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid var(--border-color); border-radius:6px; background:rgba(255,255,255,0.01); flex-wrap:wrap; gap:10px;">
              <div>
                <strong style="font-size:0.75rem; color:var(--text-primary); display:block;">3. Audit Evidence & Verification Ledger</strong>
                <span style="font-size:0.65rem; color:var(--text-muted);">Database log export containing supplier security certificates, NDAs, and test dates.</span>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-secondary btn-xs" onclick="window.previewReportSummary('audit-pack')" style="font-size:0.64rem;">🔍 Summary</button>
                <button class="btn btn-secondary btn-xs" onclick="window.triggerDynamicExport('pdf', 'audit-pack')" style="font-size:0.64rem; color:var(--color-cyan);">📄 PDF</button>
                <button class="btn btn-secondary btn-xs" onclick="window.triggerDynamicExport('pptx', 'audit-pack')" style="font-size:0.64rem; color:#8b5cf6;">📊 PPTX</button>
              </div>
            </div>

            <!-- Report Row 4 -->
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid var(--border-color); border-radius:6px; background:rgba(255,255,255,0.01); flex-wrap:wrap; gap:10px;">
              <div>
                <strong style="font-size:0.75rem; color:var(--text-primary); display:block;">4. DORA Article Mapping & Scoring Matrix</strong>
                <span style="font-size:0.65rem; color:var(--text-muted);">Full evaluation checklist of compliance articles, audit findings, and remediation status.</span>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-secondary btn-xs" onclick="window.previewReportSummary('dora-matrix')" style="font-size:0.64rem;">🔍 Summary</button>
                <button class="btn btn-secondary btn-xs" onclick="window.triggerDynamicExport('pdf', 'dora-matrix')" style="font-size:0.64rem; color:var(--color-cyan);">📄 PDF</button>
                <button class="btn btn-secondary btn-xs" onclick="window.triggerDynamicExport('pptx', 'dora-matrix')" style="font-size:0.64rem; color:#8b5cf6;">📊 PPTX</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    // Bind clean addEventListener handlers for Cockpit cards
    const kpiResilience = document.getElementById('cockpit-kpi-resilience');
    if (kpiResilience) {
      kpiResilience.addEventListener('click', () => {
        showModal('Resilience Score Formula & Explanation', `<div style="font-size:0.75rem; line-height:1.5;"><b>Resilience Score: ${resilienceScore}%</b><br/>Weighted Index = (Average Supplier Compliance * 0.8) + (Internal Controls Index * 0.2)<br/><br/>Evaluates high-tier supplier compliance ratings (averaging ${supplierRiskScore}%) and deductions for open risk register entries (-${openRisks * 5}%) and findings (-${openFindings * 3}%).</div>`);
      });
    }

    const kpiReadiness = document.getElementById('cockpit-kpi-readiness');
    if (kpiReadiness) {
      kpiReadiness.addEventListener('click', () => {
        showModal('Recovery Readiness Breakdown', `<div style="font-size:0.75rem; line-height:1.5;"><b>Recovery Readiness Index: ${readinessScore}%</b><br/>Based on ${passedTests} passed validation tests out of ${totalTests} total scenario simulations catalogued in the state database.</div>`);
      });
    }

    const kpiDora = document.getElementById('cockpit-kpi-dora');
    if (kpiDora) {
      kpiDora.addEventListener('click', () => {
        showModal('DORA Compliance Score', `<div style="font-size:0.75rem; line-height:1.5;"><b>DORA Compliance Index: ${doraScore}%</b><br/>Weighted calculation: ((Compliant + 0.5 * Partial) / Total Obligations) * 100<br/><br/>Compliant: ${compliantObligations} Articles | Partial: ${partialObligations} Articles | Non-Compliant: ${totalObligations - compliantObligations - partialObligations} Articles.</div>`);
      });
    }

    const kpiTesting = document.getElementById('cockpit-kpi-testing');
    if (kpiTesting) {
      kpiTesting.addEventListener('click', () => {
        showModal('Testing Coverage Breakdown', `<div style="font-size:0.75rem; line-height:1.5;"><b>Testing Coverage: ${testingCoverage}%</b><br/>Evaluates the ratio of recovery plans with status Tested & Approved (${testedPlans}/${plans.length} recovery playbooks tested).</div>`);
      });
    }

    const kpiSupplier = document.getElementById('cockpit-kpi-supplier');
    if (kpiSupplier) {
      kpiSupplier.addEventListener('click', () => {
        showModal('Supplier Risk Score Breakdown', `<div style="font-size:0.75rem; line-height:1.5;"><b>Supplier Risk Score: ${supplierRiskScore}%</b><br/>Average compliance rating across all catalogued Nth-party suppliers (AWS: 80%, Salesforce: 100%, ServiceNow: 90%, Infosys: 60%, Workday: 80%).</div>`);
      });
    }
  } else if (activeDashboardSubTab === 'graph') {
    contentArea.innerHTML = `
      <div id="resilience-global-graph-container" style="width: 100%;"></div>
    `;
    renderResilienceGraph('resilience-global-graph-container');
  } else {
    // RENDER THREAT MAP & LIVE FEED
    contentArea.innerHTML = `
      <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
        <!-- Left Column: Global Visualisation Map & Systems -->
        <div class="dashboard-card map-card" style="flex: 1.8; min-width: 500px; padding: 15px; display: flex; flex-direction: column; gap: 10px; height: 550px; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; flex-shrink: 0;">
            <h3 style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
              Global Threat & Service Infrastructure Visualiser
            </h3>
            <div style="display: flex; gap: 8px;">
              <select id="map-filter-service" class="dropdown-control select-sm" onchange="filterResilienceMap(this.value)" style="padding: 4px 6px; font-size: 0.65rem; background: #0c101b; border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); border-radius: 4px; cursor: pointer;">
                <option value="all">All Services (IBS & CIS)</option>
                <option value="ibs">Important Business Services (IBS)</option>
                <option value="cis">Critical Internal Services (CIS)</option>
              </select>
            </div>
          </div>

          <div class="world-map-wrapper" style="position: relative; height: 280px; flex-shrink: 0;">
            <!-- Simulation Loader Overlay -->
            <div id="simulation-loader-overlay" class="hidden" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 12, 29, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: var(--border-radius-lg); backdrop-filter: blur(4px); transition: opacity 0.3s ease;">
              <div class="scanner-line" style="position: absolute; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--color-cyan), transparent); animation: scanEffect 1.5s infinite linear;"></div>
              <div style="font-weight: 700; color: var(--color-cyan); font-size: 0.95rem; margin-bottom: 8px; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
                <svg class="animate-spin" style="width: 18px; height: 18px; color: var(--color-cyan);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"></circle>
                </svg>
                <span>CALCULATING BLAST RADIUS & DORA IMPACT...</span>
              </div>
              <p id="simulation-loader-text" style="font-size: 0.72rem; color: var(--text-secondary); margin: 0;"></p>
            </div>
            
            <div class="world-map-grid" id="resilience-world-map" style="position: relative; width: 100%; height: 100%;">
              <!-- Flat Globe Continent SVG Layers -->
              <svg class="world-map-svg" viewBox="0 0 800 400" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: auto;">
                <!-- Non-selectable landmasses -->
                <g class="landmass-passive" style="fill: rgba(255,255,255,0.015); stroke: rgba(255,255,255,0.04); stroke-width: 1; pointer-events: none;">
                  <path d="M 270 40 Q 310 30 320 50 T 290 70 Z" />
                </g>
                
                <!-- Selectable Regions (interactive hover states) -->
                <!-- South America -->
                <g class="map-region-group" id="map-region-sa" style="cursor: pointer;" onclick="drillResilienceDown('sa')">
                  <path d="M 210 190 Q 240 200 270 230 T 280 270 T 250 340 T 230 370 T 210 320 Z" class="region-land" />
                </g>
                
                <!-- North America -->
                <g class="map-region-group" id="map-region-na" style="cursor: pointer;" onclick="drillResilienceDown('na')">
                  <path d="M 80 80 L 160 50 L 240 60 L 260 80 L 220 120 L 240 160 L 210 180 L 180 150 L 160 210 L 130 200 L 140 160 L 100 140 Z" class="region-land" />
                </g>
                
                <!-- Europe -->
                <g class="map-region-group" id="map-region-eu" style="cursor: pointer;" onclick="drillResilienceDown('eu')">
                  <path d="M 420 120 L 460 90 L 500 90 L 520 120 L 500 160 L 450 170 L 430 150 Z" class="region-land" />
                  <path d="M 430 100 L 445 95 L 440 115 Z" class="region-land" />
                </g>
                
                <!-- Africa -->
                <g class="map-region-group" id="map-region-af" style="cursor: pointer;" onclick="drillResilienceDown('af')">
                  <path d="M 400 200 Q 450 180 490 200 T 510 240 T 500 290 T 470 340 T 450 350 T 440 310 T 390 230 Z" class="region-land" />
                </g>
                
                <!-- Asia-Pacific -->
                <g class="map-region-group" id="map-region-apac" style="cursor: pointer;" onclick="drillResilienceDown('apac')">
                  <path d="M 520 120 L 580 80 L 680 90 L 740 120 L 730 180 L 680 210 L 650 240 L 600 220 L 580 170 Z" class="region-land" />
                  <path d="M 605 210 L 620 215 L 610 245 L 595 225 Z" class="region-land" />
                  <path d="M 650 230 L 670 240 L 660 270 L 645 250 Z" class="region-land" />
                  <path d="M 730 130 L 745 125 L 740 155 L 725 160 Z" class="region-land" />
                  <path d="M 680 290 L 740 280 L 770 310 L 750 350 L 700 350 L 670 320 Z" class="region-land" />
                </g>
              </svg>

              <!-- Visual Connection SVG -->
              <svg class="map-connections" viewBox="0 0 800 400" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;">
                <path d="M 220 180 Q 380 150 510 180" class="connection-line" id="line-na-eu" />
                <path d="M 510 180 Q 580 240 650 250" class="connection-line" id="line-eu-apac" />
                <path d="M 220 180 Q 430 270 650 250" class="connection-line dashed" id="line-na-apac" />
                <path d="M 220 180 Q 230 240 288 296" class="connection-line" id="line-na-sa" />
                <path d="M 510 180 Q 400 240 288 296" class="connection-line dashed" id="line-eu-sa" />
              </svg>
            </div>
          </div>

          <!-- Mapped Infrastructure Section (utilizing space below map) -->
          <div class="map-systems-section" style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
            <h4 style="font-size: 0.74rem; text-transform: uppercase; color: var(--text-secondary); margin: 0 0 6px 0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
              <span>Mapped Infrastructure Services & Systems</span>
              <span id="map-systems-count" style="font-size: 0.68rem; text-transform: none; color: var(--color-cyan); font-weight: 600;">0 Service(s)</span>
            </h4>
            <div id="map-systems-grid" class="resilience-systems-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; overflow-y: auto; flex: 1; padding-right: 4px;">
              <!-- Dynamically populated in app.js -->
            </div>
          </div>
        </div>

        <!-- Right Column: Detail Card & Live Threat Feed -->
        <div style="flex: 1.2; min-width: 350px; display: flex; flex-direction: column; gap: 16px; height: 550px; box-sizing: border-box;">
          <!-- Region Detail Card -->
          <div class="dashboard-card info-card" id="resilience-detail-card" style="display: flex; flex-direction: column; min-height: 200px; padding: 15px; margin: 0; box-sizing: border-box;">
            <!-- Dynamically populated in app.js -->
          </div>

          <!-- Live Industry Threat Feed Card -->
          <div class="dashboard-card" style="display: flex; flex-direction: column; flex: 1; padding: 15px; margin: 0; box-sizing: border-box; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; margin-bottom: 10px; flex-shrink: 0;">
              <h3 style="font-size: 0.78rem; color: var(--color-cyan); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; margin: 0;">
                📡 Live Industry Threat Feed
              </h3>
              <span class="badge" style="font-size: 0.55rem; background: rgba(16, 185, 129, 0.08); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); font-weight: 700; text-transform: uppercase;">LIVE</span>
            </div>
            <div id="navigator-threat-feed" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px;"></div>
          </div>
        </div>
      </div>
    `;

    // Populate threat feed and trigger map pin renderings inside app.js scope
    if (typeof window.renderThreatFeed === 'function') {
      window.renderThreatFeed();
    }
    if (typeof window.renderResilienceDashboard === 'function') {
      window.renderResilienceDashboard();
    }
  }
}


export function renderExecutiveDashboard() {
  const state = getState();
  window.activeDashboardSubTab = activeDashboardSubTab;
  const container = document.getElementById('view-manager-dashboard');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- Sub-tab switcher -->
      <div style="display: flex; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; width: 100%;">
        <button id="btn-db-tab-overview" class="btn btn-secondary btn-xs ${activeDashboardSubTab === 'overview' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">Executive Overview</button>
        <button id="btn-db-tab-threatmap" class="btn btn-secondary btn-xs ${activeDashboardSubTab === 'threatmap' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">🗺️ Global Threat Map & Feed</button>
        <button id="btn-db-tab-graph" class="btn btn-secondary btn-xs ${activeDashboardSubTab === 'graph' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">🕸️ Resilience Knowledge Graph</button>
      </div>

      <!-- Tab Content Area -->
      <div id="dashboard-tab-content" style="width: 100%;"></div>
    </div>
  `;

  // Bind tab buttons
  const btnOverview = document.getElementById('btn-db-tab-overview');
  const btnThreatMap = document.getElementById('btn-db-tab-threatmap');
  const btnGraph = document.getElementById('btn-db-tab-graph');

  if (btnOverview) {
    btnOverview.onclick = () => {
      activeDashboardSubTab = 'overview';
      window.activeDashboardSubTab = activeDashboardSubTab;
      renderDashboardContent();
      // Update active classes
      btnOverview.classList.add('active');
      if (btnThreatMap) btnThreatMap.classList.remove('active');
      if (btnGraph) btnGraph.classList.remove('active');
    };
  }

  if (btnThreatMap) {
    btnThreatMap.onclick = () => {
      activeDashboardSubTab = 'threatmap';
      window.activeDashboardSubTab = activeDashboardSubTab;
      renderDashboardContent();
      // Update active classes
      btnThreatMap.classList.add('active');
      if (btnOverview) btnOverview.classList.remove('active');
      if (btnGraph) btnGraph.classList.remove('active');
    };
  }

  if (btnGraph) {
    btnGraph.onclick = () => {
      activeDashboardSubTab = 'graph';
      window.activeDashboardSubTab = activeDashboardSubTab;
      renderDashboardContent();
      // Update active classes
      btnGraph.classList.add('active');
      if (btnOverview) btnOverview.classList.remove('active');
      if (btnThreatMap) btnThreatMap.classList.remove('active');
    };
  }

  // Initial load
  renderDashboardContent();
}

// Register Executive Export handler to window for inline triggers
window.triggerDynamicExport = function(format, reportType) {
  const state = getState();
  const timestamp = new Date().toISOString().substring(0, 10);
  const totalServices = state.services.length;
  const activeIncidents = state.incidents.filter(i => i.status === 'Active').length;
  const totalGaps = state.obligations.filter(o => o.status !== 'Compliant').length;
  
  if (format === 'summary') {
    window.previewReportSummary(reportType);
    return;
  }

  let docTitle = 'Executive Resilience Report';
  let contentHtml = '';

  if (reportType === 'board-pack') {
    docTitle = 'CYPHER VANTAGE - EXECUTIVE BOARD BRIEFING PACK';
    contentHtml = `
      <div style="font-family:'Segoe UI', system-ui, sans-serif; padding:40px; color:#0f172a; max-width:850px; margin:0 auto; background:#ffffff;">
        <div style="display:flex; justify-content:space-between; border-bottom:3px solid #0284c7; padding-bottom:15px; margin-bottom:25px;">
          <div>
            <h1 style="font-size:22px; margin:0; color:#0f172a; text-transform:uppercase; letter-spacing:0.05em;">${docTitle}</h1>
            <p style="margin:4px 0 0 0; font-size:12px; color:#64748b;">Target Audience: Board of Directors, CRO, COO, CISO | Classification: Highly Confidential</p>
          </div>
          <div style="text-align:right; font-size:12px; color:#64748b;">
            <b>Date:</b> ${timestamp}<br/>
            <b>Format:</b> ${format.toUpperCase()}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:25px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:6px; text-align:center;">
            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Resilience Score</div>
            <div style="font-size:22px; font-weight:800; color:#059669; margin-top:2px;">92%</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:6px; text-align:center;">
            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Recovery Readiness</div>
            <div style="font-size:22px; font-weight:800; color:#0284c7; margin-top:2px;">89%</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:6px; text-align:center;">
            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">DORA Compliance</div>
            <div style="font-size:22px; font-weight:800; color:#7c3aed; margin-top:2px;">82%</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:6px; text-align:center;">
            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Testing Coverage</div>
            <div style="font-size:22px; font-weight:800; color:#d97706; margin-top:2px;">94%</div>
          </div>
        </div>

        <h3 style="font-size:14px; color:#0284c7; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-top:20px;">1. Executive Summary & Operational Posture</h3>
        <p style="font-size:13px; line-height:1.6; color:#334155;">
          Cypher Vantage is currently maintaining a composite <b>Resilience Score of 92%</b> across all 16 catalogued Important Business Services (IBS). Active risk mitigations operate within accepted tolerance margins. However, critical sub-processor dependency overlaps require immediate capital allocation to safeguard business continuity under DORA Article 11 standards.
        </p>

        <h3 style="font-size:14px; color:#0284c7; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-top:25px;">2. Strategic Vulnerabilities & Concentration Risks</h3>
        <ul style="font-size:13px; line-height:1.6; color:#334155; padding-left:20px;">
          <li><b>Subprocessor Overlap:</b> Cloudflare edge infrastructure serves concurrently as a single point of dependency across AWS US-East hosting and Salesforce CRM directories.</li>
          <li><b>BCP Evidence Gaps:</b> AWS Disaster Recovery test summary certificates are outdated since October 2024.</li>
          <li><b>Third-Party Configuration:</b> Infosys developer TLS certificates exhibit configuration gaps under Section 14.0 guidelines.</li>
        </ul>

        <h3 style="font-size:14px; color:#0284c7; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-top:25px;">3. Executive Requisitions & Action Plan</h3>
        <table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:10px;">
          <thead>
            <tr style="background:#f1f5f9; text-align:left;">
              <th style="padding:8px; border:1px solid #cbd5e1;">Requisition Item</th>
              <th style="padding:8px; border:1px solid #cbd5e1;">Target Timeline</th>
              <th style="padding:8px; border:1px solid #cbd5e1;">Owner</th>
              <th style="padding:8px; border:1px solid #cbd5e1;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:8px; border:1px solid #e2e8f0;">Approve secondary Route53 / Akamai DNS failover budget</td>
              <td style="padding:8px; border:1px solid #e2e8f0;">Q3 2026</td>
              <td style="padding:8px; border:1px solid #e2e8f0;">CISO / Lead Architect</td>
              <td style="padding:8px; border:1px solid #e2e8f0;"><span style="color:#d97706; font-weight:700;">Pending Board Approval</span></td>
            </tr>
            <tr>
              <td style="padding:8px; border:1px solid #e2e8f0;">Issue formal SLA compliance notice to Infosys integration team</td>
              <td style="padding:8px; border:1px solid #e2e8f0;">30 Days</td>
              <td style="padding:8px; border:1px solid #e2e8f0;">Head of TPRM</td>
              <td style="padding:8px; border:1px solid #e2e8f0;"><span style="color:#0284c7; font-weight:700;">Drafted</span></td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top:40px; padding-top:15px; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; color:#94a3b8;">
          Generated automatically by Cypher Vantage Operational Resilience Engine v5.0 | ${timestamp}
        </div>
      </div>
    `;
  } else {
    docTitle = `CYPHER VANTAGE - ${reportType.replace('-', ' ').toUpperCase()} EXPORT`;
    contentHtml = `
      <div style="font-family:'Segoe UI', system-ui, sans-serif; padding:40px; color:#0f172a; max-width:850px; margin:0 auto; background:#ffffff;">
        <div style="border-bottom:3px solid #0284c7; padding-bottom:15px; margin-bottom:25px;">
          <h1 style="font-size:22px; margin:0; color:#0f172a; text-transform:uppercase;">${docTitle}</h1>
          <p style="margin:4px 0 0 0; font-size:12px; color:#64748b;">Statutory Regulatory Dossier & Compliance Evidence | Date: ${timestamp}</p>
        </div>
        <h3 style="font-size:14px; color:#0284c7;">Obligations Matrix Audit Summary</h3>
        <table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:10px;">
          <thead>
            <tr style="background:#f1f5f9; text-align:left;">
              <th style="padding:8px; border:1px solid #cbd5e1;">Article</th>
              <th style="padding:8px; border:1px solid #cbd5e1;">Title</th>
              <th style="padding:8px; border:1px solid #cbd5e1;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${state.obligations.map(o => `
              <tr>
                <td style="padding:8px; border:1px solid #e2e8f0;"><b>Article ${o.article}</b></td>
                <td style="padding:8px; border:1px solid #e2e8f0;">${o.title}</td>
                <td style="padding:8px; border:1px solid #e2e8f0;"><span style="font-weight:700; color:${o.status === 'Compliant' ? '#059669' : o.status === 'Partial' ? '#d97706' : '#dc2626'};">${o.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Open printable document window
  const exportWindow = window.open('', '_blank', 'width=950,height=800');
  if (!exportWindow) {
    alert('Please allow popups to open the PDF/PPTX report viewer.');
    return;
  }

  exportWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${docTitle}</title>
        <style>
          body { margin:0; padding:20px; background:#e2e8f0; font-family:system-ui, sans-serif; }
          .toolbar { max-width:850px; margin:0 auto 15px auto; display:flex; justify-content:space-between; align-items:center; }
          .btn { background:#0284c7; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer; font-size:13px; }
          .btn-secondary { background:#64748b; }
          @media print {
            .toolbar { display:none !important; }
            body { background:#fff; padding:0; }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <div>
            <strong style="color:#0f172a; font-size:14px;">${format.toUpperCase()} Document Preview Mode</strong>
            <span style="font-size:12px; color:#64748b; display:block;">Click "Save as PDF / Print" to export clean PDF or slides.</span>
          </div>
          <div>
            <button class="btn btn-secondary" onclick="window.close()">Close</button>
            <button class="btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
          </div>
        </div>
        <div id="print-area">
          ${contentHtml}
        </div>
      </body>
    </html>
  `);
  exportWindow.document.close();
};

// Helper to show dynamic report summary previews in dashboard
window.previewReportSummary = function(reportType) {
window.previewReportSummary = function(reportType) {
  const timestamp = new Date().toISOString().substring(0, 10);
  let summaryHtml = '';
  
  if (reportType === 'board-pack') {
    summaryHtml = `
      <div style="font-size:0.72rem; line-height:1.45; color:var(--text-secondary);">
        <strong style="color:var(--color-cyan); display:block; margin-bottom:5px;">📋 PREVIEW: BOARD BRIEFING SUMMARY</strong>
        * **Resilience Index:** 92% (Target: >90%)
        <br/>* **Current Posture:** Adequate risk margins. Primary concern is Cloudflare edge infrastructure concentration.
        <br/>* **Action Required:** Board approval for Q3 multi-cloud DNS routing enhancements.
      </div>
    `;
  } else if (reportType === 'audit-pack') {
    summaryHtml = `
      <div style="font-size:0.72rem; line-height:1.45; color:var(--text-secondary);">
        <strong style="color:var(--color-cyan); display:block; margin-bottom:5px;">📋 PREVIEW: AUDIT PACK EVIDENCE SUMMARY</strong>
        * **Controls Checked:** 15 core frameworks modules.
        <br/>* **Active Gaps:** AWS recovery planning outdated logs; Infosys security policy mismatch.
        <br/>* **Evidence Checked:** SOC 2 Type II valid; ISO certificate verified.
      </div>
    `;
  } else if (reportType === 'regulator-pack') {
    summaryHtml = `
      <div style="font-size:0.72rem; line-height:1.45; color:var(--text-secondary);">
        <strong style="color:var(--color-cyan); display:block; margin-bottom:5px;">📋 PREVIEW: REGULATOR ASSESSMENT SUMMARY</strong>
        * **Pillars Scored:** Pillar I (85%), Pillar II (100%), Pillar III (75%), Pillar IV (60%), Pillar V (100%).
        <br/>* **Regulatory Alignment:** Under FCA/EBA regulatory audit frameworks.
        <br/>* **Action Plan:** Complete validation drills for critical suppliers by next quarter.
      </div>
    `;
  } else {
    summaryHtml = `
      <div style="font-size:0.72rem; line-height:1.45; color:var(--text-secondary);">
        <strong style="color:var(--color-cyan); display:block; margin-bottom:5px;">📋 PREVIEW: DORA ARTICLE ASSESSMENT SUMMARY</strong>
        * **Scanned Articles:** DORA Articles 5, 11, 12, 14, 26.
        <br/>* **Compliance Score:** 82% Compliant. Gaps identified in Article 11 (BCP) and Article 14 (Subcontracting).
      </div>
    `;
  }
  
  showModal('Report Summary Preview', summaryHtml);
};
}

