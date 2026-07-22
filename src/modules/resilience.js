// ==========================================================================
// Cypher Vantage - Operational Resilience Module (ES6 Module)
// ==========================================================================

import { getState, saveState } from '../core/db.js';
import { createTable, createForm, createStatusBadge } from '../components/ui.js';
import { renderSimulationTab } from './simulation.js';
import {
  analyzeBlastRadius,
  getImpactPropagationChain,
  calculateResilienceExposureScore,
  getScoreExplainability,
  calculateCriticalServiceHealthScore,
  calculateRecoveryConfidenceScore,
  calculateSupplierDependencyScore,
  calculateOperationalRiskVelocity,
  calculateTestingCoverageIndex,
  calculateDoraReadinessIndex,
  getExecutiveBoardAnswers
} from '../core/resilienceEngine.js';

let activeResilienceTab = 'services'; // 'services' | 'dependencies' | 'twin' | 'incidents' | 'readiness' | 'monitoring' | 'simulation'
let selectedServiceId = 'srv-001';
let selectedTwinPoint = 'sup-aws'; // default failure point for DORT
let isEditing = false;
let isAdding = false;

// Zoom/Pan state for the dependency map
let zoomScale = 1.0;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startDragX = 0;
let startDragY = 0;
let mapFilter = 'all'; // 'all' | 'critical' | 'infra'
let highlightCriticalPath = false;

export function renderResilienceModule() {
  window.activeResilienceTab = activeResilienceTab;
  window.executeTwinSimulation = executeTwinSimulation;
  const container = document.getElementById('view-manager-resilience');
  if (!container) return;

  // Render Sub-tab switcher and base structure
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 15px; width: 100%;">
      <!-- Sub-tab Selector -->
      <div style="display: flex; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; overflow-x: auto; width: 100%;">
        <button id="btn-res-tab-services" class="btn btn-secondary btn-xs ${activeResilienceTab === 'services' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">🏢 Business Services</button>
        <button id="btn-res-tab-dependencies" class="btn btn-secondary btn-xs ${activeResilienceTab === 'dependencies' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">🕸️ Dependency Mapping</button>
        <button id="btn-res-tab-twin" class="btn btn-secondary btn-xs ${activeResilienceTab === 'twin' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">♊ Digital Resilience Twin</button>
        <button id="btn-res-tab-simulation" class="btn btn-secondary btn-xs ${activeResilienceTab === 'simulation' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">🧬 Scenario Simulation</button>
        <button id="btn-res-tab-incidents" class="btn btn-secondary btn-xs ${activeResilienceTab === 'incidents' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">🚨 Incident Management</button>
        <button id="btn-res-tab-readiness" class="btn btn-secondary btn-xs ${activeResilienceTab === 'readiness' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">⏱️ Recovery Readiness</button>
        <button id="btn-res-tab-monitoring" class="btn btn-secondary btn-xs ${activeResilienceTab === 'monitoring' ? 'active' : ''}" style="padding: 6px 14px; font-size: 0.72rem;">📊 Control Monitoring</button>
      </div>

      <!-- Tab Content Pane -->
      <div id="resilience-tab-content" style="width: 100%;"></div>
    </div>
  `;

  // Bind tab switcher clicks
  const tabs = ['services', 'dependencies', 'twin', 'simulation', 'incidents', 'readiness', 'monitoring'];
  tabs.forEach(tab => {
    const btn = document.getElementById(`btn-res-tab-${tab}`);
    if (btn) {
      btn.onclick = () => {
        activeResilienceTab = tab;
        window.activeResilienceTab = activeResilienceTab;
        renderResilienceModule();
      };
    }
  });

  renderResilienceContent();
}

function renderResilienceContent() {
  const contentArea = document.getElementById('resilience-tab-content');
  if (!contentArea) return;

  switch (activeResilienceTab) {
    case 'services':
      renderServicesTab(contentArea);
      break;
    case 'dependencies':
      renderDependenciesTab(contentArea);
      break;
    case 'twin':
      renderTwinTab(contentArea);
      break;
    case 'simulation':
      renderSimulationTab(contentArea);
      break;
    case 'incidents':
      renderIncidentsTab(contentArea);
      break;
    case 'readiness':
      renderReadinessTab(contentArea);
      break;
    case 'monitoring':
      renderMonitoringTab(contentArea);
      break;
  }
}

// ==========================================================================
// 1. BUSINESS SERVICES TAB
// ==========================================================================
function renderServicesTab(container) {
  const state = getState();
  
  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
      <!-- Left Panel: Registry -->
      <div class="dashboard-card" style="flex: 1.5; min-width: 450px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0; min-height: 600px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
          <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
            Business Services Registry
          </h3>
          <button id="btn-add-service" class="btn btn-primary btn-xs" style="padding: 4px 10px;">+ Add Service</button>
        </div>

        <div id="services-table-container" style="width: 100%;"></div>
      </div>

      <!-- Right Panel: Mappings & Details -->
      <div class="dashboard-card" style="flex: 1.2; min-width: 380px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0; min-height: 600px;">
        <div id="resilience-detail-header" style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;"></div>
        <div id="resilience-detail-body" style="flex: 1; display: flex; flex-direction: column; gap: 15px;"></div>
      </div>
    </div>
  `;

  // Bind Add Button
  const btnAdd = document.getElementById('btn-add-service');
  if (btnAdd) {
    btnAdd.onclick = () => {
      isAdding = true;
      isEditing = false;
      renderServiceDetailPane();
    };
  }

  // Render Services Table
  const columns = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'name', label: 'Service Name', width: '180px', render: (row) => `<b>${row.name}</b>` },
    { key: 'criticality', label: 'Criticality', width: '100px', render: (row) => createStatusBadge(row.criticality) },
    { key: 'mtd', label: 'MTD', width: '90px', render: (row) => `<span style="font-size:0.7rem; color:var(--color-cyan); font-weight:600;">${row.mtd || row.rto || '--'}</span>` },
    { key: 'owner', label: 'Owner', render: (row) => `<span style="font-size:0.7rem; color:var(--text-secondary);">${row.owner}</span>` }
  ];

  createTable('services-table-container', state.services, columns, {
    searchPlaceholder: 'Search business services...',
    pageSize: 6,
    selectedRowId: selectedServiceId,
    onRowClick: (row) => {
      selectedServiceId = row.id;
      isAdding = false;
      isEditing = false;
      renderServiceDetailPane();
      renderServicesTab(container); // Refresh select highlighter
    }
  });

  renderServiceDetailPane();
}

