// ============================================
// Jenkins Multibranch Pipeline
// Branches: dev (auto-deploy), prod (manual approval)
// ============================================

pipeline {
    agent any

    environment {
        APP_NAME = 'jenkins-branch-demo'
        DOCKER_HUB_CREDS = credentials('docker-hub-creds')
        DOCKER_IMAGE = "${DOCKER_HUB_CREDS_USR}/${APP_NAME}"
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
        stage('Checkout') {
            steps {
                script {
                    echo "========================================"
                    echo "Branch: ${env.BRANCH_NAME}"
                    echo "Commit: ${env.GIT_COMMIT?.take(8)}"
                    echo "Build:  #${env.BUILD_NUMBER}"
                    echo "========================================"
                }
                checkout scm
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin'
                }
            }
        }

        stage('Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
            }
        }

        stage('Unit Test') {
            steps {
                sh "docker run --rm ${DOCKER_IMAGE}:${BUILD_NUMBER} npm test"
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh "docker run --rm aquasec/trivy:latest image --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_IMAGE}:${BUILD_NUMBER}"
            }
        }

        // ============================================
        // DEV STAGE: Auto-deploy on dev branch
        // ============================================
        stage('Deploy to DEV') {
            when {
                branch 'dev'
            }
            steps {
                sh '''
                    docker compose down app-dev 2>/dev/null || true
                    docker compose up -d app-dev
                '''
            }
            post {
                success {
                    echo 'DEV deployment successful. URL: http://localhost:3001'
                }
                failure {
                    echo 'DEV deployment failed!'
                }
            }
        }

        // ============================================
        // PROD STAGES: Manual approval then deploy
        // ============================================
        stage('Approval') {
            when {
                branch 'prod'
            }
            steps {
                script {
                    input (
                        message: 'Ready to deploy to PRODUCTION?',
                        ok: 'Yes, Deploy to Production',
                        parameters: [
                            string(
                                name: 'APPROVAL_NOTE',
                                defaultValue: '',
                                description: 'Optional approval note'
                            )
                        ]
                    )
                }
            }
        }

        stage('Deploy to PRODUCTION') {
            when {
                branch 'prod'
            }
            steps {
                sh '''
                    docker compose down app-prod 2>/dev/null || true
                    docker compose up -d app-prod
                '''
            }
            post {
                success {
                    echo 'PRODUCTION deployment successful. URL: http://localhost:3003'
                }
                failure {
                    echo 'PRODUCTION deployment failed!'
                }
            }
        }

        stage('Notify') {
            steps {
                script {
                    def status = currentBuild.currentResult == 'SUCCESS' ? 'SUCCESS' : 'FAILED'
                    echo "Pipeline ${status} | Branch: ${env.BRANCH_NAME} | Build: ${env.BUILD_URL}"
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f 2>/dev/null || true'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}
