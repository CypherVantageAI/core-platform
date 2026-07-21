// ==========================================================================
// Cypher Vantage - AI Audit & Governance Module (ES6 Module)
// ==========================================================================

import { getState, saveState } from '../core/db.js';
import { createTable, createCard, createStatusBadge } from '../components/ui.js';

let activeAiSubTab = 'audit';
let selectedCampaignId = 'tlpt-001';

export function renderAiGovernanceModule() {
  const state = getState();
  window.activeAiSubTab = activeAiSubTab;
  const container = document.getElementById('view-manager-ai-risk');
  if (!container) return;

  const totalModels = state.aiInventory ? state.aiInventory.length : 0;
  const criticalModels = state.aiInventory ? state.aiInventory.filter(m => m.riskTier === 'Critical' || m.riskTier === 'High').length : 0;
  const activeCampaigns = state.tlptCampaigns ? state.tlptCampaigns.filter(c => c.status === 'Active').length : 0;
  const blockedPayloads = state.promptRiskRegister ? state.promptRiskRegister.filter(p => p.status === 'Blocked').length : 0;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <div class="view-header" style="margin-bottom: 0;">
        <h2>AI Audit &amp; BAS Operational Resilience Suite</h2>
        <p>Manage adversarial penetration campaigns, audit LLM integrations, and maintain the institutional AI Model Registry.</p>
      </div>

      <!-- KPI stats row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; width: 100%;">
        <div id="ai-kpi-total"></div>
        <div id="ai-kpi-critical"></div>
        <div id="ai-kpi-campaigns"></div>
        <div id="ai-kpi-blocked"></div>
      </div>

      <!-- Sub-Tab Navigation -->
      <div class="sub-tab-nav" style="display: flex; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 0; flex-wrap: wrap; margin-bottom: 15px;">
        <button id="tab-ai-audit" class="horizontal-sub-tab-btn ${activeAiSubTab === 'audit' ? 'active' : ''}">Adversarial Audit &amp; DLP</button>
        <button id="tab-ai-campaigns" class="horizontal-sub-tab-btn ${activeAiSubTab === 'campaigns' ? 'active' : ''}">TLPT Campaigns</button>
        <button id="tab-ai-governance" class="horizontal-sub-tab-btn ${activeAiSubTab === 'governance' ? 'active' : ''}">AI Governance Registry</button>
      </div>

      <!-- Dynamic Content Area -->
      <div id="ai-tab-content" style="width: 100%; min-height: 480px;"></div>
    </div>
  `;

  // Render KPI cards
  createCard('ai-kpi-total', {
    title: 'AI Models Registered',
    value: `${totalModels}`,
    icon: '🤖',
    borderLeftColor: '#14b8a6',
    tooltip: 'Click to view institutional AI Model Registry summary.',
    onclick: () => {
      const modalHtml = `
        <div style="font-size:0.75rem; line-height:1.5;">
          <b>AI Model Registry Overview (${totalModels} Models):</b><br/>
          * Customer Support LLM Assistant (GPT-4o)<br/>
          * Finance Market Strategy Bot (Claude 3.5 Sonnet)<br/>
          * Salesforce Copilot Integrator (GPT-4)<br/>
          * Resume Screening Recruiter Bot (Llama 3 70B)<br/><br/>
          All models require risk tiering, DORA Article 5 alignment, and automated prompt vulnerability scanning.
        </div>
      `;
      window.showModal('AI Model Registry Summary', modalHtml);
    }
  });

  createCard('ai-kpi-critical', {
    title: 'High/Critical Risk Models',
    value: `${criticalModels}`,
    subtext: 'Requires continuous audit log validation',
    icon: '⚠️',
    borderLeftColor: '#ef4444',
    tooltip: 'Click for High/Critical Risk Models details.',
    onclick: () => {
      const modalHtml = `
        <div style="font-size:0.75rem; line-height:1.5;">
          <b>High/Critical Models Count: ${criticalModels}</b><br/>
          * <b>Resume Screening Recruiter Bot</b> (Critical - HR bias audit required)<br/>
          * <b>Finance Market Strategy Bot</b> (High - Market data API access)<br/>
          * <b>Salesforce Copilot Integrator</b> (High - PII exposure potential)<br/><br/>
          Mandatory DLP proxy anonymization and monthly vulnerability sweeps active.
        </div>
      `;
      window.showModal('Critical Risk AI Models', modalHtml);
    }
  });

  createCard('ai-kpi-campaigns', {
    title: 'Active TLPT Campaigns',
    value: `${activeCampaigns}`,
    subtext: 'TIBER-EU aligned simulations',
    icon: '🎯',
    borderLeftColor: '#6366f1',
    tooltip: 'Click to view active Red/Purple Team penetration campaigns.',
    onclick: () => {
      const modalHtml = `
        <div style="font-size:0.75rem; line-height:1.5;">
          <b>Active Threat-Led Penetration Testing (TLPT): ${activeCampaigns} Active</b><br/>
          * <b>TLPT-001:</b> Automated Red-Team Prompt Injection Blitz (Target: Customer Support Assistant)<br/>
          * <b>TLPT-002:</b> Infosys API Supply Chain Pentest (Target: Core DB Ledger)<br/><br/>
          Aligned with TIBER-EU testing frameworks for EU financial institutions.
        </div>
      `;
      window.showModal('TLPT Campaigns Breakdown', modalHtml);
    }
  });

  createCard('ai-kpi-blocked', {
    title: 'Blocked Prompt Injections',
    value: `${blockedPayloads}`,
    subtext: 'Intercepted by inline DLP gateway',
    icon: '🛡️',
    borderLeftColor: '#10b981',
    tooltip: 'Click to view blocked prompt risk log.',
    onclick: () => {
      const modalHtml = `
        <div style="font-size:0.75rem; line-height:1.5;">
          <b>Blocked Security Threats (${blockedPayloads} Injections):</b><br/>
          * Adversarial System Prompt Exfiltration Attempts<br/>
          * Outbound PII / API Token Exfiltration<br/>
          * Direct Jailbreak Payload Sequences<br/><br/>
          All suspicious prompts are recorded in real-time within the Prompt Risk Register.
        </div>
      `;
      window.showModal('Blocked Security Incidents', modalHtml);
    }
  });

  // Bind tab buttons
  document.getElementById('tab-ai-audit').onclick = () => switchTab('audit');
  document.getElementById('tab-ai-campaigns').onclick = () => switchTab('campaigns');
  document.getElementById('tab-ai-governance').onclick = () => switchTab('governance');

  // Load active tab
  renderActiveTabContent();
}

function switchTab(tabId) {
  activeAiSubTab = tabId;
  window.activeAiSubTab = activeAiSubTab;
  document.querySelectorAll('.sub-tab-nav .horizontal-sub-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`tab-ai-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');
  renderActiveTabContent();
}

