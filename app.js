// ==========================================================================
// Cypher Vantage - Core Application Logic
// ==========================================================================

// --------------------------------------------------------------------------
// 1. MOCK DATABASE STATE (15 Reference Control Modules Mapping)
// --------------------------------------------------------------------------
const state = {
  activePersona: 'manager', // 'manager' | 'supplier'
  activeSupplierId: 'aws',  // Currently active supplier for Supplier Portal
  
  suppliers: {
    'aws': {
      id: 'aws',
      name: 'Amazon Web Services (AWS)',
      riskTier: 'Critical',
      scoVersion: 'CV Framework',
      complianceScore: 80,
      status: 'Awaiting Response', // 'Compliant' | 'Awaiting Response' | 'Pending Review' | 'Gaps Identified'
      contactName: 'David Vance',
      contactEmail: 'compliance@aws.amazon.com',
      avatar: 'AWS',
      documents: [
        { name: 'AWS_SOC_2_Type_II_2025.pdf', type: 'SOC 2 Report', date: '2025-02-10', scanned: '2026-07-01', status: 'Valid' },
        { name: 'ISO_27001_Certificate_AWS.pdf', type: 'ISO Certificate', date: '2024-11-05', scanned: '2026-07-01', status: 'Valid' },
        { name: 'AWS_DR_Testing_Plan_2024.pdf', type: 'Resilience Evidence', date: '2024-05-12', scanned: '2026-07-01', status: 'Outdated' }
      ],
      assessments: [
        { id: 'c2.1', section: 'Section 5.0', title: 'Information & Cyber Security', requirement: 'Implement Multi-Factor Authentication (MFA) on all admin and customer access endpoints.', status: 'Met', document: 'AWS_SOC_2_Type_II_2025.pdf', snippet: 'MFA is enforced on all logical administrative consoles and API access gateways via hardware tokens or virtual authenticator systems (Page 24).' },
        { id: 'c3.1', section: 'Section 3.0', title: 'Data Management', requirement: 'Encrypt all Cypher Vantage tenant proprietary data at rest and in transit using cryptographic algorithms of AES-256 or higher.', status: 'Met', document: 'AWS_SOC_2_Type_II_2025.pdf', snippet: 'Data stored in EBS volumes, S3, and RDS is encrypted at rest using AES-256 via KMS keys managed by customer or AWS (Page 41).' },
        { id: 'c4.2', section: 'Section 13.0', title: 'Recovery Planning', requirement: 'Provide executive summaries of business continuity and disaster recovery tests conducted within the last 12 months.', status: 'Gap', document: 'AWS_DR_Testing_Plan_2024.pdf', snippet: 'Disaster recovery execution and failover testing successfully completed on October 14, 2024. Next scheduled test Q4 2025 (Outdated; current date is mid-2026).' },
        { id: 'c5.3', section: 'Section 14.0', title: 'Technology Risk Technical', requirement: 'Ensure all critical subcontractors are bound by non-disclosure agreements and undergo security evaluations equivalent to Cypher Vantage guidelines.', status: 'Met', document: 'AWS_SOC_2_Type_II_2025.pdf', snippet: 'AWS Third-Party Vendor management program conducts annual risk assessments and enforces master services NDAs for all sub-service organizations (Page 18).' },
        { id: 'c8.1', section: 'Section 8.0', title: 'PCIDSS Compliance', requirement: 'Provide annual certificate of compliance with the PCI DSS standard for payment tokenization systems.', status: 'Met', document: 'ISO_27001_Certificate_AWS.pdf', snippet: 'AWS is certified as a PCI DSS Level 1 Service Provider. Current Attestation of Compliance (AoC) is active through 2026.' }
      ],
      history: [
        { type: 'evidence-uploaded', title: 'SOC 2 Report Uploaded', body: 'AWS uploaded file AWS_SOC_2_Type_II_2025.pdf', user: 'David Vance (AWS)', date: '2025-02-10 14:32' },
        { type: 'action-raised', title: 'Assessment Run - Gap Identified', body: 'AI Auto-Collector detected outdated Recovery Planning evidence.', user: 'AI Risk Officer', date: '2026-07-01 09:12' },
        { type: 'action-raised', title: 'Follow-up Sent by Risk Manager', body: 'Sarah Jenkins requested 2025 DR testing report evidence.', user: 'Sarah Jenkins', date: '2026-07-01 10:15' }
      ]
    },
    'salesforce': {
      id: 'salesforce',
      name: 'Salesforce Inc.',
      riskTier: 'High',
      scoVersion: 'CV Framework',
      complianceScore: 100,
      status: 'Compliant',
      contactName: 'Elena Rostova',
      contactEmail: 'security@salesforce.com',
      avatar: 'SF',
      documents: [
        { name: 'SFDC_SOC_2_Type_II_2025.pdf', type: 'SOC 2 Report', date: '2025-03-01', scanned: '2026-07-02', status: 'Valid' },
        { name: 'Salesforce_BCP_ExecSummary_2025.pdf', type: 'Resilience Evidence', date: '2025-04-10', scanned: '2026-07-02', status: 'Valid' }
      ],
      assessments: [
        { id: 'c2.1', section: 'Section 5.0', title: 'Information & Cyber Security', requirement: 'Implement Multi-Factor Authentication (MFA) on all admin and customer access endpoints.', status: 'Met', document: 'SFDC_SOC_2_Type_II_2025.pdf', snippet: 'MFA is mandatory for all employee logins accessing infrastructure and customer production database environments (Page 19).' },
        { id: 'c3.1', section: 'Section 3.0', title: 'Data Management', requirement: 'Encrypt all Cypher Vantage tenant proprietary data at rest and in transit using cryptographic algorithms of AES-256 or higher.', status: 'Met', document: 'SFDC_SOC_2_Type_II_2025.pdf', snippet: 'Salesforce Shield Platform Encryption enables native tables to be encrypted at rest using AES-256 bit tenant secrets (Page 30).' },
        { id: 'c4.2', section: 'Section 13.0', title: 'Recovery Planning', requirement: 'Provide executive summaries of business continuity and disaster recovery tests conducted within the last 12 months.', status: 'Met', document: 'Salesforce_BCP_ExecSummary_2025.pdf', snippet: 'Salesforce Core Platform DR drill successfully conducted on March 18, 2025, demonstrating secondary site failover RTO under 4 hours (Page 3).' },
        { id: 'c5.3', section: 'Section 14.0', title: 'Technology Risk Technical', requirement: 'Ensure all critical subcontractors are bound by non-disclosure agreements and undergo security evaluations equivalent to Cypher Vantage guidelines.', status: 'Met', document: 'SFDC_SOC_2_Type_II_2025.pdf', snippet: 'Sub-processors undergo regular cyber audits and contractual alignment including standard contract clauses (SCCs) (Page 15).' },
        { id: 'c8.1', section: 'Section 8.0', title: 'PCIDSS Compliance', requirement: 'Provide annual certificate of compliance with the PCI DSS standard for payment tokenization systems.', status: 'Met', document: 'SFDC_SOC_2_Type_II_2025.pdf', snippet: 'Salesforce complies with PCIDSS standards for merchants, maintaining active SAQ-D merchant validation certificates.' }
      ],
      history: [
        { type: 'evidence-uploaded', title: 'SOC 2 & BCP Documents Scanned', body: 'AI Auto-Collector successfully scanned Salesforce files. 100% compliance verified.', user: 'AI Risk Officer', date: '2026-07-02 11:45' }
      ]
    },
    'infosys': {
      id: 'infosys',
      name: 'Infosys Limited',
      riskTier: 'High',
      scoVersion: 'CV Framework',
      complianceScore: 60,
      status: 'Gaps Identified',
      contactName: 'Rajesh Kumar',
      contactEmail: 'compliance_team@infosys.com',
      avatar: 'INF',
      documents: [
        { name: 'Infosys_Cyber_Policy_2025.pdf', type: 'Policy Document', date: '2025-01-15', scanned: '2026-07-03', status: 'Valid' }
      ],
      assessments: [
        { id: 'c2.1', section: 'Section 5.0', title: 'Information & Cyber Security', requirement: 'Implement Multi-Factor Authentication (MFA) on all admin and customer access endpoints.', status: 'Met', document: 'Infosys_Cyber_Policy_2025.pdf', snippet: 'MFA authentication via secure tokens is required for all developer terminals accessing client staging systems.' },
        { id: 'c3.1', section: 'Section 3.0', title: 'Data Management', requirement: 'Encrypt all Cypher Vantage tenant proprietary data at rest and in transit using cryptographic algorithms of AES-256 or higher.', status: 'Gap', document: 'Infosys_Cyber_Policy_2025.pdf', snippet: 'Encryption in transit is enforced; encryption of local staging databases at rest is configurable but not standard policy (Missing concrete AES-256 enforcement details).' },
        { id: 'c4.2', section: 'Section 13.0', title: 'Recovery Planning', requirement: 'Provide executive summaries of business continuity and disaster recovery tests conducted within the last 12 months.', status: 'Met', document: 'Infosys_Cyber_Policy_2025.pdf', snippet: 'Disaster recovery failover plans are tested semi-annually across global delivery centers, last completed Dec 2025.' },
        { id: 'c5.3', section: 'Section 14.0', title: 'Technology Risk Technical', requirement: 'Ensure all critical subcontractors are bound by non-disclosure agreements and undergo security evaluations equivalent to Cypher Vantage guidelines.', status: 'Gap', document: 'None', snippet: 'No evidence document uploaded for sub-contractor NDAs or flow-down compliance audits.' },
        { id: 'c8.1', section: 'Section 8.0', title: 'PCIDSS Compliance', requirement: 'Provide annual certificate of compliance with the PCI DSS standard for payment tokenization systems.', status: 'Met', document: 'Infosys_Cyber_Policy_2025.pdf', snippet: 'Infosys global services division maintains active PCI DSS Level 1 certification for processing networks.' }
      ],
      history: [
        { type: 'action-raised', title: 'Auto-Collector Assessment', body: 'AI Auto-Collector identified gaps in Data Management (encryption at rest) and Technology Risk (Subcontractors).', user: 'AI Risk Officer', date: '2026-07-03 16:30' }
      ]
    },
    'slack': {
      id: 'slack',
      name: 'Slack Technologies',
      riskTier: 'Medium',
      scoVersion: 'CV Framework',
      complianceScore: 100,
      status: 'Compliant',
      contactName: 'Marcus Aurelius',
      contactEmail: 'compliance@slack.com',
      avatar: 'SL',
      documents: [
        { name: 'Slack_SOC_3_Report_2025.pdf', type: 'SOC 2/3 Report', date: '2025-02-15', scanned: '2026-07-04', status: 'Valid' },
        { name: 'Slack_BCP_Failover_2025.pdf', type: 'Resilience Evidence', date: '2025-05-20', scanned: '2026-07-04', status: 'Valid' }
      ],
      assessments: [
        { id: 'c2.1', section: 'Section 5.0', title: 'Information & Cyber Security', requirement: 'Implement Multi-Factor Authentication (MFA) on all admin and customer access endpoints.', status: 'Met', document: 'Slack_SOC_3_Report_2025.pdf', snippet: 'SAML Single Sign-On and multi-factor authentication are mandatory for administration credentials (Page 12).' },
        { id: 'c3.1', section: 'Section 3.0', title: 'Data Management', requirement: 'Encrypt all Cypher Vantage tenant proprietary data at rest and in transit using cryptographic algorithms of AES-256 or higher.', status: 'Met', document: 'Slack_SOC_3_Report_2025.pdf', snippet: 'Customer data is encrypted at rest using AES-256 and in transit using TLS 1.2 or higher (Page 16).' },
        { id: 'c4.2', section: 'Section 13.0', title: 'Recovery Planning', requirement: 'Provide executive summaries of business continuity and disaster recovery tests conducted within the last 12 months.', status: 'Met', document: 'Slack_BCP_Failover_2025.pdf', snippet: 'Slack conducts automated multi-region DR drills quarterly. Last successful drill concluded May 14, 2025.' },
        { id: 'c5.3', section: 'Section 14.0', title: 'Technology Risk Technical', requirement: 'Ensure all critical subcontractors are bound by non-disclosure agreements and undergo security evaluations equivalent to Cypher Vantage guidelines.', status: 'Met', document: 'Slack_SOC_3_Report_2025.pdf', snippet: 'Slack reviews security postures of critical sub-processors on an annual basis.' },
        { id: 'c8.1', section: 'Section 8.0', title: 'PCIDSS Compliance', requirement: 'Provide annual certificate of compliance with the PCI DSS standard for payment tokenization systems.', status: 'Met', document: 'Slack_SOC_3_Report_2025.pdf', snippet: 'Payment gateways are hosted in PCI-compliant VPC infrastructure.' }
      ],
      history: [
        { type: 'evidence-uploaded', title: 'Quarterly Check Complete', body: 'AI Auto-Collector verified Slack certificates. 100% compliant.', user: 'AI Risk Officer', date: '2026-07-04 10:20' }
      ]
    },
    'acme': {
      id: 'acme',
      name: 'Acme Corp Solutions',
      riskTier: 'Low',
      scoVersion: 'CV Framework',
      complianceScore: 80,
      status: 'Compliant',
      contactName: 'Wile E. Coyote',
      contactEmail: 'wecoyote@acme.com',
      avatar: 'AC',
      documents: [
        { name: 'Acme_Security_Framework_v2.pdf', type: 'Policy Document', date: '2024-08-11', scanned: '2026-07-05', status: 'Valid' },
        { name: 'Acme_BCP_TestDoc_2025.pdf', type: 'Resilience Evidence', date: '2025-06-01', scanned: '2026-07-05', status: 'Valid' }
      ],
      assessments: [
        { id: 'c2.1', section: 'Section 5.0', title: 'Information & Cyber Security', requirement: 'Implement Multi-Factor Authentication (MFA) on all admin and customer access endpoints.', status: 'Met', document: 'Acme_Security_Framework_v2.pdf', snippet: 'Administrative controls require physical key cards or authenticator app confirmations.' },
        { id: 'c3.1', section: 'Section 3.0', title: 'Data Management', requirement: 'Encrypt all Cypher Vantage tenant proprietary data at rest and in transit using cryptographic algorithms of AES-256 or higher.', status: 'Met', document: 'Acme_Security_Framework_v2.pdf', snippet: 'Data stored on servers uses BitLocker hardware encryption (AES-256 equivalent).' },
        { id: 'c4.2', section: 'Section 13.0', title: 'Recovery Planning', requirement: 'Provide executive summaries of business continuity and disaster recovery tests conducted within the last 12 months.', status: 'Met', document: 'Acme_BCP_TestDoc_2025.pdf', snippet: 'Backup restore testing executed and verified on June 1, 2025.' },
        { id: 'c5.3', section: 'Section 14.0', title: 'Technology Risk Technical', requirement: 'Ensure all critical subcontractors are bound by non-disclosure agreements and undergo security evaluations equivalent to Cypher Vantage guidelines.', status: 'Gap', document: 'None', snippet: 'No subcontractor evaluation process exists (Deemed Acceptable risk due to Low risk classification of Acme Services).' },
        { id: 'c8.1', section: 'Section 8.0', title: 'PCIDSS Compliance', requirement: 'Provide annual certificate of compliance with the PCI DSS standard for payment tokenization systems.', status: 'Met', document: 'Acme_Security_Framework_v2.pdf', snippet: 'Acme services do not store, process, or transmit cardholder data.' }
      ],
      history: [
        { type: 'evidence-uploaded', title: 'Low Risk Exemption Logged', body: 'Subcontractor gap accepted by Risk Lead based on Low Tier risk posture.', user: 'Sarah Jenkins', date: '2026-07-05 14:15' }
      ]
    }
  },

  actions: [
    {
      id: 'act-001',
      supplierId: 'aws',
      domain: 'Resilience',
      controlId: 'c4.2',
      title: 'Outdated Disaster Recovery Testing Summary',
      gapDetails: 'Evidence file AWS_DR_Testing_Plan_2024.pdf dates from October 2024. Cypher Vantage Recovery Planning module requires evidence of annual testing within the last 12 months (Current date is July 2026).',
      status: 'Awaiting Response', // 'Open Gap' | 'Awaiting Response' | 'Pending Review' | 'Closed'
      dateCreated: '2026-07-01',
      emailDraft: `Dear AWS Compliance Team,

Our ongoing risk assurance program has reviewed your compliance data against Cypher Vantage Control Modules.

We identified a gap in the following control requirement:
Domain: Section 13.0 - Recovery Planning (Control 4.2)
Requirement: Supplier must provide evidence of annual disaster recovery and business continuity testing relevant to the systems hosting Cypher Vantage tenant data.

Gap details: Your uploaded Disaster Recovery Test Plan dates back to 2024. We require evidence of your calendar year 2025/2026 DR testing execution summary.

Please respond to this request and upload the updated documentation through the Cypher Vantage Supplier Portal as soon as possible.

Regards,
Sarah Jenkins
Third-Party Risk Assurance, Cypher Vantage Team`,
      responseMessage: '',
      responseAttachment: ''
    },
    {
      id: 'act-002',
      supplierId: 'infosys',
      domain: 'Data Management',
      controlId: 'c3.1',
      title: 'Staging Database Encryption Enforceability',
      gapDetails: 'Infosys_Cyber_Policy_2025.pdf does not clarify if staging databases hosting Cypher Vantage mock datasets are encrypted at rest using AES-256. Data Management module requires encryption of all client proprietary data.',
      status: 'Open Gap',
      dateCreated: '2026-07-03',
      emailDraft: '',
      responseMessage: '',
      responseAttachment: ''
    },
    {
      id: 'act-003',
      supplierId: 'infosys',
      domain: 'ICT Security',
      controlId: 'c5.3',
      title: 'Missing Monthly Vulnerability Scan Evidence',
      gapDetails: 'Infosys_Cyber_Policy_2025.pdf states that vulnerability scans are conducted quarterly. Cypher Vantage Cyber Security module requires monthly scanning on systems accessing tenant networks.',
      status: 'Open Gap',
      dateCreated: '2026-07-04',
      emailDraft: '',
      responseMessage: '',
      responseAttachment: ''
    },
    {
      id: 'act-004',
      supplierId: 'infosys',
      domain: 'Technology Risk',
      controlId: 'c14.1',
      title: 'Missing Subcontractor Evaluation Audits',
      gapDetails: 'No active subcontractor evaluation process exists. Technology Risk Technical module requires annual audits of key subcontractors handling downstream API services.',
      status: 'Open Gap',
      dateCreated: '2026-07-04',
      emailDraft: '',
      responseMessage: '',
      responseAttachment: ''
    },
    {
      id: 'act-005',
      supplierId: 'acme',
      domain: 'ICT Security',
      controlId: 'c5.3',
      title: 'Subcontractor Security Evaluation Gap',
      gapDetails: 'Acme Services has not submitted contract sign-offs or NDAs for subcontractors. Section 14.0 requires all downstream sub-processors to be bound by equivalent security guidelines.',
      status: 'Open Gap',
      dateCreated: '2026-07-05',
      emailDraft: '',
      responseMessage: '',
      responseAttachment: ''
    }
  ],

  activityLog: [
    { time: '14:22', text: 'Sarah Jenkins logged in as Risk Manager.' },
    { time: 'Yesterday', text: 'AWS compliance portal accessed by David Vance.' },
    { time: '02-Jul-2026', text: 'AI Auto-Collector completed scheduled scan on <b>Salesforce Inc.</b> -> 100% Compliant.' },
    { time: '01-Jul-2026', text: 'Action <b>act-001</b> sent to AWS (David Vance) by Sarah Jenkins.' },
    { time: '01-Jul-2026', text: 'AI Auto-Collector flagged Gap in <b>AWS</b>: Section 13.0 Recovery Planning outdated.' }
  ]
};

