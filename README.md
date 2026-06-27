# 🚀 Jenkins Multi-Branch CI/CD Demo

A hands-on project to learn **Git branching**, **Jenkins pipelines**, **Pull Requests**, and **Docker deployment**.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Branch Strategy](#branch-strategy)
3. [How PRs Work](#how-prs-work)
4. [How Pipelines Get Triggered](#how-pipelines-get-triggered)
5. [Setup Instructions](#setup-instructions)
6. [Hands-On Exercises](#hands-on-exercises)

---

## 🎯 Project Overview

This project demonstrates a real-world CI/CD workflow:

- **4 Branches**: `main`, `dev`, `qa`, `prod`
- **Docker**: Build and deploy locally
- **Jenkins**: Automated pipeline triggered by branch events
- **Pull Requests**: Code review workflow

---

## 🔀 Branch Strategy

```
main (production)
 ├── dev (development - where features are built)
 │    └── feature/* (individual feature branches)
 ├── qa (quality assurance - testing)
 └── prod (production release)
```

### Branch Roles

| Branch | Purpose | Deploy Target | Port |
|--------|---------|---------------|------|
| `main` | Default branch, production-ready code | Production | 3003 |
| `dev` | Active development, integration | Development | 3001 |
| `qa` | Testing & validation | QA Environment | 3002 |
| `prod` | Production releases | Production | 3003 |
| `feature/*` | Individual features | Dev | 3001 |

---

## 🔄 How Pull Requests (PRs) Work

### The PR Workflow (Step by Step)

```
Developer                    Git/GitHub                      Team Lead
    │                            │                              │
    │  1. Create feature branch  │                              │
    ├───────────────────────────>│                              │
    │                            │                              │
    │  2. Make changes & commit  │                              │
    ├───────────────────────────>│                              │
    │                            │                              │
    │  3. Push to remote         │                              │
    ├───────────────────────────>│                              │
    │                            │                              │
    │  4. Create PR:             │                              │
    │     feature/* → dev        │                              │
    ├───────────────────────────>│──── 5. Notify reviewer ─────>│
    │                            │                              │
    │                            │<──── 6. Review code ─────────┤
    │                            │                              │
    │                            │──── 7. Approve/Reject ──────>│
    │                            │                              │
    │<──── 8. Merge to dev ──────│                              │
    │                            │                              │
    │  9. Pipeline triggers!     │──── 10. Deploy to Dev ──────>│
```

### PR Command Examples

```bash
# Step 1: Create feature branch from dev
git checkout dev
git checkout -b feature/add-login-button

# Step 2: Make changes
echo "Login button added" >> login.html
git add .
git commit -m "feat: add login button"

# Step 3: Push to remote
git push origin feature/add-login-button

# Step 4: Create PR on GitHub
gh pr create --base dev --head feature/add-login-button \
  --title "Add Login Button" \
  --body "Added a responsive login button to the homepage"

# Step 5: After PR is approved and merged to dev
# Jenkins pipeline triggers automatically!

# Step 6: Promote to QA
git checkout qa
git merge dev
git push origin qa
# Jenkins pipeline triggers for QA deployment!

# Step 7: After QA testing, promote to Production
git checkout main
git merge qa
git push origin main
# Jenkins pipeline triggers for Production deployment!
```

---

## ⚡ How Pipelines Get Triggered

### Trigger Methods

| Trigger | When | How It Works |
|---------|------|--------------|
| **Branch Push** | Code pushed to any branch | Jenkins scans branches, triggers matching jobs |
| **PR Created** | Pull request opened | Jenkins runs PR validation pipeline |
| **PR Updated** | New commits to PR branch | Jenkins re-runs PR pipeline |
| **PR Merged** | PR merged to target branch | Jenkins triggers deployment pipeline |
| **Poll SCM** | Every 5 minutes | Jenkins checks for new commits |
| **Manual** | User clicks "Build Now" | Manual trigger in Jenkins UI |

### Pipeline Flow per Branch

```
┌─────────────────────────────────────────────────────────┐
│                    FEATURE BRANCH                        │
│  Push → Build → Test → PR Pipeline → Review → Merge     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (Merge PR)
┌─────────────────────────────────────────────────────────┐
│                       DEV BRANCH                         │
│  Push/Merge → Build → Test → Lint → Deploy to Dev       │
│                    Container: jenkins-demo-dev :3001    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (Merge to QA)
┌─────────────────────────────────────────────────────────┐
│                       QA BRANCH                          │
│  Push/Merge → Build → Test → Lint → Deploy to QA        │
│                    Container: jenkins-demo-qa :3002     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (Merge to Main)
┌─────────────────────────────────────────────────────────┐
│                      MAIN/PROD BRANCH                    │
│  Push/Merge → Build → Test → Lint → Manual Approve      │
│                    → Deploy to Production                │
│                    Container: jenkins-demo-prod :3003   │
└─────────────────────────────────────────────────────────┘
```

### Jenkinsfile Branch Conditions

```groovy
// Only deploy to DEV when branch is 'dev'
stage('Deploy to DEV') {
    when {
        branch 'dev'    // ← This condition gates the stage
    }
    steps {
        sh 'docker-compose up -d app-dev'
    }
}

// Only deploy to QA when branch is 'qa'
stage('Deploy to QA') {
    when {
        branch 'qa'
    }
    steps {
        sh 'docker-compose up -d app-qa'
    }
}

// Production requires manual approval!
stage('Deploy to PRODUCTION') {
    when {
        branch 'main'
    }
    steps {
        input message: 'Deploy to Production?'  // ← Human approval
        sh 'docker-compose up -d app-prod'
    }
}
```

---

## 🛠 Setup Instructions

### Prerequisites

```bash
# Install Docker
sudo apt update && sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
# Log out and back in for docker group changes

# Install Jenkins
sudo apt install -y openjdk-17-jdk
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list
sudo apt update && sudo apt install -y jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

### Quick Start

```bash
# 1. Clone this repo
git clone <your-repo-url>
cd jenkins-branch-demo

# 2. Initialize git and create branches
git init
git checkout -b main
git add . && git commit -m "Initial commit"

# 3. Create branch structure
git checkout -b dev
git checkout -b qa
git checkout main
git checkout -b prod

# 4. Build and run all environments with Docker
docker-compose up -d --build

# 5. Verify
curl http://localhost:3001/health  # Dev
curl http://localhost:3002/health  # QA
curl http://localhost:3003/health  # Prod
```

---

## 🎮 Hands-On Exercises

### Exercise 1: Create a Feature Branch & PR

```bash
# From dev branch, create a feature
git checkout dev
git checkout -b feature/update-title

# Make a change in server.js (modify the title)
# Then commit and push
git add .
git commit -m "feat: update page title"
git push origin feature/update-title

# Create PR on GitHub (or use gh CLI)
gh pr create --base dev --title "Update Page Title" --body "Updated the page title"

# After PR is merged, dev branch will trigger the pipeline!
```

### Exercise 2: Promote Through Environments

```bash
# After testing on dev, promote to QA
git checkout qa
git merge dev
git push origin qa
# Watch Jenkins deploy to QA (http://localhost:3002)

# After QA testing, promote to Production
git checkout main
git merge qa
git push origin main
# Watch Jenkins deploy to Production (http://localhost:3003)
```

### Exercise 3: Docker Commands for Each Environment

```bash
# Build for specific environment
ENVIRONMENT=dev docker-compose up -d app-dev

# Check running containers
docker ps | grep jenkins-demo

# View logs
docker logs jenkins-demo-dev -f

# Stop specific environment
docker-compose stop app-dev

# Restart all
docker-compose down && docker-compose up -d --build
```

---

## 🔍 Useful Commands

```bash
# View all branches
git branch -a

# View commit history with graph
git log --oneline --graph --all

# Check which branch triggers which deployment
grep -A5 "when {" Jenkinsfile

# Check Docker container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Access container shell
docker exec -it jenkins-demo-dev sh

# View Jenkins logs
sudo journalctl -u jenkins -f
```

---

## 📁 Project Structure

```
jenkins-branch-demo/
├── server.js              # Main application
├── test.js                # Test suite
├── package.json           # Dependencies
├── Dockerfile             # Docker build instructions
├── docker-compose.yml     # Multi-environment deployment
├── Jenkinsfile            # CI/CD pipeline definition
├── .gitignore             # Git ignore rules
├── .dockerignore          # Docker ignore rules
└── README.md              # This file
```

---

## 🎯 Expected Workflow Diagram

```
Developer writes code
        │
        ▼
Feature Branch (feature/*)
        │
        ├── Build & Test (automated)
        │
        ▼
Pull Request to dev
        │
        ├── Code Review (team reviews)
        │
        ▼
Merge to dev
        │
        ├── Jenkins Pipeline Triggers
        ├── Build Docker Image
        ├── Run Tests
        ├── Deploy to Dev (port 3001)
        │
        ▼
QA Testing on dev
        │
        ▼
Merge to qa
        │
        ├── Jenkins Pipeline Triggers
        ├── Deploy to QA (port 3002)
        │
        ▼
QA Approval
        │
        ▼
Merge to main
        │
        ├── Jenkins Pipeline Triggers
        ├── Deploy to Production (port 3003)
        └── Manual Approval Required
```

---

## 💡 Tips

1. **Always create feature branches** from `dev`, never directly commit to `dev`
2. **Use descriptive commit messages**: `feat:`, `fix:`, `chore:`, `docs:`
3. **Keep PRs small** - easier to review and merge
4. **Check Jenkins dashboard** after pushes to see pipeline status
5. **Use `docker-compose logs -f`** to watch deployments in real-time

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | `docker-compose down && docker-compose up -d` |
| Jenkins not starting | `sudo systemctl restart jenkins` |
| Permission denied | `sudo usermod -aG docker $USER` then logout/login |
| Build fails | Check `docker logs <container-name>` |

---

**Happy Learning! 🎉**