function renderServiceDetailPane() {
  const state = getState();
  const header = document.getElementById('resilience-detail-header');
  const body = document.getElementById('resilience-detail-body');
  if (!header || !body) return;

  if (isAdding) {
    header.innerHTML = `<h3 style="font-size:0.8rem; color:var(--text-secondary); font-weight:700; margin:0;">Create New Business Service</h3>`;
    body.innerHTML = `
      <div style="background: rgba(6, 182, 212, 0.04); border: 1px solid rgba(6, 182, 212, 0.2); padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 0.72rem; line-height: 1.4; color: var(--text-secondary);">
        🌐 <b>IBM Blueworks Sync Action:</b> Saving this new business service will automatically submit the definitions and operational process mappings to <b>IBM Blueworks</b>. Process models and workflow dependencies will be managed and synchronized bi-directionally there.
      </div>
      <div id="resilience-form-container"></div>
    `;

    const formSchema = [
      { name: 'name', label: 'Service Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'criticality', label: 'DORA Criticality Tier', type: 'select', required: true, options: [
        { value: 'Critical', label: 'Critical (IBS / DORA Art. 5)' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
      ]},
      { name: 'rto', label: 'RTO (Recovery Time Objective)', type: 'text', required: true, placeholder: 'e.g. 4 Hours' },
      { name: 'rpo', label: 'RPO (Recovery Point Objective)', type: 'text', required: true, placeholder: 'e.g. 1 Hour' },
      { name: 'mtd', label: 'MTD (Max Tolerable Disruption)', type: 'text', required: true, placeholder: 'e.g. 4 Hours' },
      { name: 'impactTolerance', label: 'Impact Tolerance Limits', type: 'textarea', required: true, placeholder: 'Enter maximum tolerable loss boundaries...' },
      { name: 'customerImpact', label: 'Customer Impact Statement', type: 'textarea', required: true },
      { name: 'financialImpact', label: 'Financial Impact Statement', type: 'textarea', required: true },
      { name: 'regulatoryImpact', label: 'Regulatory Impact Statement', type: 'textarea', required: true },
      { name: 'owner', label: 'Service Owner', type: 'text', required: true },
      { name: 'ownerDepartment', label: 'Department', type: 'text', required: true }
    ];

    createForm('resilience-form-container', formSchema, (data) => {
      const newService = {
        id: `srv-${String(state.services.length + 1).padStart(3, '0')}`,
        ...data,
        status: 'Active',
        processes: ['prc-001'],
        applications: ['app-001']
      };
      state.services.push(newService);
      saveState();
      alert(`Service registered! Process model created and synced with IBM Blueworks.\nService ID: ${newService.id}`);
      selectedServiceId = newService.id;
      isAdding = false;
      renderResilienceModule();
    });
    return;
  }

  const srv = state.services.find(s => s.id === selectedServiceId);
  if (!srv) {
    header.innerHTML = `<h3 style="font-size:0.8rem; margin:0;">No Service Selected</h3>`;
    body.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">Please select a service from the registry.</div>`;
    return;
  }

  if (isEditing) {
    header.innerHTML = `<h3 style="font-size:0.8rem; color:var(--text-secondary); font-weight:700; margin:0;">Edit: ${srv.name}</h3>`;
    body.innerHTML = `<div id="resilience-form-container"></div>`;

    const formSchema = [
      { name: 'name', label: 'Service Name', type: 'text', required: true, placeholder: srv.name },
      { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: srv.description },
      { name: 'criticality', label: 'DORA Criticality Tier', type: 'select', required: true, options: [
        { value: 'Critical', label: 'Critical' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
      ]},
      { name: 'rto', label: 'RTO', type: 'text', required: true, placeholder: srv.rto },
      { name: 'rpo', label: 'RPO', type: 'text', required: true, placeholder: srv.rpo },
      { name: 'mtd', label: 'MTD (Max Tolerable Disruption)', type: 'text', required: true, placeholder: srv.mtd || '' },
      { name: 'impactTolerance', label: 'Impact Tolerance Limits', type: 'textarea', required: true, placeholder: srv.impactTolerance || '' },
      { name: 'customerImpact', label: 'Customer Impact Statement', type: 'textarea', required: true, placeholder: srv.customerImpact || '' },
      { name: 'financialImpact', label: 'Financial Impact Statement', type: 'textarea', required: true, placeholder: srv.financialImpact || '' },
      { name: 'regulatoryImpact', label: 'Regulatory Impact Statement', type: 'textarea', required: true, placeholder: srv.regulatoryImpact || '' },
      { name: 'owner', label: 'Owner', type: 'text', required: true, placeholder: srv.owner },
      { name: 'ownerDepartment', label: 'Department', type: 'text', required: true, placeholder: srv.ownerDepartment }
    ];

    createForm('resilience-form-container', formSchema, (data) => {
      Object.assign(srv, data);
      saveState();
      isEditing = false;
      renderResilienceModule();
    });
    return;
  }

  // Render detail view
  header.innerHTML = `
    <div>
      <span style="font-size:0.56rem; text-transform:uppercase; color:var(--color-cyan); font-weight:700;">Business Service Details</span>
      <h2 style="font-size:1.05rem; font-weight:700; margin-top:2px; color:var(--text-primary);">${srv.name}</h2>
    </div>
    <div style="display:flex; gap:6px;">
      <button id="btn-edit-srv" class="btn btn-secondary btn-xs" style="padding:2px 6px;">Edit</button>
      <button id="btn-delete-srv" class="btn btn-danger btn-xs" style="padding:2px 6px;">Delete</button>
    </div>
  `;

  document.getElementById('btn-edit-srv').onclick = () => { isEditing = true; renderServiceDetailPane(); };
  document.getElementById('btn-delete-srv').onclick = () => {
    if (confirm(`Delete business service "${srv.name}"?`)) {
      state.services = state.services.filter(s => s.id !== srv.id);
      saveState();
      if (state.services.length > 0) selectedServiceId = state.services[0].id;
      renderResilienceModule();
    }
  };

  body.innerHTML = `
    <div style="font-size:0.72rem; color:var(--text-secondary); line-height:1.45; display:flex; flex-direction:column; gap:10px;">
      <div><b>Scope:</b> ${srv.description}</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:8px; border-radius:4px;">
        <div><b>Owner:</b> ${srv.owner}</div>
        <div><b>Dept:</b> ${srv.ownerDepartment}</div>
        <div><b>RTO / RPO:</b> ${srv.rto} / ${srv.rpo}</div>
        <div><b>MTD:</b> ${srv.mtd || srv.rto || '--'}</div>
      </div>
      <div>
        <h4 style="font-size: 0.68rem; text-transform: uppercase; color: var(--color-cyan); font-weight: 700; margin: 4px 0;">Impact Tolerance:</h4>
        <span style="font-size:0.68rem; color:var(--text-secondary);">${srv.impactTolerance || 'Not explicitly modeled.'}</span>
      </div>
      <div style="border-top:1px dashed rgba(255,255,255,0.05); padding-top:6px; display:flex; flex-direction:column; gap:5px;">
        <div><b>Customer Impact:</b> <span style="color:var(--text-secondary); font-size:0.68rem;">${srv.customerImpact || 'No specific exposure calculated.'}</span></div>
        <div><b>Financial Impact:</b> <span style="color:var(--text-secondary); font-size:0.68rem;">${srv.financialImpact}</span></div>
        <div><b>Regulatory Impact:</b> <span style="color:var(--text-secondary); font-size:0.68rem;">${srv.regulatoryImpact || 'DORA alignment standard applies.'}</span></div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 2. INTERACTIVE DEPENDENCY MAP TAB
// ==========================================================================
function renderDependenciesTab(container) {
  const state = getState();
  const srv = state.services.find(s => s.id === selectedServiceId) || state.services[0];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 15px; width: 100%;">
      <!-- Controls Ribbon -->
      <div class="dashboard-card" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; margin: 0; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <label style="font-size:0.72rem; color:var(--text-secondary); font-weight: 600;">Mapping for:</label>
          <select id="map-service-selector" class="dropdown-control" style="width: 220px; font-size:0.72rem;">
            ${state.services.map(s => `<option value="${s.id}" ${s.id === srv.id ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="btn-zoom-in" class="btn btn-secondary btn-xs">🔍+ Zoom In</button>
          <button id="btn-zoom-out" class="btn btn-secondary btn-xs">🔍- Zoom Out</button>
          <button id="btn-zoom-reset" class="btn btn-secondary btn-xs">🔄 Reset</button>
          <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.1); margin: 0 4px;"></div>
          <button id="btn-toggle-critical" class="btn btn-secondary btn-xs ${highlightCriticalPath ? 'active' : ''}">⚡ Critical Path</button>
          <select id="map-layer-filter" class="dropdown-control" style="width: 120px; font-size:0.72rem;">
            <option value="all" ${mapFilter === 'all' ? 'selected' : ''}>All Levels</option>
            <option value="critical" ${mapFilter === 'critical' ? 'selected' : ''}>Critical Only</option>
            <option value="infra" ${mapFilter === 'infra' ? 'selected' : ''}>Infra & Suppliers</option>
          </select>
        </div>
      </div>

      <!-- Graph Visualization Box -->
      <div class="dashboard-card" id="dependency-graph-card" style="position: relative; overflow: hidden; height: 460px; padding: 0; margin: 0; cursor: grab; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px;">
        <div id="dependency-graph-canvas" style="width: 100%; height: 100%; transform-origin: 0 0; transition: transform 0.1s ease-out; pointer-events: none;">
          <!-- SVG Network rendered dynamically -->
        </div>
        <div style="position: absolute; bottom: 10px; right: 10px; font-size: 0.62rem; color: var(--text-muted); background: rgba(0,0,0,0.6); padding: 2px 6px; border-radius: 4px; pointer-events: none;">
          Drag to Pan | Scroll / Buttons to Zoom
        </div>
      </div>
    </div>
  `;

  // Bind service selector
  document.getElementById('map-service-selector').onchange = (e) => {
    selectedServiceId = e.target.value;
    renderDependenciesTab(container);
  };

  // Bind Zoom controls
  document.getElementById('btn-zoom-in').onclick = () => {
    zoomScale = Math.min(zoomScale * 1.2, 3.0);
    updateGraphTransform();
  };
  document.getElementById('btn-zoom-out').onclick = () => {
    zoomScale = Math.max(zoomScale * 0.8, 0.4);
    updateGraphTransform();
  };
  document.getElementById('btn-zoom-reset').onclick = () => {
    zoomScale = 1.0;
    offsetX = 0;
    offsetY = 0;
    updateGraphTransform();
  };

  // Bind Critical Path toggle
  document.getElementById('btn-toggle-critical').onclick = () => {
    highlightCriticalPath = !highlightCriticalPath;
    renderDependenciesTab(container);
  };

  // Bind layer filter
  document.getElementById('map-layer-filter').onchange = (e) => {
    mapFilter = e.target.value;
    renderDependenciesTab(container);
  };

  // Setup pan dragging listeners
  const graphCard = document.getElementById('dependency-graph-card');
  if (graphCard) {
    graphCard.onmousedown = (e) => {
      isDragging = true;
      graphCard.style.cursor = 'grabbing';
      startDragX = e.clientX - offsetX;
      startDragY = e.clientY - offsetY;
    };
    graphCard.onmousemove = (e) => {
      if (!isDragging) return;
      offsetX = e.clientX - startDragX;
      offsetY = e.clientY - startDragY;
      updateGraphTransform();
    };
    graphCard.onmouseup = () => {
      isDragging = false;
      graphCard.style.cursor = 'grab';
    };
    graphCard.onmouseleave = () => {
      isDragging = false;
      graphCard.style.cursor = 'grab';
    };
  }

  // Draw the SVG tree
  drawDependencyGraph(srv);
  updateGraphTransform();
}

function updateGraphTransform() {
  const canvas = document.getElementById('dependency-graph-canvas');
  if (canvas) {
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomScale})`;
  }
}

function drawDependencyGraph(srv) {
  const state = getState();
  const canvas = document.getElementById('dependency-graph-canvas');
  if (!canvas) return;

  // Resolve dependent nodes
  const processes = state.processes.filter(p => srv.processes && srv.processes.includes(p.id));
  const applications = state.applications.filter(app => srv.applications && srv.applications.includes(app.id));
  
  let assets = [];
  applications.forEach(app => {
    const matched = state.assets.filter(ast => ast.name.includes(app.name.split(' ')[0]));
    assets.push(...matched);
  });
  if (assets.length === 0 && state.assets.length > 0) assets = [state.assets[0]];

  const suppliersList = Object.values(state.suppliers || {});
  const suppliers = suppliersList.filter(sup => assets.some(ast => ast.supplierId === sup.id));

  // Determine levels filter
  let drawProcess = mapFilter !== 'infra';
  let drawSupplier = mapFilter !== 'critical';
  let drawAsset = mapFilter !== 'critical' || highlightCriticalPath;

  // Render SVG elements
  // Level positions:
  // BS (x=80) -> Process (x=260) -> App (x=440) -> Asset (x=620) -> Supplier (x=800)
  const bsNode = { id: srv.id, name: srv.name, x: 80, y: 180, type: 'service', criticality: srv.criticality };
  const pNodes = drawProcess ? processes.map((p, idx) => ({ id: p.id, name: p.name, x: 260, y: 70 + idx * 110, type: 'process', owner: p.owner })) : [];
  const appNodes = applications.map((app, idx) => ({ id: app.id, name: app.name, x: 440, y: 120 + idx * 120, type: 'app', version: app.version }));
  const assetNodes = drawAsset ? assets.map((ast, idx) => ({ id: ast.id, name: ast.name, x: 620, y: 80 + idx * 110, type: 'asset', status: ast.status })) : [];
  const supNodes = drawSupplier ? suppliers.map((sup, idx) => ({ id: sup.id, name: sup.name, x: 800, y: 150 + idx * 100, type: 'supplier', risk: sup.riskTier })) : [];

  // Generate connection paths
  const connections = [];

  // Connections BS -> Processes
  pNodes.forEach(pn => {
    connections.push({ from: bsNode, to: pn, critical: highlightCriticalPath });
  });

  // Connections Processes -> Apps
  pNodes.forEach(pn => {
    appNodes.forEach(an => {
      connections.push({ from: pn, to: an, critical: highlightCriticalPath });
    });
  });

  // Connections BS -> Apps directly if no processes drawn
  if (!drawProcess) {
    appNodes.forEach(an => {
      connections.push({ from: bsNode, to: an, critical: highlightCriticalPath });
    });
  }

  // Connections Apps -> Assets
  appNodes.forEach(an => {
    assetNodes.forEach(astN => {
      // Connect based on partial matching name
      const isRelated = astN.name.toLowerCase().includes(an.name.split(' ')[0].toLowerCase());
      connections.push({ from: an, to: astN, critical: highlightCriticalPath && isRelated });
    });
  });

  // Connections Assets -> Suppliers
  assetNodes.forEach(astN => {
    const rawAst = state.assets.find(a => a.id === astN.id);
    supNodes.forEach(sn => {
      const isRelated = rawAst && rawAst.supplierId === sn.id;
      connections.push({ from: astN, to: sn, critical: highlightCriticalPath && isRelated });
    });
  });

  // Construct SVG Elements
  const isLight = document.body.classList.contains('light-mode');
  let pathsHtml = '';
  connections.forEach(c => {
    const dx = c.to.x - c.from.x;
    const dy = c.to.y - c.from.y;
    const pathD = `M ${c.from.x + 130} ${c.from.y + 25} C ${c.from.x + 130 + dx/2} ${c.from.y + 25}, ${c.from.x + 130 + dx/2} ${c.to.y + 25}, ${c.to.x} ${c.to.y + 25}`;
    const strokeColor = c.critical ? '#ef4444' : (isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.06)');
    const strokeWidth = c.critical ? '2.5' : '1.5';
    const filterGlow = c.critical ? 'filter="url(#glow-red)"' : '';
    pathsHtml += `<path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${filterGlow} />`;
  });

  // Render Nodes
  let nodesHtml = '';
  const allNodes = [bsNode, ...pNodes, ...appNodes, ...assetNodes, ...supNodes];
  allNodes.forEach(node => {
    let nodeBorder = isLight ? 'rgba(15,23,42,0.15)' : 'rgba(255,255,255,0.08)';
    let nodeBg = isLight ? '#ffffff' : 'rgba(10,12,25,0.85)';
    let headerBg = isLight ? 'rgba(15,23,42,0.03)' : 'rgba(255,255,255,0.02)';
    let titleColor = isLight ? '#0f172a' : '#f8fafc';
    let textColor = isLight ? '#475569' : '#94a3b8';
    let labelColor = isLight ? '#64748b' : '#64748b';
    let label = '';
    let meta = '';

    if (node.type === 'service') {
      nodeBorder = 'var(--color-cyan)';
      label = 'BUSINESS SERVICE';
      meta = `Tier: ${node.criticality}`;
    } else if (node.type === 'process') {
      nodeBorder = '#a78bfa';
      label = 'MAPPED PROCESS';
      meta = `Owner: ${node.owner}`;
    } else if (node.type === 'app') {
      nodeBorder = '#3b82f6';
      label = 'APPLICATION';
      meta = `Version: ${node.version}`;
    } else if (node.type === 'asset') {
      nodeBorder = node.status === 'Secure' ? '#10b981' : '#f59e0b';
      label = 'ASSET';
      meta = `Status: ${node.status}`;
    } else if (node.type === 'supplier') {
      nodeBorder = node.risk === 'Critical' ? '#ef4444' : '#f97316';
      label = 'SUPPLIER';
      meta = `Tier: ${node.risk}`;
    }

    const isCriticalPathNode = highlightCriticalPath && (node.type === 'service' || node.type === 'app' || (node.type === 'process' && node.id === 'prc-001') || (node.type === 'asset' && node.id === 'ast-001') || (node.type === 'supplier' && node.id === 'aws'));
    if (highlightCriticalPath) {
      if (isCriticalPathNode) {
        nodeBorder = '#ef4444';
        nodeBg = isLight ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.02)';
      } else {
        nodeBg = isLight ? 'rgba(15,23,42,0.02)' : 'rgba(10,12,25,0.2)';
        nodeBorder = isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.03)';
      }
    }

    nodesHtml += `
      <g transform="translate(${node.x}, ${node.y})">
        <!-- Node Box -->
        <rect width="130" height="50" rx="4" fill="${nodeBg}" stroke="${nodeBorder}" stroke-width="1.5" />
        <!-- Node Header label -->
        <rect width="130" height="15" rx="2" fill="${headerBg}" />
        <text x="5" y="11" font-size="6.5" font-weight="700" fill="${labelColor}">${label}</text>
        
        <!-- Node content -->
        <text x="5" y="28" font-size="8" font-weight="700" fill="${titleColor}" clip-path="url(#clip-${node.id})">${node.name.slice(0, 22)}</text>
        <text x="5" y="42" font-size="7" fill="${textColor}">${meta}</text>
      </g>
    `;
  });

  canvas.innerHTML = `
    <svg width="950" height="400" viewBox="0 0 950 400" style="width: 100%; height: 100%;">
      <defs>
        <!-- Filter glow for highlighted path -->
        <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <!-- Paths -->
      ${pathsHtml}
      
      <!-- Nodes -->
      ${nodesHtml}
    </svg>
  `;
}

