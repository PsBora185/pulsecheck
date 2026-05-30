pipeline {
    agent { label "project" }
    
    environment {
        SERVER_IP = ''
    }
    
    stages {
        stage('Node info') {
            steps {
                echo "Running on ${env.NODE_NAME}"
            }
        }
        stage('Debug') {
            steps {
                sh '''
                whoami
                groups
                docker ps
                '''
            }
        }     l̥
        stage('Code') {
            steps {
                echo 'Fetching the code'
                git url: "https://github.com/PsBora185/devops-intro.git",
                branch: "main"
                echo 'Code cloning successful'
            }
        }
        stage('Docker build') {
            steps {
                echo 'Building Docker images'
                sh 'docker build -t pulsecheck-frontend:latest ./frontend'
                sh 'docker build -t pulsecheck-backend:latest ./backend'
            }
        }
        stage('DockerHub Push') {
            steps {
                echo 'Login to docker'
                withCredentials([
                    usernamePassword(
                        credentialsId: "dockerhub",
                        usernameVariable: "dockerHubUser",
                        passwordVariable: "dockerHubPass"
                    )
                ]) {
                    sh "docker login -u ${dockerHubUser} -p ${dockerHubPass}"
                    echo 'Push images to docker hub'
                    
                    // Tag images for Docker Hub
                    sh "docker image tag pulsecheck-frontend:latest ${dockerHubUser}/pulsecheck-frontend:latest"
                    sh "docker image tag pulsecheck-backend:latest ${dockerHubUser}/pulsecheck-backend:latest"
                    
                    // Push images
                    sh "docker push ${dockerHubUser}/pulsecheck-frontend:latest"
                    sh "docker push ${dockerHubUser}/pulsecheck-backend:latest"
                }
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying using docker compose'
                withCredentials([
                    usernamePassword(
                        credentialsId: "dockerhub",
                        usernameVariable: "dockerHubUser",
                        passwordVariable: "dockerHubPass"
                    )
                ]) {
                    sh """
                    # Inject variables for docker-compose.yml to pull the correct images
                    export FRONTEND_IMAGE=${dockerHubUser}/pulsecheck-frontend:latest
                    export BACKEND_IMAGE=${dockerHubUser}/pulsecheck-backend:latest
                    
                    docker compose down || true
                    docker compose pull
                    docker compose up -d
                    """
                }
                echo 'App is Live!'
            }
        }
    }

    post {
        success {
            mail(
                to: 'pranavsinghbora@gmail.com',

                subject: 'Jenkins Build Success - PulseCheck',

                body: """
Build completed successfully.
Project deployed successfully.
Running on node: ${env.NODE_NAME}

Application Live At: http://${env.SERVER_IP}:8000
Backend API Live At: http://${env.SERVER_IP}:3000
Check Jenkins dashboard for more details.
"""
            )
        }
        failure {
            mail(
                to: 'pranavsinghbora@gmail.com',
                subject: 'Jenkins Build Failed - PulseCheck',
                body: """
Build failed.
Running on node: ${env.NODE_NAME}

Check Jenkins console output for errors.
"""
            )
        }
    }
}
