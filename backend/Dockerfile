FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app/backend

RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-xlib-2.0-0 \
    libcairo2 \
    libgirepository1.0-dev \
    gobject-introspection \
    shared-mime-info \
    netcat-openbsd gcc postgresql \
    && apt-get clean

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

RUN pip install uwsgi

COPY . ./

EXPOSE 8080

WORKDIR /app
CMD ["uwsgi", "--http", ":8080", "--module", "backend.wsgi:application"]
