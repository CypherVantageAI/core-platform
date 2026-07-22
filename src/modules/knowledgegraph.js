// ==========================================================================
// Cypher Vantage - Operational Resilience Knowledge Graph Engine
// ==========================================================================

import { getState } from '../core/db.js';
import { showModal } from '../components/ui.js';
import { analyzeBlastRadius, getImpactPropagationChain, calculateResilienceExposureScore } from '../core/resilienceEngine.js';

// Graph engine state
let selectedNodeId = null;
let simulatedOutageNodeId = null;
let graphZoom = 1.0;
let graphPanX = 0;
let graphPanY = 0;
let isDraggingGraph = false;
let startDragX = 0;
let startDragY = 0;

/**
 * Compile the unified relationship graph from the active database state.
 */
export function buildResilienceGraph() {
  const state = getState();
  const nodes = [];
  const edges = [];

  // Helper to add node if not exists
  function addNode(id, name, type, originalData) {
    if (!nodes.some(n => n.id === id)) {
      nodes.push({ id, name, type, originalData });
    }
  }

  // Helper to add edge if not exists
  function addEdge(from, to, type) {
    if (from && to && !edges.some(e => e.from === from && e.to === to)) {
      edges.push({ from, to, type });
    }
  }

  // 1. Add Obligations
  state.obligations.forEach(ob => {
    addNode(ob.id, `${ob.id}: ${ob.title || 'Obligation'}`, 'obligation', ob);
    if (ob.controls) {
      ob.controls.forEach(ctlId => {
        addEdge(ob.id, ctlId, 'governs');
      });
    }
  });

  // 2. Add Controls
  state.controls.forEach(ctl => {
    addNode(ctl.id, ctl.title, 'control', ctl);
    if (ctl.relatedRisks) {
      ctl.relatedRisks.forEach(rskId => {
        addEdge(ctl.id, rskId, 'mitigates');
      });
    }
  });

  // 3. Add Risks
  state.risks.forEach(rsk => {
    addNode(rsk.id, rsk.title, 'risk', rsk);
    if (rsk.associatedServiceId) addEdge(rsk.id, rsk.associatedServiceId, 'affects');
    if (rsk.associatedAppId) addEdge(rsk.id, rsk.associatedAppId, 'threatens');
    if (rsk.associatedAssetId) addEdge(rsk.id, rsk.associatedAssetId, 'threatens');
    if (rsk.associatedSupplierId) addEdge(rsk.id, rsk.associatedSupplierId, 'exposes');
  });

  // 4. Add Services (Business & Internal)
  state.services.forEach(srv => {
    addNode(srv.id, srv.name, 'service', srv);
    if (srv.processes) {
      srv.processes.forEach(prcId => addEdge(srv.id, prcId, 'supports'));
    }
    if (srv.applications) {
      srv.applications.forEach(appId => addEdge(srv.id, appId, 'relies_on'));
    }
  });

  // 5. Add Processes
  state.processes.forEach(prc => {
    addNode(prc.id, prc.name, 'process', prc);
    // Link processes to applications based on ID mapping
    const appMapping = {
      'prc-001': 'app-001',
      'prc-002': 'app-002',
      'prc-003': 'app-003',
      'prc-004': 'app-004'
    };
    if (appMapping[prc.id]) {
      addEdge(prc.id, appMapping[prc.id], 'executed_by');
    }
  });

  // 6. Add Applications
  state.applications.forEach(app => {
    addNode(app.id, app.name, 'application', app);
    
    // Link application to hosting supplier
    const suppliersList = Object.values(state.suppliers || {});
    const provider = app.hostingProvider || '';
    const matchedSupplier = suppliersList.find(s => s.name.toLowerCase().includes(provider.toLowerCase()) || provider.toLowerCase().includes(s.id));
    if (matchedSupplier) {
      addEdge(app.id, matchedSupplier.id, 'hosted_by');
    }

    // Link application to infrastructure asset
    const assetMapping = {
      'app-001': 'ast-001',
      'app-002': 'ast-002',
      'app-003': 'ast-003',
      'app-004': 'ast-004'
    };
    if (assetMapping[app.id]) {
      addEdge(app.id, assetMapping[app.id], 'runs_on');
    }
  });

  // 7. Add Data Assets
  state.dataAssets.forEach(dat => {
    addNode(dat.id, dat.name, 'data', dat);
    if (dat.associatedApplications) {
      dat.associatedApplications.forEach(appId => {
        addEdge(dat.id, appId, 'stored_in');
      });
    }
  });

  // 8. Add Infrastructure / Cloud Assets
  state.assets.forEach(ast => {
    // Classify as cloud or physical infra based on provider region
    const nodeType = (ast.name.toLowerCase().includes('aws') || ast.name.toLowerCase().includes('azure')) ? 'cloud' : 'infrastructure';
    addNode(ast.id, ast.name, nodeType, ast);
    if (ast.supplierId) {
      addEdge(ast.id, ast.supplierId, 'provided_by');
    }
  });

  // 9. Add Suppliers
  Object.values(state.suppliers || {}).forEach(sup => {
    addNode(sup.id, sup.name, 'supplier', sup);
  });

  // 10. Add Incidents
  state.incidents.forEach(inc => {
    addNode(inc.id, inc.title, 'incident', inc);
    // Link incident to service
    const matchedSrv = state.services.find(s => s.name === inc.serviceAffected);
    if (matchedSrv) {
      addEdge(inc.id, matchedSrv.id, 'disrupted');
    }
  });

  // 11. Add Recovery Plans
  state.recoveryPlans.forEach(rp => {
    addNode(rp.id, rp.name, 'recovery_plan', rp);
    if (rp.associatedServices) {
      rp.associatedServices.forEach(srvId => {
        addEdge(rp.id, srvId, 'restores');
      });
    }
  });

  return { nodes, edges };
}

