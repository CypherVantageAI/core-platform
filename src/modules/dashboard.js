// ==========================================================================
// Cypher Vantage - Executive Dashboard Module (ES6 Module)
// ==========================================================================

import { getState } from '../core/db.js';
import { createCard, createSVGChart, createStatusBadge } from '../components/ui.js';

let activeDashboardSubTab = 'overview';

export function renderExecutiveDashboard() {
  const state = getState();
  const container = document.getElementById('view-manager-dashboard');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- Sub-tab switcher -->
      <div style="display: flex; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; width: 100%;">
        <button id="btn-db-tab-overview" class="btn btn-secondary btn-xs ${activeDashboardSubTab === 'overview' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">Executive Overview</button>
        <button id="btn-db-tab-threatmap" class="btn btn-secondary btn-xs ${activeDashboardSubTab === 'threatmap' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">🗺️ Global Threat Map & Feed</button>
      </div>

      <!-- Tab Content Area -->
      <div id="dashboard-tab-content" style="width: 100%;"></div>
    </div>
  `;

  // Bind tab buttons
  const btnOverview = document.getElementById('btn-db-tab-overview');
  const btnThreatMap = document.getElementById('btn-db-tab-threatmap');

  if (btnOverview) {
    btnOverview.onclick = () => {
      activeDashboardSubTab = 'overview';
      renderDashboardContent();
      // Update active classes
      btnOverview.classList.add('active');
      if (btnThreatMap) btnThreatMap.classList.remove('active');
    };
  }

  if (btnThreatMap) {
    btnThreatMap.onclick = () => {
      activeDashboardSubTab = 'threatmap';
      renderDashboardContent();
      // Update active classes
      btnThreatMap.classList.add('active');
      if (btnOverview) btnOverview.classList.remove('active');
    };
  }

  // Initial load
  renderDashboardContent();
}

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

    // Convert state.suppliers object to array for dashboard statistics
    const suppliersList = Object.values(state.suppliers || {});

    // Compute Resilience score based on findings, incidents, and supplier ratings
    const avgSupplierScore = suppliersList.length ? (suppliersList.reduce((sum, s) => sum + s.complianceScore, 0) / suppliersList.length) : 100;
    const resilienceScore = Math.round(avgSupplierScore * 0.8 + (100 - openRisks * 5 - openFindings * 3) * 0.2);

    // Compute Recovery Readiness based on tests
    const totalTests = state.tests.length;
    const passedTests = state.tests.filter(t => t.results === 'Passed').length;
    const readinessScore = Math.round((passedTests / totalTests) * 100);

    // Supplier risk tier breakdowns for the Heat-donut
    const criticalSuppliers = suppliersList.filter(s => s.riskTier === 'Critical').length;
    const highSuppliers = suppliersList.filter(s => s.riskTier === 'High').length;
    const mediumSuppliers = suppliersList.filter(s => s.riskTier === 'Medium').length;
    const lowSuppliers = suppliersList.filter(s => s.riskTier === 'Low' || s.riskTier.includes('Low')).length;

    contentArea.innerHTML = `
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

    // Render overview KPI cards
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
  } else {
    // RENDER THREAT MAP & LIVE FEED
    contentArea.innerHTML = `
      <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
        <!-- Global Visualisation Map Card -->
        <div class="dashboard-card map-card" style="flex: 2; min-width: 500px; padding: 15px; position: relative; min-height: 520px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; margin-bottom: 12px;">
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

          <div class="world-map-wrapper" style="position: relative; flex: 1; min-height: 380px;">
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
            
            <div class="world-map-grid" id="resilience-world-map" style="position: relative; width: 100%; height: 100%; min-height: 380px;">
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
              </svg>
            </div>
          </div>
        </div>

        <!-- Industry-Wide Threat Feed Card -->
        <div class="dashboard-card" style="flex: 1; min-width: 300px; padding: 15px; display: flex; flex-direction: column; height: 520px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; margin-bottom: 12px;">
            <h3 style="font-size: 0.78rem; color: var(--color-cyan); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; margin: 0;">
              📡 Live Industry Threat Feed
            </h3>
            <span class="badge" style="font-size: 0.55rem; background: rgba(16, 185, 129, 0.08); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); font-weight: 700; text-transform: uppercase;">LIVE</span>
          </div>
          
          <div id="navigator-threat-feed" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px;">
            <!-- Dynamically populated ticking feed items in app.js -->
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
