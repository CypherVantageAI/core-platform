// ==========================================================================
// Cypher Vantage - Contextual Pane Help Module (ES6 Module)
// ==========================================================================

import { showModal } from '../components/ui.js';

const PANE_HELP_GUIDES = {
  dashboard: {
    title: '📊 Executive Resilience Dashboard - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Real-time corporate resilience indexing, compliance scores across global operations, and automated board briefing exports.
        </div>
        
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Executive Cockpit Cards:</strong> Displays Overall Resilience Index (94.8%), Recovery Readiness, DORA Alignment, and Supplier Risk Scores.</li>
            <li><strong>Board Pack One-Click Export:</strong> Download full executive briefing packs in PDF or PPTX format.</li>
            <li><strong>Services Exceeding Impact Tolerance:</strong> Alerts on critical IBS/CIS services where RTO recovery limits exceed SLA targets.</li>
            <li><strong>Major Incidents Feed:</strong> Live stream of active simulated and real-world threat events affecting core transactions.</li>
          </ul>
        </div>
      </div>
    `
  },

  resilience: {
    title: '🛡️ Operational Resilience & DORA Cockpit - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Map Important Business Services (IBS), Critical Internal Services (CIS), run digital twin simulations, and execute DORA drills.
        </div>
        
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Business Services Registry:</strong> Register and edit IBS/CIS services, set MTD/RTO tolerances, and assign service owners.</li>
            <li><strong>Global Threat Map & Feed:</strong> Interactive geospatial map tracking live data centers, BGP routing threats, and regional power outages.</li>
            <li><strong>Digital Resilience Twin:</strong> Graph-based dependency visualization showing live connections between business services, cloud infrastructure, and suppliers.</li>
            <li><strong>Scenario Simulation Drills:</strong> Trigger ransomware failover tests or AWS regional outages to measure financial loss mitigation (£).</li>
          </ul>
        </div>
      </div>
    `
  },

  dora: {
    title: '📜 DORA Regulatory Compliance - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Audit operational safeguards across the 5 regulatory pillars of the EU Digital Operational Resilience Act (DORA).
        </div>
        
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Pillar 1 (ICT Risk Management):</strong> Mitigate threats across cloud and data center boundaries.</li>
            <li><strong>Pillar 2 (Incident Management):</strong> Log, classify, and submit DORA Article 19 major incident reports.</li>
            <li><strong>Pillar 3 (Resilience Testing):</strong> Threat-Led Penetration Testing (TLPT) and Breach & Attack Simulations (BAS).</li>
            <li><strong>Pillar 4 (Third-Party Risk):</strong> Sub-contractor auditing and Information Register reporting.</li>
          </ul>
        </div>
      </div>
    `
  },

  risk: {
    title: '⚠️ ICT Operational Risk Register - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Continuous ICT risk identification, likelihood matrices, and automated threat mitigation tracking.
        </div>
        
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Risk Register Table:</strong> Filter risks by severity (Critical, High, Medium) and status.</li>
            <li><strong>Mitigation Workflows:</strong> Assign mitigation actions to technical owners and track target resolution dates.</li>
            <li><strong>AI Threat Intelligence:</strong> Automated risk score updates based on real-time vulnerability feeds.</li>
          </ul>
        </div>
      </div>
    `
  },

  thirdparty: {
    title: '🌐 Nth-Party Concentration & Risk - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Monitor vendor risk tiers, compliance scores, and 4th/5th party subcontractor chains.
        </div>
        
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Monitored Vendors Directory:</strong> View compliance ratings, primary/secondary support locations, and active control gaps.</li>
            <li><strong>Subcontractor Transparency:</strong> Unpack Nth-party dependency trees (e.g. AWS -> Infosys -> Salesforce).</li>
            <li><strong>Supplier Control Obligations:</strong> Enforce 15 Reference Control Modules on vendor contracts.</li>
          </ul>
        </div>
      </div>
    `
  },

  compliance: {
    title: '📊 Compliance Dashboard - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Global compliance analytics, control gap resolution tracking, and audit-ready reporting.
        </div>
        
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Metrics Grid:</strong> Real-time counts for vendor compliance rating, identified gaps, and active follow-up actions.</li>
            <li><strong>Regulatory Alignment:</strong> DORA, UK PRA SS2/21, and PCIDSS framework coverage tracking.</li>
            <li><strong>Activity Log:</strong> Live audit trail of changes, evidence uploads, and verification checks.</li>
          </ul>
        </div>
      </div>
    `
  }
};

export function showPaneHelp(paneKey) {
  const guide = PANE_HELP_GUIDES[paneKey] || {
    title: '❓ Contextual Module Guide',
    content: `<p style="color: var(--text-secondary);">Contextual documentation guide for this module.</p>`
  };
  
  showModal(guide.title, guide.content);
}

// Bind globally for inline HTML onclick handlers
if (typeof window !== 'undefined') {
  window.showPaneHelp = showPaneHelp;
}
