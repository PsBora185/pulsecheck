pipeline {
  agent any

  environment {
    IMAGE_NAME = 'devops-intro:jenkins'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm ci'
          }
        }
      }
    }

    stage('Build') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run build'
          } else {
            bat 'npm run build'
          }
        }
      }
    }

    stage('Docker Build') {
      steps {
        script {
          if (isUnix()) {
            sh 'docker build -t $IMAGE_NAME .'
          } else {
            bat 'docker build -t %IMAGE_NAME% .'
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
    }
  }
}