/**
 * Trace adjacent relationships, sorting upstream/downstream lists.
 */
export function queryNodeRelationships(nodeId, graph) {
  const upstream = [];
  const downstream = [];
  const relatedRisks = [];
  const relatedControls = [];
  const relatedIncidents = [];
  const relatedSuppliers = [];
  const relatedRecoveryPlans = [];

  // Traversal lists
  const visited = new Set();

  function traverse(currentId, direction) {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    graph.edges.forEach(edge => {
      if (direction === 'downstream') {
        // Node points to downstream dependencies: e.g. edge.from === currentId
        if (edge.from === currentId) {
          const target = graph.nodes.find(n => n.id === edge.to);
          if (target) {
            downstream.push(target);
            traverse(edge.to, 'downstream');
          }
        }
      } else {
        // Upstream points to node: e.g. edge.to === currentId
        if (edge.to === currentId) {
          const source = graph.nodes.find(n => n.id === edge.from);
          if (source) {
            upstream.push(source);
            traverse(edge.from, 'upstream');
          }
        }
      }
    });
  }

  // Resolve direct & indirect dependencies
  traverse(nodeId, 'upstream');
  visited.clear();
  traverse(nodeId, 'downstream');

  // Resolve related helper entities in the neighborhood paths
  const allPathIds = new Set([nodeId, ...upstream.map(n => n.id), ...downstream.map(n => n.id)]);

  graph.nodes.forEach(node => {
    if (node.id === nodeId) return;

    if (node.type === 'risk') {
      // Connects if linked to anything in the neighborhood paths
      const isLinked = graph.edges.some(e => e.from === node.id && allPathIds.has(e.to));
      if (isLinked) relatedRisks.push(node);
    } else if (node.type === 'control') {
      const isLinked = graph.edges.some(e => e.from === node.id && allPathIds.has(e.to)) ||
                       graph.edges.some(e => e.to === node.id && allPathIds.has(e.from));
      if (isLinked) relatedControls.push(node);
    } else if (node.type === 'incident') {
      const isLinked = graph.edges.some(e => e.from === node.id && allPathIds.has(e.to));
      if (isLinked) relatedIncidents.push(node);
    } else if (node.type === 'supplier') {
      const isLinked = graph.edges.some(e => e.to === node.id && allPathIds.has(e.from));
      if (isLinked) relatedSuppliers.push(node);
    } else if (node.type === 'recovery_plan') {
      const isLinked = graph.edges.some(e => e.from === node.id && allPathIds.has(e.to));
      if (isLinked) relatedRecoveryPlans.push(node);
    }
  });

  return {
    upstream: [...new Set(upstream)],
    downstream: [...new Set(downstream)],
    relatedRisks: [...new Set(relatedRisks)],
    relatedControls: [...new Set(relatedControls)],
    relatedIncidents: [...new Set(relatedIncidents)],
    relatedSuppliers: [...new Set(relatedSuppliers)],
    relatedRecoveryPlans: [...new Set(relatedRecoveryPlans)]
  };
}

