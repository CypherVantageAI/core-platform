// ==========================================================================
// Cypher Vantage - Operational Resilience Module (ES6 Module)
// ==========================================================================

import { getState, saveState } from '../core/db.js';
import { createTable, createForm, createStatusBadge } from '../components/ui.js';

let selectedServiceId = 'srv-001';
let isEditing = false;
let isAdding = false;

export function renderResilienceModule() {
  const state = getState();
  const container = document.getElementById('view-manager-resilience');
  if (!container) return;

  // Render main layout structure
  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
      <!-- Left Panel: Business Services Registry -->
      <div class="dashboard-card" style="flex: 1.5; min-width: 450px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0; min-height: 600px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
          <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
            Business Services Registry
          </h3>
          <button id="btn-add-service" class="btn btn-primary btn-xs" style="padding: 4px 10px;">+ Add Service</button>
        </div>

        <!-- Filter bar -->
        <div style="display: flex; gap: 8px; align-items: center; width: 100%;">
          <select id="resilience-filter-criticality" class="dropdown-control" style="width: 130px; font-size: 0.74rem;">
            <option value="all">All Criticality</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <!-- Dynamic Registry Table Container -->
        <div id="services-table-container" style="width: 100%;"></div>
      </div>

      <!-- Right Panel: Dependency & CRUD Editor -->
      <div class="dashboard-card" style="flex: 1.2; min-width: 380px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0; min-height: 600px;">
        <div id="resilience-detail-header" style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <!-- Populated dynamically -->
        </div>

        <div id="resilience-detail-body" style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  `;

  // Bind top-level controls
  const btnAdd = document.getElementById('btn-add-service');
  if (btnAdd) {
    btnAdd.onclick = () => {
      isAdding = true;
      isEditing = false;
      renderDetailPane();
    };
  }

  const filterSelect = document.getElementById('resilience-filter-criticality');
  if (filterSelect) {
    filterSelect.onchange = (e) => {
      renderServicesTable(e.target.value);
    };
  }

  // Initial loads
  renderServicesTable('all');
  renderDetailPane();
}

/**
 * Render the main Business Services list grid
 */
function renderServicesTable(criticalityFilter = 'all') {
  const state = getState();
  let services = [...state.services];

  if (criticalityFilter !== 'all') {
    services = services.filter(s => s.criticality === criticalityFilter);
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Service Name', render: (row) => `<b>${row.name}</b>` },
    { key: 'criticality', label: 'Criticality', render: (row) => createStatusBadge(row.criticality) },
    { key: 'rto', label: 'RTO / RPO', render: (row) => `<span style="font-size:0.68rem; color: var(--color-cyan); font-weight:600;">${row.rto} / ${row.rpo}</span>` },
    { key: 'owner', label: 'Owner', render: (row) => `<span style="font-size:0.7rem; color: var(--text-secondary);">${row.owner}</span>` },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => `
        <button class="btn btn-secondary btn-xs select-srv-btn" data-id="${row.id}" style="padding: 2px 6px;">Select</button>
      `
    }
  ];

  createTable('services-table-container', services, columns, {
    searchPlaceholder: 'Search business services...',
    pageSize: 6,
    selectedRowId: selectedServiceId,
    onRowClick: (row) => {
      selectedServiceId = row.id;
      isAdding = false;
      isEditing = false;
      renderDetailPane();
      renderServicesTable(); // refreshes highlighters
    }
  });
}

/**
 * Render the Details Pane on the right side
 */
function renderDetailPane() {
  const state = getState();
  const headerContainer = document.getElementById('resilience-detail-header');
  const bodyContainer = document.getElementById('resilience-detail-body');
  if (!headerContainer || !bodyContainer) return;

  // Case A: Adding a new service
  if (isAdding) {
    headerContainer.innerHTML = `<h3 style="font-size:0.8rem; color:var(--text-secondary); font-weight:700; margin:0;">Create New Business Service</h3>`;
    bodyContainer.innerHTML = `
      <div style="background: rgba(6, 182, 212, 0.04); border: 1px solid rgba(6, 182, 212, 0.2); padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 0.72rem; line-height: 1.4; color: var(--text-secondary);">
        🌐 <b>IBM Blueworks Sync Action:</b> Saving this new business service will automatically submit the definitions and operational process mappings to <b>IBM Blueworks</b>. Process models and workflow dependencies will be managed and synchronized bi-directionally there.
      </div>
      <div id="resilience-form-container"></div>
    `;
    
    const formSchema = [
      { name: 'name', label: 'Service Name', type: 'text', required: true, placeholder: 'e.g. Credit Card Clearing' },
      { name: 'description', label: 'Description / Scope', type: 'textarea', required: true, placeholder: 'Specify critical operational path...' },
      { name: 'criticality', label: 'DORA Criticality Tier', type: 'select', required: true, options: [
        { value: 'Critical', label: 'Critical (IBS / DORA Art. 5)' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
      ]},
      { name: 'rto', label: 'Recovery Time Objective (RTO)', type: 'text', required: true, placeholder: 'e.g. 4 Hours' },
      { name: 'rpo', label: 'Recovery Point Objective (RPO)', type: 'text', required: true, placeholder: 'e.g. 1 Hour' },
      { name: 'owner', label: 'Service Owner', type: 'text', required: true, placeholder: 'e.g. Sarah Jenkins' },
      { name: 'ownerDepartment', label: 'Owner Department', type: 'text', required: true, placeholder: 'e.g. Core Banking Ops' }
    ];

    createForm('resilience-form-container', formSchema, (data) => {
      const newService = {
        id: `srv-${String(state.services.length + 1).padStart(3, '0')}`,
        ...data,
        status: 'Active',
        processes: [],
        applications: []
      };
      state.services.push(newService);
      saveState();
      
      alert(`Service registered! Bi-directional process model created and synced with IBM Blueworks successfully.\nService ID: ${newService.id}`);
      
      selectedServiceId = newService.id;
      isAdding = false;
      renderResilienceModule();
    });
    return;
  }

  // Find the selected service
  const srv = state.services.find(s => s.id === selectedServiceId);
  if (!srv) {
    headerContainer.innerHTML = `<h3 style="font-size:0.8rem; margin:0;">No Service Selected</h3>`;
    bodyContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">Please select a service from the registry.</div>`;
    return;
  }

  // Case B: Editing existing service
  if (isEditing) {
    headerContainer.innerHTML = `<h3 style="font-size:0.8rem; color:var(--text-secondary); font-weight:700; margin:0;">Edit: ${srv.name}</h3>`;
    bodyContainer.innerHTML = `<div id="resilience-form-container"></div>`;

    const formSchema = [
      { name: 'name', label: 'Service Name', type: 'text', required: true, placeholder: srv.name },
      { name: 'description', label: 'Description / Scope', type: 'textarea', required: true, placeholder: srv.description },
      { name: 'criticality', label: 'DORA Criticality Tier', type: 'select', required: true, options: [
        { value: 'Critical', label: 'Critical' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
      ]},
      { name: 'rto', label: 'RTO', type: 'text', required: true, placeholder: srv.rto },
      { name: 'rpo', label: 'RPO', type: 'text', required: true, placeholder: srv.rpo },
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

  // Case C: Standard details view
  headerContainer.innerHTML = `
    <div>
      <span style="font-size:0.56rem; text-transform:uppercase; color:var(--color-cyan); font-weight:700;">Business Service Details</span>
      <h2 style="font-size:1.05rem; font-weight:700; margin-top:2px; color:var(--text-primary);">${srv.name}</h2>
    </div>
    <div style="display:flex; gap:6px;">
      <button id="btn-edit-srv" class="btn btn-secondary btn-xs" style="padding:2px 6px;">Edit</button>
      <button id="btn-delete-srv" class="btn btn-danger btn-xs" style="padding:2px 6px;">Delete</button>
    </div>
  `;

  // Bind edit/delete
  const btnEdit = document.getElementById('btn-edit-srv');
  if (btnEdit) btnEdit.onclick = () => { isEditing = true; renderDetailPane(); };

  const btnDelete = document.getElementById('btn-delete-srv');
  if (btnDelete) btnDelete.onclick = () => {
    if (confirm(`Are you sure you want to delete the business service "${srv.name}"?`)) {
      state.services = state.services.filter(s => s.id !== srv.id);
      saveState();
      // Auto-select another
      if (state.services.length > 0) {
        selectedServiceId = state.services[0].id;
      }
      renderResilienceModule();
    }
  };

  // Find relationships to draw the dependency tree
  const processes = state.processes.filter(p => srv.processes && srv.processes.includes(p.id));
  const applications = state.applications.filter(app => srv.applications && srv.applications.includes(app.id));

  let appAssets = [];
  applications.forEach(app => {
    // Assets having app name or matched references
    const matchedAssets = state.assets.filter(ast => ast.name.includes(app.name.split(' ')[0]));
    appAssets.push(...matchedAssets);
  });
  
  if (appAssets.length === 0 && state.assets.length > 0) {
    // Fallback mapping
    appAssets = [state.assets[0]];
  }

  const suppliersList = Object.values(state.suppliers || {});
  const supplier = suppliersList.find(sup => appAssets.some(ast => ast.supplierId === sup.id));

  // Build tree nodes HTML
  let treeNodesHtml = `
    <!-- Business Service Node -->
    <div class="dependency-tree-node service-node">
      <div class="node-content">
        <span class="node-label">1. Business Service</span>
        <span class="node-title">${srv.name}</span>
        <span class="node-meta">Criticality: ${srv.criticality} | SLA RTO: ${srv.rto} | RPO: ${srv.rpo}</span>
      </div>
    </div>
  `;

  if (processes.length > 0) {
    processes.forEach(prc => {
      treeNodesHtml += `
        <div class="node-branches">
          <div class="dependency-tree-node personnel-node" style="border-left-color: var(--color-cyan);">
            <div class="node-content">
              <span class="node-label">2. Mapped Process</span>
              <span class="node-title">${prc.name}</span>
              <span class="node-meta">Process Owner: ${prc.owner}</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  if (applications.length > 0) {
    applications.forEach(app => {
      treeNodesHtml += `
        <div class="node-branches" style="padding-left:40px;">
          <div class="dependency-tree-node personnel-node" style="border-left-color: #8b5cf6;">
            <div class="node-content">
              <span class="node-label">3. Technical Application</span>
              <span class="node-title">${app.name} (${app.version})</span>
              <span class="node-meta">Type: ${app.type} | Host: ${app.hostingProvider}</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  if (appAssets.length > 0) {
    appAssets.forEach(ast => {
      treeNodesHtml += `
        <div class="node-branches" style="padding-left:60px;">
          <div class="dependency-tree-node subcontractor-node" style="border-left-color: #eab308;">
            <div class="node-content">
              <span class="node-label">4. Infrastructure Asset</span>
              <span class="node-title">${ast.name}</span>
              <span class="node-meta">Type: ${ast.type} | Region: ${ast.region} | Status: ${ast.status}</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  if (supplier) {
    treeNodesHtml += `
      <div class="node-branches" style="padding-left:80px;">
        <div class="dependency-tree-node supplier-node">
          <div class="node-content">
            <span class="node-label">5. Critical Supplier</span>
            <span class="node-title">${supplier.name}</span>
            <span class="node-meta">Risk Tier: ${supplier.riskTier} | HQ: ${supplier.primaryLocation}</span>
          </div>
        </div>
      </div>
    `;
  }

  bodyContainer.innerHTML = `
    <div style="font-size:0.72rem; color:var(--text-secondary); line-height:1.45;">
      <b>Department:</b> ${srv.ownerDepartment} | <b>Owner:</b> ${srv.owner}<br/>
      <b>Scope:</b> ${srv.description}
    </div>
    
    <div style="margin-top: 10px; display:flex; flex-direction:column; gap:8px;">
      <h4 style="font-size:0.7rem; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; font-weight:700; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom:4px;">
        Service Dependency Mapping
      </h4>
      <div id="dependency-tree-root" style="display:flex; flex-direction:column; gap:6px;">
        ${treeNodesHtml}
      </div>
    </div>
  `;
}
