# Cypher Vantage - Third-Party Risk & Compliance Platform

<p align="center">
  <img src="CypherVantage-AI.png" alt="Cypher Vantage Logo" width="160" height="160">
</p>

<p align="center">
  <strong>Autonomous Third-Party Risk Management (TPRM), Cryptographic Ledger Audit, and AI Governance Gateway.</strong>
</p>

---

## 🎯 Overview

**Cypher Vantage** is an advanced Third-Party Risk Management (TPRM) platform designed to automate compliance collection, map external attack surfaces, audit document integrity via cryptography, and govern artificial intelligence vendor integrations.

This repository hosts the **Cypher Vantage Core Platform Interface**, a highly interactive dashboard showcasing both Risk Manager assurance views and Supplier evidence submission portals.

🌐 **[Live Demo on GitHub Pages](https://cyphervantageai.github.io/core-platform/)**

---

## ✨ Core Features

### 🤖 1. AI Auto-Collector & Evidence Parsing
- Automated scanning of uploaded supplier compliance documents (SOC 2, ISO 27001).
- Extracts and parses control obligations and flags compliance gaps (e.g., outdated failover drill logs).
- Allows Risk Managers to dispatch dynamic questionnaires targeting specific control modules.

### 📊 2. Intelligent Risk Scoring Models
- Dynamic risk weight calculators enabling managers to customize metrics for **ICT Security**, **Operational Resilience**, and **Governance**.
- Automatically computes tailored adjusted risk tiers (Low, Medium, High) based on real-time vendor compliance stats.

### 🗺️ 3. Continuous Attack Surface Mapping
- Real-time 360-degree digital footprint scans of external domains, VPN endpoints, and API gateways.
- **Subnet Node Discovery**: Simulates secure scans of internal VPN subnetworks to map private corporate interfaces.
- Custom target configurations to manually add new assets to active port scanning inventories.

### 🔒 4. Cryptographic File Integrity Ledger
- Registers SHA-256 signatures of evidence documents in the secure Cypher Vantage ledger.
- **Tampering Simulation**: Allows users to simulate document tampering and runs verification checks, raising alarms on hash mismatches.

### 🛡️ 5. AI Risk Governance Suite (New)
- **LLM DLP Gateway**: Outbound prompt proxy sanitization with real-time redaction of passwords, emails, credentials, and API keys.
- **Adversarial Agent Pentester**: Terminal simulation running DAN jailbreaks and system-prompt extraction exploits to audit third-party bot robustness.
- **EU AI Act Classifier**: Classifies vendor models into legal risk tiers (Minimal, Transparency, High, Prohibited) and lists mandatory requirements.

### 💾 6. Client-Side Database Persistence
- Implements browser `localStorage` state persistence. All uploaded files, custom audit states, dispatched tasks, scan records, and security toggles persist across page refreshes.
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