// --------------------------------------------------------------------------
// 2. CORE UTILITIES
// --------------------------------------------------------------------------
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getSupplierName(id) {
  return state.suppliers[id] ? state.suppliers[id].name : 'Unknown';
}

function getSupplierAvatar(id) {
  return state.suppliers[id] ? state.suppliers[id].avatar : '??';
}

// --------------------------------------------------------------------------
// 3. TAB NAVIGATION CONTROL
// --------------------------------------------------------------------------
window.switchTab = function(tabId) {
  // Hide all panes
  document.querySelectorAll('.content-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  
  // Show target pane
  const targetPane = document.getElementById(`view-${tabId}`);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  // Deactivate all nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  // Activate matching nav item
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeNav) {
    activeNav.classList.add('active');
  }

  // Reload tab specific views
  if (tabId === 'manager-dashboard') {
    renderDashboard();
  } else if (tabId === 'manager-suppliers') {
    renderSuppliersTable();
  } else if (tabId === 'manager-actions') {
    renderManagerActions();
  } else if (tabId === 'manager-obligations') {
    renderSCOAccordion();
  } else if (tabId === 'supplier-dashboard') {
    renderSupplierPortalDashboard();
  } else if (tabId === 'supplier-evidence') {
    renderSupplierVaultTable();
  } else if (tabId === 'supplier-obligations') {
    renderSCOAccordion();
  }
};

// --------------------------------------------------------------------------
// 4. PERSONA / ROLE SWITCHER
// --------------------------------------------------------------------------
window.setPersona = function(persona) {
  state.activePersona = persona;
  
  const btnManager = document.getElementById('btn-persona-manager');
  const btnSupplier = document.getElementById('btn-persona-supplier');
  const navManager = document.getElementById('nav-group-manager');
  const navSupplier = document.getElementById('nav-group-supplier');
  const supplierSelector = document.getElementById('supplier-selector-container');
  const userRoleText = document.getElementById('user-role-name');
  const userAvatar = document.querySelector('.user-avatar');

  if (persona === 'manager') {
    btnManager.classList.add('active');
    btnSupplier.classList.remove('active');
    navManager.classList.remove('hidden');
    navSupplier.classList.add('hidden');
    supplierSelector.classList.add('hidden');
    userRoleText.innerText = 'Sarah Jenkins';
    userAvatar.innerText = 'RM';
    userAvatar.style.background = 'var(--gradient-accent)';
    
    switchTab('manager-dashboard');
  } else {
    btnManager.classList.remove('active');
    btnSupplier.classList.add('active');
    navManager.classList.add('hidden');
    navSupplier.classList.remove('hidden');
    supplierSelector.classList.remove('hidden');
    
    // Populate active supplier switcher
    populateSupplierPortalSwitcher();
    updateSupplierPortalIdentity();
    switchTab('supplier-dashboard');
  }
};

function populateSupplierPortalSwitcher() {
  const select = document.getElementById('active-supplier-select');
  select.innerHTML = '';
  Object.keys(state.suppliers).forEach(key => {
    const s = state.suppliers[key];
    const option = document.createElement('option');
    option.value = s.id;
    option.text = s.name;
    if (s.id === state.activeSupplierId) option.selected = true;
    select.appendChild(option);
  });
}

window.changeActiveSupplier = function(supplierId) {
  state.activeSupplierId = supplierId;
  updateSupplierPortalIdentity();
  renderSupplierPortalDashboard();
  renderSupplierVaultTable();
};