// ==========================================================================
// 3. DIGITAL OPERATIONAL RESILIENCE TWIN (DORT)
// ==========================================================================
let activeTwinSubTab = 'simulate';
let selectedAuditTarget = 'aws';
let selectedAuditRegion = 'us-east-1';

function getTwinMetrics() {
  const state = getState();
  const activeIncidents = state.incidents.filter(i => i.status === 'Active').length;
  const controlGaps = state.actions.filter(a => a.status !== 'Closed').length;
  const openRisks = state.risks.filter(r => r.status === 'Open').length;
  
  let healthScore = 100 - (activeIncidents * 12) - (controlGaps * 5) - (openRisks * 3);
  healthScore = Math.max(30, Math.min(100, healthScore));

  const atRiskServices = [];
  state.incidents.forEach(inc => {
    if (inc.status === 'Active') atRiskServices.push(inc.serviceAffected);
  });
  state.risks.forEach(rsk => {
    if (rsk.status === 'Open' && rsk.associatedServiceId) {
      const s = state.services.find(srv => srv.id === rsk.associatedServiceId);
      if (s) atRiskServices.push(s.name);
    }
  });
  const uniqueAtRiskServices = [...new Set(atRiskServices)];

  const totalServices = state.services.length;
  const servicesWithPlans = state.services.filter(s => {
    return state.recoveryPlans.some(rp => rp.associatedServices && rp.associatedServices.includes(s.id));
  }).length;
  const readinessIndex = totalServices ? Math.round((servicesWithPlans / totalServices) * 100) : 100;

  const supplierAppCounts = {};
  state.applications.forEach(app => {
    const provider = app.hostingProvider || 'Internal';
    if (provider !== 'Internal') {
      supplierAppCounts[provider] = (supplierAppCounts[provider] || 0) + 1;
    }
  });
  let topSupplier = 'None';
  let topCount = 0;
  for (const [sup, count] of Object.entries(supplierAppCounts)) {
    if (count > topCount) {
      topSupplier = sup;
      topCount = count;
    }
  }
  const concentrationStatus = topCount > 1 ? `High (${topSupplier})` : `Nominal`;

  return {
    healthScore,
    activeIncidents,
    controlGaps,
    openRisks,
    uniqueAtRiskServices,
    readinessIndex,
    concentrationStatus
  };
}

