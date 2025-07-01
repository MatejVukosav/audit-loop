#!/bin/bash

echo "🚀 Setting up Audit Loop with Docker Compose..."

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T postgres psql -U audit -d audit < packages/db/migrations.sql

# Create SQS queue using awslocal inside the LocalStack container
echo "📬 Creating SQS queue..."
docker-compose exec -T localstack awslocal sqs create-queue --queue-name audit-events --region eu-central-1

echo "✅ Setup complete! Your services are ready:"
echo "   📊 Dashboard: http://localhost:5220"
echo "   🔌 API: http://localhost:8009"
echo "   🗄️ PgAdmin: http://localhost:8080"
echo "   📬 LocalStack: http://localhost:4566"