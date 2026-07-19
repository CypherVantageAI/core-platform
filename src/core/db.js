// ==========================================================================
// Cypher Vantage - Core Database & State Manager (ES6 Module)
// ==========================================================================

const LOCAL_STORAGE_KEY = 'cypher_vantage_dora_state_v8';

// Default state structure conforming to the 12 core DORA entities
const DEFAULT_STATE = {
  version: 8,
  activePersona: 'manager', // 'manager' | 'supplier'
  activeSupplierId: 'aws',  // Supplier portal context
  activeSupplierSubTab: 'all',
  dlpProxyEnabled: true,
  
  // Relational DORA & Resilience Entities
  services: [
    {
      id: 'srv-001',
      name: 'IBS Payments Processing',
      description: 'Customer credit payment network gateway routing critical institutional transaction clearing.',
      criticality: 'Critical',
      rto: '4 Hours',
      rpo: '1 Hour',
      owner: 'Sarah Jenkins',
      ownerDepartment: 'Global Transaction Banking',
      status: 'Active',
      processes: ['prc-001'],
      applications: ['app-001'],
      financialImpact: 'High exposure. Downtime cost modeled at £75,000/hr + clearing network SLA penalties.',
      reputationalImpact: 'Severe breach of payment processing integrity. Risk of merchant churn and PCI DSS compliance suspension.'
    },
    {
      id: 'srv-002',
      name: 'IBS Clearing Portal',
      description: 'Web portal serving institutional clients for end-of-day equity clearings and settlements.',
      criticality: 'Critical',
      rto: '8 Hours',
      rpo: '4 Hours',
      owner: 'Sarah Jenkins',
      ownerDepartment: 'Post-Trade Infrastructure',
      status: 'Active',
      processes: ['prc-002'],
      applications: ['app-002'],
      financialImpact: 'High exposure. Outage cost modeled at £50,000/hr. Backlog penalty of £150,000 baseline.',
      reputationalImpact: 'Major clearing delays affecting European stock exchanges. Significant negative press coverage.'
    },
    {
      id: 'srv-003',
      name: 'CIS Database Backup Services',
      description: 'Automated snapshot backup ledger maintaining transaction history and customer credit journals.',
      criticality: 'High',
      rto: '24 Hours',
      rpo: '12 Hours',
      owner: 'Marcus Vance',
      ownerDepartment: 'IT Operations & Infrastructure',
      status: 'Active',
      processes: ['prc-003'],
      applications: ['app-003'],
      financialImpact: 'Loss of regulatory audit trail. Interruption fines modeled up to £100,000 per day under DORA Article 50.',
      reputationalImpact: 'Audit failure report filed with regulatory supervisors. Disruption to disaster recovery assurances.'
    },
    {
      id: 'srv-004',
      name: 'CIS Identity & Access Directories',
      description: 'Single Sign-On (SSO) and LDAP identity directory mapping internal employee credentials.',
      criticality: 'Critical',
      rto: '2 Hours',
      rpo: '0 Hours',
      owner: 'David Vance',
      ownerDepartment: 'Cyber Security Operations',
      status: 'Active',
      processes: ['prc-004'],
      applications: ['app-004'],
      financialImpact: 'Complete internal operational freeze. Lockout cost estimated at £120,000/hr due to employee downtime.',
      reputationalImpact: 'High compliance exposure. Inability to audit privilege controls or enforce zero-trust policies.'
    }
  ],

  processes: [
    {
      id: 'prc-001',
      name: 'Merchant Settlement Clearing',
      description: 'Real-time ledger processing of transaction clearings, credit card auths, and wire handoffs.',
      owner: 'Alexander Wright',
      criticality: 'Critical'
    },
    {
      id: 'prc-002',
      name: 'Equity Settlement Reconciliation',
      description: 'Post-market clearing validations aligning ledger balances with third-party exchange reports.',
      owner: 'David Carter',
      criticality: 'High'
    },
    {
      id: 'prc-003',
      name: 'Immutable Data Archival',
      description: 'Automated write-once-read-many (WORM) journaling of transactions into offline storage pools.',
      owner: 'Nate Peterson',
      criticality: 'High'
    },
    {
      id: 'prc-004',
      name: 'Privilege Identity Tokenization',
      description: 'MFA token handoffs, session rotations, and directory lookup validations for administrative tasks.',
      owner: 'Marcus Vance',
      criticality: 'Critical'
    }
  ],

  applications: [
    {
      id: 'app-001',
      name: 'Spring Core Payment Engine',
      version: 'v4.1.2',
      type: 'Cloud Hosted',
      owner: 'Global Banking IT',
      hostingProvider: 'Amazon Web Services',
      status: 'Nominal'
    },
    {
      id: 'app-002',
      name: 'React Institutional Portal',
      version: 'v2.8.0',
      type: 'SaaS',
      owner: 'Web Products Group',
      hostingProvider: 'Amazon Web Services',
      status: 'Nominal'
    },
    {
      id: 'app-003',
      name: 'Oracle DB Ledger Controller',
      version: 'v19.4.1',
      type: 'Cloud Hosted',
      owner: 'DBA Ops Group',
      hostingProvider: 'Infosys Secure Cloud',
      status: 'Nominal'
    },
    {
      id: 'app-004',
      name: 'Azure Active Directory SSO',
      version: 'Cloud Native',
      type: 'SaaS',
      owner: 'IAM Security Group',
      hostingProvider: 'Microsoft Azure',
      status: 'Nominal'
    }
  ],

  assets: [
    {
      id: 'ast-001',
      name: 'AWS us-east-1a (IBS Payments)',
      type: 'Server Container Host',
      region: 'us-east-1 (N. Virginia)',
      supplierId: 'aws',
      status: 'Secure',
      downtimeCostPerHour: 45000
    },
    {
      id: 'ast-002',
      name: 'AWS eu-central-1 (IBS Clearing Portal)',
      type: 'Load Balancer Node',
      region: 'eu-central-1 (Frankfurt)',
      supplierId: 'aws',
      status: 'Secure',
      downtimeCostPerHour: 30000
    },
    {
      id: 'ast-003',
      name: 'Infosys Core DB Ledger (CIS Database Backup)',
      type: 'Database Engine Instance',
      region: 'Private Cloud (Bangalore)',
      supplierId: 'infosys',
      status: 'Secure',
      downtimeCostPerHour: 20000
    },
    {
      id: 'ast-004',
      name: 'Azure US-West-2 (CIS Identity Services)',
      type: 'Active Directory Tenant',
      region: 'us-west-2 (Oregon)',
      supplierId: 'microsoft',
      status: 'Secure',
      downtimeCostPerHour: 15000
    }
  ],

  suppliers: {
    'aws': {
      id: 'aws',
      name: 'Amazon Web Services (AWS)',
      riskTier: 'Critical',
      riskTierExplanation: 'Hosts core transactional infrastructure and clearing portals. Outage directly triggers bank operational RTO failover protocols.',
      scoVersion: 'CV Framework',
      complianceScore: 80,
      status: 'Awaiting Response', // 'Compliant' | 'Awaiting Response' | 'Pending Review' | 'Gaps Identified'
      contactName: 'David Vance',
      contactEmail: 'compliance@aws.amazon.com',
      avatar: 'AWS',
      primarySupportLocation: 'Seattle, WA (USA)',
      secondarySupportLocation: 'Frankfurt, Germany',
      subcontractors: [
        { name: 'Cloudflare', role: 'Edge CDN & DNS Security', primaryLocation: 'San Francisco, CA (USA)', secondaryLocation: 'Frankfurt, Germany', additionalLocations: 'Singapore, Tokyo, Sydney' },
        { name: 'Equinix', role: 'Physical Colocation Facilities', primaryLocation: 'Redwood City, CA (USA)', secondaryLocation: 'London, United Kingdom', additionalLocations: 'Dublin, Amsterdam' }
      ],
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
        { type: 'action-raised', title: 'Assessment Run - Gap Identified', body: 'AI Evidence Collector detected outdated Recovery Planning evidence.', user: 'AI Risk Officer', date: '2026-07-01 09:12' },
        { type: 'action-raised', title: 'Follow-up Sent by Risk Manager', body: 'Sarah Jenkins requested 2025 DR testing report evidence.', user: 'Sarah Jenkins', date: '2026-07-01 10:15' }
      ]
    },
    'salesforce': {
      id: 'salesforce',
      name: 'Salesforce Inc.',
      riskTier: 'High',
      riskTierExplanation: 'Processes high volumes of sensitive customer PII and sales records. Data exposure carries significant regulatory GDPR audit risk.',
      scoVersion: 'CV Framework',
      complianceScore: 100,
      status: 'Compliant',
      contactName: 'Elena Rostova',
      contactEmail: 'security@salesforce.com',
      avatar: 'SF',
      primarySupportLocation: 'San Francisco, CA (USA)',
      secondarySupportLocation: 'Dublin, Ireland',
      subcontractors: [
        { name: 'Amazon Web Services (AWS)', role: 'Hosting Infrastructure & Storage', primaryLocation: 'Seattle, WA (USA)', secondaryLocation: 'Dublin, Ireland', additionalLocations: 'Frankfurt, Tokyo' },
        { name: 'Twilio', role: 'SMS Authentication Gateway', primaryLocation: 'San Francisco, CA (USA)', secondaryLocation: 'London, UK', additionalLocations: 'Sydney' }
      ],
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
        { type: 'evidence-uploaded', title: 'SOC 2 & BCP Documents Scanned', body: 'AI Evidence Collector successfully scanned Salesforce files. 100% compliance verified.', user: 'AI Risk Officer', date: '2026-07-02 11:45' }
      ]
    },
    'servicenow': {
      id: 'servicenow',
      name: 'ServiceNow Inc.',
      riskTier: 'High',
      riskTierExplanation: 'Hosts corporate service desks, access provisioning logs, and internal operation registries.',
      scoVersion: 'CV Framework',
      complianceScore: 90,
      status: 'Compliant',
      contactName: 'John Miller',
      contactEmail: 'governance@servicenow.com',
      avatar: 'SN',
      primarySupportLocation: 'Santa Clara, CA (USA)',
      secondarySupportLocation: 'Munich, Germany',
      subcontractors: [
        { name: 'Wrangu', role: 'Privacy Compliance Integrations', primaryLocation: 'Amsterdam, Netherlands', secondaryLocation: 'London, UK', additionalLocations: 'Munich' },
        { name: 'Microsoft Azure', role: 'Hosting Infrastructure', primaryLocation: 'Redmond, WA (USA)', secondaryLocation: 'Frankfurt, Germany', additionalLocations: 'Singapore' }
      ],
      documents: [
        { name: 'ServiceNow_SOC_2_Report.pdf', type: 'SOC 2 Report', date: '2025-04-10', scanned: '2026-07-06', status: 'Valid' }
      ],
      assessments: [
        { id: 'c2.1', section: 'Section 5.0', title: 'Information & Cyber Security', requirement: 'Implement Multi-Factor Authentication (MFA) on all admin and customer access endpoints.', status: 'Met', document: 'ServiceNow_SOC_2_Report.pdf', snippet: 'MFA is validated and enforced across all administrative accounts on customer instances (Page 14).' },
        { id: 'c3.1', section: 'Section 3.0', title: 'Data Management', requirement: 'Encrypt all Cypher Vantage tenant proprietary data at rest and in transit using cryptographic algorithms of AES-256 or higher.', status: 'Met', document: 'ServiceNow_SOC_2_Report.pdf', snippet: 'Data stored in customer databases is encrypted at rest using AES-256 bit encryption keys (Page 22).' },
        { id: 'c4.2', section: 'Section 13.0', title: 'Recovery Planning', requirement: 'Provide executive summaries of business continuity and disaster recovery tests conducted within the last 12 months.', status: 'Met', document: 'ServiceNow_SOC_2_Report.pdf', snippet: 'Disaster recovery and high-availability database failover tests successfully completed in March 2025.' },
        { id: 'c5.3', section: 'Section 14.0', title: 'Technology Risk Technical', requirement: 'Ensure all critical subcontractors are bound by non-disclosure agreements and undergo security evaluations equivalent to Cypher Vantage guidelines.', status: 'Met', document: 'ServiceNow_SOC_2_Report.pdf', snippet: 'ServiceNow conducts security assurance mapping for sub-processors including Wrangu compliance assessments (Page 31).' },
        { id: 'c8.1', section: 'Section 8.0', title: 'PCIDSS Compliance', requirement: 'Provide annual certificate of compliance with the PCI DSS standard for payment tokenization systems.', status: 'Gap', document: 'None', snippet: 'Exemption logged; ServiceNow does not process client payment data directly.' }
      ],
      history: [
        { type: 'evidence-uploaded', title: 'SOC 2 Analysis Verified', body: 'AI Evidence Collector successfully scanned ServiceNow evidence document.', user: 'AI Risk Officer', date: '2026-07-06 10:45' }
      ]
    },
    'infosys': {
      id: 'infosys',
      name: 'Infosys Limited',
      riskTier: 'High',
      riskTierExplanation: 'Critical systems integration partner. Holds elevated developer credential routing into bank internal staging grids.',
      scoVersion: 'CV Framework',
      complianceScore: 60,
      status: 'Gaps Identified',
      contactName: 'Rajesh Kumar',
      contactEmail: 'compliance_team@infosys.com',
      avatar: 'INF',
      primarySupportLocation: 'Bangalore (India)',
      secondarySupportLocation: 'London, United Kingdom',
      subcontractors: [
        { name: 'Wipro Ltd', role: 'Systems Integration Support', primaryLocation: 'Bangalore, India', secondaryLocation: 'London, UK', additionalLocations: 'New York' },
        { name: 'TATA Consultancy Services', role: 'Global Operations Helpdesk', primaryLocation: 'Mumbai, India', secondaryLocation: 'London, UK', additionalLocations: 'Toronto' }
      ],
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
        { type: 'action-raised', title: 'Evidence Collector Assessment', body: 'AI Evidence Collector identified gaps in Data Management (encryption at rest) and Technology Risk (Subcontractors).', user: 'AI Risk Officer', date: '2026-07-03 16:30' }
      ]
    },
    'slack': {
      id: 'slack',
      name: 'Slack Technologies',
      riskTier: 'Medium',
      riskTierExplanation: 'Collaborative messaging system. Hosts operational chats but excluded from transactional networks and core ledgers.',
      scoVersion: 'CV Framework',
      complianceScore: 100,
      status: 'Compliant',
      contactName: 'Marcus Aurelius',
      contactEmail: 'compliance@slack.com',
      avatar: 'SL',
      primarySupportLocation: 'San Francisco, CA (USA)',
      secondarySupportLocation: 'Melbourne, Australia',
      subcontractors: [
        { name: 'Amazon Web Services (AWS)', role: 'Hosting Infrastructure', primaryLocation: 'Seattle, WA (USA)', secondaryLocation: 'Frankfurt, Germany', additionalLocations: 'Dublin' },
        { name: 'Fastly', role: 'Edge Content Delivery (CDN)', primaryLocation: 'San Francisco, CA (USA)', secondaryLocation: 'London, UK', additionalLocations: 'Tokyo' }
      ],
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
        { type: 'evidence-uploaded', title: 'Quarterly Check Complete', body: 'AI Evidence Collector verified Slack certificates. 100% compliant.', user: 'AI Risk Officer', date: '2026-07-04 10:20' }
      ]
    },
    'workday': {
      id: 'workday',
      name: 'Workday, Inc. (SaaS HR & ERP)',
      riskTier: 'Critical',
      riskTierExplanation: 'Hosts core enterprise ledger and employee payroll system of record. High business impact on operational continuity.',
      scoVersion: 'CV Framework',
      complianceScore: 80,
      status: 'Gaps Identified',
      contactName: 'Marcus Vance',
      contactEmail: 'compliance@workday.com',
      avatar: 'WD',
      primarySupportLocation: 'Pleasanton, CA (USA)',
      secondarySupportLocation: 'Dublin, Ireland',
      subcontractors: [
        { name: 'Amazon Web Services (AWS)', role: 'Hosting & Core Cloud Storage', primaryLocation: 'Seattle, WA (USA)', secondaryLocation: 'Frankfurt, Germany', additionalLocations: 'Dublin' },
        { name: 'Akamai Technologies', role: 'Edge Delivery & DDoS Shielding', primaryLocation: 'Cambridge, MA (USA)', secondaryLocation: 'Munich, Germany', additionalLocations: 'Singapore' }
      ],
      documents: [
        { name: 'Workday_SOC_2_Type_II_2025.pdf', type: 'SOC 2 Report', date: '2025-02-15', scanned: '2026-07-05', status: 'Valid' },
        { name: 'Workday_BCP_TestDoc_2025.pdf', type: 'Resilience Evidence', date: '2025-06-01', scanned: '2026-07-05', status: 'Valid' }
      ],
      assessments: [
        { id: 'c2.1', section: 'Section 5.0', title: 'Information & Cyber Security', requirement: 'Implement Multi-Factor Authentication (MFA) on all admin and customer access endpoints.', status: 'Met', document: 'Workday_SOC_2_Type_II_2025.pdf', snippet: 'Administrative controls require physical MFA tokens or secure Authenticator app confirmation.' },
        { id: 'c3.1', section: 'Section 3.0', title: 'Data Management', requirement: 'Encrypt all Cypher Vantage tenant proprietary data at rest and in transit using cryptographic algorithms of AES-256 or higher.', status: 'Met', document: 'Workday_SOC_2_Type_II_2025.pdf', snippet: 'Data stored on persistent database volumes is encrypted at rest using AES-256 bit keys.' },
        { id: 'c4.2', section: 'Section 13.0', title: 'Recovery Planning', requirement: 'Provide executive summaries of business continuity and disaster recovery tests conducted within the last 12 months.', status: 'Met', document: 'Workday_BCP_TestDoc_2025.pdf', snippet: 'Full environment backup restore and DR testing executed and verified on June 1, 2025.' },
        { id: 'c5.3', section: 'Section 14.0', title: 'Technology Risk Technical', requirement: 'Ensure all critical subcontractors are bound by non-disclosure agreements and undergo security evaluations equivalent to Cypher Vantage guidelines.', status: 'Gap', document: 'None', snippet: 'Sub-processor compliance assessment forms and NDAs are missing for downstream service organizations.' },
        { id: 'c8.1', section: 'Section 8.0', title: 'PCIDSS Compliance', requirement: 'Provide annual certificate of compliance with the PCI DSS standard for payment tokenization systems.', status: 'Met', document: 'Workday_SOC_2_Type_II_2025.pdf', snippet: 'Workday Core Services do not store or transmit cardholder payment data directly.' }
      ],
      history: [
        { type: 'evidence-uploaded', title: 'Compliance Gap Logged', body: 'AI Evidence Collector identified gap in subcontractor evaluation audits.', user: 'AI Risk Officer', date: '2026-07-05 14:15' }
      ]
    }
  },

  risks: [
    {
      id: 'rsk-001',
      title: 'Third-Party Vendor Concentration Risk (AWS)',
      description: 'Over-reliance on AWS us-east-1 hosting nodes across critical IBS payment and clearing portals.',
      category: 'Third Party',
      likelihood: 4,
      impact: 5,
      mitigation: 'Implement GCP multi-region backup failover routes and mirror critical identity vaults.',
      owner: 'Sarah Jenkins',
      status: 'Open'
    },
    {
      id: 'rsk-002',
      title: 'Outdated Disaster Recovery Verification Logs',
      description: 'Primary supplier (AWS) DR verification summaries are older than 12 months, triggering a gap.',
      category: 'Compliance',
      likelihood: 3,
      impact: 4,
      mitigation: 'Trigger immediate automated request on AWS portal to upload recent BCP failover drill documents.',
      owner: 'Nate Peterson',
      status: 'Open'
    },
    {
      id: 'rsk-003',
      title: 'Unpatched Remote Code Execution vulnerability in Web Server',
      description: 'CVE-2026-9912 critical vulnerability detected on AWS Spring Framework engine nodes.',
      category: 'ICT Security',
      likelihood: 5,
      impact: 5,
      mitigation: 'Push automated remediation plan request to AWS and apply temporary ingress security group block rules.',
      owner: 'David Vance',
      status: 'Open'
    },
    {
      id: 'rsk-004',
      title: 'Missing Subcontractor Flow-down audit logs',
      description: 'Lack of NDAs and active security audit records for downstream subcontractors.',
      category: 'Third Party',
      likelihood: 2,
      impact: 3,
      mitigation: 'Enforce master subcontractor policy requirements in supplier portal for all integration partners.',
      owner: 'Alexander Wright',
      status: 'Mitigated'
    }
  ],

  controls: [
    {
      id: 'ctl-001',
      title: 'Multi-Factor Authentication (MFA) Enforcement',
      description: 'Logical access gates require secondary physical or virtual OTP tokens.',
      status: 'Met',
      implementationDetails: 'Enforced across all administrator terminals and SSH keys supporting target server zones.',
      relatedRisks: ['rsk-003']
    },
    {
      id: 'ctl-002',
      title: 'End-to-End Cryptographic Encryption at Rest',
      description: 'Data blocks encrypted using FIPS 140-2 validated AES-256 bit algorithms.',
      status: 'Met',
      implementationDetails: 'AWS KMS encryption active on target database structures.',
      relatedRisks: []
    },
    {
      id: 'ctl-003',
      title: 'Annual Disaster Recovery Failover Testing',
      description: 'Semi-annual simulation failovers demonstrating recovery objectives (RTO) below threshold.',
      status: 'Gap',
      implementationDetails: 'Mock test run completed in 2024; active logs for 2025/2026 are missing.',
      relatedRisks: ['rsk-002']
    },
    {
      id: 'ctl-004',
      title: 'Subcontractor Evaluation Audits',
      description: 'Annual audits and flow-down NDA bindings signed for Tier-4 subcontractors.',
      status: 'Gap',
      implementationDetails: 'Integration audits are pending verification for Wipro and Equinix sub-nodes.',
      relatedRisks: ['rsk-004']
    }
  ],

  obligations: [
    {
      id: 'ob-001',
      article: 'Article 5',
      title: 'ICT Risk Management Framework',
      pillar: 'Risk Management',
      description: 'Entities must implement a robust ICT risk management framework, identifying operational risks and mapping active safeguards.',
      status: 'Partial',
      controls: ['ctl-001', 'ctl-002']
    },
    {
      id: 'ob-002',
      article: 'Article 17',
      title: 'ICT Incident Reporting',
      pillar: 'Incident Reporting',
      description: 'Mandatory reporting templates and response logs must be generated for all critical functional disruptions.',
      status: 'Compliant',
      controls: ['ctl-001']
    },
    {
      id: 'ob-003',
      article: 'Article 24',
      title: 'Operational Resilience Testing',
      pillar: 'Resilience Testing',
      description: 'Required annual scenario-based testing, including volumetric testing, vulnerability checks, and red-team drills.',
      status: 'Partial',
      controls: ['ctl-003']
    },
    {
      id: 'ob-004',
      article: 'Article 28',
      title: 'Third-Party Risk Management',
      pillar: 'Third-Party Risk',
      description: 'Continuous monitoring of critical third parties, including auditing downstream sub-processors and subcontractor chains.',
      status: 'Non-Compliant',
      controls: ['ctl-004']
    }
  ],

  incidents: [
    {
      id: 'inc-001',
      title: 'APAC Regional Power Outage (Simulated)',
      severity: 'Critical',
      status: 'Closed',
      serviceAffected: 'IBS Payments Processing',
      downtime: '42 Minutes',
      financialLoss: 31500
    },
    {
      id: 'inc-002',
      title: 'Oregon Datacenter Wildfire Threat (Simulated)',
      severity: 'Major',
      status: 'Resolved',
      serviceAffected: 'CIS Identity & Access Directories',
      downtime: '15 Minutes',
      financialLoss: 12500
    }
  ],

  tests: [
    {
      id: 'tst-001',
      title: 'AWS Primary Node DR Failover Verification',
      type: 'DR Failover',
      lastRun: '2024-10-14',
      results: 'Passed',
      status: 'Completed'
    },
    {
      id: 'tst-002',
      title: 'Spring Framework CVE-2026-9912 Penetration Audit',
      type: 'Vulnerability Scan',
      lastRun: '2026-07-17',
      results: 'Failed',
      status: 'Completed'
    },
    {
      id: 'tst-003',
      title: 'Adversarial Agent Jailbreak Simulation',
      type: 'Red Team Sim',
      lastRun: '2026-07-18',
      results: 'Passed',
      status: 'Completed'
    }
  ],

  findings: [
    {
      id: 'fnd-001',
      title: 'Spring Framework RCE Exploit Vulnerability (CVE-2026-9912)',
      severity: 'Critical',
      status: 'Open',
      dueDate: '2026-07-24',
      relatedRisk: 'rsk-003'
    },
    {
      id: 'fnd-002',
      title: 'AWS BCP Test Logs Overdue (SLA violation)',
      severity: 'High',
      status: 'Open',
      dueDate: '2026-07-31',
      relatedRisk: 'rsk-002'
    }
  ],

  evidence: [
    {
      id: 'ev-001',
      name: 'AWS_SOC_2_Type_II_2025.pdf',
      type: 'SOC 2 Report',
      uploadedDate: '2026-07-01',
      status: 'Valid',
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: 'ev-002',
      name: 'ISO_27001_Certificate_AWS.pdf',
      type: 'ISO Certificate',
      uploadedDate: '2026-07-01',
      status: 'Valid',
      fileHash: '439a0678d2ccb308e1ec2c2a033f218bbadca5b1c552093557e4e11a14c6e9d6'
    },
    {
      id: 'ev-003',
      name: 'AWS_DR_Testing_Plan_2024.pdf',
      type: 'DR Test Log',
      uploadedDate: '2026-07-01',
      status: 'Expired',
      fileHash: 'fa54687b1c43b2089b218fca201ec7412ca6e11f185794a3194ec6b31c19b85c'
    }
  ],

  // UI state matrices & simulations (needed to keep Red-Team and other modules working)
  resilience: {
    selectedCurrency: 'GBP',
    lossPrevented: 0,
    activeDrill: null,
    lossTrackerIntervalId: null,
    // Store nested navigation hierarchy
    hierarchy: {
      global: {
        name: 'Global Operations Network',
        personnel: [{ name: 'Nate Peterson', role: 'Lead Architect', location: 'London Head Office', status: 'On-Call', contact: 'n.peterson@cyphervantage.ai' }],
        systems: [],
        countries: {
          uk: {
            name: 'United Kingdom Core Grid',
            personnel: [{ name: 'Alexander Wright', role: 'Incident Commander', location: 'London Ops Hub', status: 'On-Call', contact: 'a.wright@cyphervantage.ai' }],
            systems: [],
            cities: {
              london: {
                name: 'London Primary Datacenter Hub',
                personnel: [{ name: 'Sarah Jenkins', role: 'Head of Resilience', location: 'London Center', status: 'Active', contact: 's.jenkins@cyphervantage.ai' }],
                systems: [{ name: 'Borsa Italiana Transit Gateway (IBS Trade Entry)', description: 'Trade entry relay validating execution buffers for Borsa Italiana clearing nodes.', serviceType: 'ibs', status: 'Nominal' }]
              }
            }
          },
          us: {
            name: 'North American Zone',
            personnel: [],
            systems: [],
            states: {
              va: {
                name: 'Virginia Regional Ingress',
                personnel: [],
                systems: [],
                cities: {
                  ashburn: {
                    name: 'Ashburn Secure Co-location Facility',
                    personnel: [{ name: 'David Carter', role: 'Network Administrator', location: 'Ashburn, VA', status: 'Active', contact: 'd.carter@cyphervantage.ai' }],
                    systems: [{ name: 'AWS us-east-1a (IBS Payments)', description: 'Primary cardholder transactions verification controller and gateway services.', serviceType: 'ibs', status: '9h SLA (Urgent)' }]
                  }
                }
              },
              or: {
                name: 'Oregon Regional Access',
                personnel: [],
                systems: [],
                cities: {
                  portland: {
                    name: 'Oregon AWS-West Backup Site',
                    personnel: [{ name: 'Emily Rose', role: 'Secondary SysOps Lead', location: 'Oregon, USA', status: 'Standby', contact: 'e.rose@cyphervantage.ai' }],
                    systems: [{ name: 'Azure US-West-2 (CIS Identity Services)', description: 'Directory authorization sync relay validating credentials database replication logs.', serviceType: 'cis', status: 'Nominal' }]
                  }
                }
              }
            }
          },
          de: {
            name: 'European Union Zone',
            personnel: [],
            systems: [],
            states: {
              he: {
                name: 'Hesse Regional Clearing Router',
                personnel: [],
                systems: [],
                cities: {
                  frankfurt: {
                    name: 'Frankfurt Central Colocation Grid',
                    personnel: [{ name: 'Hans Mueller', role: 'EU Security Supervisor', location: 'Frankfurt Central', status: 'On-Call', contact: 'h.mueller@cyphervantage.ai' }],
                    systems: [{ name: 'AWS eu-central-1 (IBS Clearing Portal)', description: 'Equity clearing node managing real-time ledger settlement journals.', serviceType: 'ibs', status: '48h SLA (Critical)' }]
                  }
                }
              }
            }
          },
          in: {
            name: 'APAC Region West',
            personnel: [],
            systems: [],
            states: {
              ka: {
                name: 'Karnataka Integration Zone',
                personnel: [],
                systems: [],
                cities: {
                  bangalore: {
                    name: 'Bangalore Secure Cloud Sandbox',
                    personnel: [{ name: 'Rajesh Kumar', role: 'Lead Compliance Architect', location: 'Bangalore Delivery Center', status: 'Active', contact: 'r.kumar@infosys-tprm.com' }],
                    systems: [{ name: 'Infosys Core DB Ledger (CIS Database Backup)', description: 'Transaction history journal storage vault maintaining ledger synchronizations.', serviceType: 'cis', status: '24h SLA (Critical)' }]
                  }
                }
              }
            }
          },
          sg: {
            name: 'APAC Region East',
            personnel: [],
            systems: [],
            cities: {
              singapore: {
                name: 'Singapore Edge Routers',
                personnel: [{ name: 'Lee Min', role: 'APAC Operations Lead', location: 'Singapore Edge Center', status: 'Active', contact: 'l.min@cyphervantage.ai' }],
                systems: [{ name: 'Google Cloud SG (CIS API Gateway Routing)', description: 'API router managing gateway channels for APAC routing zones.', serviceType: 'cis', status: '48h SLA (Critical)' }]
              }
            }
          }
        }
      }
    }
  },

  supplierEvidenceVault: [],
  customAssessments: [],
  remediatedVulnerabilities: [],
  actions: [
    {
      id: 'act-vuln-pre',
      supplierId: 'aws',
      domain: 'Vulnerability Remediation',
      controlId: 'c5.3',
      title: 'CVE-2026-9912 - SLA Remediation Request: AWS us-east-1a (IBS Payments)',
      gapDetails: 'A critical vulnerability (CVE-2026-9912: Spring Framework Remote Code Execution) has been identified on your hosted service node supporting "AWS us-east-1a (IBS Payments)". Under DORA Article 19, you must provide an immediate remediation action plan, root cause analysis, and execute patches within the agreed SLA.',
      status: 'Awaiting Response',
      dateCreated: '2026-07-17',
      isVulnerabilityRemediation: true,
      cveId: 'CVE-2026-9912',
      serviceName: 'AWS us-east-1a (IBS Payments)',
      execSummary: '',
      remediationPlan: '',
      rootCauseAnalysis: '',
      revisionComment: ''
    }
  ],
  advisorChatHistory: [
    { sender: 'assistant', text: 'Hello! I am your Cypher Vantage AI Risk Advisor. I can analyze DORA control compliance, evaluate concentration risk, query current audit outcomes, or suggest remediation drafts for active vendor gaps. What compliance query can I help you resolve today?' }
  ],
  attackSurfaceTargets: [],
  
  // TIBER-EU red-team simulation variables
  tlpt: {
    status: 'Ready', // 'Ready' | 'Active' | 'Complete'
    currentPhase: 'Threat Intelligence', // 'Prep & Scope' | 'Threat Intelligence' | 'Red Team Execution' | 'Closure & Replay'
    selectedScenario: 'Ransomware on Identity Gateways',
    logHistory: [],
    mitigationActions: []
  },
  tamperedDocuments: [],
  dlpHistory: [],
  aiActAudits: []
};

