// ==========================================================================
// Cypher Vantage - Executive Dashboard Module (ES6 Module)
// ==========================================================================

import { getState } from '../core/db.js';
import { createCard, createSVGChart, createStatusBadge } from '../components/ui.js';

export function renderExecutiveDashboard() {
  const state = getState();
  const container = document.getElementById('view-manager-dashboard');
  if (!container) return;

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

  // Compute Resilience score based on findings, incidents, and supplier ratings
  const avgSupplierScore = state.suppliers.reduce((sum, s) => sum + s.complianceScore, 0) / state.suppliers.length;
  const resilienceScore = Math.round(avgSupplierScore * 0.8 + (100 - openRisks * 5 - openFindings * 3) * 0.2);

  // Compute Recovery Readiness based on tests
  const totalTests = state.tests.length;
  const passedTests = state.tests.filter(t => t.results === 'Passed').length;
  const readinessScore = Math.round((passedTests / totalTests) * 100);

  // Supplier risk tier breakdowns for the Heat-donut
  const criticalSuppliers = state.suppliers.filter(s => s.riskTier === 'Critical').length;
  const highSuppliers = state.suppliers.filter(s => s.riskTier === 'High').length;
  const mediumSuppliers = state.suppliers.filter(s => s.riskTier === 'Medium').length;
  const lowSuppliers = state.suppliers.filter(s => s.riskTier === 'Low' || s.riskTier.includes('Low')).length;

  // 2. Build layout grid
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- KPI Metrics Ribbon -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; width: 100%;">
        <div id="kpi-resilience"></div>
        <div id="kpi-dora"></div>
        <div id="kpi-risks"></div>
        <div id="kpi-incidents"></div>
        <div id="kpi-findings"></div>
      </div>

      <!-- Charts & Insights Row -->
      <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
        <!-- Recovery Readiness Dial -->
        <div class="dashboard-card" style="flex: 1; min-width: 250px; display: flex; flex-direction: column; align-items: center; padding: 15px; position: relative; justify-content: space-between;">
          <h3 style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; align-self: flex-start; margin-bottom: 10px;">RECOVERY READINESS</h3>
          <div id="readiness-radial-chart" style="position: relative; width: 100%; height: 160px;"></div>
          <div style="font-size: 0.64rem; color: var(--text-muted); text-align: center; margin-top: 5px;">
            Based on <b>${passedTests}/${totalTests}</b> passed resilience and recovery validation tests.
          </div>
        </div>

        <!-- Supplier Risk Donut -->
        <div class="dashboard-card" style="flex: 2; min-width: 380px; padding: 15px; display: flex; flex-direction: column; justify-content: space-between;">
          <h3 style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">SUPPLIER RISK SUMMARY</h3>
          <div id="supplier-risk-donut" style="width: 100%;"></div>
        </div>
      </div>

      <!-- Active Threat & Incidents Feed -->
      <div class="dashboard-card" style="padding: 15px; width: 100%;">
        <h3 style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; margin-bottom: 10px;">
          🚨 CRITICAL OPERATIONS ALERTS
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${state.incidents.map(inc => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(239, 68, 68, 0.02); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 6px; padding: 8px 12px; font-size: 0.74rem;">
              <div style="display: flex; gap: 8px; align-items: center;">
                <span style="color: #ef4444;">●</span>
                <span style="font-weight: 600; color: var(--text-primary);">${inc.title}</span>
                <span style="font-size: 0.65rem; color: var(--text-muted);">| Affected Service: <b>${inc.serviceAffected}</b></span>
              </div>
              <div style="display: flex; gap: 10px; align-items: center;">
                <span style="font-size: 0.68rem; color: var(--text-muted);">Downtime: <b>${inc.downtime}</b></span>
                ${createStatusBadge(inc.status)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // 3. Render dynamic widgets
  createCard('kpi-resilience', {
    title: 'Resilience Score',
    value: `${resilienceScore}%`,
    trendText: 'Stable',
    trendClass: 'positive',
    icon: '🛡️',
    borderLeftColor: '#10b981'
  });

  createCard('kpi-dora', {
    title: 'DORA Compliance',
    value: `${doraScore}%`,
    trendText: '+5% MoM',
    trendClass: 'positive',
    icon: '📜',
    borderLeftColor: '#14b8a6'
  });

  createCard('kpi-risks', {
    title: 'Open Risks',
    value: `${openRisks}`,
    subtext: 'High/Critical risks in register',
    icon: '⚠️',
    borderLeftColor: '#f97316'
  });

  createCard('kpi-incidents', {
    title: 'Active Incidents',
    value: `${activeIncidents}`,
    subtext: 'Ongoing operational issues',
    icon: '🚨',
    borderLeftColor: '#ef4444'
  });

  createCard('kpi-findings', {
    title: 'Open Findings',
    value: `${openFindings}`,
    subtext: 'Pending audit remediations',
    icon: '🔍',
    borderLeftColor: '#eab308'
  });

  createSVGChart('readiness-radial-chart', 'radial', { score: readinessScore }, { color: '#14b8a6' });

  createSVGChart('supplier-risk-donut', 'donut', [
    { label: 'Critical Tier', value: criticalSuppliers, color: '#ef4444' },
    { label: 'High Tier', value: highSuppliers, color: '#f97316' },
    { label: 'Medium Tier', value: mediumSuppliers, color: '#eab308' },
    { label: 'Low Tier', value: lowSuppliers, color: '#10b981' }
  ]);
}
