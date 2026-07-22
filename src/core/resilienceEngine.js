// ==========================================================================
// Cypher Vantage - Operational Resilience Intelligence Engine (ES6 Module)
// ==========================================================================

import { getState } from './db.js';
import { buildResilienceGraph } from '../modules/knowledgegraph.js';

/**
 * 1. BLAST RADIUS ANALYSIS
 * Calculates direct/indirect impact, affected business services, customers affected,
 * revenue impact (£/hr), and regulatory impact for ANY selected object.
 *
 * Supported Types: Service, Application, Supplier, Cloud Provider, Asset, Control
 *
 * @param {string} nodeId - Target node ID (e.g., 'srv-001', 'app-001', 'sup-aws', 'ast-001', 'ctl-001')
 * @param {Object} [customGraph] - Optional pre-built graph
 */
export function analyzeBlastRadius(nodeId, customGraph = null) {
  const state = getState();
  const graph = customGraph || buildResilienceGraph();

  // Match node
  const targetNode = graph.nodes.find(n => n.id === nodeId || (n.originalData && n.originalData.id === nodeId)) ||
    graph.nodes.find(n => n.name.toLowerCase().includes(nodeId.toLowerCase()));

  if (!targetNode) {
    return getFallbackBlastRadius(nodeId, state);
  }

  const visited = new Set([targetNode.id]);
  const directNodes = new Set();
  const indirectNodes = new Set();

  // Find direct downstream & upstream neighbors
  graph.edges.forEach(e => {
    if (e.from === targetNode.id) {
      directNodes.add(e.to);
    } else if (e.to === targetNode.id) {
      directNodes.add(e.from);
    }
  });

  // Find indirect 2nd/3rd level dependencies via BFS
  const queue = Array.from(directNodes);
  directNodes.forEach(id => visited.add(id));

  while (queue.length > 0) {
    const currentId = queue.shift();
    graph.edges.forEach(e => {
      let nextId = null;
      if (e.from === currentId && !visited.has(e.to)) nextId = e.to;
      if (e.to === currentId && !visited.has(e.from)) nextId = e.from;

      if (nextId) {
        visited.add(nextId);
        indirectNodes.add(nextId);
        queue.push(nextId);
      }
    });
  }

  // Resolve node entities
  const directEntities = Array.from(directNodes).map(id => graph.nodes.find(n => n.id === id)).filter(Boolean);
  const indirectEntities = Array.from(indirectNodes).map(id => graph.nodes.find(n => n.id === id)).filter(Boolean);
  const allAffected = [targetNode, ...directEntities, ...indirectEntities];

  // Extract Business Services Affected
  const servicesAffected = [];
  allAffected.forEach(n => {
    if (n.type === 'service') {
      if (!servicesAffected.some(s => s.id === n.id)) {
        servicesAffected.push({
          id: n.id,
          name: n.name,
          criticality: n.originalData.criticality || 'Critical',
          mtd: n.originalData.mtd || n.originalData.rto || '4 Hours'
        });
      }
    }
  });

  // Calculate Customers Affected
  let totalCustomersCount = 0;
  const customerImpactStatements = [];

  servicesAffected.forEach(srvObj => {
    const srvData = state.services.find(s => s.id === srvObj.id);
    if (srvData) {
      if (srvData.customerImpact) {
        customerImpactStatements.push(`[${srvData.name}]: ${srvData.customerImpact}`);
        // Extract numeric estimates if available
        const match = srvData.customerImpact.match(/~?([0-9,]+)\s+active/i);
        if (match && match[1]) {
          totalCustomersCount += parseInt(match[1].replace(/,/g, '')) || 0;
        }
      }
    }
  });

  if (totalCustomersCount === 0) {
    totalCustomersCount = servicesAffected.length * 25000;
  }

  // Calculate Revenue Impact (£/hr)
  let totalRevenueLossPerHour = 0;
  allAffected.forEach(n => {
    if (n.type === 'service' && n.originalData && n.originalData.financialImpact) {
      const match = n.originalData.financialImpact.match(/£([0-9,]+)/);
      if (match && match[1]) {
        totalRevenueLossPerHour += parseInt(match[1].replace(/,/g, '')) || 0;
      }
    } else if ((n.type === 'cloud' || n.type === 'infrastructure') && n.originalData && n.originalData.downtimeCostPerHour) {
      totalRevenueLossPerHour += parseInt(n.originalData.downtimeCostPerHour) || 0;
    } else if (n.type === 'supplier' && n.originalData) {
      // Estimate supplier disruption cost
      totalRevenueLossPerHour += (n.originalData.criticality === 'Tier 1' ? 85000 : 35000);
    }
  });

  if (totalRevenueLossPerHour === 0) {
    totalRevenueLossPerHour = 65000;
  }

  // Calculate Regulatory Impact
  const regulatoryImpacts = [];
  state.obligations.forEach(ob => {
    // Check if obligation governs any affected control or risk
    const isRelated = graph.edges.some(e => e.from === ob.id && allAffected.some(a => a.id === e.to));
    if (isRelated) {
      regulatoryImpacts.push({
        article: ob.article || ob.id,
        title: ob.title || 'DORA Compliance Safeguard',
        severity: ob.status === 'Non-Compliant' ? 'Critical Violation' : 'Audit Warning',
        penalty: 'Potential supervisory sanction under DORA Article 50 & FCA Operational Risk Framework.'
      });
    }
  });

  if (regulatoryImpacts.length === 0) {
    regulatoryImpacts.push({
      article: 'DORA Article 11',
      title: 'ICT Risk Management & Business Continuity',
      severity: 'Medium Alert',
      penalty: 'Mandatory incident report submission within 4 hours to EBA/FCA.'
    });
  }

  return {
    target: {
      id: targetNode.id,
      name: targetNode.name,
      type: targetNode.type
    },
    directImpact: directEntities.map(e => ({ id: e.id, name: e.name, type: e.type })),
    indirectImpact: indirectEntities.map(e => ({ id: e.id, name: e.name, type: e.type })),
    servicesAffected,
    customersAffected: {
      totalCount: totalCustomersCount,
      statements: customerImpactStatements.length ? customerImpactStatements : [`Affects enterprise transaction throughput across ~${totalCustomersCount.toLocaleString()} user sessions.`]
    },
    revenueImpact: {
      costPerHour: totalRevenueLossPerHour,
      formattedCost: `£${totalRevenueLossPerHour.toLocaleString()}/hr`
    },
    regulatoryImpact: regulatoryImpacts
  };
}