// Global state container
let state = null;

/**
 * Save current state to localStorage and update sidebar count badges
 */
export function saveState() {
  if (!state) return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  
  // Update badges globally if elements exist in DOM
  const badgeActions = document.getElementById('badge-actions-count');
  if (badgeActions) {
    // Actions are supplier-related followups
    badgeActions.innerText = state.actions.length;
  }
  
  // Try calling the manager inbox badge update
  const badgeInbox = document.getElementById('badge-manager-inbox');
  if (badgeInbox) {
    const count = state.actions.filter(a => a.isVulnerabilityRemediation && a.status !== 'Closed').length;
    badgeInbox.innerText = count;
    badgeInbox.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

/**
 * Load database state from localStorage or initialize with default mocks
 */
export function loadState() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  let parsed = null;
  if (saved) {
    try {
      parsed = JSON.parse(saved);
      if (!parsed.version || parsed.version < 8) {
        console.warn("Outdated DORA database state (V8 needed). Reinitializing database.");
        parsed = JSON.parse(JSON.stringify(DEFAULT_STATE));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (e) {
      console.error("Failed to load local DORA state, reinitializing default mocks.", e);
      parsed = JSON.parse(JSON.stringify(DEFAULT_STATE));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    }
  } else {
    console.log("No existing database. Initializing default Cypher Vantage DORA mock data.");
    parsed = JSON.parse(JSON.stringify(DEFAULT_STATE));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
  }

  if (!state) {
    state = parsed;
  } else {
    for (let key in state) {
      delete state[key];
    }
    Object.assign(state, parsed);
  }
  return state;
}

/**
 * Clear storage and reload to default state
 */
export function resetDatabase() {
  if (confirm("Are you sure you want to reset all DORA operational resilience records, supplier registers, and simulation logs to default mocks?")) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.location.reload();
  }
}

// Export a getter to prevent value reassignment errors
export function getState() {
  if (!state) {
    loadState();
  }
  return state;
}

// Attach helpers to window for console/HTML event handles
window.saveState = saveState;
window.loadState = loadState;
window.resetDatabase = resetDatabase;
window.getState = getState;
