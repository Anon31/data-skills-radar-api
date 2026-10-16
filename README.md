# ⚙️ Data Skills Radar - REST API Backend

Welcome to the Backend API repository of the Data Skills Radar project.
This application is the secure intermediate layer of a global Decision Support System (DSS) designed to analyze and predict the impact of Artificial Intelligence on employment trends and skill mutations in France.

The source code for the frontend UI can be found at `data-skills-radar-app`, and the Big Data infrastructure (Ingestion, PySpark) at `data-skills-radar-lakehouse`.

> **🇫🇷 Language Policy:** While this README is in English for international visibility, the detailed architectural documentation (in the `docs/` folder) and the Git commit messages are written in French. This aligns with the local academic and business context of this specific project (French employment data).

## 🎯 Purpose of this application

This API acts as the crucial bridge between the user interface and the data infrastructure. It is designed with strict **Hexagonal Architecture (Ports and Adapters)** principles to ensure:
- **Security:** It acts as a shield, hiding all sensitive credentials (like S3/MinIO access keys) from the client browser.
- **Performance & Caching:** It prevents the data infrastructure from being overloaded by multiple concurrent users by implementing a caching strategy for heavy analytical queries.
- **Data Connection:** It utilizes a native DuckDB driver for Node.js to directly query massive Apache Parquet datasets, executing Zero-ETL analytical workloads on the fly.

## 🛠️ Tech Stack
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Architecture:** Hexagonal Architecture
- **Data Connector:** DuckDB native Node.js driver
- **Testing Engine:** Vitest
- **CI/CD:** GitHub Actions & Docker (Unprivileged)

## 🚀 Quick Start (Local Development)

### Prerequisites
Ensure you have Node.js (version 24 or higher) installed on your machine.

### Installation
1. Clone the repository:
```bash
git clone https://github.com/Anon31/data-skills-radar-api.git
cd data-skills-radar-api
```

2. Install project dependencies:
```bash
npm install
```

3. Start the development server (Hot-reload enabled):
```bash
npm run start:dev
```

4. Run unit tests (Vitest):
```bash
npm run test
```

## 🤝 Contribution Guidelines (GitOps)
This project strictly adheres to industrial software engineering standards:
- **Commit Language:** Commit descriptions must be written in French (e.g., `feat(domain): ajout du calcul de score IA`).
- **Conventional Commits:** All commit messages must follow the `type(scope): description` syntax.
- **Branch Naming:** Developments must be done on ephemeral branches following the `type/context/short-description` format (e.g., `feat/duckdb/connector`) before being merged via Pull Request.
- **Main Branches:** `master` (Production) and `develop` (Integration).

## ⚖️ License
This project is licensed under the MIT License. You are free to use, modify, and distribute this software, provided that the original copyright notice is included. See the LICENSE file for more details.