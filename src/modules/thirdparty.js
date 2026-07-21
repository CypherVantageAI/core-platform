// ==========================================================================
// Cypher Vantage - Third Party & Nth-Party Risk Module (ES6 Module)
// ==========================================================================

import { getState, saveState } from '../core/db.js';
import { createTable, createCard, createStatusBadge } from '../components/ui.js';

let selectedSupplierId = 'aws';
let activeThirdPartyTab = 'directory';
let selectedHotspotName = null;

export function renderThirdPartyModule() {
  const state = getState();
  window.activeThirdPartyTab = activeThirdPartyTab;
  const container = document.getElementById('view-manager-thirdparty');
  if (!container) return;

  const suppliersList = Object.values(state.suppliers || {});
  const totalSuppliers = suppliersList.length;
  const criticalSuppliers = suppliersList.filter(s => s.riskTier === 'Critical').length;
  const avgCompliance = totalSuppliers ? Math.round(suppliersList.reduce((sum, s) => sum + s.complianceScore, 0) / totalSuppliers) : 100;
  const activeGaps = state.actions.filter(a => a.status !== 'Closed').length;
  const totalSubcontractors = suppliersList.reduce((sum, s) => sum + (s.subcontractors ? s.subcontractors.length : 0), 0);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- KPI stats row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; width: 100%;">
        <div id="tpr-kpi-total"></div>
        <div id="tpr-kpi-critical"></div>
        <div id="tpr-kpi-compliance"></div>
        <div id="tpr-kpi-gaps"></div>
      </div>

      <!-- Sub-Tab Navigation -->
      <div class="sub-tab-nav" style="display: flex; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 0; flex-wrap: wrap; margin-bottom: 15px;">
        <button id="tab-tpr-directory" class="horizontal-sub-tab-btn ${activeThirdPartyTab === 'directory' ? 'active' : ''}">Supplier Inventory</button>
        <button id="tab-tpr-concentration" class="horizontal-sub-tab-btn ${activeThirdPartyTab === 'concentration' ? 'active' : ''}">Concentration Risk</button>
        <button id="tab-tpr-sla" class="horizontal-sub-tab-btn ${activeThirdPartyTab === 'sla' ? 'active' : ''}">SLA &amp; Performance</button>
        <button id="tab-tpr-exit" class="horizontal-sub-tab-btn ${activeThirdPartyTab === 'exit' ? 'active' : ''}">Exit Strategies</button>
      </div>

      <!-- Dynamic Content Area -->
      <div id="tpr-tab-content" style="width: 100%; min-height: 520px;"></div>
    </div>
  `;

  // Render KPI cards
  createCard('tpr-kpi-total', {
    title: 'Total Suppliers Mapped',
    value: `${totalSuppliers}`,
    subtext: `${totalSubcontractors} Subcontractors Mapped`,
    icon: '🏢',
    borderLeftColor: '#14b8a6'
  });

  createCard('tpr-kpi-critical', {
    title: 'Critical-Tier Vendors',
    value: `${criticalSuppliers}`,
    subtext: 'Requires real-time RTO alerts',
    icon: '⚠️',
    borderLeftColor: '#ef4444'
  });

  createCard('tpr-kpi-compliance', {
    title: 'Average Compliance Score',
    value: `${avgCompliance}%`,
    subtext: 'Across Supplier Control Obligations',
    icon: '📊',
    borderLeftColor: '#10b981'
  });

  createCard('tpr-kpi-gaps', {
    title: 'Active Remediation Gaps',
    value: `${activeGaps}`,
    subtext: 'Awaiting response/remediation',
    icon: '🚨',
    borderLeftColor: '#eab308'
  });

  // Bind tab buttons
  document.getElementById('tab-tpr-directory').onclick = () => switchTab('directory');
  document.getElementById('tab-tpr-concentration').onclick = () => switchTab('concentration');
  document.getElementById('tab-tpr-sla').onclick = () => switchTab('sla');
  document.getElementById('tab-tpr-exit').onclick = () => switchTab('exit');

  // Load active tab
  renderActiveTabContent();
}

function switchTab(tabId) {
  activeThirdPartyTab = tabId;
  window.activeThirdPartyTab = activeThirdPartyTab;
  document.querySelectorAll('.sub-tab-nav .horizontal-sub-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`tab-tpr-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');
  renderActiveTabContent();
}

