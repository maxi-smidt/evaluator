#!/bin/bash
set -e

echo "--- Stopping and removing existing containers ---"
docker-compose down

echo "--- Pulling latest Docker images defined in docker-compose.yml ---"
docker-compose pull

echo "--- Starting new containers in detached mode ---"
docker-compose up -d

echo "--- Waiting for Database to initialize ---"
sleep 10

echo "--- Apply Django migration ---"
docker-compose exec backend python manage.py migrate

echo "Deployment complete!"