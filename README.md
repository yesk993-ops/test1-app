# Jenkins Multi-Branch CI/CD Demo (2-Branch Model)

A hands-on project demonstrating a **multi-branch pipeline** with only **2 branches**: `prod` and `dev`.

## Branch Strategy

```
prod (production - manual approval required)
 └── dev (development - auto-deploy on push)
      └── feature/* (feature branches, PR → dev)
```

| Branch | Trigger | Deploy | Port |
|--------|---------|--------|------|
| `dev` | Push/PR merge | Auto-deploy to DEV | 3001 |
| `prod` | Push/PR merge | Manual approval required | 3003 |

## Pipeline Flow

```
Developer pushes code to dev
         │
         ▼
  ┌─────────────────────┐
  │  1. Build           │
  │  2. Unit Test       │
  │  3. Trivy Scan      │
  │  4. Deploy to DEV   │  ← auto on dev branch
  └─────────────────────┘
         │
         ▼
  QA verifies on dev (http://localhost:3001)
         │
         ▼
  Create PR: dev → prod
         │
         ▼
  ┌──────────────────────────────┐
  │  1. Build                    │
  │  2. Unit Test                │
  │  3. Trivy Scan               │
  │  4. Manual Approval (input)  │  ← human gate
  │  5. Deploy to PRODUCTION     │
  └──────────────────────────────┘
```

## Quick Start

```bash
# Clone
git clone <repo-url>
cd test1-app

# Build and run all environments
docker compose up -d --build

# Verify
curl http://localhost:3001/health  # Dev
curl http://localhost:3003/health  # Prod
```

## Workflow

### Dev (auto-deploy)
```bash
git checkout dev
# Make changes, commit, push
git add . && git commit -m "feat: new feature"
git push origin dev
# Jenkins triggers: Build → Test → Trivy → Deploy to DEV
```

### Prod (manual approval)
```bash
# After dev is verified, merge to prod
git checkout prod
git merge dev
git push origin prod
# Jenkins triggers: Build → Test → Trivy → Approval → Deploy to PROD
```

## Project Structure

```
├── server.js           # Node.js app with /health and /api/info endpoints
├── test.js             # Unit tests
├── package.json        # Dependencies
├── Dockerfile          # Docker image (multi-stage)
├── docker-compose.yml  # Dev (3001) + Prod (3003) services
├── Jenkinsfile         # Multi-branch pipeline definition
└── README.md           # This file
```