function renderActiveTabContent() {
  const contentArea = document.getElementById('tpr-tab-content');
  if (!contentArea) return;

  if (activeThirdPartyTab === 'directory') {
    renderDirectoryTab(contentArea);
  } else if (activeThirdPartyTab === 'concentration') {
    renderConcentrationTab(contentArea);
  } else if (activeThirdPartyTab === 'sla') {
    renderSlaTab(contentArea);
  } else if (activeThirdPartyTab === 'exit') {
    renderExitTab(contentArea);
  }
}

// --------------------------------------------------------------------------
// TAB 1: SUPPLIER DIRECTORY
// --------------------------------------------------------------------------
function renderDirectoryTab(container) {
  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
      <!-- Left Panel: Supplier Registry -->
      <div class="dashboard-card" style="flex: 1.5; min-width: 450px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
          <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
            Nth-Party Supplier Directory
          </h3>
          <button class="btn btn-secondary btn-xs" onclick="switchTab('manager-inbox')" style="padding: 4px 8px; font-size: 0.65rem; display: flex; align-items: center; gap: 4px;">
            🚨 Urgent Remediation Inbox
          </button>
        </div>
        <div id="suppliers-table-container" style="width: 100%;"></div>
      </div>

      <!-- Right Panel: Profile & Subcontractors -->
      <div class="dashboard-card" style="flex: 1.2; min-width: 380px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0;">
        <div id="supplier-detail-header" style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <!-- Populated dynamically -->
        </div>
        <div id="supplier-detail-body" style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  `;

  renderSuppliersTable();
  renderSupplierDetails();
}

function renderSuppliersTable() {
  const state = getState();
  const columns = [
    { key: 'name', label: 'Supplier Name', render: (row) => `<b>${row.name}</b>` },
    { key: 'riskTier', label: 'Risk Tier', render: (row) => createStatusBadge(row.riskTier) },
    { 
      key: 'complianceScore', 
      label: 'Compliance', 
      render: (row) => `
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-weight:700; color: ${row.complianceScore >= 90 ? '#10b981' : (row.complianceScore >= 75 ? '#eab308' : '#ef4444')}">${row.complianceScore}%</span>
          <div style="flex:1; width:50px; height:4px; background:rgba(255,255,255,0.04); border-radius:2px; overflow:hidden;">
            <div style="width: ${row.complianceScore}%; height:100%; background: ${row.complianceScore >= 90 ? '#10b981' : (row.complianceScore >= 75 ? '#eab308' : '#ef4444')}"></div>
          </div>
        </div>
      `
    },
    { key: 'contactName', label: 'Contact Rep', render: (row) => `<span style="font-size:0.7rem; color:var(--text-secondary);">${row.contactName}</span>` },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => `
        <button class="btn btn-secondary btn-xs select-sup-btn" data-id="${row.id}" style="padding: 2px 6px;">Select</button>
      `
    }
  ];

  const suppliersList = Object.values(state.suppliers || {});
  createTable('suppliers-table-container', suppliersList, columns, {
    searchPlaceholder: 'Search suppliers directory...',
    pageSize: 6,
    selectedRowId: selectedSupplierId,
    onRowClick: (row) => {
      selectedSupplierId = row.id;
      renderSupplierDetails();
      renderSuppliersTable();
    }
  });
}

function renderSupplierDetails() {
  const state = getState();
  const headerContainer = document.getElementById('supplier-detail-header');
  const bodyContainer = document.getElementById('supplier-detail-body');
  if (!headerContainer || !bodyContainer) return;

  const sup = (state.suppliers && state.suppliers[selectedSupplierId]) || null;
  if (!sup) {
    headerContainer.innerHTML = `<h3 style="font-size:0.8rem; margin:0;">No Supplier Selected</h3>`;
    bodyContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">Please select a supplier from the registry.</div>`;
    return;
  }

  headerContainer.innerHTML = `
    <div>
      <span style="font-size:0.56rem; text-transform:uppercase; color:var(--color-cyan); font-weight:700;">Supplier Profile</span>
      <h2 style="font-size:1.05rem; font-weight:700; margin-top:2px; color:var(--text-primary);">${sup.name}</h2>
    </div>
    <div>
      ${createStatusBadge(sup.riskTier)}
    </div>
  `;

  const subsHtml = sup.subcontractors && sup.subcontractors.length > 0 ? sup.subcontractors.map(sub => `
    <tr style="border-bottom:1px solid var(--border-color); font-size:0.7rem;">
      <td style="padding:6px 8px; color:var(--text-primary);"><b>${sub.name}</b></td>
      <td style="padding:6px 8px; color:var(--text-secondary);">${sub.role}</td>
      <td style="padding:6px 8px; color:var(--text-muted);">${sub.primaryLocation}</td>
      <td style="padding:6px 8px; color:var(--text-muted);">${sub.secondaryLocation || '--'}</td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="4" style="padding:10px; text-align:center; color:var(--text-muted); font-size:0.68rem; font-style:italic;">No mapped downstream subcontractors.</td>
    </tr>
  `;

  // Compute supplier active gaps across risk register, SCO assessments, and remediations actions
  const supplierRisks = state.risks.filter(r => r.owner.includes(sup.contactName) || r.title.includes(sup.id.toUpperCase()) || r.title.includes(sup.name.split(' ')[0]));
  const assessmentGaps = (sup.assessments || []).filter(a => a.status === 'Gap');
  const actionGaps = (state.actions || []).filter(a => a.supplierId === sup.id);

  let gapItems = [];
  supplierRisks.forEach(r => gapItems.push({ title: r.title, status: r.status }));
  assessmentGaps.forEach(a => gapItems.push({ title: `${a.section} ${a.title}: ${a.snippet}`, status: 'Gap Identified' }));
  actionGaps.forEach(a => gapItems.push({ title: `${a.title} (${a.domain})`, status: a.status || 'Open Gap' }));

  const supplierGapsHtml = gapItems.length > 0 ? gapItems.map(g => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(239,68,68,0.02); border:1px solid rgba(239,68,68,0.1); border-radius:4px; padding:6px 10px; font-size:0.68rem; gap:8px;">
      <span style="color:var(--text-primary); font-weight:600;">⚠️ ${g.title}</span>
      ${createStatusBadge(g.status)}
    </div>
  `).join('') : `<div style="font-size:0.68rem; color:var(--text-muted); font-style:italic;">No active compliance gaps logged.</div>`;

  bodyContainer.innerHTML = `
    <div style="font-size:0.72rem; color:var(--text-secondary); line-height:1.45;">
      <b>Business Impact Context:</b><br/>
      ${sup.riskTierExplanation}
    </div>

    <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border-color); padding:10px; border-radius:6px; font-size:0.7rem; display:flex; flex-direction:column; gap:4px;">
      <div>💼 <b>Account Lead:</b> ${sup.contactName} (${sup.contactEmail})</div>
      <div>📍 <b>Primary Location:</b> ${sup.primarySupportLocation || 'N/A'}</div>
      <div>🌎 <b>Secondary Operations Location:</b> ${sup.secondarySupportLocation || 'N/A'}</div>
    </div>

    <div style="display:flex; flex-direction:column; gap:6px;">
      <h4 style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; font-weight: 700; margin: 0;">
        Active Compliance Gaps & Risks
      </h4>
      ${supplierGapsHtml}
    </div>

    <div style="display:flex; flex-direction:column; gap:6px;">
      <h4 style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed var(--border-color); padding-bottom: 4px; margin: 0;">
        Downstream Subcontractor Chain (Tier 4 / Nth-Party)
      </h4>
      <div style="overflow-x:auto; width:100%; border:1px solid var(--border-color); border-radius:4px;">
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="background:rgba(255,255,255,0.02); border-bottom:1px solid var(--border-color); font-size:0.68rem; font-weight:600; color:var(--text-secondary);">
              <th style="padding:6px 8px;">Subcontractor</th>
              <th style="padding:6px 8px;">Role</th>
              <th style="padding:6px 8px;">Primary Location</th>
              <th style="padding:6px 8px;">Failover Location</th>
            </tr>
          </thead>
          <tbody>
            ${subsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getServicesForSupplier(state, supplierId) {
  const linkedServices = [];
  const assets = state.assets || [];
  const supAssets = assets.filter(a => a.supplierId === supplierId);
  
  if (state.applications && state.services) {
    supAssets.forEach(ast => {
      const matchedApps = state.applications.filter(app => ast.name && ast.name.includes(app.name.split(' ')[0]));
      matchedApps.forEach(app => {
        const srvs = state.services.filter(s => s.applications && s.applications.includes(app.id));
        linkedServices.push(...srvs);
      });
    });
    
    if (linkedServices.length === 0) {
      const matchedApps = state.applications.filter(app => 
        app.hostingProvider && app.hostingProvider.toLowerCase().includes(supplierId.toLowerCase())
      );
      matchedApps.forEach(app => {
        const srvs = state.services.filter(s => s.applications && s.applications.includes(app.id));
        linkedServices.push(...srvs);
      });
    }
  }

  // Fallback explicit mappings for DORT concentration logic to ensure ALL related IBS are mapped!
  const id = supplierId.toLowerCase();
  if (id === 'salesforce') {
    const s1 = state.services.find(s => s.id === 'srv-001'); // Payments Hub
    const s2 = state.services.find(s => s.id === 'srv-002'); // IBS Clearing Portal
    if (s1) linkedServices.push(s1);
    if (s2) linkedServices.push(s2);
  } else if (id === 'slack') {
    const s1 = state.services.find(s => s.id === 'srv-001'); // Payments Hub
    const s4 = state.services.find(s => s.id === 'srv-004'); // CIS Identity & Access Directories
    if (s1) linkedServices.push(s1);
    if (s4) linkedServices.push(s4);
  } else if (id === 'workday') {
    const s3 = state.services.find(s => s.id === 'srv-003'); // CIS Database Backup Services
    if (s3) linkedServices.push(s3);
  } else if (id === 'aws') {
    const s1 = state.services.find(s => s.id === 'srv-001'); // Payments Hub
    const s2 = state.services.find(s => s.id === 'srv-002'); // IBS Clearing Portal
    if (s1) linkedServices.push(s1);
    if (s2) linkedServices.push(s2);
  }
  
  return [...new Set(linkedServices)];
}

// --------------------------------------------------------------------------
// TAB 2: CONCENTRATION RISK
// --------------------------------------------------------------------------
function renderConcentrationTab(container) {
  const state = getState();
  const suppliersList = Object.values(state.suppliers || {});

  // Identify subcontractor concentration hotspots
  const subcontractorMap = {};
  suppliersList.forEach(sup => {
    if (sup.subcontractors) {
      sup.subcontractors.forEach(sub => {
        if (!subcontractorMap[sub.name]) {
          subcontractorMap[sub.name] = {
            name: sub.name,
            role: sub.role,
            primaryLocation: sub.primaryLocation,
            suppliers: []
          };
        }
        subcontractorMap[sub.name].suppliers.push(sup.name);
      });
    }
  });

  const hotspots = Object.values(subcontractorMap).filter(sub => sub.suppliers.length > 1);
  // Sort hotspots descending by exposure (highest supplier count first)
  hotspots.sort((a, b) => b.suppliers.length - a.suppliers.length);

  // Default to highest-exposure hotspot if initial or not found
  if ((!selectedHotspotName || !subcontractorMap[selectedHotspotName]) && hotspots.length > 0) {
    selectedHotspotName = hotspots[0].name;
  }

  let subObj = subcontractorMap[selectedHotspotName];
  if (!subObj && hotspots.length > 0) {
    selectedHotspotName = hotspots[0].name;
    subObj = subcontractorMap[selectedHotspotName];
  }

  const hotspotRows = hotspots.map(sub => `
      <tr class="hotspot-row ${selectedHotspotName === sub.name ? 'active-row' : ''}" data-name="${sub.name}" style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem; cursor: pointer; transition: background 0.15s ease;">
        <td style="padding: 10px; color: var(--text-primary); font-weight: 700;">
          ${selectedHotspotName === sub.name ? '👉 ' : ''}⚠️ ${sub.name}
        </td>
        <td style="padding: 10px; color: var(--text-secondary);">${sub.role}</td>
        <td style="padding: 10px; color: var(--text-muted);">${sub.primaryLocation}</td>
        <td style="padding: 10px; color: #ef4444; font-weight: 700;">${sub.suppliers.length} Primary Vendors</td>
        <td style="padding: 10px; color: var(--text-secondary);">${sub.suppliers.join(', ')}</td>
      </tr>
    `).join('');

  // Generate dynamic nodes & paths for SVG
  let svgPaths = '';
  let svgNodes = '';
  
  if (subObj) {
    const subX = 490;
    const subY = 115;
    
    // Common Subcontractor Node (Right)
    svgNodes += `
      <g transform="translate(${subX}, ${subY})">
        <rect width="140" height="50" rx="4" fill="#ef4444" stroke="#ef4444" stroke-width="2" />
        <text x="5" y="15" font-size="7" font-weight="800" fill="rgba(255,255,255,0.7)">⚠️ CONCENTRATION POINT</text>
        <text x="5" y="32" font-size="8.5" font-weight="800" fill="#ffffff">${subObj.name}</text>
        <text x="5" y="43" font-size="6.5" fill="rgba(255,255,255,0.9)">Shared by ${subObj.suppliers.length} vendors</text>
      </g>
    `;
    
    // Suppliers Nodes (Middle)
    const midX = 250;
    const sups = subObj.suppliers;
    const spacingY = 70;
    const totalSups = sups.length;
    const startY = 140 - ((totalSups - 1) * spacingY) / 2 - 25;
    
    const supCoords = [];
    sups.forEach((supName, idx) => {
      const supY = startY + idx * spacingY;
      supCoords.push({ name: supName, x: midX, y: supY });
      
      // Node Box
      svgNodes += `
        <g transform="translate(${midX}, ${supY})">
          <rect width="120" height="50" rx="4" fill="var(--bg-card)" stroke="#ef4444" stroke-width="1.5" />
          <text x="5" y="15" font-size="7" font-weight="700" fill="var(--text-muted)">PRIMARY SUPPLIER</text>
          <text x="5" y="32" font-size="8" font-weight="700" fill="var(--text-primary)">${supName.slice(0, 20)}</text>
        </g>
      `;
      
      // Path Supplier -> Subcontractor (Bezier curve)
      const x1 = midX + 120;
      const y1 = supY + 25;
      const x2 = subX;
      const y2 = subY + 25;
      const cx1 = x1 + (x2 - x1) / 2;
      const cy1 = y1;
      const cx2 = x1 + (x2 - x1) / 2;
      const cy2 = y2;
      svgPaths += `<path d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}" stroke="#ef4444" stroke-width="2" fill="none" filter="url(#glow-red)" />`;
    });
    
    // Services Nodes (Left) - Render all linked services!
    const serviceMap = {};
    sups.forEach(supName => {
      const supObj = suppliersList.find(s => s.name === supName);
      if (supObj) {
        const services = getServicesForSupplier(state, supObj.id);
        services.forEach(srv => {
          if (!serviceMap[srv.name]) {
            serviceMap[srv.name] = {
              name: srv.name,
              criticality: srv.criticality,
              suppliers: []
            };
          }
          serviceMap[srv.name].suppliers.push(supName);
        });
      }
    });
    
    const uniqueServices = Object.values(serviceMap);
    const leftX = 10;
    const totalSrvs = uniqueServices.length || 1;
    const srvSpacingY = totalSrvs > 3 ? 55 : 70;
    const srvStartY = 140 - ((totalSrvs - 1) * srvSpacingY) / 2 - 25;
    
    uniqueServices.forEach((srv, idx) => {
      const srvY = srvStartY + idx * srvSpacingY;
      const borderCol = srv.criticality === 'Critical' ? 'var(--color-danger)' : 'var(--border-color)';
      
      svgNodes += `
        <g transform="translate(${leftX}, ${srvY})">
          <rect width="120" height="50" rx="4" fill="var(--bg-card)" stroke="${borderCol}" stroke-width="1.5" />
          <text x="5" y="15" font-size="7" font-weight="700" fill="var(--text-muted)">CRITICAL SERVICE</text>
          <text x="5" y="32" font-size="8" font-weight="700" fill="var(--text-primary)">${srv.name.slice(0, 20)}</text>
        </g>
      `;
      
      srv.suppliers.forEach(supName => {
        const matchingSup = supCoords.find(sc => sc.name === supName);
        if (matchingSup) {
          const x1 = leftX + 120;
          const y1 = srvY + 25;
          const x2 = matchingSup.x;
          const y2 = matchingSup.y + 25;
          const cx1 = x1 + (x2 - x1) / 2;
          const cy1 = y1;
          const cx2 = x1 + (x2 - x1) / 2;
          const cy2 = y2;
          svgPaths += `<path d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" fill="none" />`;
        }
      });
    });
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- CSS styling for active row -->
      <style>
        .hotspot-row:hover { background: rgba(255,255,255,0.03); }
        .hotspot-row.active-row { background: rgba(239, 68, 68, 0.08) !important; border-left: 3px solid #ef4444; }
      </style>
      
      <div class="dashboard-card" style="padding: 15px; margin: 0;">
        <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
          Nth-Party Subprocessor Concentration Hotspots
        </h3>
        <p class="panel-subtitle" style="margin-bottom: 15px;">DORA Chapter V mandates identifying critical services sharing downstream subcontractors to prevent systemic failures. Click a row to map below.</p>
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);">
                <th style="padding: 10px;">Subcontractor (Tier 4)</th>
                <th style="padding: 10px;">Role</th>
                <th style="padding: 10px;">Primary Location</th>
                <th style="padding: 10px;">Concentration Exposure</th>
                <th style="padding: 10px;">Impacted Primary Suppliers</th>
              </tr>
            </thead>
            <tbody>
              ${hotspotRows || '<tr><td colspan="5" style="padding:15px; text-align:center; color:var(--text-muted);">No overlapping critical subcontractors mapped.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Concentration Map Visualization -->
      <div class="dashboard-card" style="padding: 15px; margin: 0; min-height: 340px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
        <h3 style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin: 0;">
          Interactive Concentration Overlay Map: ${selectedHotspotName}
        </h3>
        
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.1); border: 1px solid var(--border-color); border-radius: 6px; padding: 20px; position: relative; overflow: auto;">
          <!-- SVG Concentration Tree -->
          <svg viewBox="0 0 700 280" style="width: 100%; height: 100%; max-height: 280px; min-height: 280px; min-width: 680px;">
            <defs>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <!-- Lines -->
            ${svgPaths}
            
            <!-- Nodes -->
            ${svgNodes}
          </svg>
        </div>
      </div>
    </div>
  `;

  // Bind row click handlers
  document.querySelectorAll('.hotspot-row').forEach(row => {
    row.onclick = () => {
      selectedHotspotName = row.getAttribute('data-name');
      renderConcentrationTab(container);
    };
  });
}

// --------------------------------------------------------------------------
// TAB 3: SLA & PERFORMANCE
// --------------------------------------------------------------------------
function renderSlaTab(container) {
  const state = getState();
  const activeActions = state.actions.filter(a => a.isVulnerabilityRemediation && a.status !== 'Closed');

  const slaRows = activeActions.map(act => {
    const s = state.suppliers[act.supplierId];
    const supplierName = s ? s.name : 'Unknown';
    let slaTarget = '48 Hours';
    if (act.title.includes('9 Hours') || act.id === 'act-vuln-pre') slaTarget = '9 Hours';
    else if (act.title.includes('24 Hours')) slaTarget = '24 Hours';

    return `
      <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem;">
        <td style="padding: 10px; color: var(--text-primary);"><b>${act.id}</b></td>
        <td style="padding: 10px; color: var(--text-secondary);">${act.title}</td>
        <td style="padding: 10px; color: var(--text-muted);">${supplierName}</td>
        <td style="padding: 10px;"><span class="badge badge-info" style="font-size:0.6rem;">${slaTarget}</span></td>
        <td style="padding: 10px; color: var(--text-secondary);">${act.status}</td>
        <td style="padding: 10px; color: #ef4444; font-weight: 700;">Active Remediation</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- SLA Status gauges -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; width: 100%;">
        <div class="dashboard-card" style="padding: 15px; margin: 0; text-align: center;">
          <h4 style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin: 0;">SLA Compliance Rate</h4>
          <strong style="font-size: 1.8rem; color: #10b981; display: block; margin-top: 5px;">94.2%</strong>
          <span style="font-size: 0.62rem; color: var(--text-secondary);">Target: >95.0% | Variance: -0.8%</span>
        </div>
        
        <div class="dashboard-card" style="padding: 15px; margin: 0; text-align: center;">
          <h4 style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin: 0;">MTTR (Mean Time to Resolve)</h4>
          <strong style="font-size: 1.8rem; color: var(--color-cyan); display: block; margin-top: 5px;">14.8 Hours</strong>
          <span style="font-size: 0.62rem; color: var(--text-secondary);">Critical Vulns: 8.2 Hours | High: 22 Hours</span>
        </div>
        
        <div class="dashboard-card" style="padding: 15px; margin: 0; text-align: center;">
          <h4 style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin: 0;">Active SLA Breaches</h4>
          <strong style="font-size: 1.8rem; color: #ef4444; display: block; margin-top: 5px;">1</strong>
          <span style="font-size: 0.62rem; color: var(--text-secondary);">AWS us-east-1a testing overdue (Article 13 gap)</span>
        </div>
      </div>

      <div class="dashboard-card" style="padding: 15px; margin: 0;">
        <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
          Active Supplier Remediation SLA Registry
        </h3>
        <p class="panel-subtitle" style="margin-bottom: 15px;">Uptime and vulnerability fix performance under contractual service level agreements (SLAs).</p>
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);">
                <th style="padding: 10px;">Action ID</th>
                <th style="padding: 10px;">Remediation Objective</th>
                <th style="padding: 10px;">Vendor</th>
                <th style="padding: 10px;">Target SLA Limit</th>
                <th style="padding: 10px;">Status</th>
                <th style="padding: 10px;">Compliance Rating</th>
              </tr>
            </thead>
            <tbody>
              ${slaRows || '<tr><td colspan="6" style="padding:15px; text-align:center; color:var(--text-muted);">No active remediation SLAs logged. All suppliers nominal.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// TAB 4: EXIT STRATEGIES
// --------------------------------------------------------------------------
function renderExitTab(container) {
  const state = getState();
  const strategies = state.exitStrategies || {};

  const strategyRows = Object.keys(strategies).map(supId => {
    const strat = strategies[supId];
    const s = state.suppliers[supId];
    const supplierName = s ? s.name : supId.toUpperCase();
    const feasibilityColor = strat.feasibilityIndex >= 80 ? '#10b981' : (strat.feasibilityIndex >= 60 ? '#eab308' : '#ef4444');

    return `
      <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem;">
        <td style="padding: 10px; color: var(--text-primary);"><b>${supplierName}</b></td>
        <td style="padding: 10px; color: var(--text-secondary);">${strat.backupProvider}</td>
        <td style="padding: 10px; color: var(--text-muted);">${strat.transitionTimeline}</td>
        <td style="padding: 10px; color: var(--text-secondary);">${strat.criticalServicesAffected.join(', ')}</td>
        <td style="padding: 10px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-weight:700; color: ${feasibilityColor}">${strat.feasibilityIndex}%</span>
            <div style="flex:1; width:50px; height:4px; background:rgba(255,255,255,0.04); border-radius:2px; overflow:hidden;">
              <div style="width: ${strat.feasibilityIndex}%; height:100%; background: ${feasibilityColor}"></div>
            </div>
          </div>
        </td>
        <td style="padding: 10px;"><span class="badge" style="background: rgba(6,182,212,0.1); color: var(--color-cyan); border: 1px solid rgba(6,182,212,0.2);">${strat.strategyStatus}</span></td>
        <td style="padding: 10px; text-align: center;">
          <button class="btn btn-secondary btn-xs" onclick="alert('Exit simulation logs: Last run ${strat.lastTestDate}. Data integrity and failover sync verified with zero loss.')" style="padding: 2px 6px;">Test Log</button>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <div class="dashboard-card" style="padding: 15px; margin: 0;">
        <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
          Supplier Exit Strategy Registry
        </h3>
        <p class="panel-subtitle" style="margin-bottom: 15px;">DORA Article 28 requires financial institutions to maintain robust exit strategies for critical ICT service providers to allow transitions without service interruption.</p>
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);">
                <th style="padding: 10px;">Primary Supplier</th>
                <th style="padding: 10px;">Alternative Backup Provider</th>
                <th style="padding: 10px;">Transition Timeline</th>
                <th style="padding: 10px;">Services Mapped</th>
                <th style="padding: 10px;">Feasibility Index</th>
                <th style="padding: 10px;">Plan Status</th>
                <th style="padding: 10px; text-align: center;">Simulation Drills</th>
              </tr>
            </thead>
            <tbody>
              ${strategyRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