function updateSupplierPortalIdentity() {
  const supplier = state.suppliers[state.activeSupplierId];
  const userRoleText = document.getElementById('user-role-name');
  const userAvatar = document.querySelector('.user-avatar');
  
  userRoleText.innerText = `${supplier.contactName} (${supplier.avatar})`;
  userAvatar.innerText = supplier.avatar.slice(0, 2);
  userAvatar.style.backgroundColor = '#10b981';
  
  document.getElementById('supplier-portal-title').innerText = `Supplier Operations Console - ${supplier.name}`;
}

// --------------------------------------------------------------------------
// 5. MANAGER VIEW: OVERVIEW DASHBOARD
// --------------------------------------------------------------------------
function renderDashboard() {
  const suppliersList = Object.values(state.suppliers);
  const totalCount = suppliersList.length;
  
  let totalScoreSum = 0;
  suppliersList.forEach(s => {
    totalScoreSum += s.complianceScore;
  });

  const avgCompliance = Math.round(totalScoreSum / totalCount);
  
  const gapCount = state.actions.filter(a => a.status === 'Open Gap').length;
  const awaitingResponseCount = state.actions.filter(a => a.status === 'Awaiting Response').length;
  
  document.getElementById('stat-total-suppliers').innerText = totalCount;
  document.getElementById('stat-compliance-avg').innerText = `${avgCompliance}%`;
  document.getElementById('stat-pending-gaps').innerText = gapCount;
  document.getElementById('stat-active-followups').innerText = awaitingResponseCount;
  document.getElementById('badge-actions-count').innerText = awaitingResponseCount;

  // Render recent activity logs
  const logContainer = document.getElementById('recent-activity-log');
  logContainer.innerHTML = '';
  state.activityLog.slice(0, 5).forEach(log => {
    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = `
      <div class="log-time">${log.time}</div>
      <div class="log-details">
        <p>${log.text}</p>
      </div>
    `;
    logContainer.appendChild(item);
  });
}

// --------------------------------------------------------------------------
// 6. MANAGER VIEW: SUPPLIERS DIRECTORY
// --------------------------------------------------------------------------
function renderSuppliersTable() {
  const tbody = document.getElementById('suppliers-table-body');
  tbody.innerHTML = '';

  Object.values(state.suppliers).forEach(s => {
    const gapCount = s.assessments.filter(a => a.status === 'Gap').length;
    let statusClass = 'badge-success';
    if (s.status === 'Awaiting Response') statusClass = 'badge-warning';
    if (s.status === 'Pending Review') statusClass = 'badge-accent';
    if (s.status === 'Gaps Identified') statusClass = 'badge-danger';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="flex-align-center gap-2">
          <div class="user-avatar-sm" style="background: var(--gradient-accent)">${s.avatar}</div>
          <div>
            <span class="table-supplier-name">${s.name}</span>
            <small class="block text-muted">${s.contactEmail}</small>
          </div>
        </div>
      </td>
      <td><span class="badge ${s.riskTier === 'Critical' ? 'badge-danger' : s.riskTier === 'High' ? 'badge-warning' : 'badge-accent'}">${s.riskTier}</span></td>
      <td><span class="text-secondary">${s.scoVersion}</span></td>
      <td><span class="table-score ${s.complianceScore === 100 ? 'text-success' : s.complianceScore >= 75 ? 'text-accent' : 'text-danger'}">${s.complianceScore}%</span></td>
      <td><span class="text-secondary font-semibold">${gapCount} Gaps</span></td>
      <td><span class="badge ${statusClass}">${s.status}</span></td>
      <td>
        <button class="btn btn-secondary py-1 px-3 text-xs" onclick="openSupplierModal('${s.id}')">Review Assessment</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.filterSuppliersTable = function() {
  const query = document.getElementById('supplier-search-input').value.toLowerCase();
  const filter = document.getElementById('supplier-risk-filter').value;
  const tbody = document.getElementById('suppliers-table-body');
  const rows = tbody.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const nameText = row.getElementsByClassName('table-supplier-name')[0].innerText.toLowerCase();
    const riskBadge = row.getElementsByClassName('badge')[0].innerText;
    
    const matchesSearch = nameText.includes(query);
    const matchesRisk = filter === 'all' || riskBadge === filter;

    if (matchesSearch && matchesRisk) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  }
};

// --------------------------------------------------------------------------
// 7. SUPPLIER COMPLIANCE MODAL
// --------------------------------------------------------------------------
let currentModalSupplierId = '';

window.openSupplierModal = function(supplierId) {
  currentModalSupplierId = supplierId;
  const s = state.suppliers[supplierId];
  if (!s) return;

  document.getElementById('modal-supplier-name').innerText = s.name;
  document.getElementById('modal-supplier-risk').innerText = `${s.riskTier} Risk Tier`;
  document.getElementById('modal-compliance-score').innerText = `${s.complianceScore}%`;
  document.getElementById('modal-sco-version').innerText = s.scoVersion;
  
  const metCount = s.assessments.filter(a => a.status === 'Met').length;
  const totalCount = s.assessments.length;
  document.getElementById('modal-met-controls').innerText = `${metCount} / ${totalCount}`;
  document.getElementById('modal-unmet-controls').innerText = totalCount - metCount;

  // Toggle modal button depending on status
  const btnAction = document.getElementById('modal-btn-action');
  if (s.status === 'Pending Review') {
    btnAction.innerText = 'Review & Verify Response';
  } else if (s.assessments.some(a => a.status === 'Gap')) {
    btnAction.innerText = 'Generate Action Follow-up';
  } else {
    btnAction.innerText = 'Assessment Completed';
    btnAction.disabled = true;
  }

  // Populate assessments list
  const listContainer = document.getElementById('modal-obligations-list');
  listContainer.innerHTML = '';
  s.assessments.forEach(a => {
    const card = document.createElement('div');
    card.className = 'obligation-detail-card';
    
    let statusBadge = `<span class="badge badge-success">Module Met</span>`;
    if (a.status === 'Gap') {
      statusBadge = `<span class="badge badge-danger">Control Gap</span>`;
    }

    let hashHtml = '';
    if (a.document !== 'None') {
      const docObj = s.documents.find(d => d.name === a.document);
      if (docObj) {
        const hash = getDocHash(docObj);
        const intStatus = docObj.integrityStatus || 'unverified';
        let statusText = '<span style="color: var(--text-muted);">Not Verified</span>';
        if (intStatus === 'verified') statusText = '<span style="color: var(--color-success); font-weight:600;">Secure Ledger Verified</span>';
        else if (intStatus === 'tampered') statusText = '<span style="color: var(--color-danger); font-weight:600;">TAMPER WARNING</span>';
        
        hashHtml = `
          <div class="mt-2 pt-2 text-xs font-mono text-muted flex-align-center gap-2" style="border-top: 1px solid rgba(255,255,255,0.03);">
            <span>SHA-256: ${hash.slice(0, 16)}...${hash.slice(-8)}</span> | 
            <span>Status: ${statusText}</span>
          </div>
        `;
      }
    }

    card.innerHTML = `
      <div class="obligation-detail-header">
        <span class="obligation-section-tag">${a.section}</span>
        ${statusBadge}
      </div>
      <p class="obligation-text">${a.title}</p>
      <small class="block text-muted mt-1">Requirement: ${a.requirement}</small>
      
      <div class="evidence-block">
        <div class="evidence-header">
          <span class="evidence-filename">
            <svg class="icon-sm" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/></svg>
            ${a.document !== 'None' ? a.document : 'No Evidence File Mapped'}
          </span>
          <span>Verified via Cypher Vantage AI Scan</span>
        </div>
        <p class="evidence-snippet">"${a.snippet}"</p>
        ${hashHtml}
      </div>
    `;
    listContainer.appendChild(card);
  });

  // Populate history audit log
  const auditContainer = document.getElementById('modal-audit-history-container');
  auditContainer.innerHTML = '';
  s.history.forEach(h => {
    const item = document.createElement('div');
    item.className = `audit-item ${h.type}`;
    item.innerHTML = `
      <div class="audit-meta">
        <span>By ${h.user}</span>
        <span>${h.date}</span>
      </div>
      <div class="audit-title">${h.title}</div>
      <div class="audit-body">${h.body}</div>
    `;
    auditContainer.appendChild(item);
  });

  // Initialize weights for this modal
  initRiskModelWeights(supplierId);

  switchModalTab('assessment');
  document.getElementById('supplier-detail-modal').classList.remove('hidden');
};

window.closeSupplierModal = function() {
  document.getElementById('supplier-detail-modal').classList.add('hidden');
};

window.switchModalTab = function(tabName) {
  document.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.modal-tab-view').forEach(view => view.classList.remove('active'));

  document.getElementById(`modal-tab-${tabName}`).classList.add('active');
  document.getElementById(`modal-view-${tabName}`).classList.add('active');
};

window.triggerModalAction = function() {
  closeSupplierModal();
  const s = state.suppliers[currentModalSupplierId];
  
  if (s.status === 'Pending Review') {
    switchTab('manager-actions');
  } else {
    const gap = s.assessments.find(a => a.status === 'Gap');
    if (gap) {
      openFollowupModal(currentModalSupplierId, gap.id);
    }
  }
};

// --------------------------------------------------------------------------
// 8. FOLLOW-UP DRAFT MODAL
// --------------------------------------------------------------------------
let activeDraftSupplierId = '';
let activeDraftControlId = '';

window.openFollowupModal = function(supplierId, controlId) {
  activeDraftSupplierId = supplierId;
  activeDraftControlId = controlId;
  
  const s = state.suppliers[supplierId];
  const c = s.assessments.find(a => a.id === controlId);
  const action = state.actions.find(a => a.supplierId === supplierId && a.controlId === controlId);

  document.getElementById('draft-email-to').value = s.contactEmail;
  document.getElementById('draft-email-subject').value = `Action Required: Cypher Vantage Control Gap - ${s.name}`;
  
  if (action && action.emailDraft) {
    document.getElementById('draft-email-body').value = action.emailDraft;
  } else {
    const body = `Dear ${s.name} Compliance Team,

Our ongoing risk assurance program has evaluated your uploaded evidence against the Cypher Vantage Control Framework.

We have identified a gap in compliance for:
Section: ${c.section} - ${c.title}
Requirement: ${c.requirement}

AI Audit Scan Findings: ${c.snippet}

Please access the Cypher Vantage Supplier Portal, review this action item, and upload updated documentation supporting your compliance statement.

Regards,
Sarah Jenkins
Third-Party Risk Assurance, Cypher Vantage Team`;
    document.getElementById('draft-email-body').value = body;
  }

  document.getElementById('followup-draft-modal').classList.remove('hidden');
};

window.closeFollowupModal = function() {
  document.getElementById('followup-draft-modal').classList.add('hidden');
};

window.sendFollowupEmail = function() {
  const body = document.getElementById('draft-email-body').value;
  const s = state.suppliers[activeDraftSupplierId];
  const c = s.assessments.find(a => a.id === activeDraftControlId);

  let action = state.actions.find(a => a.supplierId === activeDraftSupplierId && a.controlId === activeDraftControlId);
  if (action) {
    action.status = 'Awaiting Response';
    action.emailDraft = body;
  } else {
    action = {
      id: `act-${Math.floor(Math.random() * 900) + 100}`,
      supplierId: activeDraftSupplierId,
      domain: c.title.split(' ')[0],
      controlId: activeDraftControlId,
      title: `Gap in ${c.title}`,
      gapDetails: `AI Audit Scan Flagged: ${c.snippet}`,
      status: 'Awaiting Response',
      dateCreated: formatDate(new Date()),
      emailDraft: body,
      responseMessage: '',
      responseAttachment: ''
    };
    state.actions.push(action);
  }

  s.status = 'Awaiting Response';
  s.history.unshift({
    type: 'action-raised',
    title: 'Follow-up Sent by Risk Manager',
    body: `Sarah Jenkins dispatched email regarding ${c.section} compliance request.`,
    user: 'Sarah Jenkins',
    date: `${formatDate(new Date())} ${new Date().toTimeString().slice(0, 5)}`
  });

  state.activityLog.unshift({
    time: 'Just Now',
    text: `Action email dispatched to <b>${s.name}</b> regarding control gap: ${c.title}.`
  });

  closeFollowupModal();
  renderDashboard();
  renderSuppliersTable();
  renderManagerActions();
  
  showNotification('Follow-up successfully dispatched to supplier.');
};

function showNotification(msg) {
  const notif = document.createElement('div');
  notif.style.position = 'fixed';
  notif.style.bottom = '20px';
  notif.style.right = '20px';
  notif.style.background = 'var(--gradient-accent)';
  notif.style.color = '#fff';
  notif.style.padding = '12px 24px';
  notif.style.borderRadius = 'var(--border-radius-md)';
  notif.style.boxShadow = '0 4px 15px rgba(139,92,246,0.3)';
  notif.style.zIndex = '9999';
  notif.style.fontWeight = '600';
  notif.style.animation = 'fadeIn 0.2s ease-out';
  notif.innerText = msg;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => notif.remove(), 200);
  }, 3000);
}

