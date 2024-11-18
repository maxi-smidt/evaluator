FROM node:latest as build-stage
ARG BUILD_MODE

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY ./ /app/

RUN if [ "$BUILD_MODE" = "production" ]; then \
      npm run build -- --configuration=production; \
    else \
      npm run build -- --configuration=development; \
    fi


FROM nginx:alpine as production-stage

COPY --from=build-stage /app/dist/evaluator/ /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
