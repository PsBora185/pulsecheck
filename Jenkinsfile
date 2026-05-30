pipeline {
    // You can restrict this to your specific AWS EC2 Jenkins Agent, e.g., agent { label 'ec2-agent' }
    agent any

    environment {
        DOCKER_REGISTRY = 'your-dockerhub-username'
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/pulsecheck-frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/pulsecheck-backend"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Code Quality & Test') {
            steps {
                // Here we would run standard linters or unit tests.
                // Assuming Vite standard build as validation.
                script {
                    echo "Running tests placeholder..."
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                script {
                    if (isUnix()) {
                        sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend"
                    } else {
                        bat "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend"
                    }
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                script {
                    if (isUnix()) {
                        sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"
                    } else {
                        bat "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"
                    }
                }
            }
        }

        stage('Push Images to Registry') {
            // Uncomment and configure credentials when you have a registry ready
            /*
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    script {
                        if (isUnix()) {
                            sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                            sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                            sh "docker push ${FRONTEND_IMAGE}:latest"
                            sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                            sh "docker push ${BACKEND_IMAGE}:latest"
                        } else {
                           bat "echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin"
                           bat "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                           // ...
                        }
                    }
                }
            }
            */
            steps {
                echo "Skipping push for local validation. Uncomment Push stage to push to DockerHub."
            }
        }

        stage('Deploy to EC2 via Compose') {
            steps {
                // Since this might be running directly on the intended EC2 agent, we can just orchestrate via Docker Compose natively. 
                // For a remote server, we'd use ssh-agent to run compose there.
                script {
                    if (isUnix()) {
                        sh "docker compose up -d --build"
                    } else {
                        bat "docker-compose up -d --build"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "CI/CD Pipeline succeeded! PulseCheck is live."
        }
        failure {
            echo "Pipeline failed. Check the logs for more information."
        }
    }
}
