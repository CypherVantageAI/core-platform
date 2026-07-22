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
  },

  reports: {
    title: '📊 Simulation Compliance Reports - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Audit trail of all TIBER-EU Threat-Led Penetration Tests (TLPT), Breach and Attack Simulations (BAS), and DORA Article 11 drills.
        </div>
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Simulation Log:</strong> Filter completed tests by status, execution date, and impact radius.</li>
            <li><strong>Report Viewer:</strong> Generate one-click DORA Incident Notifications and export print-ready PDFs.</li>
            <li><strong>Compliance Proof:</strong> Export verified audit evidence for financial regulators and auditors.</li>
          </ul>
        </div>
      </div>
    `
  },

  obligations: {
    title: '📋 Supplier Control Obligations - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Browse the 15 Reference Control Modules derived from global compliance standards and supplier regulatory duties.
        </div>
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Control Accordion:</strong> Expand domain sections (Cyber, Data Management, Physical Security, EUDA, PCIDSS).</li>
            <li><strong>Contractual Mapping:</strong> Inspect mandatory evidence expectations for Tier 1 and Tier 2 suppliers.</li>
            <li><strong>Gap Auditing:</strong> Identify missing vendor attestations and trigger automated remediation requests.</li>
          </ul>
        </div>
      </div>
    `
  },

  navigator: {
    title: '🌐 IBS & CIS SLA Monitor - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Monitor vulnerability SLA windows (9h emergency, 24h critical, 48h elevated) across Important Business Services (IBS) and Critical Internal Services (CIS).
        </div>
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>SLA Risk Ribbon:</strong> Live counts for 9h emergency zero-days, 24h critical patches, and nominal SLA targets.</li>
            <li><strong>Services Registry & Filters:</strong> Filter IBS/CIS services by geographic region and SLA compliance status.</li>
            <li><strong>Dependency Blast Radius:</strong> Inspect tech stack vulnerability registers and Nth-party subcontractor chains.</li>
          </ul>
        </div>
      </div>
    `
  },

  collector: {
    title: '🤖 AI Evidence Collector - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Upload vendor SOC 2 and ISO 27001 documents to automatically parse control attestations and detect compliance gaps.
        </div>
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Document Parser:</strong> Drag-and-drop compliance PDFs for AI extraction of security controls.</li>
            <li><strong>Dynamic Questionnaire Dispatch:</strong> Dispatch targeted questionnaires to vendors based on missing evidence.</li>
            <li><strong>Evidence Hashing:</strong> Register parsed document hashes on the SHA-256 cryptographic ledger.</li>
          </ul>
        </div>
      </div>
    `
  },

  advisor: {
    title: '💬 AI Resilience Analyst - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Interact with the AI Copilot to query DORA regulatory requirements, query supplier risk postures, and draft remediation guidance.
        </div>
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Regulatory Assistant:</strong> Ask natural language questions regarding DORA Articles 6, 11, 19, and 26.</li>
            <li><strong>Vendor Risk Analysis:</strong> Request real-time compliance summaries and breach impact estimates for any vendor.</li>
            <li><strong>Quick Prompts:</strong> Use pre-configured shortcut buttons for instant audit briefings.</li>
          </ul>
        </div>
      </div>
    `
  },

  "ai-risk": {
    title: '🛡️ AI Security & Audit Suite - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Audit internal and third-party AI models for DLP leaks, prompt injection vulnerabilities, and EU AI Act compliance.
        </div>
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>LLM DLP Gateway:</strong> Real-time outbound prompt proxy sanitization for credentials and PII.</li>
            <li><strong>Adversarial Pentester:</strong> Run DAN jailbreak and prompt extraction simulations against LLM endpoints.</li>
            <li><strong>EU AI Act Classifier:</strong> Categorize vendor AI tools into legal risk tiers (Minimal, High, Prohibited).</li>
          </ul>
        </div>
      </div>
    `
  },

  actions: {
    title: '📋 Follow-up Action Center - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Track, draft, and issue official remediation notices to suppliers with outstanding control gaps.
        </div>
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Status Filters:</strong> Filter action items by Control Gaps, Awaiting Response, and Pending Review.</li>
            <li><strong>Communication Dispatch:</strong> Send automated email alerts and remediation tickets directly to vendor contacts.</li>
            <li><strong>Audit Log:</strong> Track historical response turnarounds and escalate unaddressed gaps.</li>
          </ul>
        </div>
      </div>
    `
  },

  inbox: {
    title: '⚠️ Urgent Actions Inbox - Contextual Guide',
    content: `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">
        <div style="background: rgba(6, 182, 212, 0.06); border-left: 3px solid var(--color-cyan); padding: 10px 14px; border-radius: 4px;">
          <strong style="color: var(--color-cyan); display: block; margin-bottom: 2px;">Core Objective:</strong>
          Review urgent supplier submissions for critical SLA vulnerability remediation plans and DORA Article 19 Root Cause Analyses (RCA).
        </div>
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 0.88rem;">💡 Key Features & Options</h4>
          <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <li><strong>Incoming Submissions:</strong> Inspect supplier RCA uploads, patch verifications, and mitigation requests.</li>
            <li><strong>SLA Countdown Tracking:</strong> Monitor active regulatory countdowns (9h, 24h, 48h) for emergency fixes.</li>
            <li><strong>Approval Workflow:</strong> Accept, reject, or request further evidence for incoming vendor remediations.</li>
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
