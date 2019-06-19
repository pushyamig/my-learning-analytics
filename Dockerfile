# build react components for production mode
FROM node:11.10-alpine AS node-webpack
WORKDIR /usr/src/app
RUN ls -la

# NOTE: package.json and webpack.config.js not likely to change between dev builds
COPY package.json webpack.config.js /usr/src/app/
RUN ls -la
RUN npm install

# NOTE: assets/ likely to change between dev builds
COPY assets /usr/src/app/assets
RUN ls -la
RUN npm run prod && \
    # src is no longer needed (saves time for collect static)
    rm -rf /usr/src/app/assets/src
RUN ls -la




# build node libraries for production mode
FROM node-webpack AS node-prod-deps
RUN ls -la

RUN npm install --save wait-port@"~0.2.2" && \
    npm prune --production && \
    # This is needed to clean up the examples files as these cause collectstatic to fail (and take up extra space)
    find /usr/src/app/node_modules -type d -name "examples" -print0 | xargs -0 rm -rf
RUN ls -la




# FROM directive instructing base image to build upon
FROM python:3.6 AS app

# EXPOSE port 5000 to allow communication to/from server
EXPOSE 5000
WORKDIR /code

RUN ls -la

# NOTE: requirements.txt not likely to change between dev builds
COPY requirements.txt /code/requirements.txt
RUN ls -la
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3-dev xmlsec1 cron && \
    apt-get clean -y && \
    pip install -r requirements.txt
RUN ls -la

# NOTE: project files likely to change between dev builds
COPY . /code/
RUN ls -la
# copy built react and node libraries for production mode
COPY --from=node-prod-deps /usr/src/app/package-lock.json /code/package-lock.json
RUN ls -la
COPY --from=node-prod-deps /usr/src/app/webpack-stats.json /code/webpack-stats.json
RUN ls -la
COPY --from=node-prod-deps /usr/src/app/assets/images /code/static
RUN ls -la
COPY --from=node-prod-deps /usr/src/app/assets/dist/static /code/static
COPY --from=node-prod-deps /usr/src/app/assets /code/assets
RUN ls -la
COPY --from=node-prod-deps /usr/src/app/node_modules /code/node_modules
RUN ls -la

# This DJANGO_SECRET_KEY is set here just so collectstatic runs with an empty key. It can be set to anything
RUN echo yes | DJANGO_SECRET_KEY="collectstatic" python manage.py collectstatic --verbosity 0

# Sets the local timezone of the docker image
ARG TZ
ENV TZ ${TZ:-America/Detroit}
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD ["/code/start.sh"]
# done!