// --------------------------------------------------------------------------
// 9. MANAGER VIEW: ACTION FOLLOW-UPS CENTER
// --------------------------------------------------------------------------
let activeActionsFilter = 'all';

window.filterActions = function(filter, element) {
  activeActionsFilter = filter;
  document.querySelectorAll('.filter-pill').forEach(pill => pill.classList.remove('active'));
  
  if (element) {
    element.classList.add('active');
  } else {
    const pills = document.querySelectorAll('.filter-pill');
    let targetIndex = 0;
    if (filter === 'gap') targetIndex = 1;
    else if (filter === 'awaiting') targetIndex = 2;
    else if (filter === 'review') targetIndex = 3;
    if (pills[targetIndex]) {
      pills[targetIndex].classList.add('active');
    }
  }
  renderManagerActions();
};

function renderManagerActions() {
  const container = document.getElementById('manager-actions-list-container');
  container.innerHTML = '';

  let filteredActions = state.actions;
  if (activeActionsFilter === 'gap') {
    filteredActions = state.actions.filter(a => a.status === 'Open Gap');
  } else if (activeActionsFilter === 'awaiting') {
    filteredActions = state.actions.filter(a => a.status === 'Awaiting Response');
  } else if (activeActionsFilter === 'review') {
    filteredActions = state.actions.filter(a => a.status === 'Pending Review');
  }

  if (filteredActions.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-muted font-medium">No actions matching filter criteria.</div>`;
    return;
  }

  filteredActions.forEach(act => {
    const s = state.suppliers[act.supplierId];
    const c = s.assessments.find(as => as.id === act.controlId);
    
    let statusClass = 'badge-danger';
    if (act.status === 'Awaiting Response') statusClass = 'badge-warning';
    if (act.status === 'Pending Review') statusClass = 'badge-accent';
    if (act.status === 'Closed') statusClass = 'badge-success';

    const card = document.createElement('div');
    card.className = 'action-card';
    
    let actionButtons = '';
    if (act.status === 'Open Gap') {
      actionButtons = `<button class="btn btn-primary" onclick="openFollowupModal('${act.supplierId}', '${act.controlId}')">Generate Follow-up</button>`;
    } else if (act.status === 'Awaiting Response') {
      actionButtons = `
        <span class="text-secondary text-xs italic mb-2">Sent ${act.dateCreated}</span>
        <button class="btn btn-secondary" onclick="openFollowupModal('${act.supplierId}', '${act.controlId}')">Resend Request</button>
      `;
    } else if (act.status === 'Pending Review') {
      actionButtons = `
        <button class="btn btn-primary" onclick="approveSupplierResponse('${act.id}')">Approve response</button>
        <button class="btn btn-secondary mt-2" onclick="rejectSupplierResponse('${act.id}')">Request revisions</button>
      `;
    }

    let supplierResponseHTML = '';
    if (act.status === 'Pending Review' && act.responseMessage) {
      supplierResponseHTML = `
        <div class="supplier-response-box">
          <div class="supplier-response-header">
            <span>Supplier Response Submitted</span>
            <span>Awaiting Review</span>
          </div>
          <div class="supplier-response-body">
            "${act.responseMessage}"
          </div>
          <div class="supplier-response-attachment">
            <svg class="icon-sm" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/></svg>
            <span>Attached Document: <b>${act.responseAttachment}</b></span>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="action-info">
        <span class="supplier-tag">${s.name} (Risk Tier: ${s.riskTier})</span>
        <h4>${act.title}</h4>
        <p>${act.gapDetails}</p>
        <span class="clause-tag">Target: CV ${c.section}</span>
        ${supplierResponseHTML}
      </div>
      <div class="action-controls">
        <span class="badge ${statusClass} mb-2">${act.status}</span>
        ${actionButtons}
      </div>
    `;
    
    container.appendChild(card);
  });
}

window.approveSupplierResponse = function(actionId) {
  const act = state.actions.find(a => a.id === actionId);
  const s = state.suppliers[act.supplierId];
  const c = s.assessments.find(a => a.id === act.controlId);

  c.status = 'Met';
  c.document = act.responseAttachment;
  c.snippet = `Supplier certified compliance via manual upload: "${act.responseMessage.slice(0, 100)}..."`;
  
  const metCount = s.assessments.filter(a => a.status === 'Met').length;
  s.complianceScore = Math.round((metCount / s.assessments.length) * 100);

  act.status = 'Closed';
  const activeGaps = s.assessments.some(a => a.status === 'Gap');
  s.status = activeGaps ? 'Gaps Identified' : 'Compliant';

  s.history.unshift({
    type: 'evidence-uploaded',
    title: 'Evidence Verified & Approved',
    body: `Sarah Jenkins verified response. File ${act.responseAttachment} approved. Control ${c.section} marked Met.`,
    user: 'Sarah Jenkins',
    date: `${formatDate(new Date())} ${new Date().toTimeString().slice(0, 5)}`
  });

  state.activityLog.unshift({
    time: 'Just Now',
    text: `Sarah Jenkins approved <b>${s.name}</b> response for control: ${c.title}.`
  });

  state.actions = state.actions.filter(a => a.id !== actionId);

  renderDashboard();
  renderManagerActions();
  showNotification('Supplier response approved. Score updated!');
};

window.rejectSupplierResponse = function(actionId) {
  const act = state.actions.find(a => a.id === actionId);
  const s = state.suppliers[act.supplierId];

  act.status = 'Awaiting Response';
  act.gapDetails += ` [Revision Requested]: Submitted evidence was insufficient. Need full test report.`;

  s.history.unshift({
    type: 'action-raised',
    title: 'Response Rejected - Revisions Needed',
    body: `Sarah Jenkins rejected submitted response. Re-requesting compliance details.`,
    user: 'Sarah Jenkins',
    date: `${formatDate(new Date())} ${new Date().toTimeString().slice(0, 5)}`
  });

  renderManagerActions();
  showNotification('Supplier response rejected. Re-request sent.');
};

// --------------------------------------------------------------------------
// 10. AI OBLIGATIONS AUTO-COLLECTOR SIMULATION
// --------------------------------------------------------------------------
function updateCollectorDocumentsList(supplierId) {
  const s = state.suppliers[supplierId];
  const listContainer = document.getElementById('collector-files-list');
  listContainer.innerHTML = '';
  
  if (!s) return;

  s.documents.forEach(doc => {
    const item = document.createElement('div');
    item.className = 'vault-file-item';
    
    let badgeClass = 'badge-success';
    if (doc.status === 'Outdated') badgeClass = 'badge-warning';

    item.innerHTML = `
      <div class="vault-file-info">
        <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/></svg>
        <span>${doc.name}</span>
      </div>
      <span class="badge ${badgeClass}">${doc.status}</span>
    `;
    listContainer.appendChild(item);
  });
}

function updateCollectorDropdown() {
  const select = document.getElementById('collector-target-supplier');
  select.innerHTML = '';
  Object.values(state.suppliers).forEach(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.text = s.name;
    select.appendChild(option);
  });
  updateCollectorDocumentsList(select.value);
}

window.runAutoCollector = function() {
  const supplierId = document.getElementById('collector-target-supplier').value;
  const s = state.suppliers[supplierId];
  const terminal = document.getElementById('collector-terminal-logs');
  const startBtn = document.getElementById('btn-start-collector');
  const statusBadge = document.getElementById('collector-status-badge');
  const resultsCard = document.getElementById('collector-results-card');

  if (!s) return;

  terminal.innerHTML = '';
  resultsCard.classList.add('hidden');
  startBtn.disabled = true;
  statusBadge.className = 'terminal-badge running';
  statusBadge.innerText = 'Analyzing';

  const logs = [
    { text: 'Starting Cypher Vantage AI assessment engine...', type: 'info' },
    { text: `Target supplier: ${s.name}`, type: 'info' },
    { text: 'Target framework: Cypher Vantage 15 Control Modules', type: 'info' },
    { text: 'Accessing secure supplier document vault...', type: 'info' },
    ...s.documents.flatMap(doc => [
      { text: `Initiating file parsing: ${doc.name}`, type: 'info' },
      { text: `Extracting semantic structure via AI OCR...`, type: 'info' },
      { text: `Matching document content against Cypher Vantage modules...`, type: 'info' }
    ]),
    { text: 'Performing automated gap checking...', type: 'info' },
    { text: 'Evaluating Module: Information & Cyber Security (PDF 535KB)...', type: 'info' },
    { text: 'Check result: [MFA policy active] - Verified.', type: 'success' },
    { text: 'Evaluating Module: Data Management (PDF 156KB)...', type: 'info' },
    ... (supplierId === 'infosys' ? [
      { text: 'Check result: [Encryption-at-rest details missing on Local Staging Db] - Gap Detected!', type: 'warning' }
    ] : [
      { text: 'Check result: [AES-256 enabled on stored volumes] - Verified.', type: 'success' }
    ]),
    { text: 'Evaluating Module: Recovery Planning (PDF 234KB)...', type: 'info' },
    ... (supplierId === 'aws' ? [
      { text: 'Check result: [Last DR failover test summary is older than 12-month requirement limit] - Outdated Evidence Detected!', type: 'warning' }
    ] : [
      { text: 'Check result: [DR test report active for current cycle] - Verified.', type: 'success' }
    ]),
    { text: 'Evaluating Module: Technology Risk Technical (PDF 127KB)...', type: 'info' },
    ... (supplierId === 'infosys' ? [
      { text: 'Check result: [Subcontractor audit and NDA documentation missing] - Gap Detected!', type: 'warning' }
    ] : [
      { text: 'Check result: [Sub-processors annually verified and contractually bound] - Verified.', type: 'success' }
    ]),
    { text: 'Finalizing assessment gap analysis report...', type: 'info' },
    { text: 'Auto-Collector processing complete. Report compiled.', type: 'success' }
  ];

  let logIndex = 0;
  function printLog() {
    if (logIndex < logs.length) {
      const lineObj = logs[logIndex];
      const lineSpan = document.createElement('div');
      const time = new Date().toTimeString().slice(0, 8);
      
      let colorClass = 'term-line-info';
      if (lineObj.type === 'success') colorClass = 'term-line-success';
      if (lineObj.type === 'warning') colorClass = 'term-line-warning';

      lineSpan.innerHTML = `<span class="term-line-time">[${time}]</span> <span class="${colorClass}">${lineObj.text}</span>`;
      terminal.appendChild(lineSpan);
      terminal.scrollTop = terminal.scrollHeight;
      
      logIndex++;
      setTimeout(printLog, 300);
    } else {
      startBtn.disabled = false;
      statusBadge.className = 'terminal-badge';
      statusBadge.innerText = 'Completed';
      
      renderCollectorResults(supplierId);
    }
  }

  printLog();
};