/**
 * Calculates cascading failures downstream of the startNodeId.
 */
export function runImpactPropagation(startNodeId, graph) {
  const affectedNodes = new Set([startNodeId]);
  const queue = [startNodeId];

  // Breadth-First-Search along downstream edges
  while (queue.length > 0) {
    const currentId = queue.shift();
    graph.edges.forEach(edge => {
      if (edge.from === currentId) {
        if (!affectedNodes.has(edge.to)) {
          affectedNodes.add(edge.to);
          queue.push(edge.to);
        }
      }
    });
  }

  // Calculate impacts
  let financialDowntimeCost = 0;
  const customersAffected = [];
  const regulatoryObligationsBreached = [];
  const servicesImpacted = [];
  const applicationsImpacted = [];

  affectedNodes.forEach(id => {
    const node = graph.nodes.find(n => n.id === id);
    if (!node) return;

    if (node.type === 'service') {
      servicesImpacted.push(node.name);
      if (node.originalData.customerImpact) {
        customersAffected.push(node.originalData.customerImpact);
      }
      if (node.originalData.regulatoryImpact) {
        regulatoryObligationsBreached.push(node.originalData.regulatoryImpact);
      }
      // Add estimated financial impact hourly rate
      if (node.originalData.financialImpact) {
        const valStr = node.originalData.financialImpact.match(/£([0-9,]+)/);
        if (valStr && valStr[1]) {
          financialDowntimeCost += parseInt(valStr[1].replace(/,/g, '')) || 0;
        }
      }
    } else if (node.type === 'application') {
      applicationsImpacted.push(node.name);
    } else if (node.type === 'cloud' || node.type === 'infrastructure') {
      if (node.originalData.downtimeCostPerHour) {
        financialDowntimeCost += parseInt(node.originalData.downtimeCostPerHour) || 0;
      }
    }
  });

  return {
    affectedIds: Array.from(affectedNodes),
    servicesImpacted,
    applicationsImpacted,
    financialDowntimeCost,
    customersAffected,
    regulatoryObligationsBreached
  };
}

/**
 * Render the main Knowledge Graph screen (interactive SVG + detailed sidebar).
 */
