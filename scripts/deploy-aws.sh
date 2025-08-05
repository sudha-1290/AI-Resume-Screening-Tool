#!/bin/bash

# AWS Deployment Script for AI Resume Screening Tool
# This script deploys the application to AWS using ECS and RDS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
PROJECT_NAME="ai-resume-screening"
AWS_REGION="us-east-1"
ECR_REPOSITORY="${PROJECT_NAME}-backend"
CLUSTER_NAME="${PROJECT_NAME}-cluster"
SERVICE_NAME="${PROJECT_NAME}-service"
TASK_DEFINITION="${PROJECT_NAME}-task"

# Check AWS CLI
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI is configured"
}

# Create ECR repository
create_ecr_repository() {
    print_status "Creating ECR repository..."
    
    if ! aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} &> /dev/null; then
        aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${AWS_REGION}
        print_success "ECR repository created"
    else
        print_warning "ECR repository already exists"
    fi
}

# Build and push Docker image
build_and_push_image() {
    print_status "Building and pushing Docker image..."
    
    # Get ECR login token
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com
    
    # Build image
    docker build -t ${ECR_REPOSITORY}:latest .
    
    # Tag image
    docker tag ${ECR_REPOSITORY}:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
    
    # Push image
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
    
    print_success "Docker image pushed to ECR"
}

# Create ECS cluster
create_ecs_cluster() {
    print_status "Creating ECS cluster..."
    
    if ! aws ecs describe-clusters --clusters ${CLUSTER_NAME} --region ${AWS_REGION} &> /dev/null; then
        aws ecs create-cluster --cluster-name ${CLUSTER_NAME} --region ${AWS_REGION}
        print_success "ECS cluster created"
    else
        print_warning "ECS cluster already exists"
    fi
}

# Create task definition
create_task_definition() {
    print_status "Creating ECS task definition..."
    
    cat > task-definition.json << EOF
{
    "family": "${TASK_DEFINITION}",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "512",
    "memory": "1024",
    "executionRoleArn": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "${PROJECT_NAME}-container",
            "image": "$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest",
            "portMappings": [
                {
                    "containerPort": 3000,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "NODE_ENV",
                    "value": "production"
                },
                {
                    "name": "PORT",
                    "value": "3000"
                }
            ],
            "secrets": [
                {
                    "name": "DATABASE_URL",
                    "valueFrom": "arn:aws:secretsmanager:${AWS_REGION}:$(aws sts get-caller-identity --query Account --output text):secret:${PROJECT_NAME}/database-url"
                },
                {
                    "name": "JWT_SECRET",
                    "valueFrom": "arn:aws:secretsmanager:${AWS_REGION}:$(aws sts get-caller-identity --query Account --output text):secret:${PROJECT_NAME}/jwt-secret"
                },
                {
                    "name": "OPENAI_API_KEY",
                    "valueFrom": "arn:aws:secretsmanager:${AWS_REGION}:$(aws sts get-caller-identity --query Account --output text):secret:${PROJECT_NAME}/openai-api-key"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/${PROJECT_NAME}",
                    "awslogs-region": "${AWS_REGION}",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
EOF
    
    aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${AWS_REGION}
    print_success "Task definition created"
}

# Create ECS service
create_ecs_service() {
    print_status "Creating ECS service..."
    
    # Check if service exists
    if aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --region ${AWS_REGION} &> /dev/null; then
        print_warning "ECS service already exists, updating..."
        aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --task-definition ${TASK_DEFINITION} --region ${AWS_REGION}
    else
        # Create service
        aws ecs create-service \
            --cluster ${CLUSTER_NAME} \
            --service-name ${SERVICE_NAME} \
            --task-definition ${TASK_DEFINITION} \
            --desired-count 1 \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
            --region ${AWS_REGION}
    fi
    
    print_success "ECS service created/updated"
}

# Deploy frontend to S3
deploy_frontend() {
    print_status "Deploying frontend to S3..."
    
    # Build frontend
    cd frontend
    npm run build
    cd ..
    
    # Sync to S3
    aws s3 sync frontend/build/ s3://${PROJECT_NAME}-frontend --delete --region ${AWS_REGION}
    
    # Invalidate CloudFront cache
    if aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='${PROJECT_NAME}-frontend'].Id" --output text | grep -q "E"; then
        DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='${PROJECT_NAME}-frontend'].Id" --output text)
        aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*" --region ${AWS_REGION}
    fi
    
    print_success "Frontend deployed to S3"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "  AWS Deployment for AI Resume Screening"
    echo "=========================================="
    echo ""
    
    check_aws_cli
    create_ecr_repository
    build_and_push_image
    create_ecs_cluster
    create_task_definition
    create_ecs_service
    deploy_frontend
    
    echo ""
    echo "=========================================="
    print_success "AWS deployment completed!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Configure your domain with Route 53"
    echo "2. Set up SSL certificates with ACM"
    echo "3. Configure CloudFront for CDN"
    echo "4. Set up monitoring with CloudWatch"
    echo ""
}

# Run main function
main "$@" 