function renderCollectorResults(supplierId) {
  const resultsCard = document.getElementById('collector-results-card');
  const resultsContainer = document.getElementById('collector-parsed-results');
  resultsContainer.innerHTML = '';
  
  const s = state.suppliers[supplierId];
  if (!s) return;

  const gaps = s.assessments.filter(a => a.status === 'Gap');
  
  if (gaps.length === 0) {
    resultsContainer.innerHTML = `
      <div class="p-4 text-center text-success font-semibold">
        No compliance gaps identified. All checked obligations match current evidence criteria under Cypher Vantage modules.
      </div>
    `;
  } else {
    gaps.forEach(gap => {
      const item = document.createElement('div');
      item.className = 'result-gap-item';
      item.innerHTML = `
        <div class="gap-meta">
          <span class="gap-domain">${gap.section} - ${gap.title}</span>
          <span class="badge badge-danger">Control Gap</span>
        </div>
        <p class="gap-desc">Requirement: ${gap.requirement}</p>
        <div class="gap-evidence-snippet">
          <strong>Flagged content:</strong> "${gap.snippet}"
        </div>
        <div class="mt-3 flex gap-2">
          <button class="btn btn-primary py-1 px-3 text-xs" onclick="openFollowupModal('${s.id}', '${gap.id}')">Follow-up with Supplier</button>
        </div>
      `;
      resultsContainer.appendChild(item);
    });
  }

  resultsCard.classList.remove('hidden');
}

