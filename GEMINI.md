# GEMINI.md - AI Agent Project Guide

This document provides essential information for the Gemini agent to effectively understand, navigate, and contribute to this project.

## 1. Project Overview

This is a full-stack web application featuring a Go backend and a React frontend. The application appears to involve mapping functionalities, possibly related to Brazilian states. The entire environment is containerized using Docker and managed with Docker Compose.

## 2. Tech Stack

*   **Backend:** Go
*   **Frontend:** React (with Vite), JavaScript (JSX), CSS
*   **Linting:** ESLint
*   **Containerization:** Docker, Docker Compose
*   **Package Management:** npm (frontend)

## 3. Project Structure

```
/
├── backend/                  # Go backend source
│   ├── src/main.go           # Main application logic
│   └── src/main_test.go      # Backend tests
├── frontend/                 # React frontend source
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Top-level page components
│   │   ├── App.jsx           # Root React component
│   │   └── main.jsx          # Application entry point
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── docker-compose.yml        # Defines and runs the multi-container application
├── build.sh                  # Script to build project containers
├── start.sh                  # Script to start the application
└── run-tests.sh              # Script to execute all tests
```

## 4. Key Commands

*   **Start Application:**
    *   Description: Starts the backend and frontend services using Docker Compose.
    *   Command: `bash ./start.sh`
*   **Build Project:**
    *   Description: Builds the Docker images for all services.
    *   Command: `bash ./build.sh`
*   **Run All Tests:**
    *   Description: Executes tests for both the frontend and backend.
    *   Command: `bash ./run-tests.sh`
*   **Run Backend Tests:**
    *   Description: Runs the Go tests directly.
    *   Command: `cd backend && go test ./...`
*   **Run Frontend Tests:**
    *   Description: Runs the Jest/RTL tests for the React app.
    *   Command: `cd frontend && npm test`
