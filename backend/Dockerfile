FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app/backend

RUN apt-get update \
  && apt-get install -y netcat-openbsd gcc postgresql \
  && apt-get clean

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

RUN pip install uwsgi

COPY . ./

CMD ["uwsgi", "--http", ":8000", "--module", "backend.wsgi"]
