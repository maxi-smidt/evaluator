#!/bin/bash
set -e

echo "--- Stopping and removing existing containers ---"
docker-compose down

echo "--- Pulling latest code from Git ---"
git pull

echo "--- Pulling latest Docker images defined in docker-compose.yml ---"
docker-compose pull

echo "--- Starting new containers in detached mode ---"
docker-compose up -d

echo "Deployment complete!"