export function renderResilienceGraph(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const graph = buildResilienceGraph();
  const focalNodeId = options.focalNodeId || null;

  if (focalNodeId) {
    selectedNodeId = focalNodeId;
  }

  // Compute node layouts dynamically if it's the global view, or local neighborhood if focal node is provided
  let filteredNodes = [...graph.nodes];
  let filteredEdges = [...graph.edges];

  if (focalNodeId) {
    // Focus view: show focal node plus direct neighbors (1 degree of separation)
    const neighbors = new Set([focalNodeId]);
    graph.edges.forEach(e => {
      if (e.from === focalNodeId) neighbors.add(e.to);
      if (e.to === focalNodeId) neighbors.add(e.from);
    });
    filteredNodes = graph.nodes.filter(n => neighbors.has(n.id));
    filteredEdges = graph.edges.filter(e => neighbors.has(e.from) && neighbors.has(e.to));
  }

  // Assign coordinate positions inside columns
  // Col 0: Obligations, Col 1: Controls & Risks, Col 2: Services & Processes, Col 3: Apps & Data, Col 4: Infra/Cloud, Col 5: Suppliers/Incidents/Plans
  const columns = {
    obligation: 0,
    control: 1,
    risk: 1,
    service: 2,
    process: 2,
    application: 3,
    data: 3,
    infrastructure: 4,
    cloud: 4,
    supplier: 5,
    incident: 5,
    recovery_plan: 5
  };

  const colWidth = 160;
  const canvasHeight = 440;
  const nodeRadius = 18;

  // Group nodes by columns
  const nodesByCol = Array.from({ length: 6 }, () => []);
  filteredNodes.forEach(node => {
    const colIdx = columns[node.type] !== undefined ? columns[node.type] : 2;
    nodesByCol[colIdx].push(node);
  });

  // Calculate coordinates
  filteredNodes.forEach(node => {
    const colIdx = columns[node.type] !== undefined ? columns[node.type] : 2;
    const colNodes = nodesByCol[colIdx];
    const nodeIdx = colNodes.indexOf(node);
    const count = colNodes.length;

    // Distribute evenly along height
    const spacingY = canvasHeight / (count + 1);
    node.x = 40 + colIdx * colWidth;
    node.y = spacingY * (nodeIdx + 1);
  });

  // Upstream / Downstream highlights
  let rels = { upstream: [], downstream: [], relatedRisks: [], relatedControls: [], relatedIncidents: [], relatedSuppliers: [], relatedRecoveryPlans: [] };
  let propagationResult = null;

  if (selectedNodeId) {
    rels = queryNodeRelationships(selectedNodeId, graph);
    if (simulatedOutageNodeId) {
      propagationResult = runImpactPropagation(simulatedOutageNodeId, graph);
    }
  }

  // Render SVG nodes and lines
  const linksHtml = filteredEdges.map(edge => {
    const fromNode = filteredNodes.find(n => n.id === edge.from);
    const toNode = filteredNodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return '';

    // Calculate edge highlight state
    let strokeColor = 'rgba(56, 189, 248, 0.35)';
    let strokeWidth = '1.8';
    let dasharray = 'none';
    let flowParticle = '';

    const isPropagationActive = propagationResult && propagationResult.affectedIds.includes(edge.from) && propagationResult.affectedIds.includes(edge.to);
    const isSelectedDownstream = selectedNodeId && (edge.from === selectedNodeId || rels.downstream.some(n => n.id === edge.from) && rels.downstream.some(n => n.id === edge.to));
    const isSelectedUpstream = selectedNodeId && (edge.to === selectedNodeId || rels.upstream.some(n => n.id === edge.to) && rels.upstream.some(n => n.id === edge.from));

    if (isPropagationActive) {
      strokeColor = 'var(--color-danger)';
      strokeWidth = '2.5';
      dasharray = '4 4';
      flowParticle = `<circle r="3" fill="#ef4444"><animateMotion dur="2.5s" repeatCount="indefinite" path="M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}" /></circle>`;
    } else if (isSelectedDownstream) {
      strokeColor = 'var(--color-cyan)';
      strokeWidth = '2';
      flowParticle = `<circle r="2.5" fill="#06b6d4"><animateMotion dur="3s" repeatCount="indefinite" path="M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}" /></circle>`;
    } else if (isSelectedUpstream) {
      strokeColor = 'var(--color-purple)';
      strokeWidth = '2';
      flowParticle = `<circle r="2.5" fill="#a855f7"><animateMotion dur="3s" repeatCount="indefinite" path="M ${toNode.x} ${toNode.y} L ${fromNode.x} ${fromNode.y}" /></circle>`;
    }

    return `
      <g>
        <line x1="${fromNode.x}" y1="${fromNode.y}" x2="${toNode.x}" y2="${toNode.y}" 
          stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${dasharray}" />
        ${flowParticle}
      </g>
    `;
  }).join('');

  // Node icon and colors resolver
  function getNodeStyle(node) {
    const isSelected = selectedNodeId === node.id;
    const isOutage = simulatedOutageNodeId === node.id || (propagationResult && propagationResult.affectedIds.includes(node.id));

    let bgColor = 'rgba(15,23,42,0.85)';
    let borderColor = 'rgba(255,255,255,0.1)';
    let glow = 'none';

    if (isOutage) {
      bgColor = 'rgba(239, 68, 68, 0.18)';
      borderColor = '#ef4444';
      glow = '0 0 10px rgba(239, 68, 68, 0.5)';
    } else if (isSelected) {
      bgColor = 'rgba(6, 182, 212, 0.15)';
      borderColor = 'var(--color-cyan)';
      glow = '0 0 12px var(--color-cyan)';
    } else {
      const typeColors = {
        service: 'var(--color-cyan)',
        application: '#8b5cf6',
        cloud: '#10b981',
        infrastructure: '#eab308',
        supplier: '#f97316',
        risk: '#ef4444',
        control: '#14b8a6',
        obligation: '#f43f5e',
        data: '#3b82f6',
        process: '#ec4899',
        incident: '#d946ef',
        recovery_plan: '#06b6d4'
      };
      const c = typeColors[node.type] || '#fff';
      borderColor = `rgba(${parseInt(c.slice(1,3),16)}, ${parseInt(c.slice(3,5),16)}, ${parseInt(c.slice(5,7),16)}, 0.4)`;
    }

    return { bgColor, borderColor, glow };
  }

  const nodesHtml = filteredNodes.map(node => {
    const { bgColor, borderColor, glow } = getNodeStyle(node);
    
    // Icon map
    const icons = {
      obligation: '📜',
      control: '🛡️',
      risk: '⚠️',
      service: '💼',
      process: '⚙️',
      application: '💻',
      data: '💾',
      cloud: '☁️',
      infrastructure: '🏢',
      supplier: '🤝',
      incident: '🚨',
      recovery_plan: '🔄'
    };
    const icon = icons[node.type] || '⚫';

    return `
      <g class="graph-node" data-id="${node.id}" style="cursor: pointer;">
        <circle cx="${node.x}" cy="${node.y}" r="${nodeRadius}" fill="${bgColor}" stroke="${borderColor}" stroke-width="2" style="filter: drop-shadow(${glow});" />
        <text x="${node.x}" y="${node.y + 4}" font-size="11" text-anchor="middle" style="pointer-events: none;">${icon}</text>
        <text x="${node.x}" y="${node.y + 24}" font-size="7.5" fill="var(--text-secondary)" text-anchor="middle" font-weight="600" style="pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${node.name.split(': ')[0].slice(0, 18)}</text>
      </g>
    `;
  }).join('');

  // Sidebar detailed pane
  let selectedNodeDetailsHtml = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 0.72rem; padding: 20px; text-align: center;">
      <span>🕸️ Click on any node inside the Knowledge Graph to inspect relationships and simulate outage impact cascades.</span>
    </div>
  `;

  if (selectedNodeId) {
    const node = graph.nodes.find(n => n.id === selectedNodeId);
    if (node) {
      const typeLabels = {
        service: 'Business Service',
        process: 'Critical Process',
        application: 'Software Application',
        infrastructure: 'Physical Asset',
        cloud: 'Cloud Service Instance',
        data: 'Data Asset Record',
        supplier: 'Third-Party Supplier',
        risk: 'Compliance Risk',
        control: 'Security Control',
        incident: 'Active Incident Log',
        recovery_plan: 'Disaster Recovery Plan',
        obligation: 'DORA Obligation Article'
      };

      const isOutageActive = simulatedOutageNodeId === node.id || (propagationResult && propagationResult.affectedIds.includes(node.id));

      selectedNodeDetailsHtml = `
        <div style="display: flex; flex-direction: column; gap: 15px; width: 100%; font-size: 0.72rem;">
          <!-- Node Header -->
          <div style="display: flex; gap: 10px; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
            <div style="font-size: 1.5rem;">${getNodeIcon(node.type)}</div>
            <div style="flex: 1;">
              <div style="font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-cyan); font-weight: 700;">${typeLabels[node.type] || 'Entity'}</div>
              <h3 style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin: 2px 0 4px 0;">${node.name}</h3>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="badge ${isOutageActive ? 'badge-danger' : 'badge-success'}" style="font-size: 0.55rem; padding: 1px 4px;">
                  ${isOutageActive ? 'CRITICAL OUTAGE' : 'NOMINAL'}
                </span>
                <span style="font-size: 0.65rem; color: var(--text-muted);">ID: ${node.id}</span>
              </div>
            </div>
          </div>

          <!-- Outage Simulator Control -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); padding: 10px; border-radius: 6px;">
            <div style="font-weight: 700; color: var(--text-secondary); text-transform: uppercase; font-size: 0.6rem; margin-bottom: 6px;">Simulate Outage Blast Radius</div>
            <p style="font-size: 0.64rem; color: var(--text-muted); margin-bottom: 8px;">Trigger simulated operational failure on this node to inspect downstream cascades, customers affected, and regulatory exposure.</p>
            <div style="display: flex; gap: 8px;">
              ${simulatedOutageNodeId === node.id ? `
                <button id="btn-stop-simulation" class="btn btn-secondary btn-xs" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #ef4444; width: 100%; font-weight: 600;">⚠️ Reset Simulation</button>
              ` : `
                <button id="btn-start-simulation" class="btn btn-primary btn-xs" style="width: 100%; font-weight: 600;">⚡ Trigger Failure</button>
              `}
            </div>
          </div>

          <!-- Propagation Blast Radius Dashboard -->
          ${selectedNodeId ? (() => {
            const blast = analyzeBlastRadius(selectedNodeId, graph);
            const exposure = calculateResilienceExposureScore(selectedNodeId);
            const chain = getImpactPropagationChain(selectedNodeId, graph);

            return `
              <!-- Resilience Exposure Score Card -->
              <div style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.6rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Resilience Exposure Score</span>
                  <span class="badge" style="background: ${exposure.badgeColor}; color: #fff; font-weight: 800; font-size: 0.6rem;">${exposure.statusTier}</span>
                </div>
                <div style="display: flex; align-items: baseline; justify-content: space-between;">
                  <span style="font-size: 1.4rem; font-weight: 800; color: ${exposure.badgeColor};">${exposure.score}%</span>
                  <button id="btn-explain-graph-score" class="btn btn-secondary btn-xs" style="font-size: 0.6rem; padding: 2px 6px;">🔍 Explain Score</button>
                </div>
              </div>

              <!-- Compact Blast Radius Summary Card -->
              <div style="background: rgba(6, 182, 212, 0.04); border: 1px solid rgba(6, 182, 212, 0.18); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
                <div style="font-weight: 700; color: var(--color-cyan); text-transform: uppercase; font-size: 0.6rem; letter-spacing: 0.05em;">
                  💥 Blast Radius Quick Stats
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                  <div style="background: rgba(0,0,0,0.2); padding: 4px 6px; border-radius: 4px;">
                    <span style="display:block; font-size:0.5rem; color:var(--text-muted); text-transform:uppercase;">Direct</span>
                    <span style="font-size:0.75rem; font-weight:700; color:var(--text-primary);">${blast.directImpact.length} Nodes</span>
                  </div>
                  <div style="background: rgba(0,0,0,0.2); padding: 4px 6px; border-radius: 4px;">
                    <span style="display:block; font-size:0.5rem; color:var(--text-muted); text-transform:uppercase;">Indirect</span>
                    <span style="font-size:0.75rem; font-weight:700; color:var(--text-primary);">${blast.indirectImpact.length} Nodes</span>
                  </div>
                  <div style="background: rgba(0,0,0,0.2); padding: 4px 6px; border-radius: 4px; border-left: 2px solid #ef4444;">
                    <span style="display:block; font-size:0.5rem; color:var(--text-muted); text-transform:uppercase;">Loss / Hr</span>
                    <span style="font-size:0.7rem; font-weight:700; color:#ef4444;">${blast.revenueImpact.formattedCost}</span>
                  </div>
                  <div style="background: rgba(0,0,0,0.2); padding: 4px 6px; border-radius: 4px; border-left: 2px solid var(--color-cyan);">
                    <span style="display:block; font-size:0.5rem; color:var(--text-muted); text-transform:uppercase;">Exposure</span>
                    <span style="font-size:0.7rem; font-weight:700; color:var(--color-cyan);">~${blast.customersAffected.totalCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            `;
          })() : ''}

          <!-- Neighborhood Relationships Lists (Horizontal Grid Distribution) -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-weight: 700; color: var(--text-secondary); text-transform: uppercase; font-size: 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 2px;">Adjacent Relationships</div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${renderRelationSection('Upstream Dependencies', rels.upstream, 'var(--color-cyan)')}
              ${renderRelationSection('Downstream Dependencies', rels.downstream, 'var(--color-purple)')}
              ${renderRelationSection('Related Compliance Risks', rels.relatedRisks, '#ef4444')}
              ${renderRelationSection('Governing Security Controls', rels.relatedControls, '#14b8a6')}
              ${renderRelationSection('Linked Incident History', rels.relatedIncidents, '#d946ef')}
              ${renderRelationSection('Associated Recovery Plans', rels.relatedRecoveryPlans, '#06b6d4')}
              ${renderRelationSection('Third-Party Suppliers Mapped', rels.relatedSuppliers, '#f97316')}
            </div>
          </div>
        </div>
      `;
    }
  }

  function renderRelationSection(title, list, color) {
    if (!list || list.length === 0) return '';
    return `
      <div style="margin-bottom: 4px;">
        <span style="font-weight: 600; color: ${color}; font-size: 0.58rem; text-transform: uppercase; display: block; margin-bottom: 4px;">${title} (${list.length})</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding-left: 2px;">
          ${list.map(node => `
            <a href="#" class="graph-link-rel" data-id="${node.id}" style="color: var(--text-primary); text-decoration: none; display: flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); font-size: 0.62rem; white-space: nowrap;">
              <span>${getNodeIcon(node.type)}</span>
              <span style="font-weight: 600;">${node.name}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  function getNodeIcon(type) {
    const icons = {
      obligation: '📜',
      control: '🛡️',
      risk: '⚠️',
      service: '💼',
      process: '⚙️',
      application: '💻',
      data: '💾',
      cloud: '☁️',
      infrastructure: '🏢',
      supplier: '🤝',
      incident: '🚨',
      recovery_plan: '🔄'
    };
    return icons[type] || '⚫';
  }

  // Draw the full DOM content
  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%; min-height: 480px;">
      <!-- Left: Interactive SVG Canvas -->
      <div class="dashboard-card" style="flex: 2; min-width: 480px; padding: 10px; margin: 0; min-height: 450px; display: flex; flex-direction: column; position: relative;">
        <!-- Canvas Header / Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.7rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
          <div style="font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
            ${focalNodeId ? `Neighborhood Graph: ${focalNodeId}` : '🕸️ Operational Resilience Enterprise Knowledge Graph'}
          </div>
          <div style="display: flex; gap: 5px; align-items: center;">
            <button id="btn-graph-zoom-in" class="btn btn-secondary btn-xs" style="padding:2px 8px;">+</button>
            <button id="btn-graph-zoom-out" class="btn btn-secondary btn-xs" style="padding:2px 8px;">-</button>
            <button id="btn-graph-reset" class="btn btn-secondary btn-xs" style="padding:2px 6px;">Reset</button>
          </div>
        </div>

        <!-- SVG Container -->
        <div id="svg-graph-viewport-container" style="flex: 1; position: relative; overflow: hidden; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px solid rgba(255,255,255,0.02); cursor: grab; width: 100%; height: 350px;">
          <svg id="resilience-graph-svg" style="width: 100%; height: 100%; min-height: 350px; transform-origin: 0 0;">
            <g id="svg-zoomable-group" style="transform: translate(${graphPanX}px, ${graphPanY}px) scale(${graphZoom});">
              <!-- Grid Background lines for cyber look -->
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.01)" stroke-width="1"/>
                </pattern>
              </defs>
              <rect width="1200" height="600" fill="url(#grid)" pointer-events="none" />
              
              <!-- Draw relationship lines -->
              ${linksHtml}

              <!-- Draw nodes -->
              ${nodesHtml}
            </g>
          </svg>
        </div>

        <!-- Space-efficient Intelligence Engine Panel below Canvas -->
        ${selectedNodeId ? (() => {
          const blast = analyzeBlastRadius(selectedNodeId, graph);
          const chain = getImpactPropagationChain(selectedNodeId, graph);
          return `
            <div style="display: flex; flex-direction: column; gap: 6px; background: rgba(6, 182, 212, 0.03); border: 1px solid rgba(6, 182, 212, 0.15); border-radius: 6px; padding: 8px 12px; margin-top: 8px; font-size: 0.68rem;">
              <!-- Top Row: Metrics -->
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 6px;">
                <div>
                  <span style="color: var(--text-muted); font-size: 0.55rem; text-transform: uppercase; font-weight: 700; display: block;">Selected Failure Object</span>
                  <strong style="color: var(--text-primary); font-size: 0.72rem;">${blast.target.name} (${blast.target.type})</strong>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.55rem; text-transform: uppercase; font-weight: 700; display: block;">Cascading Nodes</span>
                  <strong style="color: var(--color-cyan); font-size: 0.72rem;">${blast.directImpact.length} Direct / ${blast.indirectImpact.length} Indirect</strong>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.55rem; text-transform: uppercase; font-weight: 700; display: block;">Revenue Impact</span>
                  <strong style="color: #ef4444; font-size: 0.72rem;">${blast.revenueImpact.formattedCost}</strong>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.55rem; text-transform: uppercase; font-weight: 700; display: block;">Customer Exposure</span>
                  <strong style="color: var(--color-cyan); font-size: 0.72rem;">~${blast.customersAffected.totalCount.toLocaleString()} Users</strong>
                </div>
              </div>

              <!-- Bottom Row: Failure Propagation Path Stepper -->
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <span style="font-weight:700; color:var(--color-cyan); font-size:0.58rem; text-transform:uppercase; letter-spacing:0.04em;">Failure Propagation Path Across Graph:</span>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
                  ${chain.steps.map((step, idx) => `
                    <div style="flex: 1; min-width: 90px; background: rgba(0,0,0,0.2); border: 1px solid ${idx === 0 ? '#ef4444' : 'rgba(255,255,255,0.06)'}; border-radius: 4px; padding: 4px 6px; display: flex; flex-direction: column; gap: 1px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.52rem; font-weight: 800; color: ${idx === 0 ? '#ef4444' : 'var(--color-cyan)'};">L${step.level} ${step.icon}</span>
                        ${idx === 0 ? `<span style="font-size: 0.48rem; font-weight: 800; color: #ef4444;">ROOT</span>` : ''}
                      </div>
                      <span style="font-size: 0.62rem; font-weight: 700; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${step.title.split(' ')[0]} ${step.title.split(' ')[1] || ''}</span>
                    </div>
                    ${idx < chain.steps.length - 1 ? `<span style="color: #ef4444; font-weight: 800; font-size: 0.7rem;">➔</span>` : ''}
                  `).join('')}
                </div>
              </div>
            </div>
          `;
        })() : ''}
      </div>

      <!-- Right: Detailed Neighborhood sidebar -->
      <div class="dashboard-card" style="flex: 1; min-width: 280px; padding: 15px; margin: 0; min-height: 450px; display: flex; flex-direction: column; overflow-y: auto; max-height: 480px;">
        <h3 style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">🛡️ Relationship Inspector</h3>
        <div id="resilience-graph-sidebar-content" style="width: 100%; height: 100%;">
          ${selectedNodeDetailsHtml}
        </div>
      </div>
    </div>
  `;

  // Bind SVG Node Clicks
  container.querySelectorAll('.graph-node').forEach(elem => {
    elem.onclick = (e) => {
      e.stopPropagation();
      const id = elem.getAttribute('data-id');
      selectedNodeId = id;
      renderResilienceGraph(containerId, { focalNodeId });
    };
  });

  // Bind Explain Score Button
  const btnExplainScore = document.getElementById('btn-explain-graph-score');
  if (btnExplainScore && selectedNodeId) {
    btnExplainScore.onclick = () => {
      const exp = calculateResilienceExposureScore(selectedNodeId).explainability;
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
  }

  // Bind Sidebar neighborhood list links clicks
  container.querySelectorAll('.graph-link-rel').forEach(elem => {
    elem.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = elem.getAttribute('data-id');
      selectedNodeId = id;
      renderResilienceGraph(containerId, { focalNodeId });
    };
  });

  // Bind Zoom & Reset controls
  const zoomInBtn = document.getElementById('btn-graph-zoom-in');
  const zoomOutBtn = document.getElementById('btn-graph-zoom-out');
  const resetBtn = document.getElementById('btn-graph-reset');

  if (zoomInBtn) {
    zoomInBtn.onclick = () => {
      graphZoom = Math.min(2.0, graphZoom + 0.1);
      updateZoomGroup();
    };
  }

  if (zoomOutBtn) {
    zoomOutBtn.onclick = () => {
      graphZoom = Math.max(0.5, graphZoom - 0.1);
      updateZoomGroup();
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      graphZoom = 1.0;
      graphPanX = 0;
      graphPanY = 0;
      updateZoomGroup();
    };
  }

  function updateZoomGroup() {
    const zoomGroup = document.getElementById('svg-zoomable-group');
    if (zoomGroup) {
      zoomGroup.style.transform = `translate(${graphPanX}px, ${graphPanY}px) scale(${graphZoom})`;
    }
  }

  // Bind drag & drop panning on SVG viewport container
  const viewport = document.getElementById('svg-graph-viewport-container');
  if (viewport) {
    viewport.onmousedown = (e) => {
      if (e.target.closest('.graph-node')) return; // ignore node clicks
      isDraggingGraph = true;
      viewport.style.cursor = 'grabbing';
      startDragX = e.clientX - graphPanX;
      startDragY = e.clientY - graphPanY;
    };

    window.onmousemove = (e) => {
      if (!isDraggingGraph) return;
      graphPanX = e.clientX - startDragX;
      graphPanY = e.clientY - startDragY;
      updateZoomGroup();
    };

    window.onmouseup = () => {
      if (isDraggingGraph) {
        isDraggingGraph = false;
        if (viewport) viewport.style.cursor = 'grab';
      }
    };
  }

  // Bind Outage Simulator buttons
  const startSimBtn = document.getElementById('btn-start-simulation');
  const stopSimBtn = document.getElementById('btn-stop-simulation');

  if (startSimBtn) {
    startSimBtn.onclick = () => {
      simulatedOutageNodeId = selectedNodeId;
      renderResilienceGraph(containerId, { focalNodeId });
    };
  }

  if (stopSimBtn) {
    stopSimBtn.onclick = () => {
      simulatedOutageNodeId = null;
      renderResilienceGraph(containerId, { focalNodeId });
    };
  }
}

window.buildResilienceGraph = buildResilienceGraph;
window.renderResilienceGraph = renderResilienceGraph;
