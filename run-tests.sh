#!/bin/bash

echo "Running backend tests..."
cd backend/
go test ./...

cd ../
echo "Running frontend tests..."
cd frontend/
npm install
npm run test