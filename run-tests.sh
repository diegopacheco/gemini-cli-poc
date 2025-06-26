#!/bin/bash

echo "Running backend tests..."
docker-compose up -d
cd backend/
go test ./...
docker-compose down

cd ../
echo "Running frontend tests..."
cd frontend/
npm install
npm run test