function renderTwinTab(container) {
  const state = getState();
  const rawSuppliers = state.suppliers || [];
  const suppliers = Array.isArray(rawSuppliers) ? rawSuppliers : Object.values(rawSuppliers);
  const assets = state.assets || [];

  // Calculate 6 Executive-Grade Scores
  const serviceHealth = calculateCriticalServiceHealthScore();
  const recoveryConf = calculateRecoveryConfidenceScore();
  const supplierDep = calculateSupplierDependencyScore();
  const riskVel = calculateOperationalRiskVelocity();
  const testingCov = calculateTestingCoverageIndex();
  const doraIndex = calculateDoraReadinessIndex();

  // Get Executive Board Answers
  const boardAnswers = getExecutiveBoardAnswers();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 18px; width: 100%;">
      
      <!-- 1. Executive Board Cockpit: 30-Second Glance Header Banner -->
      <div class="dashboard-card dort-executive-banner" style="border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 8px; padding: 16px; width: 100%; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px;">
          <div>
            <h2 style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: 0.04em; display: flex; align-items: center; gap: 8px;">
              <span>♊ Digital Operational Resilience Twin (DORT) — Executive Cockpit</span>
              <span class="badge" style="background: #10b981; color: #fff; font-weight: 800; font-size: 0.58rem;">Board Ready • 30-Sec Executive Briefing</span>
            </h2>
          </div>
          <div style="font-size: 0.62rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
            <span>Real-time Dynamic Twin Feed</span>
            <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981;"></span>
          </div>
        </div>

        <!-- 30-Second Board Executive Answers Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; width: 100%;">
          
          <!-- Q1: What is most at risk? -->
          <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 0.58rem; font-weight: 800; color: #ef4444; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
              🚨 1. What is most at risk?
            </span>
            <strong style="font-size: 0.76rem; color: var(--text-primary); font-weight: 700;">${boardAnswers.mostAtRisk.title}</strong>
            <p style="font-size: 0.64rem; color: var(--text-secondary); margin: 0;">${boardAnswers.mostAtRisk.description}</p>
            <div style="margin-top: 4px; font-size: 0.58rem; color: #ef4444; font-weight: 700; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px;">
              🎯 Immediate Action: ${boardAnswers.mostAtRisk.action}
            </div>
          </div>

          <!-- Q2: What is deteriorating? -->
          <div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 0.58rem; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
              📉 2. What is deteriorating?
            </span>
            <strong style="font-size: 0.76rem; color: var(--text-primary); font-weight: 700;">${boardAnswers.deteriorating.title}</strong>
            <p style="font-size: 0.64rem; color: var(--text-secondary); margin: 0;">${boardAnswers.deteriorating.description}</p>
            <div style="margin-top: 4px; font-size: 0.58rem; color: #f59e0b; font-weight: 700; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px;">
              🎯 Immediate Action: ${boardAnswers.deteriorating.action}
            </div>
          </div>

          <!-- Q3: What should leadership focus on? -->
          <div style="background: rgba(6, 182, 212, 0.06); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 0.58rem; font-weight: 800; color: var(--color-cyan); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
              🎯 3. What should leadership focus on?
            </span>
            <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 2px;">
              ${boardAnswers.leadershipFocus.map(item => `
                <div style="font-size: 0.62rem; color: var(--text-primary); display: flex; align-items: center; gap: 4px;">
                  <span style="background: var(--color-cyan); color: #000; font-weight: 900; border-radius: 50%; width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.52rem;">${item.priority}</span>
                  <span style="font-weight: 700;">${item.title}</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      </div>

      <!-- 2. Dynamic Executive Analytics Gauges (6 Core Metrics - 1 Row Grid with Modal Popups) -->
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; width: 100%;">
        
        <!-- Gauge 1: Critical Service Health Score -->
        <div class="dashboard-card dort-metric-card" data-title="Critical Service Health Score Breakdown" data-score="${serviceHealth.score}%" data-status="${serviceHealth.status}" data-detail="${serviceHealth.detail || 'Percentage of critical services operating within target RTO.'}" data-summary="Evaluates all Tier-1 operational services to ensure recovery speed complies with maximum tolerable downtime (MTD) limits." data-color="${serviceHealth.badgeColor}" style="padding: 10px 12px; margin: 0; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid ${serviceHealth.badgeColor}; position: relative; cursor: pointer;" title="Click to view detailed score breakdown modal">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.52rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Critical Service Health</span>
            <span style="font-size: 0.6rem; color: var(--color-cyan);">🔍</span>
          </div>
          <div style="display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 1.3rem; font-weight: 800; color: ${serviceHealth.badgeColor};">${serviceHealth.score}%</span>
            <span style="font-size: 0.58rem; font-weight: 700; color: #10b981;">${serviceHealth.trend}</span>
          </div>
          <span style="font-size: 0.56rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${serviceHealth.status}</span>
        </div>

        <!-- Gauge 2: Recovery Confidence Score -->
        <div class="dashboard-card dort-metric-card" data-title="Recovery Confidence Score Breakdown" data-score="${recoveryConf.score}%" data-status="${recoveryConf.status}" data-detail="${recoveryConf.detail || 'Evaluates DR readiness drills, recovery plan pass rates, and RTO/MTD margins.'}" data-summary="Aggregates pass/fail confidence metrics across all active disaster recovery playbooks and data backup integrity checks." data-color="${recoveryConf.badgeColor}" style="padding: 10px 12px; margin: 0; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid ${recoveryConf.badgeColor}; position: relative; cursor: pointer;" title="Click to view detailed score breakdown modal">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.52rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Recovery Confidence</span>
            <span style="font-size: 0.6rem; color: var(--color-cyan);">🔍</span>
          </div>
          <div style="display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 1.3rem; font-weight: 800; color: ${recoveryConf.badgeColor};">${recoveryConf.score}%</span>
            <span style="font-size: 0.58rem; font-weight: 700; color: #10b981;">${recoveryConf.trend}</span>
          </div>
          <span style="font-size: 0.56rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${recoveryConf.status}</span>
        </div>

        <!-- Gauge 3: Supplier Dependency Score -->
        <div class="dashboard-card dort-metric-card" data-title="Supplier Dependency Score Breakdown" data-score="${supplierDep.score}%" data-status="${supplierDep.status}" data-detail="${supplierDep.detail || 'Calculates concentration risks across critical cloud vendors and key suppliers.'}" data-summary="Measures multi-cloud single-point-of-failure exposure and 4th-party vendor dependencies under DORA Article 28." data-color="${supplierDep.badgeColor}" style="padding: 10px 12px; margin: 0; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid ${supplierDep.badgeColor}; position: relative; cursor: pointer;" title="Click to view detailed score breakdown modal">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.52rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Supplier Dependency</span>
            <span style="font-size: 0.6rem; color: var(--color-cyan);">🔍</span>
          </div>
          <div style="display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 1.3rem; font-weight: 800; color: ${supplierDep.badgeColor};">${supplierDep.score}%</span>
            <span style="font-size: 0.58rem; font-weight: 700; color: #f59e0b;">${supplierDep.trend}</span>
          </div>
          <span style="font-size: 0.56rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${supplierDep.status}</span>
        </div>

        <!-- Gauge 4: Operational Risk Velocity -->
        <div class="dashboard-card dort-metric-card" data-title="Operational Risk Velocity Breakdown" data-score="${riskVel.velocityPct}" data-status="${riskVel.status}" data-detail="${riskVel.detail || 'Measures the rate of unmitigated operational risk accumulation per week.'}" data-summary="Indicates whether platform risk ingestion is outpacing risk remediation throughput." data-color="${riskVel.badgeColor}" style="padding: 10px 12px; margin: 0; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid ${riskVel.badgeColor}; position: relative; cursor: pointer;" title="Click to view detailed score breakdown modal">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.52rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Risk Velocity</span>
            <span style="font-size: 0.6rem; color: var(--color-cyan);">🔍</span>
          </div>
          <div style="display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 1.3rem; font-weight: 800; color: ${riskVel.badgeColor};">${riskVel.velocityPct}</span>
            <span style="font-size: 0.58rem; font-weight: 700; color: #ef4444;">⚠️ High</span>
          </div>
          <span style="font-size: 0.56rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${riskVel.status}</span>
        </div>

        <!-- Gauge 5: Testing Coverage Index -->
        <div class="dashboard-card dort-metric-card" data-title="Testing Coverage Index Breakdown" data-score="${testingCov.index}%" data-status="${testingCov.status}" data-detail="${testingCov.detail || 'Tracks the percentage of critical business services validated through scenario playbooks.'}" data-summary="Validates that playbooks are routinely executed and updated for all Tier-1 and Tier-2 registered services." data-color="${testingCov.badgeColor}" style="padding: 10px 12px; margin: 0; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid ${testingCov.badgeColor}; position: relative; cursor: pointer;" title="Click to view detailed score breakdown modal">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.52rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Testing Coverage</span>
            <span style="font-size: 0.6rem; color: var(--color-cyan);">🔍</span>
          </div>
          <div style="display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 1.3rem; font-weight: 800; color: ${testingCov.badgeColor};">${testingCov.index}%</span>
            <span style="font-size: 0.58rem; font-weight: 700; color: #10b981;">${testingCov.trend}</span>
          </div>
          <span style="font-size: 0.56rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${testingCov.status}</span>
        </div>

        <!-- Gauge 6: DORA Readiness Index -->
        <div class="dashboard-card dort-metric-card" data-title="DORA Readiness Index Breakdown" data-score="${doraIndex.score}%" data-status="${doraIndex.status}" data-detail="${doraIndex.detail || 'Calculates compliance posture across Articles 5, 17, 24, and 28 of DORA.'}" data-summary="Weighted compliance alignment across all 5 DORA Pillars required for regulatory submission." data-color="${doraIndex.badgeColor}" style="padding: 10px 12px; margin: 0; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid ${doraIndex.badgeColor}; position: relative; cursor: pointer;" title="Click to view detailed score breakdown modal">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.52rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">DORA Readiness</span>
            <span style="font-size: 0.6rem; color: var(--color-cyan);">🔍</span>
          </div>
          <div style="display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 1.3rem; font-weight: 800; color: ${doraIndex.badgeColor};">${doraIndex.score}%</span>
            <span style="font-size: 0.58rem; font-weight: 700; color: #10b981;">${doraIndex.trend}</span>
          </div>
          <span style="font-size: 0.56rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${doraIndex.status}</span>
        </div>

      </div>

      <!-- 3. Dual Simulation & Visual Impact Workspace Columns -->
      <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
        <!-- Left: Control & Audit Panel -->
        <div class="dashboard-card" style="flex: 1.2; min-width: 380px; padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 15px;">
          <div style="display: flex; gap: 5px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
            <button id="btn-twin-sub-simulate" class="btn btn-secondary btn-xs ${activeTwinSubTab === 'simulate' ? 'active' : ''}" style="padding: 4px 10px; font-size: 0.65rem;">Simulation Workspace</button>
            <button id="btn-twin-sub-audit" class="btn btn-secondary btn-xs ${activeTwinSubTab === 'audit' ? 'active' : ''}" style="padding: 4px 10px; font-size: 0.65rem;">Impact &amp; Audit Queries</button>
            <button id="btn-twin-sub-recovery" class="btn btn-secondary btn-xs ${activeTwinSubTab === 'recovery' ? 'active' : ''}" style="padding: 4px 10px; font-size: 0.65rem;">Recovery Plans</button>
          </div>

          <div id="twin-sub-pane-content" style="display: flex; flex-direction: column; gap: 12px; min-height: 320px;">
            <!-- Dynamically Rendered Controls -->
          </div>
        </div>

        <!-- Right: Visual Impact Map -->
        <div class="dashboard-card" style="flex: 1.8; min-width: 450px; padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 10px; min-height: 480px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
            <h3 style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em; font-weight:700; margin:0;">
              Operational Twin Visual Impact Map
            </h3>
            <span style="font-size: 0.6rem; color: var(--text-muted); padding: 2px 6px; background: rgba(0,0,0,0.2); border-radius: 4px;">Dynamic Path Graph</span>
          </div>
          <div id="twin-propagation-map" style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.25); border: 1px dashed rgba(255,255,255,0.04); border-radius: 6px; min-height: 380px; position: relative;">
            <div style="text-align: center; color: var(--text-muted); font-size: 0.76rem; font-style: italic;">
              Select a target fail-point and trigger an outage on the left panel to display dynamic impact propagation and cascading failure chains.
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  // Bind Sub-Tabs
  document.getElementById('btn-twin-sub-simulate').onclick = () => {
    activeTwinSubTab = 'simulate';
    renderTwinTab(container);
  };
  document.getElementById('btn-twin-sub-audit').onclick = () => {
    activeTwinSubTab = 'audit';
    renderTwinTab(container);
  };
  document.getElementById('btn-twin-sub-recovery').onclick = () => {
    activeTwinSubTab = 'recovery';
    renderTwinTab(container);
  };

  // Bind DORT Metric Cards Modal Popups
  container.querySelectorAll('.dort-metric-card').forEach(card => {
    card.onclick = () => {
      const title = card.getAttribute('data-title');
      const score = card.getAttribute('data-score');
      const status = card.getAttribute('data-status');
      const detail = card.getAttribute('data-detail');
      const summary = card.getAttribute('data-summary');
      const color = card.getAttribute('data-color');

      showModal(title, `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div><strong style="color:var(--color-cyan); font-size:0.9rem;">Current Rating: ${score} (${status})</strong></div>
          <div style="font-size:0.78rem;">${detail}</div>
          <div style="background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; border-left:3px solid ${color}; font-size:0.74rem;">
            <b>Executive Summary:</b> ${summary}
          </div>
        </div>
      `);
    };
  });

  // Render Sub-Pane Content
  const subContent = document.getElementById('twin-sub-pane-content');
  if (subContent) {
    if (activeTwinSubTab === 'simulate') {
      renderSimulateSubPane(subContent, state, suppliers, assets);
    } else if (activeTwinSubTab === 'audit') {
      renderAuditSubPane(subContent, state, suppliers);
    } else if (activeTwinSubTab === 'recovery') {
      renderRecoverySubPane(subContent, state);
    }
  }
}

// --------------------------------------------------------------------------
// SUB-TAB 1: OUTAGE SIMULATOR
// --------------------------------------------------------------------------
function renderSimulateSubPane(container, state, suppliers, assets) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:6px;">
      <label style="font-size:0.7rem; color:var(--text-secondary); font-weight:600;">Choose Target Fail-Point:</label>
      <select id="twin-target-select" class="dropdown-control" style="width:100%; font-size:0.72rem; padding: 6px;">
        <optgroup label="Critical Suppliers">
          ${suppliers.map(s => `<option value="sup-${s.id}" ${selectedTwinPoint === 'sup-' + s.id ? 'selected' : ''}>Supplier: ${s.name}</option>`).join('')}
        </optgroup>
        <optgroup label="Infrastructure Assets">
          ${assets.map(a => `<option value="ast-${a.id}" ${selectedTwinPoint === 'ast-' + a.id ? 'selected' : ''}>Asset: ${a.name}</option>`).join('')}
        </optgroup>
      </select>
    </div>

    <div style="display:flex; flex-direction:column; gap:6px;">
      <label style="font-size:0.7rem; color:var(--text-secondary); font-weight:600;">Disruption Scenario:</label>
      <select id="twin-scenario-select" class="dropdown-control" style="width:100%; font-size:0.72rem; padding: 6px;">
        <option value="region-loss">Complete Cloud Region Outage</option>
        <option value="ransomware">Ransomware Data Integrity Hijack</option>
        <option value="ddos">Distributed DDoS Flood Attack</option>
        <option value="power">Physical Facility Power Failure</option>
      </select>
    </div>

    <button id="btn-twin-simulate" class="btn btn-primary" onclick="if(window.executeTwinSimulation) window.executeTwinSimulation();" style="width:100%; font-size:0.72rem; padding: 10px; margin-top: 5px;">⚡ Trigger Outage &amp; Analyze Blast Radius</button>

    <div id="twin-impact-summary" style="display:none; flex-direction:column; gap:8px;">
      <!-- Populated dynamically -->
    </div>
  `;

  // Hooks
  const selectNode = document.getElementById('twin-target-select');
  if (selectNode) {
    if (!selectedTwinPoint && suppliers.length > 0) {
      selectedTwinPoint = `sup-${suppliers[0].id}`;
    }
    selectNode.onchange = (e) => {
      selectedTwinPoint = e.target.value;
    };
  }

  const btnSimulate = document.getElementById('btn-twin-simulate');
  if (btnSimulate) {
    btnSimulate.onclick = (e) => {
      e.preventDefault();
      executeTwinSimulation();
    };
  }
}

// --------------------------------------------------------------------------
// SUB-TAB 2: IMPACT & AUDIT QUERIES
// --------------------------------------------------------------------------
function renderAuditSubPane(container, state, suppliers) {
  const untestedServices = (state.services || []).filter(s => {
    const hasDrill = (state.incidents || []).some(inc => inc.serviceAffected === s.name && inc.classification === 'Recovery Drill');
    return !hasDrill;
  });

  if (!selectedAuditTarget && suppliers.length > 0) {
    selectedAuditTarget = suppliers[0].id;
  }

  // Default supplier calculation
  const rawSuppliers = state.suppliers || {};
  const defaultSup = (Array.isArray(rawSuppliers) ? rawSuppliers.find(s => s.id === selectedAuditTarget) : rawSuppliers[selectedAuditTarget]) || (suppliers && suppliers[0]) || {};
  const defaultSupName = defaultSup.name || 'AWS';
  const supSearchTerm = defaultSupName.split(' ')[0].toLowerCase();
  const affectedAppsSup = state.applications ? state.applications.filter(app => 
    app.hostingProvider && app.hostingProvider.toLowerCase().includes(supSearchTerm)
  ) : [];
  const affectedServicesSup = [];
  affectedAppsSup.forEach(app => {
    const srvs = state.services ? state.services.filter(s => s.applications && s.applications.includes(app.id)) : [];
    affectedServicesSup.push(...srvs);
  });
  const uniqSrvNamesSup = [...new Set(affectedServicesSup.map(s => s.name))];

  // Default region calculation
  const regionSearch = (selectedAuditRegion || 'us-east-1').toLowerCase();
  const affectedAssetsReg = state.assets ? state.assets.filter(ast => 
    ast.region && ast.region.toLowerCase().includes(regionSearch)
  ) : [];
  const affectedServicesReg = [];
  affectedAssetsReg.forEach(ast => {
    const matchedApps = state.applications ? state.applications.filter(app => ast.name.includes(app.name.split(' ')[0])) : [];
    matchedApps.forEach(app => {
      const srvs = state.services ? state.services.filter(s => s.applications && s.applications.includes(app.id)) : [];
      affectedServicesReg.push(...srvs);
    });
  });
  const uniqSrvNamesReg = [...new Set(affectedServicesReg.map(s => s.name))];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <!-- Query 1 -->
      <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 8px;">
        <span style="font-weight: 700; color: var(--color-cyan); font-size: 0.72rem;">❓ What breaks if Supplier fails?</span>
        <div style="display: flex; gap: 8px;">
          <select id="audit-supplier-select" class="dropdown-control" style="flex: 1; font-size: 0.7rem; padding: 4px;">
            ${suppliers.map(s => `<option value="${s.id}" ${selectedAuditTarget === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
          <button id="btn-audit-supplier" class="btn btn-secondary btn-xs" style="padding: 4px 10px;">Query</button>
        </div>
        <div id="audit-supplier-result" style="font-size: 0.65rem; color: var(--text-muted);">
          <div style="margin-top:5px; border-left: 2px solid #ef4444; padding-left: 6px; display: flex; flex-direction: column; gap: 2px;">
            <div><b>Downstream Apps Affected:</b> ${affectedAppsSup.map(a => a.name).join(', ') || 'None'}</div>
            <div><b>Impacted Critical Services:</b> ${uniqSrvNamesSup.join(', ') || 'None'}</div>
            <div><b>Financial Impact:</b> £${(affectedAppsSup.length * 20000).toLocaleString()}/hour</div>
          </div>
        </div>
      </div>

      <!-- Query 2 -->
      <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 8px;">
        <span style="font-weight: 700; color: var(--color-cyan); font-size: 0.72rem;">❓ What breaks if Cloud Region fails?</span>
        <div style="display: flex; gap: 8px;">
          <select id="audit-region-select" class="dropdown-control" style="flex: 1; font-size: 0.7rem; padding: 4px;">
            <option value="us-east-1" ${selectedAuditRegion === 'us-east-1' ? 'selected' : ''}>AWS N. Virginia (us-east-1)</option>
            <option value="eu-central-1" ${selectedAuditRegion === 'eu-central-1' ? 'selected' : ''}>AWS Frankfurt (eu-central-1)</option>
            <option value="us-west-2" ${selectedAuditRegion === 'us-west-2' ? 'selected' : ''}>Azure Oregon (us-west-2)</option>
          </select>
          <button id="btn-audit-region" class="btn btn-secondary btn-xs" style="padding: 4px 10px;">Query</button>
        </div>
        <div id="audit-region-result" style="font-size: 0.65rem; color: var(--text-muted);">
          <div style="margin-top:5px; border-left: 2px solid #ef4444; padding-left: 6px; display: flex; flex-direction: column; gap: 2px;">
            <div><b>Hosting Assets Affected:</b> ${affectedAssetsReg.map(a => a.name).join(', ') || 'None'}</div>
            <div><b>Impacted Critical Services:</b> ${uniqSrvNamesReg.join(', ') || 'None'}</div>
            <div><b>Availability Disruption:</b> Complete regional failover required.</div>
          </div>
        </div>
      </div>

      <!-- Query 3 -->
      <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 6px;">
        <span style="font-weight: 700; color: #ef4444; font-size: 0.72rem;">⚠️ Untested Critical Services (Lack Drills)</span>
        <div style="display: flex; flex-direction: column; gap: 4px; max-height: 120px; overflow-y: auto;">
          ${untestedServices.length > 0 ? untestedServices.map(s => `
            <div style="display: flex; justify-content: space-between; background: rgba(0,0,0,0.15); padding: 4px 8px; border-radius: 4px; font-size: 0.65rem;">
              <span>🏢 <b>${s.name}</b> (${(s.serviceType || 'Core').toUpperCase()})</span>
              <span style="color: #ef4444; font-weight: 700; animation: blink 1s infinite;">❌ 0 Drills Logged</span>
            </div>
          `).join('') : '<div style="font-size:0.65rem; color:#10b981; font-style:italic;">All critical services have active recovery test logs.</div>'}
        </div>
      </div>
    </div>
  `;

  // Bind Query 1
  const selSup = document.getElementById('audit-supplier-select');
  if (selSup) selSup.onchange = (e) => { selectedAuditTarget = e.target.value; };

  const btnSup = document.getElementById('btn-audit-supplier');
  if (btnSup) {
    btnSup.onclick = () => {
      const resBox = document.getElementById('audit-supplier-result');
      const allSups = Array.isArray(state.suppliers) ? state.suppliers : Object.values(state.suppliers || {});
      const supObj = allSups.find(s => s.id === selectedAuditTarget) || suppliers[0] || {};
      const supNameStr = (supObj.name || 'AWS').split(' ')[0].toLowerCase();

      const affectedApps = (state.applications || []).filter(app => app.hostingProvider && app.hostingProvider.toLowerCase().includes(supNameStr));
      const affectedServices = [];
      affectedApps.forEach(app => {
        const srvs = (state.services || []).filter(s => s.applications && s.applications.includes(app.id));
        affectedServices.push(...srvs);
      });
      const uniqSrvNames = [...new Set(affectedServices.map(s => s.name))];

      if (resBox) {
        resBox.innerHTML = `
          <div style="margin-top:5px; border-left: 2px solid #ef4444; padding-left: 6px; display: flex; flex-direction: column; gap: 2px;">
            <div><b>Downstream Apps Affected:</b> ${affectedApps.map(a => a.name).join(', ') || 'None'}</div>
            <div><b>Impacted Critical Services:</b> ${uniqSrvNames.join(', ') || 'None'}</div>
            <div><b>Financial Impact:</b> £${(affectedApps.length * 20000).toLocaleString()}/hour</div>
          </div>
        `;
      }
      selectedTwinPoint = `sup-${supObj.id || selectedAuditTarget}`;
      executeTwinSimulation();
    };
  }

  // Bind Query 2
  const selReg = document.getElementById('audit-region-select');
  if (selReg) selReg.onchange = (e) => { selectedAuditRegion = e.target.value; };

  const btnReg = document.getElementById('btn-audit-region');
  if (btnReg) {
    btnReg.onclick = () => {
      const resBox = document.getElementById('audit-region-result');
      const affectedAssets = (state.assets || []).filter(ast => ast.region && ast.region.toLowerCase().includes((selectedAuditRegion || 'us-east-1').toLowerCase()));
      const affectedServices = [];
      affectedAssets.forEach(ast => {
        const matchedApps = (state.applications || []).filter(app => ast.name.includes(app.name.split(' ')[0]));
        matchedApps.forEach(app => {
          const srvs = (state.services || []).filter(s => s.applications && s.applications.includes(app.id));
          affectedServices.push(...srvs);
        });
      });
      const uniqSrvNames = [...new Set(affectedServices.map(s => s.name))];

      if (resBox) {
        resBox.innerHTML = `
          <div style="margin-top:5px; border-left: 2px solid #ef4444; padding-left: 6px; display: flex; flex-direction: column; gap: 2px;">
            <div><b>Hosting Assets Affected:</b> ${affectedAssets.map(a => a.name).join(', ') || 'None'}</div>
            <div><b>Impacted Critical Services:</b> ${uniqSrvNames.join(', ') || 'None'}</div>
            <div><b>Availability Disruption:</b> Complete regional failover required.</div>
          </div>
        `;
      }
      if (affectedAssets.length > 0) {
        selectedTwinPoint = `ast-${affectedAssets[0].id}`;
        executeTwinSimulation();
      }
    };
  }
}

// --------------------------------------------------------------------------
// SUB-TAB 3: RECOVERY PLANS & BOTTLENECKS
// --------------------------------------------------------------------------
function renderRecoverySubPane(container, state) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; height: 320px; overflow-y: auto; padding-right: 4px;">
      <h4 style="font-size: 0.72rem; color: var(--text-secondary); margin: 0; font-weight: 700; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 4px;">Active Disaster Recovery (DR) Plans</h4>
      ${state.recoveryPlans.map(plan => {
        let confidenceColor = '#10b981';
        if (plan.confidenceScore < 70) confidenceColor = '#ef4444';
        else if (plan.confidenceScore < 85) confidenceColor = '#eab308';
        
        return `
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; color: var(--text-primary); font-size: 0.7rem;">📋 ${plan.name}</span>
              <span style="font-size: 0.65rem; font-weight: 700; color: ${confidenceColor};">${plan.confidenceScore}% Conf.</span>
            </div>
            <div style="font-size: 0.62rem; color: var(--text-muted);">
              <div><b>Target RTO:</b> ${plan.rtoTarget || '4 Hours'} | <b>Owner:</b> BCP Delivery Group</div>
              <div style="color: #f97316; font-weight: 600; margin-top: 2px;">⚠️ Bottleneck: ${plan.bottleneck || 'None'}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// --------------------------------------------------------------------------
// TWIN SIMULATOR PROPAGATION CALCULATION
// --------------------------------------------------------------------------

function executeTwinSimulation() {
  const state = getState();
  const summaryBox = document.getElementById('twin-impact-summary');
  const mapBox = document.getElementById('twin-propagation-map');
  if (!summaryBox || !mapBox) return;

  // Use Operational Resilience Intelligence Engine for multi-dimensional calculation
  const blast = analyzeBlastRadius(selectedTwinPoint);
  const chain = getImpactPropagationChain(selectedTwinPoint);
  const exposure = calculateResilienceExposureScore(selectedTwinPoint);

  const failPointLabel = `${blast.target.type.toUpperCase()}: ${blast.target.name}`;

  // Populate Blast Radius details summary
  summaryBox.style.display = 'flex';
  summaryBox.innerHTML = `
    <div style="background:rgba(239,68,68,0.03); border:1px solid rgba(239,68,68,0.15); padding:10px; border-radius:6px; font-size:0.7rem; display:flex; flex-direction:column; gap:4px; margin-top:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; color:#ef4444; font-size:0.74rem;">💥 Intelligence Engine Blast Radius Summary</span>
        <span class="badge" style="background:${exposure.badgeColor}; color:#fff; font-size:0.55rem; padding:1px 4px;">${exposure.statusTier}</span>
      </div>
      <div><b>Root Failure:</b> ${failPointLabel}</div>
      <div><b>Direct Impact:</b> ${blast.directImpact.map(d => d.name).join(', ') || 'None'}</div>
      <div><b>Indirect Impact:</b> ${blast.indirectImpact.map(i => i.name).join(', ') || 'None'}</div>
      <div><b>Affected Services (${blast.servicesAffected.length}):</b> ${blast.servicesAffected.map(s => s.name).join(', ')}</div>
      <div style="border-top:1px dashed rgba(239,68,68,0.1); padding-top:4px; margin-top:2px; display:flex; flex-direction:column; gap:2px;">
        <div>💰 <b>Financial Downtime Impact:</b> ${blast.revenueImpact.formattedCost}</div>
        <div>👥 <b>Customer Exposure:</b> ~${blast.customersAffected.totalCount.toLocaleString()} active retail & clearing sessions</div>
        <div style="color:#f43f5e;">⚖️ <b>DORA Regulatory Violations:</b> ${blast.regulatoryImpact.map(r => r.article).join(', ')}</div>
      </div>
    </div>
    
    <div style="display:flex; gap:6px; margin-top:4px;">
      <button id="btn-dort-failover" class="btn btn-primary btn-sm" style="flex:1; font-size:0.65rem; background:#10b981; color:#000; border:none; font-weight:700;">⚡ Execute Failover Protocol</button>
      <button id="btn-dort-explain" class="btn btn-secondary btn-sm" style="flex:1; font-size:0.65rem;">🔍 Explain Exposure Score</button>
      <button id="btn-dort-ticket" class="btn btn-secondary btn-sm" style="flex:1; font-size:0.65rem;">🚨 Log Incident Ticket</button>
    </div>
  `;

  // Bind failover intervention
  document.getElementById('btn-dort-failover').onclick = () => {
    summaryBox.innerHTML = `
      <div style="background:rgba(16,185,129,0.03); border:1px solid rgba(16,185,129,0.15); padding:10px; border-radius:6px; font-size:0.7rem; display:flex; flex-direction:column; gap:4px; margin-top:10px;">
        <div style="font-weight:700; color:#10b981; font-size:0.74rem;">✅ Recovery Plan Executed Successfully</div>
        <div><b>Target Node:</b> ${failPointLabel}</div>
        <div><b>Recovery Speed:</b> 2 Hours (Target RTO Met)</div>
        <div><b>Loss Prevented:</b> ${blast.revenueImpact.formattedCost}</div>
      </div>
    `;
    drawTwinOutageGraph(false, chain, blast);
  };

  // Bind explain score modal
  document.getElementById('btn-dort-explain').onclick = () => {
    const exp = exposure.explainability;
    const breakdownHtml = exp.breakdown.map(b => `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.05); padding:6px 0;">
        <div>
          <strong style="color:var(--text-primary); font-size:0.75rem;">${b.factor}</strong>
          <div style="font-size:0.65rem; color:var(--text-muted);">${b.details}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-weight:700; color:var(--color-cyan); font-size:0.75rem;">${b.score}</span>
          <div style="font-size:0.6rem; color:#10b981; font-weight:700;">${b.contribution}</div>
        </div>
      </div>
    `).join('');

    showModal('Resilience Exposure Score Explainability Breakdown', `
      <div style="display:flex; flex-direction:column; gap:12px; font-size:0.75rem;">
        <div style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.2); padding:10px; border-radius:6px;">
          <div style="font-size:0.62rem; color:var(--text-secondary); text-transform:uppercase; font-weight:700;">Mathematical Weighting Formula:</div>
          <code style="display:block; margin-top:4px; font-size:0.65rem; color:var(--color-cyan); font-family:monospace;">${exp.formula}</code>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <span style="font-weight:700; color:var(--text-secondary); text-transform:uppercase; font-size:0.62rem;">Score Breakdown Factors:</span>
          ${breakdownHtml}
        </div>
      </div>
    `);
  };

  // Bind incident creation from DORT
  document.getElementById('btn-dort-ticket').onclick = () => {
    const srvName = blast.servicesAffected.length ? blast.servicesAffected[0].name : 'IBS Payments';
    const newInc = {
      id: `inc-${String(state.incidents.length + 1).padStart(3, '0')}`,
      title: `Simulated Failure on ${blast.target.name}`,
      severity: 'Major',
      status: 'Active',
      serviceAffected: srvName,
      downtime: 'Pending',
      financialLoss: blast.revenueImpact.costPerHour,
      classification: 'Vendor Outage',
      escalationStatus: 'Escalated to DORT Response Team',
      rootCause: `DORT simulations flagged critical path disruption via ${failPointLabel}.`,
      lessonsLearned: 'Pending validation post-mortem.'
    };
    state.incidents.push(newInc);
    saveState();
    alert(`Incident Ticket Logged successfully.\nTicket ID: CV-INC-${Math.floor(1000 + Math.random()*9000)}`);
  };

  // Draw 5-step visual propagation path graph
  drawTwinOutageGraph(true, chain, blast);
}

function drawTwinOutageGraph(isBroken, chain, blast) {
  const mapBox = document.getElementById('twin-propagation-map');
  if (!mapBox) return;

  const isLight = document.body.classList.contains('light-mode');
  const stateColor = isBroken ? '#ef4444' : '#10b981';

  mapBox.innerHTML = `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-around; padding:10px; gap:8px;">
      <div style="font-size:0.65rem; font-weight:700; color:var(--color-cyan); text-transform:uppercase; letter-spacing:0.05em; text-align:center;">
        ⚡ Operational Failure Propagation Chain Across Architecture Graph
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; position:relative; gap:6px;">
        ${chain.steps.map((step, idx) => `
          <div style="flex:1; background:${isLight ? '#ffffff' : 'rgba(15,23,42,0.8)'}; border:1px solid ${idx === 0 ? stateColor : (isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.08)')}; border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:3px; position:relative; box-shadow:${idx === 0 ? '0 0 10px rgba(239,68,68,0.2)' : 'none'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.55rem; font-weight:800; color:${idx === 0 ? stateColor : 'var(--color-cyan)'}; text-transform:uppercase;">L${step.level} ${step.icon}</span>
              ${idx === 0 ? `<span style="font-size:0.5rem; font-weight:800; color:#ef4444;">ROOT FAIL</span>` : ''}
            </div>
            <div style="font-size:0.65rem; font-weight:700; color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${step.title}">
              ${step.title.split(' ')[0]} ${step.title.split(' ')[1] || ''}
            </div>
            <div style="font-size:0.58rem; color:var(--text-muted);">
              ${step.nodes ? step.nodes.map(n => n.name).slice(0, 2).join(', ') : (step.impactSummary || (step.obligations ? step.obligations.map(o => o.article).join(', ') : 'Exposed'))}
            </div>
          </div>
          ${idx < chain.steps.length - 1 ? `<div style="font-size:0.8rem; color:${stateColor}; font-weight:800;">➔</div>` : ''}
        `).join('')}
      </div>

      <!-- Financial & Regulatory Impact Bar -->
      <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px; font-size:0.65rem; margin-top:5px;">
        <div><span style="color:var(--text-muted);">Downtime Cost Rate:</span> <strong style="color:#ef4444;">${blast.revenueImpact.formattedCost}</strong></div>
        <div><span style="color:var(--text-muted);">Market Exposure:</span> <strong style="color:var(--color-cyan);">~${blast.customersAffected.totalCount.toLocaleString()} Users</strong></div>
        <div><span style="color:var(--text-muted);">DORA Compliance Status:</span> <strong style="color:#f43f5e;">CRITICAL EXPOSURE</strong></div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 4. INCIDENT MANAGEMENT TAB
// ==========================================================================
function renderIncidentsTab(container) {
  const state = getState();
  
  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
      <!-- Left List Panel -->
      <div class="dashboard-card" style="flex: 1.4; min-width: 420px; padding: 15px; margin: 0; min-height: 520px; display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
          <h3 style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em; font-weight:700; margin:0;">
            DORA Article 19 Incident Registry
          </h3>
          <button id="btn-add-incident" class="btn btn-primary btn-xs" style="padding: 4px 10px;">+ Log Incident</button>
        </div>
        
        <div id="incidents-table-container" style="width:100%;"></div>
      </div>

      <!-- Right Details & RCA Editor Panel -->
      <div class="dashboard-card" style="flex: 1.2; min-width: 350px; padding: 15px; margin: 0; min-height: 520px; display: flex; flex-direction: column; gap: 12px;">
        <div id="incident-detail-header" style="border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;"></div>
        <div id="incident-detail-body" style="flex:1; display:flex; flex-direction:column; gap:12px;"></div>
      </div>
    </div>
  `;

  // Bind Add incident click
  document.getElementById('btn-add-incident').onclick = () => {
    renderLogIncidentPane();
  };

  // Render Table
  const columns = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'title', label: 'Outage Event', width: '190px', render: (row) => `<b>${row.title}</b>` },
    { key: 'severity', label: 'Severity', width: '90px', render: (row) => createStatusBadge(row.severity) },
    { key: 'classification', label: 'Classification', width: '120px' },
    { key: 'status', label: 'Status', render: (row) => createStatusBadge(row.status) }
  ];

  let selectedIncId = state.incidents.length ? state.incidents[0].id : null;

  createTable('incidents-table-container', state.incidents, columns, {
    searchPlaceholder: 'Search incident logs...',
    pageSize: 5,
    selectedRowId: selectedIncId,
    onRowClick: (row) => {
      selectedIncId = row.id;
      renderIncidentDetailPane(row.id);
      renderIncidentsTab(container); // Refresh select highlighter
    }
  });

  if (selectedIncId) renderIncidentDetailPane(selectedIncId);

  function renderIncidentDetailPane(incId) {
    const header = document.getElementById('incident-detail-header');
    const body = document.getElementById('incident-detail-body');
    if (!header || !body) return;

    const inc = state.incidents.find(i => i.id === incId);
    if (!inc) return;

    header.innerHTML = `
      <div>
        <span style="font-size:0.56rem; text-transform:uppercase; color:var(--color-cyan); font-weight:700;">Incident Investigation</span>
        <h2 style="font-size:0.92rem; font-weight:700; margin-top:2px; color:var(--text-primary);">${inc.title}</h2>
      </div>
      <div>
        ${createStatusBadge(inc.severity)}
      </div>
    `;

    body.innerHTML = `
      <div style="font-size:0.7rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:8px;">
        <div><b>Classification:</b> ${inc.classification || 'Unclassified'}</div>
        <div><b>Escalation Node:</b> <span style="color:var(--color-cyan); font-weight:600;">${inc.escalationStatus || 'Internal Team'}</span></div>
        <div><b>Affected Business Service:</b> ${inc.serviceAffected}</div>
        <div><b>Downtime:</b> ${inc.downtime} | <b>Financial Impact:</b> £${(inc.financialLoss || 0).toLocaleString()}</div>
        
        <div style="border-top:1px dashed rgba(255,255,255,0.06); padding-top:6px; margin-top:4px;">
          <h4 style="font-size:0.68rem; text-transform:uppercase; color:var(--text-secondary); margin:4px 0; font-weight:700;">Root Cause Analysis (RCA):</h4>
          <p style="font-style:italic; line-height:1.3; color:var(--text-muted);">${inc.rootCause || 'RCA investigation is pending.'}</p>
        </div>

        <div style="border-top:1px dashed rgba(255,255,255,0.06); padding-top:6px;">
          <h4 style="font-size:0.68rem; text-transform:uppercase; color:var(--text-secondary); margin:4px 0; font-weight:700;">Lessons Learned:</h4>
          <p style="line-height:1.3; color:var(--text-secondary);">${inc.lessonsLearned || 'Post-mortem actions are pending.'}</p>
        </div>
      </div>
    `;
  }

  function renderLogIncidentPane() {
    const header = document.getElementById('incident-detail-header');
    const body = document.getElementById('incident-detail-body');
    if (!header || !body) return;

    header.innerHTML = `<h3 style="font-size:0.8rem; color:var(--text-secondary); font-weight:700; margin:0;">Report New ICT Incident</h3>`;
    
    const formSchema = [
      { name: 'title', label: 'Incident Title', type: 'text', required: true },
      { name: 'severity', label: 'Severity Tier', type: 'select', required: true, options: [
        { value: 'Critical', label: 'Critical (C-Suite escalation)' },
        { value: 'Major', label: 'Major' },
        { value: 'Minor', label: 'Minor' }
      ]},
      { name: 'classification', label: 'Classification', type: 'select', required: true, options: [
        { value: 'Infrastructure Outage', label: 'Infrastructure / Core Outage' },
        { value: 'Cyber Attack', label: 'Cyber Attack / Breach' },
        { value: 'Vendor Failure', label: 'Vendor / Subcontractor Failure' },
        { value: 'Environmental / Physical', label: 'Environmental / Physical Hazard' }
      ]},
      { name: 'serviceAffected', label: 'Affected Business Service', type: 'select', required: true, options: state.services.map(s => ({ value: s.name, label: s.name })) },
      { name: 'downtime', label: 'Downtime Duration', type: 'text', required: true, placeholder: 'e.g. 15 Minutes' },
      { name: 'financialLoss', label: 'Estimated Losses (£)', type: 'text', required: true, placeholder: 'e.g. 25000' },
      { name: 'rootCause', label: 'Root Cause Analysis (RCA)', type: 'textarea', required: true },
      { name: 'lessonsLearned', label: 'Lessons Learned / Actions', type: 'textarea', required: true }
    ];

    body.innerHTML = `<div id="resilience-form-container"></div>`;

    createForm('resilience-form-container', formSchema, (data) => {
      const ticketId = `SN-INC-2026-${Math.floor(1000 + Math.random()*9000)}`;
      const newInc = {
        id: `inc-${String(state.incidents.length + 1).padStart(3, '0')}`,
        ...data,
        status: 'Active',
        financialLoss: parseFloat(data.financialLoss) || 0,
        escalationStatus: `Escalated and tracked in ServiceNow with incident tag ${ticketId}`
      };
      state.incidents.unshift(newInc);
      saveState();
      alert(`Incident recorded and synchronized with ServiceNow.\nServiceNow Ticket: ${ticketId}`);
      renderResilienceModule();
    });
  }
}

// ==========================================================================
// 5. RECOVERY READINESS TAB
// ==========================================================================
let activeDrillLog = [];
let drillLogTimer = null;

function renderReadinessTab(container) {
  const state = getState();
  const confidence = calculateRecoveryConfidence(state);

  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
      <!-- Left Column: Confidence Rating & Planning Panel -->
      <div class="dashboard-card" style="flex: 1.1; min-width: 320px; padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 15px;">
        <div style="text-align: center;">
          <h3 style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em; font-weight:700; border-bottom:1px dashed var(--border-color); padding-bottom:8px; margin:0; text-align:left; width:100%;">
            Recovery Confidence Rating
          </h3>

          <!-- Dynamic radial indicator circle -->
          <div style="position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin: 15px auto;">
            <svg width="100%" height="100%" viewBox="0 0 36 36" style="transform: rotate(-90deg);">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-cyan)" stroke-dasharray="${confidence}, 100" stroke-width="3" />
            </svg>
            <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <span style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">${confidence}%</span>
              <span style="font-size: 0.55rem; text-transform: uppercase; color: var(--text-muted); font-weight:700; letter-spacing:0.05em;">Ready Index</span>
            </div>
          </div>
        </div>

        <!-- Exercise Planning & Scoping Form -->
        <div style="display:flex; flex-direction:column; gap:10px; border-top:1px dashed var(--border-color); padding-top:12px;">
          <h4 style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; font-weight: 700; margin: 0;">
            1. Drill Planning &amp; Scoping
          </h4>
          
          <div>
            <label style="font-size:0.65rem; color:var(--text-secondary); display:block; margin-bottom:2px;">Select Scenario Target</label>
            <select id="readiness-drill-select" class="dropdown-control" style="width:100%; font-size:0.7rem; margin:0;">
              <option value="dr-failover">AWS Primary Host DR Failover (Cloud Outage)</option>
              <option value="ransomware-drill">LockBit Ransomware Contagion (Ransomware)</option>
              <option value="compromise-scenario">Compromised Admin Session Lockout (Identity Compromise)</option>
              <option value="backup-restore">Immutable Backup Restore Audit (Data Corruption)</option>
              <option value="thirdparty-drill">Infosys Middleware Outage (Third-party Failure)</option>
              <option value="payment-drill">Credit Network SLA Fines & Failover (Payment Outage)</option>
            </select>
          </div>

          <div style="display: flex; gap: 8px;">
            <div style="flex: 1;">
              <label style="font-size:0.65rem; color:var(--text-secondary); display:block; margin-bottom:2px;">Drill Coordinator</label>
              <input type="text" id="drill-coordinator" class="input-control" value="Sarah Jenkins" style="width: 100%; font-size: 0.7rem; margin: 0; padding: 4px 8px; height: 28px;">
            </div>
            <div style="flex: 1;">
              <label style="font-size:0.65rem; color:var(--text-secondary); display:block; margin-bottom:2px;">Target RTO Limit</label>
              <input type="text" id="drill-target-rto" class="input-control" value="4 Hours" style="width: 100%; font-size: 0.7rem; margin: 0; padding: 4px 8px; height: 28px;">
            </div>
          </div>

          <div>
            <label style="font-size:0.65rem; color:var(--text-secondary); display:block; margin-bottom:2px;">Failover Strategy Description</label>
            <textarea id="drill-strategy" class="textarea-input" style="width: 100%; font-size: 0.7rem; margin: 0; padding: 4px 8px; min-height: 42px;" placeholder="Describe recovery routes (e.g. redirect traffic to backup cluster in Oregon)"></textarea>
          </div>

          <button id="btn-run-drill" class="btn btn-primary btn-sm" style="width:100%; margin-top:6px; font-weight:700;">⏱️ Launch Simulation Drill</button>
        </div>
      </div>

      <!-- Right Column: Execution Console & Lessons Learned -->
      <div style="flex: 1.8; min-width: 400px; display: flex; flex-direction: column; gap: 20px;">
        <!-- Live Simulation Terminal Card -->
        <div class="dashboard-card" style="padding: 15px; margin: 0; min-height: 280px; display: flex; flex-direction: column; gap: 8px; flex: 1;">
          <h3 style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em; font-weight:700; border-bottom:1px dashed var(--border-color); padding-bottom:8px; margin:0;">
            2. Drill Execution Console
          </h3>
          
          <div id="readiness-drill-terminal" style="flex:1; background:rgba(0,0,0,0.5); border:1px solid var(--border-color); border-radius:6px; font-family:monospace; font-size:0.68rem; color:#10b981; padding:12px; overflow-y:auto; line-height:1.45; display:flex; flex-direction:column; gap:4px; min-height: 180px;">
            <div style="color:var(--text-muted); font-style:italic;">[Drill console idle. Scope your test on the left and click launch...]</div>
          </div>
        </div>

        <!-- Lessons Learned Card (Appears dynamically upon completion) -->
        <div class="dashboard-card" id="lessons-learned-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 10px;">
          <h3 style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em; font-weight:700; border-bottom:1px dashed var(--border-color); padding-bottom:8px; margin:0;">
            3. Drill Post-Mortem &amp; Lessons Learned
          </h3>
          <div id="lessons-learned-content">
            <span style="font-size: 0.7rem; color: var(--text-muted); font-style: italic;">Complete an active drill simulation execution to log the lessons learned report.</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind drill trigger
  document.getElementById('btn-run-drill').onclick = () => {
    const drillType = document.getElementById('readiness-drill-select').value;
    const coordinator = document.getElementById('drill-coordinator').value;
    const targetRto = document.getElementById('drill-target-rto').value;
    const strategy = document.getElementById('drill-strategy').value || "Standard failover routes";
    launchResilienceDrill(drillType, coordinator, targetRto, strategy, container);
  };
}

function calculateRecoveryConfidence(state) {
  let score = 100;
  if (!state.tests || state.tests.length === 0) return 50;

  // Subtract for failures
  const failedTests = state.tests.filter(t => t.results === 'Failed').length;
  score -= failedTests * 15;

  // Subtract for outdated runs
  const currentYear = new Date().getFullYear();
  state.tests.forEach(t => {
    const testYear = new Date(t.lastRun).getFullYear();
    if (currentYear - testYear > 1) {
      score -= 5;
    }
  });

  return Math.max(Math.min(score, 100), 20);
}

function launchResilienceDrill(drillType, coordinator, targetRto, strategy, container) {
  const terminal = document.getElementById('readiness-drill-terminal');
  if (!terminal) return;

  if (drillLogTimer) clearInterval(drillLogTimer);
  activeDrillLog = [];
  terminal.innerHTML = '';

  let steps = [];
  let testTitle = '';
  let category = '';
  let defaultLessons = '';

  // Setup planning preamble
  activeDrillLog.push(`[PLANNING] Coordinator: ${coordinator}`);
  activeDrillLog.push(`[PLANNING] Target RTO Limit: ${targetRto}`);
  activeDrillLog.push(`[PLANNING] Recovery Strategy: ${strategy}`);
  activeDrillLog.push(`--------------------------------------------------`);

  if (drillType === 'dr-failover') {
    testTitle = 'AWS Primary Node DR Failover Verification';
    category = 'Cloud Outage';
    defaultLessons = 'Failover completed successfully within 4 minutes. Recommendation: Schedule automated secondary region DNS testing quarterly.';
    steps = [
      `[INFO] Booting DR Failover Simulation for AWS us-east-1a node...`,
      `[INFO] Checking database replication synchronization lags...`,
      `[OK] Standby database lag is 14 milliseconds (Target < 1 sec met).`,
      `[WARN] Simulating primary gateway server link failure...`,
      `[ACTION] Redirecting load balancer DNS zones to backup targets...`,
      `[INFO] Ping check: secondary node us-east-1b responding.`,
      `[OK] Secondary hosting containers launched successfully.`,
      `[SUCCESS] DR Failover completed successfully. Transition speed: 4 minutes 12 seconds.`
    ];
  } else if (drillType === 'ransomware-drill') {
    testTitle = 'LockBit Ransomware Contagion Drill';
    category = 'Ransomware';
    defaultLessons = 'SSO credentials locked out in under 8 seconds. Backups restored with zero transaction loss. Recommendation: Expand simulated host scanning vectors.';
    steps = [
      `[INFO] Triggering simulated LockBit 3.0 ransomware payload on Boardman Azure servers...`,
      `[ALERT] Cryptographic locking behavior detected on host directory structures.`,
      `[ACTION] Isolating affected sub-networks and locking active admin sessions...`,
      `[OK] Tenant connection tunnels disconnected successfully.`,
      `[INFO] Mounting immutable backup database snapshot ledger...`,
      `[SUCCESS] System isolated. Zero data leakage detected. Backup integrity confirmed.`
    ];
  } else if (drillType === 'compromise-scenario') {
    testTitle = 'Compromised Admin Session Lockout drill';
    category = 'Identity Compromise';
    defaultLessons = 'Admin lockout triggered immediately. Zero trust policy confirmed. Recommendation: Update session rotation timer limit from 1 hour to 30 mins.';
    steps = [
      `[INFO] Spawning mock compromised administrative token scenario...`,
      `[ACTION] Automated zero-trust credential lock triggered.`,
      `[INFO] Enforcing absolute MFA session token rotations...`,
      `[OK] Outbound corporate VPN credentials revoked.`,
      `[SUCCESS] session contained successfully within 8 seconds.`
    ];
  } else if (drillType === 'backup-restore') {
    testTitle = 'Immutable Backup Restore Audit';
    category = 'Data Corruption';
    defaultLessons = 'SHA-256 hash checks matching across all transactional segments. Recommendation: Establish incremental daily verify jobs.';
    steps = [
      `[INFO] Initiating immutable backup restore check for database snapshot...`,
      `[INFO] Retrieving WORM backup ledger journals...`,
      `[OK] File integrity hash verification completed. (FIPS SHA-256 match confirmed).`,
      `[ACTION] Restoring test container memory structures...`,
      `[INFO] Compiling ledger integrity checksum tests...`,
      `[SUCCESS] Backup restored successfully. Restored 31,452 transaction ledger journals with zero corruption.`
    ];
  } else if (drillType === 'thirdparty-drill') {
    testTitle = 'Infosys Middleware API Outage Failover';
    category = 'Third-party Failure';
    defaultLessons = 'Standby supplier TCS mobilized. API failover switch latency: 1.5 minutes. Recommendation: Pre-warm backup container resources.';
    steps = [
      `[INFO] Simulating total API failure on Infosys Bangalore middleware servers...`,
      `[ALERT] Outbound HTTP connection timeout limit exceeded.`,
      `[ACTION] Initiating third-party exit strategy: routing API queries to standby partner TCS...`,
      `[OK] TCS middleware container gateways handshake established.`,
      `[SUCCESS] API services operational. Failover latency: 1 minute 28 seconds.`
    ];
  } else {
    testTitle = 'Credit Network SLA Outage Failover';
    category = 'Payment Outage';
    defaultLessons = 'Secondary payment processor Barclays cleared transaction queue. SLA fine penalty avoided. Recommendation: Audit fallback networks availability monthly.';
    steps = [
      `[INFO] Simulating main payment settlement gateway carrier drop...`,
      `[ALERT] Direct clearing settlement processing queues backing up.`,
      `[ACTION] Activating local transaction spooler cache...`,
      `[ACTION] Triggering merchant backup routing to secondary Barclays settlement network...`,
      `[OK] Barclays clearance API returned nominal 200 HTTP code.`,
      `[SUCCESS] Transaction clearing queue flushed successfully. MTTR: 2 minutes 10 seconds.`
    ];
  }

  let idx = 0;
  drillLogTimer = setInterval(() => {
    if (idx < steps.length) {
      activeDrillLog.push(steps[idx]);
      terminal.innerHTML = activeDrillLog.map(line => `<div>${line}</div>`).join('');
      terminal.scrollTop = terminal.scrollHeight;
      idx++;
    } else {
      clearInterval(drillLogTimer);
      terminal.innerHTML += `<div style="color:#10b981; font-weight:700; margin-top:8px;">[Drill Execution Complete. Scoped under RTO target: ${targetRto}]</div>`;
      terminal.scrollTop = terminal.scrollHeight;
      
      // Render Lessons Learned Form
      const lessonsCard = document.getElementById('lessons-learned-content');
      if (lessonsCard) {
        lessonsCard.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:8px;">
            <p style="font-size:0.7rem; color:var(--text-secondary); margin:0;">Input post-mortem review notes and click save to commit test results back to the database state.</p>
            <textarea id="lessons-learned-notes-input" class="textarea-input" style="width:100%; font-size:0.7rem; min-height:50px;">${defaultLessons}</textarea>
            <button id="btn-save-lessons" class="btn btn-primary btn-xs" style="width:100%; font-weight:700; height:28px;">📝 Log Lessons Learned & Save Results</button>
          </div>
        `;

        document.getElementById('btn-save-lessons').onclick = () => {
          const notesText = document.getElementById('lessons-learned-notes-input').value;
          
          const state = getState();
          const existing = state.tests.find(t => t.title === testTitle);
          if (existing) {
            existing.lastRun = new Date().toISOString().split('T')[0];
            existing.results = 'Passed';
            existing.lessonsLearned = notesText;
          } else {
            state.tests.unshift({
              id: `tst-${String(state.tests.length + 1).padStart(3, '0')}`,
              title: testTitle,
              type: category,
              lastRun: new Date().toISOString().split('T')[0],
              results: 'Passed',
              status: 'Completed',
              lessonsLearned: notesText
            });
          }
          saveState();
          alert('Lessons learned and test metrics logged successfully to database state.');
          renderReadinessTab(container);
        };
      }
    }
  }, 350);
}

// ==========================================================================
// 6. CONTINUOUS CONTROL MONITORING TAB
// ==========================================================================
function renderMonitoringTab(container) {
  const state = getState();

  // Calculate ratings for controls dynamically
  const scoredControls = state.controls.map(ctl => {
    let score = 100;
    
    // 1. Evidence Freshness
    const relatedDocs = Object.values(state.suppliers).flatMap(s => s.documents || []);
    const matchingDocs = relatedDocs.filter(d => d.type.toLowerCase().includes(ctl.title.toLowerCase().split(' ')[0]));
    if (matchingDocs.length > 0) {
      const dates = matchingDocs.map(d => new Date(d.scanned).getTime());
      const newestDate = Math.max(...dates);
      const daysOld = (new Date().getTime() - newestDate) / (1000 * 60 * 60 * 24);
      if (daysOld > 90) score -= 30;
      else if (daysOld > 30) score -= 15;
    } else {
      score -= 20; // no matching evidence files
    }

    // 2. Test Coverage
    const relatedTests = state.tests.filter(t => t.title.toLowerCase().includes(ctl.title.toLowerCase().split(' ')[0]));
    if (relatedTests.length === 0) {
      score -= 20;
    }

    // 3. Findings / Gaps
    if (ctl.status === 'Gap') {
      score -= 40;
    } else if (ctl.status === 'Partial') {
      score -= 20;
    }

    // 4. Incidents
    const relatedIncidents = state.incidents.filter(i => i.title.toLowerCase().includes(ctl.title.toLowerCase().split(' ')[0]));
    score -= relatedIncidents.length * 15;

    score = Math.max(Math.min(score, 100), 10);
    return { ...ctl, score };
  });

  const avgEffectiveness = Math.round(scoredControls.reduce((sum, c) => sum + c.score, 0) / scoredControls.length);

  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
      <!-- Left side: overall score & degraded alerts -->
      <div class="dashboard-card" style="flex: 1; min-width: 320px; padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 15px;">
        <h3 style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em; font-weight:700; border-bottom:1px dashed rgba(255,255,255,0.06); padding-bottom:8px; margin:0;">
          Control Effectiveness Overview
        </h3>

        <!-- Big stats display -->
        <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.04); border-radius:6px; padding:15px; text-align:center;">
          <span style="font-size: 2.2rem; font-weight: 800; color: ${avgEffectiveness >= 85 ? '#10b981' : (avgEffectiveness >= 70 ? '#eab308' : '#ef4444')}; text-shadow:0 0 10px rgba(16,185,129,0.15);">${avgEffectiveness}%</span>
          <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-top:2px;">Overall Control Score</div>
        </div>

        <!-- Degraded Alerts list -->
        <div style="display:flex; flex-direction:column; gap:6px;">
          <h4 style="font-size:0.68rem; text-transform:uppercase; color:var(--text-secondary); font-weight:700; margin:4px 0;">Degraded Controls warnings:</h4>
          ${scoredControls.filter(c => c.score < 80).map(c => `
            <div style="background:rgba(245,158,11,0.02); border:1px solid rgba(245,158,11,0.15); border-radius:4px; padding:6px 10px; font-size:0.68rem; line-height:1.35;">
              ⚠️ <b>${c.title}</b> is degraded to <b>${c.score}%</b>. Reason: ${c.status === 'Gap' ? 'Unmitigated control gap logged.' : 'Evidence scans are outdated.'}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right side: controls scored grid list -->
      <div class="dashboard-card" style="flex: 2; min-width: 450px; padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 10px; min-height: 480px;">
        <h3 style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em; font-weight:700; border-bottom:1px dashed rgba(255,255,255,0.06); padding-bottom:8px; margin:0;">
          DORA Security Control Metrics
        </h3>
        
        <div id="controls-monitoring-list" style="display:flex; flex-direction:column; gap:12px; max-height:420px; overflow-y:auto; padding-right:4px;">
          ${scoredControls.map(c => {
            const scoreColor = c.score >= 85 ? '#10b981' : (c.score >= 70 ? '#eab308' : '#ef4444');
            return `
              <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.04); border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:0.74rem; font-weight:700; color:var(--text-primary);">${c.title}</span>
                  <span style="font-size:0.7rem; font-weight:700; color:${scoreColor};">${c.score}%</span>
                </div>
                <div style="font-size:0.68rem; color:var(--text-secondary);">${c.description}</div>
                <!-- Mini Progress Bar -->
                <div style="height:5px; background:rgba(255,255,255,0.03); border-radius:2.5px; overflow:hidden; width:100%;">
                  <div style="height:100%; width:${c.score}%; background:${scoreColor};"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.6rem; color:var(--text-muted); padding-top:2px;">
                  <span>Audit Code: ${c.id}</span>
                  <span>Status: ${c.status}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
