# Getting started with Evaluator

The first step is to check out the repository locally. Therefor you can clone the repository using the https url https://gitlab.fh-ooe.at/bin/evaluator.git. 

## Environment

The application depends on the following environment variables:  

| Tech     | Variable               | Info                                       | Default                                                    |
|----------|------------------------|--------------------------------------------|------------------------------------------------------------|
| Angular  | BUILD_MODE             | tells angular that this is development     | development                                                |
| Postgres | PG_PATH                | the path to your local postgres data mount |                                                            |
|          | PG_DB                  | the name of the database                   | postgres                                                   |
|          | PG_DB_USER             | the user of the database                   | postgres                                                   |
|          | PG_DB_PW               | the password of the database               | password                                                   |
|          | PG_HOST                | the host of the database                   | localhost                                                  |
|          | PG_PORT                | the port of the database                   | 5432                                                       |
| Django   | SECRET_KEY             |                                            | ask S2210458016                                            |
|          | DEBUG                  |                                            | True                                                       |
|          | DJANGO_SETTINGS_MODULE |                                            | backend.settings                                           |
|          | CORS_ALLOWED_ORIGINS   |                                            | http://localhost:80,http://localhost,http://localhost:4200 |
|          | ALLOWED_HOSTS          |                                            | localhost                                                  |
| GitLab   | GITLAB_AUTH_TOKEN      |                                            | ask S2210458016                                            |
|          | GITLAB_POST_URL        |                                            | https://gitlab.fh-ooe.at/api/v4/projects/1769/issues       |


## Frontend

The frontend is an angular application and relatively is to get to work. In order to work, you need an installation of node and npm.

1. navigate to the _frontend_ directory
2. run `npm install`
3. start the app `npm run start`

## Database

For the database to work, you need to have docker installed (docker desktop recommended) and also docker compose. It is important to have all the environment variables set. 

1. navigate to the project root directory
2. run `docker-compose up db`

After running the command, it should be possible to start and stop the database via docker desktop. 

![](images/db_schema.png)

## Backend

### Django

For this step it is important, that the database is already running or django cannot connect to it.

1. navigate to the _backend_ directory
2. run `python manage.py runserver`

### Spring Boot

For this you will also need docker and docker compose.

1. navigate to the project root directory
2. run `docker-compose up jplag`

## Run configurations

If you use an ide like PyCharm, it is recommended to use run configurations for easier starts.

### Backend
![](../doc/images/backend_run_config.png)

### Frontend
![](images/frontend_run_config.png)