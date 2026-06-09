pipeline {
    agent any
    
    stages {
        stage('IP Command Test') {
            steps {
                script {
                    def PUBLIC_IP = sh(
                        script: 'curl -s ifconfig.me',
                        returnStdout: true
                    ).trim()
                    echo "Public IP: ${PUBLIC_IP}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "dockerhub",
                        usernameVariable: "dockerHubUser",
                        passwordVariable: "dockerHubPass"
                    )
                ]) {
                    sh "docker login -u ${dockerHubUser} -p ${dockerHubPass}"
                    
                    // Build and tag for Docker Hub
                    sh "docker build -t ${dockerHubUser}/pulsecheck-backend:latest ./backend"
                    sh "docker build -t ${dockerHubUser}/pulsecheck-frontend:latest ./frontend"
                    
                    // Push to Docker Hub repository
                    sh "docker push ${dockerHubUser}/pulsecheck-backend:latest"
                    sh "docker push ${dockerHubUser}/pulsecheck-frontend:latest"
                }
            }
        }
        
        stage('Deploy') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "dockerhub",
                        usernameVariable: "dockerHubUser",
                        passwordVariable: "dockerHubPass"
                    )
                ]) {
                    sh """
                    export FRONTEND_IMAGE=${dockerHubUser}/pulsecheck-frontend:latest
                    export BACKEND_IMAGE=${dockerHubUser}/pulsecheck-backend:latest
                    
                    if docker compose version >/dev/null 2>&1; then
                        DOCKER_COMPOSE="docker compose"
                    else
                        DOCKER_COMPOSE="docker-compose"
                    fi
                    
                    \$DOCKER_COMPOSE down || true
                    \$DOCKER_COMPOSE pull
                    \$DOCKER_COMPOSE up -d --build --remove-orphans
                    docker image prune -af
                    """
                }
            }
        }
    }
    
    post {
        always {
            // Clean up unused docker builder cache and images on the runner host
            sh "docker image prune -f"
        }
        failure {
            echo "Pipeline failed at stage: ${env.STAGE_NAME}"
            emailext(
                subject: "Build Failed",
                body: "Please check Jenkins.",
                to: "abc@example.com"
            )
        }
        success { 
            echo "Deployed successfully live on EC2!"
            emailext(
                subject: "Build Success",
                body: '''Build completed successfully.
                         Pulsecheck is live
                ''',
                to: "pranavsinghbora@gmail.com"
            )
        }
    }
}
