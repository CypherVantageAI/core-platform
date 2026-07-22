# Cypher Vantage - Operational Resilience & DORA Compliance Platform

<p align="center">
  <img src="CypherVantage-AI.png" alt="Cypher Vantage Logo" width="160" height="160">
</p>

<p align="center">
  <strong>Autonomous Operational Resilience Management, Threat-Led Penetration Testing (TIBER-EU / TLPT), and Third-Party Risk Management (TPRM).</strong>
</p>

---

## 🎯 Overview

**Cypher Vantage** is an enterprise-grade Operational Resilience Management platform designed to map critical business services to technical infrastructure, track active threat hotspots, automate compliance with regulations like EU DORA and UK PRA, and run Threat-Led Penetration Testing (TLPT) simulations in accordance with the TIBER-EU framework.

This repository hosts the **Cypher Vantage Core Platform Interface**, a highly interactive dashboard showcasing both Risk Manager assurance views and Supplier evidence portals.

🌐 **[Live Demo on GitHub Pages](https://cyphervantageai.github.io/core-platform/)**

---

## ✨ Core Features

### 🌐 1. Op Resilience & DORA Dashboard
- **Nested Geographic Hotspot Drill-Down**: Clickable breadcrumb path (`Global > Region > Country > State > City`) mapping data centers, availability zones, and key personnel locations.
- **IBS & CIS Dependency Mapping**: Groups technical systems by external-facing **Important Business Services (IBS)** and internal-facing **Critical Internal Services (CIS)**.
- **Contextual Help Guides**: `[ ? ]` contextual micro-guides integrated on every module pane (powered by `contextualhelp.js`).
- **Compliance Alignment**: Directly traces platform controls to the **5 Core Pillars** of the EU Digital Operational Resilience Act (DORA).
- **Incident & Hotspot Simulator**: Real-time alerts for geopolitical stress and natural disasters with live failover verification logs.

### ⚡ 2. Executive Disruption Simulator
- **Interactive Disruption Scenarios**: Models 6 enterprise outage scenarios natively:
  1. `Cloud Outage (AWS us-east-1 Region Loss)`
  2. `Ransomware Data Integrity Hijack`
  3. `Third Party Supplier & Subprocessor Failure`
  4. `Identity Compromise & Privileged Access Hijack`
  5. `Payment Platform & Settlement Engine Failure`
  6. `Data Corruption & Journal Synchronization Desync`
- **Dynamic 6-Metric Engine**: Calculates Services Impacted, Customers Affected, Revenue Loss (£/hr & total loss), Statutory Regulatory Exposure (DORA Articles 11, 18, 50 & GDPR), Recovery Time (MTTR vs RTO target), and Recovery Confidence Score (%).
- **5 C-Suite Persona Readouts**: Generates board-ready outputs for:
  - 👔 `1. Executive / Board View`
  - ⚖️ `2. CRO View`
  - ⚙️ `3. COO View`
  - 🛡️ `4. CISO View`
  - 📜 `5. Regulator View`

### ⚔️ 3. TIBER-EU / Threat-Led Penetration Testing (TLPT)
- **Phase Tracker**: Visualizes red-team progress through TIBER-EU phases (Prep & Scope ➡️ Threat Intel ➡️ Red Team Exec ➡️ Closure & Replay).
- **Attack Permutation Simulator**: Launches red-teaming scenarios (Ransomware on Identity Gateways, Supply Chain Hijack, DDoS volumetric flooding, rogue administrator privilege escalation) with interactive terminal logs.
- **Resiliency Defenses**: Visually demonstrates automated container isolation and backup directory failovers in response to active attacks.

### 🤖 3. AI Auto-Collector & Evidence Parsing (TPRM)
- Automated scanning of uploaded supplier compliance documents (SOC 2, ISO 27001).
- Extracts and parses control obligations and flags compliance gaps (e.g., outdated failover drill logs).
- Allows Risk Managers to dispatch dynamic questionnaires targeting specific control modules.

### 📊 4. Intelligent Risk Scoring Models
- Dynamic risk weight calculators enabling managers to customize metrics for **ICT Security**, **Operational Resilience**, and **Governance**.
- Automatically computes tailored adjusted risk tiers (Low, Medium, High) based on real-time vendor compliance stats.

### 🗺️ 5. Continuous Attack Surface Mapping
- Real-time 360-degree digital footprint scans of external domains, VPN endpoints, and API gateways.
- **Subnet Node Discovery**: Simulates secure scans of internal VPN subnetworks to map private corporate interfaces.
- Custom target configurations to manually add new assets to active port scanning inventories.

### 🔒 6. Cryptographic File Integrity Ledger
- Registers SHA-256 signatures of evidence documents in the secure Cypher Vantage ledger.
- **Tampering Simulation**: Allows users to simulate document tampering and runs verification checks, raising alarms on hash mismatches.

### 🛡️ 7. AI Audit Suite
- **LLM DLP Gateway**: Outbound prompt proxy sanitization with real-time redaction of passwords, emails, credentials, and API keys.
- **Adversarial Agent Pentester**: Terminal simulation running DAN jailbreaks and system-prompt extraction exploits to audit third-party bot robustness.
- **EU AI Act Classifier**: Classifies vendor models into legal risk tiers (Minimal, Transparency, High, Prohibited) and lists mandatory requirements.

### 💾 8. Client-Side Database Persistence
- Implements browser `localStorage` state persistence. All uploaded files, custom audit states, dispatched tasks, scan records, resilience configurations, and security toggles persist across page refreshes.
- Quick **Reset Local Database** option in the sidebar footer to restore default demo configurations.

---

## 🚀 Getting Started

No heavy build pipelines or cloud deployments are required to run the core platform console.

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CypherVantageAI/core-platform.git
   cd core-platform
   ```

2. **Start a local development server:**
   - **Python 3:**
     ```bash
     python -m http.server 8080
     ```
   - **Node.js (http-server):**
     ```bash
     npx http-server -p 8080
     ```

3. **Open the browser:**
   Navigate to **[http://localhost:8080](http://localhost:8080)**.

---

## 🛠️ Repository Architecture

- [index.html](file:///c:/Users/samba/OneDrive/Projects/core-platform/index.html) – The core structure, layouts, and workspace panes for all dashboard views.
- [app.js](file:///c:/Users/samba/OneDrive/Projects/core-platform/app.js) – Core platform engine, simulation routines, database sync controllers, and logic handles.
- [styles.css](file:///c:/Users/samba/OneDrive/Projects/core-platform/styles.css) – Premium glassmorphic styling system, responsive grid layouts, and color tokens.
- [CypherVantage-AI.png](file:///c:/Users/samba/OneDrive/Projects/core-platform/CypherVantage-AI.png) – Brand logo asset.

---

## 🔒 Security & Support
For security issues or disclosures relating to the Cypher Vantage compliance ledger, contact our risk assurance team at **security@cyphervantage.ai**.

<p align="center">
© 2026 Cypher Vantage. All rights reserved.
</p>