function renderActiveTabContent() {
  const contentArea = document.getElementById('ai-tab-content');
  if (!contentArea) return;

  if (activeAiSubTab === 'audit') {
    renderAuditTab(contentArea);
  } else if (activeAiSubTab === 'campaigns') {
    renderCampaignsTab(contentArea);
  } else if (activeAiSubTab === 'governance') {
    renderGovernanceTab(contentArea);
  }
}

// --------------------------------------------------------------------------
// TAB 1: ADVERSARIAL AUDIT & DLP
// --------------------------------------------------------------------------
function renderAuditTab(container) {
  const state = getState();
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- Section 1: LLM Pentesting -->
      <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
            LLM Integration Adversarial Audit Sweep
          </h3>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.65rem; color: var(--text-secondary); background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15); padding: 3px 8px; border-radius: 4px;">
            <span class="status-dot status-green" style="width: 6px; height: 6px;"></span>
            <span>Inline DLP Proxy: <b>ACTIVE</b></span>
          </div>
        </div>
        <p class="panel-subtitle">Simulate adversarial prompt injection payloads against integrated third-party chatbots and database assistants to verify boundary containment.</p>
        
        <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: flex-end; margin-top: 10px;">
          <div style="flex: 1.2; min-width: 220px;">
            <label style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; display: block; margin-bottom: 4px;">Target Integration Agent</label>
            <select id="pentest-target" class="dropdown-control" style="width: 100%;">
              <option value="aws-assistant">AWS Support Agent (Integrated LLM)</option>
              <option value="slack-helper">Slack Productivity Bot (Integrated LLM)</option>
              <option value="infosys-db-bot">Infosys Database Assistant (Integrated LLM)</option>
              <option value="salesforce-agent">Salesforce Customer Success AI (Integrated LLM)</option>
            </select>
          </div>
          
          <div style="flex: 1; min-width: 200px;">
            <label style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; display: block; margin-bottom: 4px;">Attack Payload / Vector</label>
            <select id="pentest-vector" class="dropdown-control" style="width: 100%;">
              <option value="jailbreak">System Instruction Bypass (Jailbreak)</option>
              <option value="exfiltrate">Tenant Data Harvest (PII Exfiltration)</option>
              <option value="poison">Indirect Prompt Injection (Web Scraping exploit)</option>
              <option value="escalate">Remote Command Execution &amp; API Key Harvest</option>
              <option value="toxic">Hallucination &amp; Toxicity Trigger</option>
            </select>
          </div>

          <button class="btn btn-primary" onclick="runAdversarialTest()" style="height: 34px; padding: 0 15px; display: flex; align-items: center; justify-content: center; font-weight: 700;">
            Launch Pentest Sweep
          </button>
        </div>

        <div class="terminal-card" style="margin-top: 10px; min-height: 240px; display: flex; flex-direction: column;">
          <div class="terminal-header" style="padding: 6px 10px; background: rgba(0,0,0,0.3); display: flex; justify-content: space-between;">
            <span style="font-size:0.7rem; font-weight:700; color:var(--color-cyan);">ADVERSARIAL ATTACK SIMULATION CONSOLE</span>
            <span class="terminal-badge" id="pentest-status" style="font-size:0.6rem;">IDLE</span>
          </div>
          <div class="terminal-body" id="pentest-logs" style="flex: 1; padding: 10px; font-family: monospace; font-size: 0.72rem; color: #f43f5e; background: rgba(0,0,0,0.25); height: 200px; overflow-y: auto;">
            <span style="color:var(--text-muted);">Select target and vector above, then click "Launch Pentest Sweep" to begin...</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// TAB 2: TLPT CAMPAIGNS (TIBER-EU LIFECYCLE)