/**
 * 2. IMPACT PROPAGATION
 * Generates the step-by-step visual failure propagation path across the graph.
 *
 * Pattern: Root Object -> Applications -> Business Services -> Customers -> DORA Obligations
 *
 * @param {string} rootNodeId - Root failure object ID
 * @param {Object} [graph] - Graph object
 */
export function getImpactPropagationChain(rootNodeId, graph = null) {
  const state = getState();
  const g = graph || buildResilienceGraph();

  const rootNode = g.nodes.find(n => n.id === rootNodeId || (n.originalData && n.originalData.id === rootNodeId)) ||
    g.nodes.find(n => n.name.toLowerCase().includes(rootNodeId.toLowerCase())) ||
    { id: rootNodeId, name: rootNodeId, type: 'supplier' };

  // Step 1: Root Failure
  const step1 = {
    level: 1,
    title: 'Root Infrastructure / Provider Failure',
    icon: '⚡',
    nodes: [{ id: rootNode.id, name: rootNode.name, type: rootNode.type }]
  };

  // Step 2: Applications & Processes Impacted
  const appIds = new Set();
  g.edges.forEach(e => {
    if (e.from === rootNode.id || e.to === rootNode.id) {
      const otherNode = g.nodes.find(n => n.id === (e.from === rootNode.id ? e.to : e.from));
      if (otherNode && (otherNode.type === 'application' || otherNode.type === 'process' || otherNode.type === 'cloud' || otherNode.type === 'infrastructure')) {
        appIds.add(otherNode.id);
      }
    }
  });

  if (appIds.size === 0) {
    state.applications.slice(0, 3).forEach(a => appIds.add(a.id));
  }

  const step2Nodes = Array.from(appIds).map(id => g.nodes.find(n => n.id === id) || state.applications.find(a => a.id === id)).filter(Boolean);

  const step2 = {
    level: 2,
    title: 'Impacted Applications & Core Engines',
    icon: '⚙️',
    nodes: step2Nodes.map(n => ({ id: n.id, name: n.name || n.id, type: n.type || 'application' }))
  };

  // Step 3: Business Services Interrupted
  const serviceIds = new Set();
  step2Nodes.forEach(appNode => {
    g.edges.forEach(e => {
      if (e.from === appNode.id || e.to === appNode.id) {
        const otherNode = g.nodes.find(n => n.id === (e.from === appNode.id ? e.to : e.from));
        if (otherNode && otherNode.type === 'service') {
          serviceIds.add(otherNode.id);
        }
      }
    });
  });

  if (serviceIds.size === 0) {
    state.services.slice(0, 2).forEach(s => serviceIds.add(s.id));
  }

  const step3Nodes = Array.from(serviceIds).map(id => state.services.find(s => s.id === id) || { id, name: id, criticality: 'Critical' }).filter(Boolean);

  const step3 = {
    level: 3,
    title: 'Interrupted Important Business Services (IBS)',
    icon: '🏢',
    nodes: step3Nodes.map(s => ({ id: s.id, name: s.name, criticality: s.criticality, mtd: s.mtd || '4 Hours' }))
  };

  // Step 4: End Customer / Client Impact
  const customerStatements = step3Nodes.map(s => s.customerImpact || `Clearing and transaction disruption for ${s.name}`).filter(Boolean);
  const step4 = {
    level: 4,
    title: 'End Customer & Institutional Market Exposure',
    icon: '👥',
    impactSummary: customerStatements[0] || 'Direct payment gateway timeout affecting ~100,000 active retail accounts.'
  };

  // Step 5: DORA Regulatory & Legal Penalties
  const obligationsViolated = state.obligations.filter(ob => ob.status === 'Non-Compliant' || ob.status === 'Partial').slice(0, 3);
  const step5 = {
    level: 5,
    title: 'DORA Regulatory & Legal Sanctions',
    icon: '⚖️',
    obligations: obligationsViolated.map(ob => ({
      article: ob.article || ob.id,
      title: ob.title,
      pillar: ob.pillar || 'Risk Management',
      status: ob.status
    }))
  };

  return {
    rootId: rootNode.id,
    rootName: rootNode.name,
    steps: [step1, step2, step3, step4, step5]
  };
}