// --------------------------------------------------------------------------
// 11. SUPPLIER PORTAL VIEW: PORTAL DASHBOARD
// --------------------------------------------------------------------------
function renderSupplierPortalDashboard() {
  const container = document.getElementById('supplier-pending-actions-list');
  container.innerHTML = '';

  const s = state.suppliers[state.activeSupplierId];
  if (!s) return;

  const sActions = state.actions.filter(a => a.supplierId === state.activeSupplierId && a.status !== 'Closed');

  const circle = document.getElementById('supplier-radial-progress');
  const pctText = document.getElementById('supplier-percentage-text');
  const statusBadge = document.getElementById('supplier-overall-status');

  const score = s.complianceScore;
  pctText.innerText = `${score}%`;
  
  const offset = 251.2 - (251.2 * score / 100);
  circle.style.strokeDashoffset = offset;

  if (score === 100) {
    statusBadge.className = 'badge badge-success';
    statusBadge.innerText = 'Compliant';
  } else if (score >= 75) {
    statusBadge.className = 'badge badge-accent';
    statusBadge.innerText = 'Action Needed';
  } else {
    statusBadge.className = 'badge badge-danger';
    statusBadge.innerText = 'High Risk Gaps';
  }

  if (sActions.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-muted font-medium">No active compliance action requests found. Your account is fully aligned.</div>`;
    return;
  }

  sActions.forEach(act => {
    const card = document.createElement('div');
    card.className = 'action-card';

    let actionFormHTML = '';
    if (act.status === 'Awaiting Response') {
      actionFormHTML = `
        <div class="supplier-response-form-box mt-3" id="form-container-${act.id}">
          <div class="form-group">
            <label for="resp-msg-${act.id}">Response Statement</label>
            <textarea id="resp-msg-${act.id}" class="textarea-input mt-1" rows="3" placeholder="Provide details on how this gap has been addressed..."></textarea>
          </div>
          
          <div class="form-group mt-3">
            <label>Upload Supporting Evidence Document</label>
            <div class="file-upload-simulated" onclick="triggerSimulatedFileUpload('${act.id}')">
              <svg viewBox="0 0 24 24"><path d="M19 13h-6V7h-2v6H5v2h6v6h2v-6h6z" fill="currentColor"/></svg>
              <span>Click to simulate uploading PDF evidence</span>
            </div>
            <div id="file-indicator-${act.id}" class="uploaded-filename-indicator hidden">
              <span>Selected: <b id="filename-${act.id}">None</b></span>
              <button class="btn btn-secondary py-0 px-2" style="height: 20px" onclick="clearSimulatedFileUpload('${act.id}')">Remove</button>
            </div>
          </div>

          <button class="btn btn-primary mt-3 py-1 px-4" onclick="submitResponseToManager('${act.id}')">Submit Evidence</button>
        </div>
      `;
    } else if (act.status === 'Pending Review') {
      actionFormHTML = `
        <div class="supplier-response-box mt-3">
          <div class="supplier-response-header">
            <span>Evidence Submitted</span>
            <span>Awaiting Verification</span>
          </div>
          <p class="supplier-response-body">"${act.responseMessage}"</p>
          <div class="supplier-response-attachment mt-2">
            <svg class="icon-sm" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/></svg>
            <span>Attached file: <b>${act.responseAttachment}</b></span>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="action-info" style="grid-column: 1 / span 2;">
        <span class="badge badge-danger mb-1">Response Requested</span>
        <h4>${act.title}</h4>
        <p>${act.gapDetails}</p>
        
        <div class="email-copy-box mt-3 p-3 bg-secondary rounded border" style="background-color: rgba(0,0,0,0.2)">
          <small class="block text-muted font-bold">MESSAGE FROM SARAH JENKINS (CYPHER VANTAGE RISK LEAD):</small>
          <p class="text-xs mt-1 text-secondary" style="white-space: pre-wrap;">${act.emailDraft}</p>
        </div>

        ${actionFormHTML}
      </div>
    `;

    container.appendChild(card);
  });
}

let simulatedUploads = {};

window.triggerSimulatedFileUpload = function(actionId) {
  const act = state.actions.find(a => a.id === actionId);
  const s = state.suppliers[act.supplierId];
  
  let fakeFileName = `${s.avatar}_DR_Failover_Execution_Report_2025.pdf`;
  if (act.controlId === 'c3.1') fakeFileName = `${s.avatar}_StagingDb_EncryptionKeys_Policy.pdf`;
  if (act.controlId === 'c5.3') fakeFileName = `${s.avatar}_Subcontractor_Assurance_Matrix_2025.pdf`;

  simulatedUploads[actionId] = fakeFileName;

  document.getElementById(`filename-${actionId}`).innerText = fakeFileName;
  document.getElementById(`file-indicator-${actionId}`).classList.remove('hidden');
};

window.clearSimulatedFileUpload = function(actionId) {
  delete simulatedUploads[actionId];
  document.getElementById(`file-indicator-${actionId}`).classList.add('hidden');
};

window.submitResponseToManager = function(actionId) {
  const msg = document.getElementById(`resp-msg-${actionId}`).value;
  const attachment = simulatedUploads[actionId];
  
  if (!msg) {
    alert('Please enter a response statement.');
    return;
  }
  if (!attachment) {
    alert('Please attach a supporting evidence document.');
    return;
  }

  const act = state.actions.find(a => a.id === actionId);
  const s = state.suppliers[act.supplierId];

  act.status = 'Pending Review';
  act.responseMessage = msg;
  act.responseAttachment = attachment;

  s.documents.unshift({
    name: attachment,
    type: 'Evidence Upload',
    date: formatDate(new Date()),
    scanned: 'Pending Review',
    status: 'Valid'
  });

  s.status = 'Pending Review';

  s.history.unshift({
    type: 'response-submitted',
    title: 'Response Statement Submitted',
    body: `Supplier response: "${msg}". Supporting evidence file ${attachment} uploaded.`,
    user: `${s.contactName} (${s.name})`,
    date: `${formatDate(new Date())} ${new Date().toTimeString().slice(0, 5)}`
  });

  state.activityLog.unshift({
    time: 'Just Now',
    text: `Supplier <b>${s.name}</b> submitted compliance evidence for control: ${act.title}.`
  });

  renderSupplierPortalDashboard();
  renderSupplierVaultTable();
  showNotification('Evidence submitted to Cypher Vantage Risk Officer.');
};

// --------------------------------------------------------------------------
// 12. SUPPLIER PORTAL VIEW: DOCUMENT VAULT
// --------------------------------------------------------------------------
function renderSupplierVaultTable() {
  const tbody = document.getElementById('supplier-vault-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const s = state.suppliers[state.activeSupplierId];
  if (!s) return;

  s.documents.forEach(doc => {
    let badgeClass = 'badge-success';
    if (doc.status === 'Outdated') badgeClass = 'badge-warning';

    const hash = getDocHash(doc);
    const intStatus = doc.integrityStatus || 'unverified';
    
    let verifyBadgeHtml = `<span class="verify-badge unverified">Not Verified</span>`;
    if (intStatus === 'checking') {
      verifyBadgeHtml = `<span class="verify-badge scanning">Verifying...</span>`;
    } else if (intStatus === 'verified') {
      verifyBadgeHtml = `<span class="verify-badge verified">Hash Verified</span>`;
    } else if (intStatus === 'tampered') {
      verifyBadgeHtml = `<span class="verify-badge tampered">Hash Mismatch</span>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="flex-align-center gap-2">
          <svg class="icon-sm text-accent" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/></svg>
          <div>
            <strong>${doc.name}</strong>
            <small class="block hash-text mt-1">SHA-256: ${hash.slice(0, 16)}...${hash.slice(-8)}</small>
          </div>
        </div>
      </td>
      <td><span class="text-secondary">${doc.type}</span></td>
      <td><span class="text-secondary">${doc.date}</span></td>
      <td><span class="text-secondary">${doc.scanned}</span></td>
      <td><span class="badge ${badgeClass}">${doc.status}</span></td>
      <td>
        <div class="flex-align-center gap-2" style="display: flex; align-items: center; gap: 8px;">
          ${verifyBadgeHtml}
          <button class="btn btn-secondary py-1 px-2 text-xs" onclick="verifyFileIntegrity('${doc.name}')">Verify</button>
          <button class="btn btn-danger py-1 px-2 text-xs" style="background: rgba(239,68,68,0.15); border: 1px solid var(--color-danger); color: var(--color-danger);" onclick="simulateTampering('${doc.name}')">Tamper</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.simulateFileUpload = function() {
  const s = state.suppliers[state.activeSupplierId];
  const input = prompt("Enter simulated document name (e.g. AWS_PenTestSummary_2025.pdf):");
  if (!input) return;

  s.documents.unshift({
    name: input,
    type: 'Manual Evidence',
    date: formatDate(new Date()),
    scanned: 'Never Scanned',
    status: 'Valid'
  });

  s.history.unshift({
    type: 'evidence-uploaded',
    title: 'Evidence Uploaded Manual File',
    body: `File ${input} successfully uploaded. Ready for AI scanning.`,
    user: `${s.contactName} (${s.name})`,
    date: `${formatDate(new Date())} ${new Date().toTimeString().slice(0, 5)}`
  });

  renderSupplierVaultTable();
  showNotification('File successfully uploaded to Vault.');
};

// --------------------------------------------------------------------------
// 13. SUPPLIER PORTAL VIEW: OBLIGATION REFERENCES (15 Modules Mapping)
// --------------------------------------------------------------------------
const scoContent = [
  { 
    section: '1.0 Accessibility', 
    content: 'Ensures digital offerings and vendor delivery platforms align with global Web Content Accessibility Guidelines (WCAG 2.1 AA) supporting inclusive access.', 
    regulatoryMapping: 'European Accessibility Act (EAA), US Section 508, and WCAG 2.1 AA.',
    items: ['Verify screen-reader compatibility.', 'Provide accessibility reports annually.'] 
  },
  { 
    section: '2.0 Complaints Management', 
    content: 'Outlines standard operation workflows for logging, investigating, and resolving tenant grievances or system complaints.', 
    regulatoryMapping: 'UK FCA DISP (Complaints Sourcebook) and ISO 10002 Quality Management.',
    items: ['Log complaints within 48 hours.', 'Track resolution metrics.'] 
  },
  { 
    section: '3.0 Data Management', 
    content: 'Core criteria for classifying, labeling, tracking, and protecting client data sets throughout their operational lifecycle.', 
    regulatoryMapping: 'EU GDPR Article 32 (Security of Processing), UK DPA 2018, and ISO 27001 Annex A.8.',
    items: ['Strict data classification standards.', 'AES-256 bit database encryption.'] 
  },
  { 
    section: '4.0 EUDA (End User Developed Applications)', 
    content: 'Mandates registration, security audits, and risk control tracking for custom spreadsheets or local code tools executing critical math models.', 
    regulatoryMapping: 'UK PRA SS2/21 (Operational Resilience) and Sarbanes-Oxley Act (SOX) Section 404.',
    items: ['Enforce model validation checks.', 'Maintain inventory of all EUDA assets.'] 
  },
  { 
    section: '5.0 Information & Cyber Security', 
    content: 'Outlines compulsory technical safeguard controls: firewalls, intrusion detection, penetration testing, and vulnerability remediation cycles.', 
    regulatoryMapping: 'EU DORA Articles 6 & 7 (ICT Risk Framework), ISO 27001 Annex A.12, and NIST CSF v1.1.',
    items: ['Mandatory MFA on admin portals.', 'Monthly vulnerability scans.'] 
  },
  { 
    section: '6.0 Management Framework', 
    content: 'Criteria for supplier internal executive governance, policy reviews, and security accountability roles.', 
    regulatoryMapping: 'EU DORA Article 5 (Governance and Organisation) and UK PRA SS2/21 Chapter 3.',
    items: ['Annual executive policy sign-off.', 'Dedicated InfoSec Officer assigned.'] 
  },
  { 
    section: '7.0 Payments Process', 
    content: 'Governance standards around wire transfers, batch settlements, payment authorization matrix controls, and segregation of roles.', 
    regulatoryMapping: 'EU PSD2 (Payment Services Directive), ISO 20022, and FCA Payment Services Regulations.',
    items: ['Segregation of maker/checker roles.', 'Verify payment endpoint security.'] 
  },
  { 
    section: '8.0 PCIDSS', 
    content: 'Technical security requirements for systems storing, processing, or transmitting credit cardholder data elements.', 
    regulatoryMapping: 'PCI DSS v4.0 (12 core security domains).',
    items: ['Annual Attestation of Compliance (AoC).', 'Enforced encryption for card data.'] 
  },
  { 
    section: '9.0 People Screening', 
    content: 'Enforces pre-employment vetting, background checks, credit evaluations, and security clearance criteria for third-party personnel.', 
    regulatoryMapping: 'ISO 27001 Annex A.7 (HR Security) and BS 7858 Screening Standard.',
    items: ['Criminal record background checks.', 'Verify education and credentials.'] 
  },
  { 
    section: '10.0 Physical Security', 
    content: 'Technical physical boundaries: biometric data center entries, badge checks, video surveillance logs, and visitor escorts.', 
    regulatoryMapping: 'ISO 27001 Annex A.11 (Physical Security) and NIST SP 800-53 (Physical Protection).',
    items: ['24/7 CCTV surveillance logs.', 'Biometric entry checks on server cages.'] 
  },
  { 
    section: '11.0 Premises Power Resilience', 
    content: 'Enforces electrical redundancies: Uninterruptible Power Supplies (UPS), backup diesel generator test cycles, and multi-feed power sources.', 
    regulatoryMapping: 'EU DORA Article 11 (Business Continuity & DR) and ISO 22301.',
    items: ['Backup generators tested quarterly.', 'RTO for power failure under 5 seconds.'] 
  },
  { 
    section: '12.0 Records Management', 
    content: 'Mandated storage duration parameters, archival policies, and secure shredding methods for corporate data.', 
    regulatoryMapping: 'EU GDPR Article 5(1)(e) (Storage Limitation) and SEC Rule 17a-4.',
    items: ['7-year financial record archive.', 'Secure physical/digital data shredding.'] 
  },
  { 
    section: '13.0 Recovery Planning', 
    content: 'Requires disaster recovery plans, annual regional failover drills, and system backup testing frequencies (DORA compatible).', 
    regulatoryMapping: 'EU DORA Articles 11 & 12 (Resiliency Testing) and UK PRA SS2/21 Chapter 7.',
    items: ['Failover test summary submitted annually.', 'Backup recovery testing verified.'] 
  },
  { 
    section: '14.0 Technology Risk Technical', 
    content: 'Focuses on sub-processor evaluation protocols, source code secure build pipelines, and API integrations audit guidelines.', 
    regulatoryMapping: 'EU DORA Article 30 (Contractual Provisions) and UK PRA SS2/21 Chapter 5.',
    items: ['Contractual flow-down to subcontractors.', 'Source code security scans.'] 
  },
  { 
    section: '15.0 Transaction Operations', 
    content: 'Operational guidelines for logging and auditing general system transactions, settling batch transfers, and handling processing exceptions.', 
    regulatoryMapping: 'EU PSD2 Article 95 (Security Management) and ISO 20022 Transaction Standards.',
    items: ['Maintain untampered transaction log trails.', 'Exception queues cleared daily.'] 
  }
];

function renderSCOAccordion() {
  const containers = ['sco-accordion-container-manager', 'sco-accordion-container-supplier'];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = '';

    scoContent.forEach((sco, idx) => {
      const item = document.createElement('div');
      item.className = `accordion-item ${idx === 0 ? 'active' : ''}`;
      
      const itemsList = sco.items.map(it => `<li>${it}</li>`).join('');

      item.innerHTML = `
        <button class="accordion-trigger" onclick="toggleAccordion(event)">
          <h4>${sco.section}</h4>
          <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/></svg>
        </button>
        <div class="accordion-content" style="${idx === 0 ? 'max-height: 500px;' : ''}">
          <div class="accordion-body">
            <p>${sco.content}</p>
            <div class="reg-mapping-box mt-3 mb-3 p-2" style="background: rgba(255,255,255,0.02); border-left: 2px solid var(--color-accent); border-radius: 4px; font-size: 0.85rem;">
              <span style="color: var(--color-accent); font-weight: 600;">Regulatory Alignment:</span> ${sco.regulatoryMapping}
            </div>
            <ul class="mt-2">
              ${itemsList}
            </ul>
          </div>
        </div>
      `;
      container.appendChild(item);
    });
  });
}

window.toggleAccordion = function(e) {
  const item = e.currentTarget.closest('.accordion-item');
  const isActive = item.classList.contains('active');
  
  document.querySelectorAll('.accordion-item').forEach(el => {
    el.classList.remove('active');
    el.querySelector('.accordion-content').style.maxHeight = '0';
  });

  if (!isActive) {
    item.classList.add('active');
    const content = item.querySelector('.accordion-content');
    content.style.maxHeight = '500px';
  }
};

// --------------------------------------------------------------------------
// 14. RISK MANAGER ADVISOR CHATBOT ENGINE
// --------------------------------------------------------------------------
window.handleAdvisorChatKeyPress = function(event) {
  if (event.key === 'Enter') {
    sendAdvisorChatMessage();
  }
};

window.sendAdvisorChatMessage = function() {
  const input = document.getElementById('advisor-user-input');
  const query = input.value.trim();
  if (!query) return;

  appendChatBubble('user', query);
  input.value = '';

  setTimeout(() => {
    const response = generateAIAdvisorResponse(query);
    appendChatBubble('agent', response);
  }, 600);
};

window.triggerPresetQuery = function(query) {
  appendChatBubble('user', query);
  setTimeout(() => {
    const response = generateAIAdvisorResponse(query);
    appendChatBubble('agent', response);
  }, 600);
};

function appendChatBubble(role, text) {
  const chatMessages = document.getElementById('advisor-chat-messages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  
  const avatar = role === 'user' ? '👩‍💼' : '🤖';
  bubble.innerHTML = `
    <div class="bubble-avatar">${avatar}</div>
    <div class="bubble-text">
      ${text}
    </div>
  `;
  
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIAdvisorResponse(query) {
  const lowercase = query.toLowerCase();
  
  if (lowercase.includes('changes') || lowercase.includes('recovery planning') || lowercase.includes('power resilience')) {
    return `
      <p><strong>Cypher Vantage Control Framework</strong> maps 15 core modules for comprehensive third-party audits. Regarding resilience:</p>
      <ul>
        <li><strong>Recovery Planning (Section 13.0):</strong> Mandates annual failover drills. If a supplier fails to run active failover drills in the last 12 months (e.g., AWS's outdated 2024 testing status), it creates a compliance gap under EU DORA standards.</li>
        <li><strong>Premises Power Resilience (Section 11.0):</strong> Enforces Uninterruptible Power Supply (UPS) backup coverage and diesel generator test logs, ensuring datacenters hosting critical systems maintain electrical redundancies.</li>
      </ul>
    `;
  }
  
  if (lowercase.includes('dora') || lowercase.includes('resilience') || lowercase.includes('financial resilience')) {
    return `
      <p>Under the EU's <strong>Digital Operational Resilience Act (DORA)</strong>, financial systems must map and mitigate ICT risk.</p>
      <p>Cypher Vantage aligns with DORA requirements via three key modules:</p>
      <ul>
        <li><strong>Section 13.0 (Recovery Planning):</strong> Demands yearly business resilience simulation testing.</li>
        <li><strong>Section 14.0 (Technology Risk Technical):</strong> Requires auditing of subcontracting chains. If a supplier fails to audit sub-processors (like Infosys's current Gap), this triggers DORA compliance alarms.</li>
      </ul>
      <p>Currently, <strong>Salesforce</strong> and <strong>Slack</strong> are fully compliant, while <strong>AWS</strong> has an active Recovery Planning gap.</p>
    `;
  }

  if (lowercase.includes('draft') && (lowercase.includes('aws') || lowercase.includes('escalation'))) {
    return `
      <p>I have drafted a high-priority escalation email regarding AWS's missing resilience evidence:</p>
      <div class="p-3 bg-secondary rounded mt-2 border text-xs" style="font-family: monospace; white-space: pre-wrap;">
Subject: URGENT ESCALATION: Recovery Planning Compliance Audit - AWS Account (Cypher Vantage)

Dear AWS Compliance Director,

Our risk monitoring system, Cypher Vantage, indicates that AWS has not provided verified evidence of disaster recovery failover testing for environments processing our staging database assets.

This violates Section 13.0 (Recovery Planning) of our Control Framework and operational resilience expectations.

Please upload the executive summary of your latest failover test drill within 5 business days, or submit a written escalation.

Regards,
Sarah Jenkins
Risk Director, Cypher Vantage Compliance Team
      </div>
    `;
  }

  if (lowercase.includes('subcontractor') || lowercase.includes('technology risk')) {
    return `
      <p><strong>Section 14.0 (Technology Risk Technical)</strong> outlines subcontractor flow-down obligations:</p>
      <ol>
        <li><strong>Contractual Flow-down:</strong> Security terms, NDAs, and audit logs must be contractually enforced downstream to secondary suppliers.</li>
        <li><strong>Audit Mandates:</strong> Suppliers must run security checks on subcontractors annually.</li>
      </ol>
      <p><strong>Status warning:</strong> Infosys has an active gap in Section 14.0 due to missing subcontractor audit reports.</p>
    `;
  }

  return `
    <p>I understand you are asking about: <em>"${query}"</em>.</p>
    <p>As the Cypher Vantage Risk Officer, I can help you check compliance state, review our 15 control modules, or draft communications.</p>
    <p>Try asking about <strong>"Recovery Planning and Power Resilience"</strong>, <strong>"DORA compliance"</strong>, or <strong>"Infosys subcontractor gaps"</strong>.</p>
  `;
}

// --------------------------------------------------------------------------
// 15. ATTACK SURFACE DATA & LOGIC (Continuous Attack Surface Mapping Showcase)
// --------------------------------------------------------------------------
const supplierSurfaceData = {
  aws: {
    assets: [
      { name: 'aws.amazon.com', type: 'Primary Domain', status: 'Secure' },
      { name: 'console.aws.amazon.com', type: 'Management Portal', status: 'Secure' },
      { name: 's3.amazonaws.com', type: 'Storage Bucket API', status: 'Secure' }
    ],
    ports: [
      { num: '80 (HTTP)', status: 'Closed (Redirect)' },
      { num: '443 (HTTPS)', status: 'Closed (Secure)' },
      { num: '22 (SSH)', status: 'Closed (Secure)' },
      { num: '3389 (RDP)', status: 'Closed (Secure)' }
    ]
  },
  salesforce: {
    assets: [
      { name: 'salesforce.com', type: 'Primary Domain', status: 'Secure' },
      { name: 'login.salesforce.com', type: 'SAML Portal', status: 'Secure' }
    ],
    ports: [
      { num: '80 (HTTP)', status: 'Closed (Redirect)' },
      { num: '443 (HTTPS)', status: 'Closed (Secure)' },
      { num: '22 (SSH)', status: 'Closed (Secure)' },
      { num: '3389 (RDP)', status: 'Closed (Secure)' }
    ]
  },
  infosys: {
    assets: [
      { name: 'infosys.com', type: 'Primary Domain', status: 'Secure' },
      { name: 'staging.infosys-tprm.com', type: 'Staging Database Host', status: 'Vulnerable' }
    ],
    ports: [
      { num: '80 (HTTP)', status: 'Open (Insecure)', isGap: true },
      { num: '443 (HTTPS)', status: 'Closed (Secure)' },
      { num: '22 (SSH)', status: 'Closed (Secure)' },
      { num: '3389 (RDP)', status: 'Open (Risk!)', isGap: true }
    ]
  },
  slack: {
    assets: [
      { name: 'slack.com', type: 'Primary Domain', status: 'Secure' },
      { name: 'api.slack.com', type: 'API Gateway', status: 'Secure' }
    ],
    ports: [
      { num: '80 (HTTP)', status: 'Closed (Redirect)' },
      { num: '443 (HTTPS)', status: 'Closed (Secure)' },
      { num: '22 (SSH)', status: 'Closed (Secure)' },
      { num: '3389 (RDP)', status: 'Closed (Secure)' }
    ]
  },
  acme: {
    assets: [
      { name: 'acme.org', type: 'Primary Domain', status: 'Secure' },
      { name: 'mail.acme.org', type: 'Mail Server Host', status: 'Secure' }
    ],
    ports: [
      { num: '80 (HTTP)', status: 'Closed (Redirect)' },
      { num: '443 (HTTPS)', status: 'Closed (Secure)' },
      { num: '22 (SSH)', status: 'Open (Vulnerable)', isGap: true },
      { num: '3389 (RDP)', status: 'Closed (Secure)' }
    ]
  }
};

window.initAttackSurfaceView = function(supplierId) {
  const data = supplierSurfaceData[supplierId];
  if (!data) return;

  // Render assets
  const assetContainer = document.getElementById('surface-assets-list');
  if (assetContainer) {
    assetContainer.innerHTML = '';
    data.assets.forEach(asset => {
      const div = document.createElement('div');
      div.className = 'asset-item';
      div.innerHTML = `
        <span>${asset.name}</span>
        <span class="badge ${asset.status === 'Secure' ? 'badge-success' : 'badge-danger'}">${asset.status}</span>
      `;
      assetContainer.appendChild(div);
    });
  }

  // Render ports
  const portContainer = document.getElementById('surface-ports-grid');
  if (portContainer) {
    portContainer.innerHTML = '';
    data.ports.forEach(port => {
      const div = document.createElement('div');
      div.className = 'port-item';
      div.innerHTML = `
        <span>Port ${port.num}</span>
        <span class="port-status-badge closed">Closed</span>
      `;
      portContainer.appendChild(div);
    });
  }

  // Reset logs
  const statusBadge = document.getElementById('surface-scan-status');
  if (statusBadge) {
    statusBadge.innerText = 'Idle';
    statusBadge.className = 'terminal-badge';
  }
  const scanLogs = document.getElementById('surface-scan-logs');
  if (scanLogs) {
    scanLogs.innerHTML = `
      <span class="terminal-placeholder">Select a supplier above and click "Initiate External Port & SSL Scan" to run real-time footprint discovery.</span>
    `;
  }
};

window.addCustomScanTarget = function() {
  const supplierId = document.getElementById('collector-target-supplier').value;
  const urlInput = document.getElementById('custom-target-url');
  const typeSelect = document.getElementById('custom-target-type');
  
  if (!urlInput || !urlInput.value.trim()) {
    alert('Please enter a target URL or IP address.');
    return;
  }
  
  const url = urlInput.value.trim();
  const type = typeSelect.value;
  const data = supplierSurfaceData[supplierId];
  
  if (data) {
    if (data.assets.some(a => a.name.toLowerCase() === url.toLowerCase())) {
      alert('Target already exists in the scan inventory.');
      return;
    }
    
    let status = 'Secure';
    if (url.includes('insecure') || url.includes('dev') || url.includes('staging') || url.includes('vulnerable')) {
      status = 'Vulnerable';
    }
    
    data.assets.push({
      name: url,
      type: type,
      status: status
    });
    
    initAttackSurfaceView(supplierId);
    urlInput.value = '';
    showNotification(`Added scan target: ${url} (${type})`);
  }
};

window.discoverInternalEndpoints = function() {
  const supplierId = document.getElementById('collector-target-supplier').value;
  const data = supplierSurfaceData[supplierId];
  if (!data) return;

  const statusBadge = document.getElementById('surface-scan-status');
  if (statusBadge) {
    statusBadge.innerText = 'Discovering';
    statusBadge.className = 'terminal-badge running';
  }

  const logBody = document.getElementById('surface-scan-logs');
  if (logBody) {
    logBody.innerHTML = '';
  }

  const logs = [
    { text: '[SYSTEM] Initiating internal subnetwork discovery scan...', delay: 100 },
    { text: '[SYSTEM] Scanning local subnet mask 10.140.0.0/16 via VPN router...', delay: 400 },
    { text: `[DISCOVERY] Requesting DNS zone transfers for internal zone *.${supplierId}-local.net...`, delay: 800 },
    { text: '[DISCOVERY] Checking routing tables and active IP leases...', delay: 1200 }
  ];

  const privateEndpoints = {
    aws: [
      { name: 'internal-auth.aws.net', type: 'VPN Endpoint', status: 'Secure' },
      { name: 'api-staging.aws-internal.net', type: 'Internal Host', status: 'Secure' }
    ],
    salesforce: [
      { name: 'prod-sandbox.salesforce.net', type: 'API Gateway', status: 'Secure' },
      { name: 'int-vpn.salesforce-private.org', type: 'VPN Endpoint', status: 'Secure' }
    ],
    infosys: [
      { name: 'dev-db.infosys-corp.internal', type: 'Internal Host', status: 'Vulnerable' },
      { name: 'corp-vpn.infosys.internal', type: 'VPN Endpoint', status: 'Secure' }
    ],
    slack: [
      { name: 'api-internal-teams.slack.net', type: 'API Gateway', status: 'Secure' },
      { name: 'slack-stage-portal.net', type: 'Internal Host', status: 'Secure' }
    ],
    acme: [
      { name: 'acme-intranet.local', type: 'Internal Host', status: 'Vulnerable' }
    ]
  };

  const listToDiscover = privateEndpoints[supplierId] || [];

  listToDiscover.forEach((ep, idx) => {
    const delay = 1600 + (idx * 600);
    logs.push({
      text: `[DISCOVERY] Found active node: <b>${ep.name}</b> (${ep.type}) - Status: ${ep.status}`,
      delay: delay,
      callback: () => {
        if (!data.assets.some(a => a.name === ep.name)) {
          data.assets.push(ep);
          initAttackSurfaceView(supplierId);
        }
      }
    });
  });

  logs.push({
    text: `[COMPLETE] Discovery complete. Found ${listToDiscover.length} internal corporate scan targets. Added to target list.`,
    delay: 1600 + (listToDiscover.length * 600) + 300,
    callback: () => {
      if (statusBadge) {
        statusBadge.innerText = 'Idle';
        statusBadge.className = 'terminal-badge';
      }
      showNotification(`Discovered ${listToDiscover.length} internal interfaces.`);
    }
  });

  logs.forEach(line => {
    setTimeout(() => {
      if (logBody) {
        const p = document.createElement('p');
        p.className = 'term-line-info';
        p.innerHTML = `<span class="term-line-time">${new Date().toTimeString().slice(0, 8)}</span> ${line.text}`;
        logBody.appendChild(p);
        logBody.scrollTop = logBody.scrollHeight;
      }
      if (line.callback) line.callback();
    }, line.delay);
  });
};

window.runAttackSurfaceScan = function() {
  const supplierId = document.getElementById('collector-target-supplier').value;
  const data = supplierSurfaceData[supplierId];
  if (!data) return;

  const statusBadge = document.getElementById('surface-scan-status');
  if (statusBadge) {
    statusBadge.innerText = 'Scanning';
    statusBadge.className = 'terminal-badge running';
  }

  const logBody = document.getElementById('surface-scan-logs');
  if (logBody) {
    logBody.innerHTML = '';
  }

  const portsGrid = document.getElementById('surface-ports-grid');
  let portBadges = [];
  if (portsGrid) {
    portBadges = portsGrid.querySelectorAll('.port-status-badge');
    portBadges.forEach(badge => {
      badge.innerText = 'Scanning...';
      badge.className = 'port-status-badge scanning';
    });
  }

  const logLines = [
    { text: '[SYSTEM] Initializing 360-degree digital footprint mapping...', delay: 200, type: 'info' },
    { text: `[ASSETS] Querying DNS sub-domains for ${supplierId === 'aws' ? 'amazon.com' : supplierId + '.com'}...`, delay: 600, type: 'info' },
    { text: `[ASSETS] Discovered ${data.assets.length} active internet-facing nodes.`, delay: 1000, type: 'success' },
    { text: '[SSL/TLS] Verifying active SSL handshake certificate chains...', delay: 1400, type: 'info' }
  ];

  // Discovered assets logs
  data.assets.forEach((asset, idx) => {
    logLines.push({
      text: `[SSL/TLS] Node: ${asset.name} | SSL Cipher: TLS_AES_256_GCM_SHA384 | Status: ${asset.status}`,
      delay: 1800 + (idx * 300),
      type: asset.status === 'Secure' ? 'success' : 'warning'
    });
  });

  logLines.push({ text: '[PORTS] Initiating TCP port scan on external interface...', delay: 2800, type: 'info' });

  // Port checks logs and UI badge updates
  data.ports.forEach((port, idx) => {
    const delay = 3200 + (idx * 650);
    logLines.push({
      text: `[PORTS] Scanning node interface port ${port.num}...`,
      delay: delay,
      type: 'info'
    });

    logLines.push({
      text: `[PORTS] Port ${port.num} -> ${port.status}`,
      delay: delay + 300,
      type: port.status.startsWith('Closed') ? 'success' : 'warning',
      callback: () => {
        const badge = portBadges[idx];
        if (badge) {
          badge.innerText = port.status;
          badge.className = `port-status-badge ${port.status.startsWith('Closed') ? 'closed' : 'open'}`;
        }
      }
    });
  });

  // Final summary
  const hasGaps = data.ports.some(p => p.isGap) || data.assets.some(a => a.status !== 'Secure');
  logLines.push({
    text: hasGaps 
      ? `[COMPLETE] Scan finished. Security violations identified. Automated compliance alert generated.` 
      : '[COMPLETE] Scan finished. 0 external vulnerabilities detected. Perimeter secure.',
    delay: 3200 + (data.ports.length * 650) + 600,
    type: hasGaps ? 'warning' : 'success',
    callback: () => {
      if (statusBadge) {
        statusBadge.innerText = 'Completed';
        statusBadge.className = `terminal-badge ${hasGaps ? 'warning' : 'success'}`;
      }
    }
  });

  // Run the logger sequence
  logLines.forEach(line => {
    setTimeout(() => {
      if (logBody) {
        const p = document.createElement('p');
        p.className = `term-line-${line.type}`;
        p.innerHTML = `<span class="term-line-time">${new Date().toTimeString().slice(0, 8)}</span> ${line.text}`;
        logBody.appendChild(p);
        logBody.scrollTop = logBody.scrollHeight;
      }
      if (line.callback) line.callback();
    }, line.delay);
  });
};

// --------------------------------------------------------------------------
// 16. INTELLIGENT RISK SCORING WEIGHTS LOGIC
// --------------------------------------------------------------------------
window.initRiskModelWeights = function(supplierId) {
  // Set default sliders to 40 / 30 / 30
  document.getElementById('slider-weight-ict').value = 40;
  document.getElementById('slider-weight-ops').value = 30;
  document.getElementById('slider-weight-gov').value = 30;

  document.getElementById('slider-weight-ict-val').innerText = '40%';
  document.getElementById('slider-weight-ops-val').innerText = '30%';
  document.getElementById('slider-weight-gov-val').innerText = '30%';

  recalculateTailoredScore(40, 30, 30);
};

window.updateRiskWeights = function(changedSlider) {
  const ictInput = document.getElementById('slider-weight-ict');
  const opsInput = document.getElementById('slider-weight-ops');
  const govInput = document.getElementById('slider-weight-gov');

  let ict = parseInt(ictInput.value) || 0;
  let ops = parseInt(opsInput.value) || 0;
  let gov = parseInt(govInput.value) || 0;

  const total = ict + ops + gov;
  if (total !== 100) {
    if (changedSlider === 'ict') {
      const remaining = 100 - ict;
      const sumOthers = ops + gov || 1;
      ops = Math.round(remaining * (ops / sumOthers));
      gov = 100 - ict - ops;
    } else if (changedSlider === 'ops') {
      const remaining = 100 - ops;
      const sumOthers = ict + gov || 1;
      ict = Math.round(remaining * (ict / sumOthers));
      gov = 100 - ops - ict;
    } else if (changedSlider === 'gov') {
      const remaining = 100 - gov;
      const sumOthers = ict + ops || 1;
      ict = Math.round(remaining * (ict / sumOthers));
      ops = 100 - gov - ict;
    }
  }

  // Update slider positions
  ictInput.value = ict;
  opsInput.value = ops;
  govInput.value = gov;

  // Update percentages display
  document.getElementById('slider-weight-ict-val').innerText = `${ict}%`;
  document.getElementById('slider-weight-ops-val').innerText = `${ops}%`;
  document.getElementById('slider-weight-gov-val').innerText = `${gov}%`;

  recalculateTailoredScore(ict, ops, gov);
};

function recalculateTailoredScore(ictW, opsW, govW) {
  const s = state.suppliers[currentModalSupplierId];
  if (!s) return;

  let ictMet = 0, ictTotal = 0;
  let opsMet = 0, opsTotal = 0;
  let govMet = 0, govTotal = 0;

  s.assessments.forEach(a => {
    const secNum = parseFloat(a.section.split(' ')[0]);
    const isMet = a.status === 'Met';

    if ([1, 3, 5, 8, 14].includes(secNum)) {
      ictTotal++;
      if (isMet) ictMet++;
    } else if ([10, 11, 13, 15].includes(secNum)) {
      opsTotal++;
      if (isMet) opsMet++;
    } else {
      govTotal++;
      if (isMet) govMet++;
    }
  });

  const ictScore = ictTotal > 0 ? (ictMet / ictTotal) * 100 : 100;
  const opsScore = opsTotal > 0 ? (opsMet / opsTotal) * 100 : 100;
  const govScore = govTotal > 0 ? (govMet / govTotal) * 100 : 100;

  const tailoredScore = Math.round((ictScore * ictW + opsScore * opsW + govScore * govW) / 100);

  document.getElementById('modal-tailored-score-display').innerText = `${tailoredScore}%`;

  const badge = document.getElementById('modal-tailored-risk-badge');
  badge.className = 'badge';
  if (tailoredScore >= 85) {
    badge.innerText = 'Low Adjusted Risk';
    badge.classList.add('badge-success');
  } else if (tailoredScore >= 70) {
    badge.innerText = 'Medium Adjusted Risk';
    badge.classList.add('badge-warning');
  } else {
    badge.innerText = 'High Adjusted Risk';
    badge.classList.add('badge-danger');
  }
}

// --------------------------------------------------------------------------
// 17. AUTOMATED VENDOR ASSESSMENTS (Dynamic Dispatch & AI verification)
// --------------------------------------------------------------------------
window.dispatchCustomAssessment = function() {
  const supplierId = document.getElementById('collector-target-supplier').value;
  const s = state.suppliers[supplierId];
  if (!s) return;

  // Let's see which modules are selected
  const selectedModules = [];
  for (let i = 1; i <= 15; i++) {
    const chk = document.getElementById(`chk-mod-${i}`);
    if (chk && chk.checked) {
      selectedModules.push(i);
    }
  }

  if (selectedModules.length === 0) {
    alert('Please select at least one control module to build the questionnaire.');
    return;
  }

  // Create follow-up action
  const actionId = `act-${Math.floor(Math.random() * 900) + 100}`;
  const subject = `Action Required: Dynamic Compliance Assessment - ${s.name}`;
  
  const body = `Dear ${s.contactName},

Our automated risk governance program has generated a custom compliance assessment for ${s.name}.

Please respond to the obligations listed below and upload supporting evidence in the Supplier Portal:
Modules: ${selectedModules.map(m => `${m}.0`).join(', ')}

Regards,
Sarah Jenkins
Third-Party Risk Operations, Cypher Vantage Team`;

  const action = {
    id: actionId,
    supplierId: supplierId,
    domain: 'Governance',
    controlId: `cCustom-${selectedModules[0]}`,
    title: `Dynamic Assessment Questionnaire (${selectedModules.length} Modules)`,
    gapDetails: `Risk Manager dispatched a dynamic questionnaire targeting: ${selectedModules.map(m => `${m}.0`).join(', ')}. Evidence verification required.`,
    status: 'Awaiting Response',
    dateCreated: formatDate(new Date()),
    emailDraft: body,
    responseMessage: '',
    responseAttachment: ''
  };

  state.actions.push(action);
  s.status = 'Awaiting Response';
  
  s.history.unshift({
    type: 'action-raised',
    title: 'Custom Assessment Dispatched',
    body: `Sarah Jenkins dispatched a dynamic questionnaire targeting ${selectedModules.length} modules.`,
    user: 'Sarah Jenkins',
    date: `${formatDate(new Date())} ${new Date().toTimeString().slice(0, 5)}`
  });

  state.activityLog.unshift({
    type: 'action-raised',
    time: 'Just Now',
    text: `Dispatched dynamic assessment <b>${actionId}</b> to <b>${s.name}</b> (${selectedModules.length} Modules).`
  });

  renderDashboard();
  renderSuppliersTable();
  renderManagerActions();
  showNotification('Custom assessment dispatched to supplier portal.');
};

// --------------------------------------------------------------------------
// 18. CRYPTOGRAPHIC FILE INTEGRITY HELPERS
// --------------------------------------------------------------------------
window.getDocHash = function(doc) {
  if (!doc.hash) {
    let hash = "";
    const chars = "0123456789abcdef";
    let seed = 0;
    for (let i = 0; i < doc.name.length; i++) {
      seed += doc.name.charCodeAt(i);
    }
    for (let i = 0; i < 64; i++) {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      hash += chars[seed % 16];
    }
    doc.hash = hash;
  }
  return doc.hash;
};

window.verifyFileIntegrity = function(docName) {
  const s = state.suppliers[state.activeSupplierId];
  const doc = s.documents.find(d => d.name === docName);
  if (doc) {
    doc.integrityStatus = 'checking';
    renderSupplierVaultTable();
    
    setTimeout(() => {
      if (doc.hash.startsWith('TAMPERED_')) {
        doc.integrityStatus = 'tampered';
        showNotification('CRITICAL HASH MISMATCH! Document integrity compromised.');
      } else {
        doc.integrityStatus = 'verified';
        showNotification('Success: File SHA-256 hash verified against Cypher Vantage Ledger.');
      }
      renderSupplierVaultTable();
    }, 1200);
  }
};

window.simulateTampering = function(docName) {
  const s = state.suppliers[state.activeSupplierId];
  const doc = s.documents.find(d => d.name === docName);
  if (doc) {
    const hashVal = getDocHash(doc);
    doc.hash = "TAMPERED_" + hashVal.slice(9);
    doc.integrityStatus = 'tampered';
    renderSupplierVaultTable();
    showNotification('Vulnerability Simulated: Document content tampered. Hash invalidated!');
  }
};

// --------------------------------------------------------------------------
// 19. COLLAPSIBLE SIDEBAR TOGGLING LOGIC
// --------------------------------------------------------------------------
window.toggleSidebar = function() {
  const sidebar = document.querySelector('.app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle');
  
  if (!sidebar) return;

  const isMobile = window.innerWidth <= 992;

  if (isMobile) {
    // Mobile slide-out toggle
    sidebar.classList.toggle('active');
    if (overlay) {
      overlay.classList.toggle('hidden');
    }
    const isActive = sidebar.classList.contains('active');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    }
  } else {
    // Desktop layout collapse toggle
    sidebar.classList.toggle('collapsed');
    const nowCollapsed = sidebar.classList.contains('collapsed');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', nowCollapsed ? 'false' : 'true');
    }
  }
};

window.addEventListener('resize', () => {
  const sidebar = document.querySelector('.app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  if (window.innerWidth > 992) {
    sidebar.classList.remove('active');
    if (overlay) overlay.classList.add('hidden');
  }
});

// --------------------------------------------------------------------------
// 20. INITIALIZATION
// --------------------------------------------------------------------------
window.onload = function() {
  renderDashboard();
  renderSuppliersTable();
  updateCollectorDropdown();
  const defaultSupplier = document.getElementById('collector-target-supplier').value;
  if (defaultSupplier) {
    initAttackSurfaceView(defaultSupplier);
  }
};