// --------------------------------------------------------------------------
function renderCampaignsTab(container) {
  const state = getState();
  const campaigns = state.tlptCampaigns || [];
  
  const campaignRows = campaigns.map(c => `
    <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem;">
      <td style="padding: 8px 10px; color: var(--text-primary);"><b>${c.title}</b></td>
      <td style="padding: 8px 10px; color: var(--text-secondary);">${c.scenario}</td>
      <td style="padding: 8px 10px;"><span class="badge ${c.status === 'Active' ? 'badge-danger' : 'badge-info'}" style="font-size:0.6rem;">${c.status}</span></td>
      <td style="padding: 8px 10px; color: var(--text-secondary); font-weight:700;">${c.phase}</td>
      <td style="padding: 8px 10px; color: var(--text-muted);">${c.coordinator}</td>
      <td style="padding: 8px 10px; text-align: center;">
        <button class="btn btn-secondary btn-xs select-campaign-btn" data-id="${c.id}" style="padding: 2px 6px;">Manage</button>
      </td>
    </tr>
  `).join('');

  const camp = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
      <!-- Left Panel: Campaign List -->
      <div class="dashboard-card" style="flex: 1.5; min-width: 450px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0;">
        <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px; margin: 0;">
          TIBER-EU Threat-Led Penetration Testing (TLPT) Campaigns
        </h3>
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);">
                <th style="padding: 8px 10px;">Campaign Title</th>
                <th style="padding: 8px 10px;">Threat Scenario</th>
                <th style="padding: 8px 10px;">Status</th>
                <th style="padding: 8px 10px;">Active Phase</th>
                <th style="padding: 8px 10px;">Lead Coordinator</th>
                <th style="padding: 8px 10px; text-align: center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${campaignRows}
            </tbody>
          </table>
        </div>

        <!-- Simulation Section -->
        <div style="margin-top: 10px; border-top: 1px dashed var(--border-color); padding-top: 15px; display: flex; flex-direction: column; gap: 10px;">
          <h4 style="font-size:0.75rem; font-weight:700; margin: 0; color: var(--text-primary);">Launch Automated TLPT Campaign Simulation</h4>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <select id="tlpt-scenario" class="dropdown-control select-sm" style="flex: 1.5; min-width: 220px; font-size:0.72rem; margin: 0;">
              <option value="ransomware">LockBit Ransomware on CIS Identity Gateway (Oregon)</option>
              <option value="supplychain">Supply Chain Poisoning (Infosys API Hack - Bangalore)</option>
              <option value="ddos">Distributed DDoS + DNS Spoofing (Singapore)</option>
            </select>
            <button class="btn btn-primary btn-sm" id="btn-launch-tlpt" onclick="startTlptSimulation()" style="flex: 1; font-weight: 700;">🚀 Run TIBER-EU Campaign</button>
            <button class="btn btn-secondary btn-sm hidden" id="btn-stop-tlpt" onclick="stopTlptSimulation()" style="flex: 0.5; border-color: var(--color-danger); color: var(--color-danger); background: rgba(239,68,68,0.05);">Abort</button>
          </div>

          <div class="terminal-card" style="min-height: 180px; display: flex; flex-direction: column; margin-top: 5px;">
            <div class="terminal-header" style="padding: 6px 10px; background: rgba(0,0,0,0.3); display: flex; justify-content: space-between;">
              <span style="font-size:0.7rem; font-weight:700; color:var(--color-cyan);">TIBER-EU RED-TEAM SIMULATOR CONSOLE</span>
              <span class="terminal-badge" id="tlpt-status" style="font-size:0.6rem;">IDLE</span>
            </div>
            <div class="terminal-body" id="tlpt-console-logs" style="flex: 1; padding: 10px; font-family: monospace; font-size: 0.72rem; color: #38bdf8; background: rgba(0,0,0,0.25); height: 130px; overflow-y: auto;">
              <span style="color:var(--text-muted);">Select a scenario and click "Run TIBER-EU Campaign" to execute lifecycle testing.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Lifecycle Details -->
      <div class="dashboard-card" style="flex: 1.2; min-width: 380px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0;">
        <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size:0.56rem; text-transform:uppercase; color:var(--color-cyan); font-weight:700;">Campaign Scoping &amp; Details</span>
            <h3 id="campaign-title-label" style="font-size:0.95rem; font-weight:700; margin: 2px 0 0 0; color:var(--text-primary);">${camp ? camp.title : 'No Campaign Selected'}</h3>
          </div>
          <div>
            <span class="badge badge-accent" style="font-size: 0.65rem;">TIBER-EU aligned</span>
          </div>
        </div>

        <div id="campaign-detail-body" style="flex: 1; display: flex; flex-direction: column; gap: 12px; font-size: 0.72rem;">
          ${renderCampaignLifecycleDetail(camp)}
        </div>
      </div>
    </div>
  `;

  // Bind campaign select buttons
  container.querySelectorAll('.select-campaign-btn').forEach(btn => {
    btn.onclick = (e) => {
      selectedCampaignId = e.target.getAttribute('data-id');
      renderCampaignsTab(container);
    };
  });
}

function renderCampaignLifecycleDetail(camp) {
  if (!camp) return `<div style="color:var(--text-muted); text-align:center; padding:20px;">Select a campaign to load details.</div>`;

  const phases = ['Prep & Scope', 'Threat Intelligence', 'White Team Signoff', 'Red Team Exec', 'Purple Team Replay', 'Findings', 'Remediation'];
  const currentPhaseIndex = phases.findIndex(p => p.toLowerCase().includes(camp.phase.split(' ')[0].toLowerCase()));

  const phaseTimelineHtml = phases.map((phase, idx) => {
    let statusClass = 'text-muted';
    let dotColor = '#3f3f46';
    if (idx < currentPhaseIndex) {
      statusClass = 'text-success';
      dotColor = '#10b981';
    } else if (idx === currentPhaseIndex) {
      statusClass = 'text-primary font-bold';
      dotColor = '#6366f1';
    }
    return `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.7rem;">
        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${dotColor}; display: inline-block;"></span>
        <span class="${statusClass}">${phase}</span>
      </div>
    `;
  }).join('');

  return `
    <div>
      <b>Scoping Notes:</b><br/>
      <span style="color: var(--text-secondary);">${camp.scopingNotes}</span>
    </div>

    <!-- TIBER Pipeline Tracker -->
    <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 6px;">
      <span style="font-weight: 700; color: var(--text-primary); font-size: 0.72rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 4px; margin-bottom: 2px;">TIBER-EU Pipeline Progress</span>
      ${phaseTimelineHtml}
    </div>

    <!-- Phase Details -->
    <div style="display:flex; flex-direction:column; gap:8px; margin-top: 5px;">
      <div>
        <b>🕵️ Threat Intel (CTI):</b>
        <div style="background: rgba(0,0,0,0.1); border:1px solid var(--border-color); padding: 6px 8px; border-radius: 4px; color: var(--text-secondary); margin-top: 2px;">
          ${camp.threatIntel}
        </div>
      </div>

      <div>
        <b>🛡️ White Team Sign-off:</b>
        <div style="color: var(--text-secondary); margin-top: 2px;">
          ${camp.whiteTeamSignoff} (${camp.planningStatus})
        </div>
      </div>

      <div>
        <b>🛑 Red Team Log Output:</b>
        <div style="font-family: monospace; font-size: 0.68rem; color: #ef4444; background: rgba(0,0,0,0.15); border:1px solid var(--border-color); padding: 6px 8px; border-radius: 4px; margin-top: 2px; white-space: pre-wrap;">