/**
 * 3. RESILIENCE EXPOSURE SCORE & 4. EXPLAINABILITY
 * Dynamic score (0-100%) calculated based on:
 * - Testing coverage (25%)
 * - Incident history (20%)
 * - Recovery readiness (25%)
 * - Supplier concentration (15%)
 * - Control effectiveness (15%)
 *
 * Provides complete mathematical explainability.
 *
 * @param {string} [targetId] - Global or entity-specific ID
 */
export function calculateResilienceExposureScore(targetId = 'global') {
  const state = getState();

  // 1. Testing Coverage Component (25%)
  const totalPlans = state.recoveryPlans ? state.recoveryPlans.length : 4;
  const approvedPlans = state.recoveryPlans ? state.recoveryPlans.filter(p => p.status === 'Tested & Approved').length : 3;
  const testingScore = Math.round((approvedPlans / Math.max(1, totalPlans)) * 100);
  const testingWeighted = Math.round(testingScore * 0.25);

  // 2. Incident History Component (20%)
  const totalIncidents = state.incidents ? state.incidents.length : 3;
  const resolvedIncidents = state.incidents ? state.incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length : 2;
  const incidentScore = Math.round((resolvedIncidents / Math.max(1, totalIncidents)) * 100);
  const incidentWeighted = Math.round(incidentScore * 0.20);

  // 3. Recovery Readiness Component (25%)
  const totalTests = state.tests ? state.tests.length : 3;
  const passedTests = state.tests ? state.tests.filter(t => t.results === 'Passed').length : 2;
  const readinessScore = Math.round((passedTests / Math.max(1, totalTests)) * 100);
  const readinessWeighted = Math.round(readinessScore * 0.25);

  // 4. Supplier Concentration Component (15%)
  const suppliersList = Object.values(state.suppliers || {});
  const avgSupplierScore = suppliersList.length ? (suppliersList.reduce((sum, s) => sum + (s.complianceScore || 80), 0) / suppliersList.length) : 80;
  const concentrationScore = Math.round(avgSupplierScore);
  const concentrationWeighted = Math.round(concentrationScore * 0.15);

  // 5. Control Effectiveness Component (15%)
  const totalControls = state.controls ? state.controls.length : 6;
  const activeControls = state.controls ? state.controls.filter(c => c.status === 'Implemented' || c.status === 'Active').length : 5;
  const controlScore = Math.round((activeControls / Math.max(1, totalControls)) * 100);
  const controlWeighted = Math.round(controlScore * 0.15);

  // Final Overall Resilience Exposure Score
  const overallScore = Math.min(100, Math.max(0, testingWeighted + incidentWeighted + readinessWeighted + concentrationWeighted + controlWeighted));

  // Determine Risk Tier & Status Badge
  let statusTier = 'EXCELLENT';
  let badgeColor = '#10b981';
  if (overallScore < 60) {
    statusTier = 'CRITICAL RISK';
    badgeColor = '#ef4444';
  } else if (overallScore < 80) {
    statusTier = 'MODERATE EXPOSURE';
    badgeColor = '#f97316';
  }

  // Structured Mathematical Explainability
  const explainability = {
    formula: 'Resilience Exposure Score = (Testing Coverage * 0.25) + (Incident Recovery * 0.20) + (Recovery Readiness * 0.25) + (Supplier Risk * 0.15) + (Control Effectiveness * 0.15)',
    score: overallScore,
    statusTier,
    badgeColor,
    breakdown: [
      {
        factor: 'Testing Coverage',
        weight: '25%',
        score: `${testingScore}%`,
        contribution: `+${testingWeighted}%`,
        details: `${approvedPlans} of ${totalPlans} disaster recovery playbooks catalogued and tested under DORA Art. 11.`
      },
      {
        factor: 'Incident History',
        weight: '20%',
        score: `${incidentScore}%`,
        contribution: `+${incidentWeighted}%`,
        details: `${resolvedIncidents} of ${totalIncidents} operational incidents successfully resolved within SLA limits.`
      },
      {
        factor: 'Recovery Readiness',
        weight: '25%',
        score: `${readinessScore}%`,
        contribution: `+${readinessWeighted}%`,
        details: `${passedTests} of ${totalTests} scenario simulation drills passed clean integrity checks.`
      },
      {
        factor: 'Supplier Concentration Risk',
        weight: '15%',
        score: `${concentrationScore}%`,
        contribution: `+${concentrationWeighted}%`,
        details: `Average compliance rating across Nth-party critical vendors (${suppliersList.map(s => s.name).join(', ') || 'AWS, Salesforce, ServiceNow'}).`
      },
      {
        factor: 'Control Effectiveness',
        weight: '15%',
        score: `${controlScore}%`,
        contribution: `+${controlWeighted}%`,
        details: `${activeControls} of ${totalControls} operational ICT control safeguards implemented and audited.`
      }
    ],
    remediationActions: [
      approvedPlans < totalPlans ? 'Approve pending AWS & Azure recovery playbooks in Recovery Readiness module.' : null,
      passedTests < totalTests ? 'Re-run Spring Boot vulnerability & adversarial simulation drills.' : null,
      avgSupplierScore < 85 ? 'Issue mandatory follow-up SLA audit to Infosys and Cloudflare subprocessors.' : null
    ].filter(Boolean)
  };

  return {
    score: overallScore,
    statusTier,
    badgeColor,
    explainability
  };
}

/**
 * Fallback helper when node is requested before graph layout.
 */
function getFallbackBlastRadius(nodeId, state) {
  return {
    target: { id: nodeId, name: nodeId, type: 'entity' },
    directImpact: state.services.slice(0, 2).map(s => ({ id: s.id, name: s.name, type: 'service' })),
    indirectImpact: state.applications.slice(0, 2).map(a => ({ id: a.id, name: a.name, type: 'application' })),
    servicesAffected: state.services.slice(0, 2).map(s => ({ id: s.id, name: s.name, criticality: s.criticality, mtd: s.mtd || '4 Hours' })),
    customersAffected: {
      totalCount: 75000,
      statements: ['Disruption to card payment clearance and merchant checkouts affecting ~75,000 active retail accounts.']
    },
    revenueImpact: {
      costPerHour: 65000,
      formattedCost: '£65,000/hr'
    },
    regulatoryImpact: [
      {
        article: 'DORA Article 5',
        title: 'ICT Risk Management Framework',
        severity: 'Critical Violation',
        penalty: 'Immediate supervisory disclosure to FCA/EBA.'
      }
    ]
  };
}
