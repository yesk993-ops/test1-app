// ============================================
// Jenkins Declarative Pipeline
// Multi-Branch CI/CD Pipeline
// ============================================

pipeline {
    agent any

    // Environment variables available to all stages
    environment {
        APP_NAME = 'jenkins-branch-demo'
        DOCKER_REGISTRY = 'docker.io/your-registry'
        DOCKER_IMAGE = "${DOCKER_REGISTRY}/${APP_NAME}"
        NODE_VERSION = '20'
        DOCKER_COMPOSE_VERSION = '2.24.0'
    }

    // Trigger pipeline on different branch events
    triggers {
        // Poll SCM every 5 minutes (for demonstration)
        pollSCM('H/5 * * * *')
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {
        // ============================================
        // STAGE 1: Checkout & Display Branch Info
        // ============================================
        stage('Checkout') {
            steps {
                script {
                    echo "============================================"
                    echo "  Branch: ${env.BRANCH_NAME}"
                    echo "  Commit: ${env.GIT_COMMIT?.take(8)}"
                    echo "  Build Number: ${env.BUILD_NUMBER}"
                    echo "============================================"
                }
                checkout scm
            }
        }

        // ============================================
        // STAGE 2: Build & Test
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
        // STAGE 3: Code Quality Check
        // ============================================
        stage('Code Quality') {
            steps {
                echo '🔍 Running code quality checks...'
                sh 'docker run --rm ${DOCKER_IMAGE}:${BUILD_NUMBER} npm run lint'
            }
        }

        // ============================================
        // STAGE 4: Deploy to DEV (only on dev branch)
        // ============================================
        stage('Deploy to DEV') {
            when {
                branch 'dev'
            }
            steps {
                echo '🚀 Deploying to DEV environment...'
                sh '''
                    docker-compose down -f docker-compose.dev.yml 2>/dev/null || true
                    docker-compose up -d app-dev
                '''
            }
            post {
                success {
                    echo '✅ DEV deployment successful! URL: http://localhost:3001'
                }
                failure {
                    echo '❌ DEV deployment failed!'
                }
            }
        }

        // ============================================
        // STAGE 5: Deploy to QA (only on qa branch)
        // ============================================
        stage('Deploy to QA') {
            when {
                branch 'qa'
            }
            steps {
                echo '🧪 Deploying to QA environment...'
                sh '''
                    docker-compose down -f docker-compose.qa.yml 2>/dev/null || true
                    docker-compose up -d app-qa
                '''
            }
            post {
                success {
                    echo '✅ QA deployment successful! URL: http://localhost:3002'
                }
                failure {
                    echo '❌ QA deployment failed!'
                }
            }
        }

        // ============================================
        // STAGE 6: Deploy to STAGING (only on staging/main branch)
        // ============================================
        stage('Deploy to STAGING') {
            when {
                branch 'staging'
            }
            steps {
                echo '🔄 Deploying to STAGING environment...'
                sh '''
                    docker-compose down -f docker-compose.staging.yml 2>/dev/null || true
                    docker-compose up -d app-staging
                '''
            }
            post {
                success {
                    echo '✅ STAGING deployment successful! URL: http://localhost:3003'
                }
            }
        }

        // ============================================
        // STAGE 7: Deploy to PRODUCTION (only on main branch)
        // ============================================
        stage('Deploy to PRODUCTION') {
            when {
                branch 'main'
            }
            steps {
                echo '🎯 Deploying to PRODUCTION...'
                input message: 'Deploy to Production?', ok: 'Yes, Deploy!'
                sh '''
                    docker-compose down -f docker-compose.prod.yml 2>/dev/null || true
                    docker-compose up -d app-prod
                '''
            }
            post {
                success {
                    echo '✅ PRODUCTION deployment successful! URL: http://localhost:3003'
                }
                failure {
                    echo '❌ PRODUCTION deployment failed!'
                }
            }
        }

        // ============================================
        // STAGE 8: Notify
        // ============================================
        stage('Notify') {
            steps {
                script {
                    def status = currentBuild.currentResult == 'SUCCESS' ? '✅ SUCCESS' : '❌ FAILED'
                    echo "Pipeline ${status} for branch: ${env.BRANCH_NAME}"
                    echo "Build URL: ${env.BUILD_URL}"
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Cleaning up...'
            sh '''
                docker image prune -f 2>/dev/null || true
            '''
        }
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '💥 Pipeline failed. Please check the logs.'
        }
    }
}