${camp.redTeamLog}
        </div>
      </div>

      <div>
        <b>🤝 Purple Team Replay Notes:</b>
        <div style="color: var(--text-secondary); margin-top: 2px;">
          ${camp.purpleTeamFindings}
        </div>
      </div>

      <div>
        <b>🩹 Linked Findings &amp; Remediation:</b>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top: 4px;">
          ${camp.findings.length > 0 ? camp.findings.map(f => `<span class="badge badge-danger" style="font-size:0.6rem;">${f}</span>`).join('') : '<span class="badge" style="font-size:0.6rem;">None</span>'}
          <span class="badge badge-info" style="font-size:0.6rem;">Remediation: ${camp.remediationStatus}</span>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// TAB 3: AI GOVERNANCE REGISTRY
// --------------------------------------------------------------------------
function renderGovernanceTab(container) {
  const state = getState();
  const models = state.aiInventory || [];
  const risks = state.aiRisks || [];
  const incidents = state.aiIncidents || [];
  const prompts = state.promptRiskRegister || [];
  const drifts = state.hallucinations || [];

  // 1. Model Registry Rows
  const modelRows = models.map(m => `
    <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem;">
      <td style="padding: 8px 10px; color: var(--text-primary);"><b>${m.name}</b></td>
      <td style="padding: 8px 10px; color: var(--text-secondary);">${m.version}</td>
      <td style="padding: 8px 10px; color: var(--text-muted);">${m.coreLLM}</td>
      <td style="padding: 8px 10px;">${createStatusBadge(m.riskTier)}</td>
      <td style="padding: 8px 10px;"><span class="badge ${m.registryStatus === 'Approved' ? 'badge-success' : 'badge-warning'}" style="font-size:0.6rem;">${m.registryStatus}</span></td>
      <td style="padding: 8px 10px; color: var(--text-muted);">${m.lastAudited}</td>
    </tr>
  `).join('');

  // 2. Risks & Controls Matrix Rows
  const riskRows = risks.map(r => `
    <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem;">
      <td style="padding: 8px 10px; color: var(--text-primary);"><b>${r.title}</b></td>
      <td style="padding: 8px 10px; color: var(--text-secondary);">${r.category}</td>
      <td style="padding: 8px 10px;">${createStatusBadge(r.riskTier)}</td>
      <td style="padding: 8px 10px; color: var(--color-cyan); font-family: monospace;">${r.controlMapped}</td>
      <td style="padding: 8px 10px;"><span class="badge ${r.controlStatus === 'Active' ? 'badge-success' : 'badge-danger'}" style="font-size:0.6rem;">${r.controlStatus}</span></td>
      <td style="padding: 8px 10px; color: var(--text-secondary);">${r.mitigation}</td>
    </tr>
  `).join('');

  // 3. Prompt Injection Risk Registry Rows
  const promptRows = prompts.map(p => `
    <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem;">
      <td style="padding: 6px 10px; color: var(--text-primary); font-family: monospace;">${p.payload}</td>
      <td style="padding: 6px 10px; color: var(--text-secondary);">${p.vector}</td>
      <td style="padding: 6px 10px;">${createStatusBadge(p.severity)}</td>
      <td style="padding: 6px 10px; color: #10b981; font-weight: 700;">${p.status}</td>
      <td style="padding: 6px 10px; color: var(--text-muted);">${p.lastTested}</td>
    </tr>
  `).join('');

  // 4. Hallucination Logs Rows
  const driftRows = drifts.map(d => {
    const isDrift = parseFloat(d.driftFactor) > 0.3;
    return `
      <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem;">
        <td style="padding: 6px 10px; color: var(--text-muted); font-family: monospace;">${d.timestamp}</td>
        <td style="padding: 6px 10px; color: var(--text-primary);"><b>${d.model}</b></td>
        <td style="padding: 6px 10px; color: ${isDrift ? '#ef4444' : 'var(--text-secondary)'}; font-weight: 700;">${d.driftFactor}</td>
        <td style="padding: 6px 10px; color: ${isDrift ? '#ef4444' : '#10b981'}; font-weight: 700;">${d.checkResult}</td>
      </tr>
    `;
  }).join('');

  // 5. AI Incidents Logs Rows
  const incidentRows = incidents.map(i => `
    <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem;">
      <td style="padding: 6px 10px; color: var(--text-muted);">${i.date}</td>
      <td style="padding: 6px 10px; color: var(--text-primary);"><b>${i.title}</b></td>
      <td style="padding: 6px 10px;">${createStatusBadge(i.severity)}</td>
      <td style="padding: 6px 10px; color: var(--text-secondary);">${i.description}</td>
      <td style="padding: 6px 10px; color: #10b981; font-weight:700;">${i.status}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      
      <!-- Section 1: Model Registry -->
      <div class="dashboard-card" style="padding: 15px; margin: 0;">
        <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
          Institutional AI Model Registry
        </h3>
        <p class="panel-subtitle" style="margin-bottom: 12px;">Unified registry mapping organizational generative AI systems, classification parameters, and audit approvals.</p>
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);">
                <th style="padding: 8px 10px;">Model System Name</th>
                <th style="padding: 8px 10px;">Deployment version</th>
                <th style="padding: 8px 10px;">Core Foundation LLM</th>
                <th style="padding: 8px 10px;">AI Act Risk Tier</th>
                <th style="padding: 8px 10px;">Approval Status</th>
                <th style="padding: 8px 10px;">Last Audited Date</th>
              </tr>
            </thead>
            <tbody>
              ${modelRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 2: Risks & Controls matrix -->
      <div class="dashboard-card" style="padding: 15px; margin: 0;">
        <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
          AI System Cyber Risk &amp; Controls Mapping Matrix
        </h3>
        <p class="panel-subtitle" style="margin-bottom: 12px;">Map AI-specific vulnerabilities to their active security controls and defensive mitigations.</p>
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);">
                <th style="padding: 8px 10px;">Risk Description</th>
                <th style="padding: 8px 10px;">Threat Vector Category</th>
                <th style="padding: 8px 10px;">Risk Level</th>
                <th style="padding: 8px 10px;">Mapped Control ID</th>
                <th style="padding: 8px 10px;">Control Status</th>
                <th style="padding: 8px 10px;">Active Technical Mitigation</th>
              </tr>
            </thead>
            <tbody>
              ${riskRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 3: Prompts Registry & Hallucinations -->
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <!-- Prompt Risk Register -->
        <div class="dashboard-card" style="flex: 1.5; min-width: 320px; padding: 15px; margin: 0;">
          <h3 style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
            Adversarial Prompt Injection Risk Register
          </h3>
          <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.68rem; font-weight: 600; color: var(--text-secondary);">
                  <th style="padding: 8px 10px;">Injected Attack Payload</th>
                  <th style="padding: 8px 10px;">Vector</th>
                  <th style="padding: 8px 10px;">Severity</th>
                  <th style="padding: 8px 10px;">Audit Status</th>
                  <th style="padding: 8px 10px;">Tested Date</th>
                </tr>
              </thead>
              <tbody>
                ${promptRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Hallucination and drift logs -->
        <div class="dashboard-card" style="flex: 1.2; min-width: 280px; padding: 15px; margin: 0;">
          <h3 style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
            Model Temperature &amp; Hallucination Monitoring Logs
          </h3>
          <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.68rem; font-weight: 600; color: var(--text-secondary);">
                  <th style="padding: 8px 10px;">Check Timestamp</th>
                  <th style="padding: 8px 10px;">AI Model</th>
                  <th style="padding: 8px 10px;">Drift Coefficient</th>
                  <th style="padding: 8px 10px;">Evaluation Outcome</th>
                </tr>
              </thead>
              <tbody>
                ${driftRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Section 4: AI Incident Logs -->
      <div class="dashboard-card" style="padding: 15px; margin: 0;">
        <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
          Logged AI System Security &amp; Drift Incidents
        </h3>
        <p class="panel-subtitle" style="margin-bottom: 12px;">Audit history logs tracking security failures, model drifts, or hallucination events impacting business logic.</p>
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);">
                <th style="padding: 8px 10px;">Logged Date</th>
                <th style="padding: 8px 10px;">Incident Summary</th>
                <th style="padding: 8px 10px;">Severity Level</th>
                <th style="padding: 8px 10px;">Incident Impact Details</th>
                <th style="padding: 8px 10px;">Remediation Status</th>
              </tr>
            </thead>
            <tbody>
              ${incidentRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
