pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Test & Compile') {
            steps {
                sh 'docker run --rm -v "${WORKSPACE}/backend":/app -w /app maven:3.9-eclipse-temurin-17-alpine mvn test -q'
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
                    docker image prune -f
                    """
                }
            }
        }
    }
    
    post {
        failure {
            echo "Pipeline failed at stage: ${env.STAGE_NAME}"
        }
        success {
            echo "Deployed successfully live on EC2!"
        }
    }
}
