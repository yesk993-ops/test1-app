// ============================================
// Jenkins Multibranch Pipeline
// Auto-discovers branches and PRs
// ============================================

pipeline {
    agent any

    // Environment variables available to all stages
    environment {
        APP_NAME = 'jenkins-branch-demo'
        DOCKER_REGISTRY = 'docker.io/your-registry'
        DOCKER_IMAGE = "${DOCKER_REGISTRY}/${APP_NAME}"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        // ============================================
        // STAGE 1: Checkout & Display Context
        // ============================================
        stage('Checkout') {
            steps {
                script {
                    def isPR = env.BRANCH_NAME.startsWith('PR-')
                    def branchType = isPR ? 'Pull Request' : 'Branch'
                    echo "============================================"
                    echo "  Build Type: ${branchType}"
                    echo "  Branch: ${env.BRANCH_NAME}"
                    echo "  Commit: ${env.GIT_COMMIT?.take(8)}"
                    echo "  Build Number: ${env.BUILD_NUMBER}"
                    if (isPR) {
                        echo "  PR Number: ${env.BRANCH_NAME.replace('PR-', '')}"
                    }
                    echo "============================================"
                }
                checkout scm
            }
        }

        // ============================================
        // STAGE 2: Build & Test (runs on ALL branches & PRs)
        // ============================================
        stage('Build & Test') {
            steps {
                echo '🔨 Building and testing the application...'
                sh '''
                    docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} .
                    docker run --rm ${DOCKER_IMAGE}:${BUILD_NUMBER} npm test
                '''
            }
        }

        // ============================================
        // STAGE 3: Code Quality (runs on ALL branches & PRs)
        // ============================================
        stage('Code Quality') {
            steps {
                echo '🔍 Running code quality checks...'
                sh 'docker run --rm ${DOCKER_IMAGE}:${BUILD_NUMBER} npm run lint'
            }
        }

        // ============================================
        // STAGE 4: PR Validation (ONLY for Pull Requests)
        // ============================================
        stage('PR Validation') {
            when {
                branch pattern: 'PR-*', comparator: 'GLOB'
            }
            steps {
                script {
                    echo '📋 Validating Pull Request...'
                    echo "PR ${env.BRANCH_NAME} - All checks passed!"
                    echo "Ready for review and merge."
                }
            }
        }

        // ============================================
        // STAGE 5: Deploy to DEV (dev branch only)
        // ============================================
        stage('Deploy to DEV') {
            when {
                branch 'dev'
            }
            steps {
                echo '🚀 Deploying to DEV environment...'
                sh '''
                    docker compose down 2>/dev/null || true
                    docker compose up -d app-dev
                '''
            }
            post {
                success {
                    echo '✅ DEV deployment successful!'
                    echo '🔗 URL: http://localhost:3001'
                }
                failure {
                    echo '❌ DEV deployment failed!'
                }
            }
        }

        // ============================================
        // STAGE 6: Deploy to QA (qa branch only)
        // ============================================
        stage('Deploy to QA') {
            when {
                branch 'qa'
            }
            steps {
                echo '🧪 Deploying to QA environment...'
                sh '''
                    docker compose down 2>/dev/null || true
                    docker compose up -d app-qa
                '''
            }
            post {
                success {
                    echo '✅ QA deployment successful!'
                    echo '🔗 URL: http://localhost:3002'
                }
                failure {
                    echo '❌ QA deployment failed!'
                }
            }
        }

        // ============================================
        // STAGE 7: Deploy to STAGING (staging branch only)
        // ============================================
        stage('Deploy to STAGING') {
            when {
                branch 'staging'
            }
            steps {
                echo '🔄 Deploying to STAGING environment...'
                sh '''
                    docker compose down 2>/dev/null || true
                    docker compose up -d app-staging
                '''
            }
            post {
                success {
                    echo '✅ STAGING deployment successful!'
                    echo '🔗 URL: http://localhost:3004'
                }
            }
        }

        // ============================================
        // STAGE 8: Deploy to PRODUCTION (main branch only)
        // ============================================
        stage('Deploy to PRODUCTION') {
            when {
                branch 'main'
            }
            steps {
                echo '🎯 Deploying to PRODUCTION...'
                input message: 'Deploy to Production?', ok: 'Yes, Deploy!'
                sh '''
                    docker compose down 2>/dev/null || true
                    docker compose up -d app-prod
                '''
            }
            post {
                success {
                    echo '✅ PRODUCTION deployment successful!'
                    echo '🔗 URL: http://localhost:3003'
                }
                failure {
                    echo '❌ PRODUCTION deployment failed!'
                }
            }
        }

        // ============================================
        // STAGE 9: Notify
        // ============================================
        stage('Notify') {
            steps {
                script {
                    def status = currentBuild.currentResult == 'SUCCESS' ? '✅ SUCCESS' : '❌ FAILED'
                    echo "============================================"
                    echo "  Pipeline ${status}"
                    echo "  Branch: ${env.BRANCH_NAME}"
                    echo "  Build: ${env.BUILD_URL}"
                    echo "============================================"
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Cleaning up...'
            sh 'docker image prune -f 2>/dev/null || true'
        }
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '💥 Pipeline failed. Please check the logs.'
        }
    }
}
