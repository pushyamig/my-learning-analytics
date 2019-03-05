# build react components for production mode
FROM node:11.10-slim AS node-webpack
WORKDIR /usr/src/app

# NOTE:package.json not likely to change between dev builds
COPY package.json webpack.config.js /usr/src/app/
RUN yarn install

# NOTE:assets/ likely to change between dev builds
COPY assets /usr/src/app/assets
RUN yarn run prod && \
    # src is no longer needed (saves time for collect static)
    rm -rf /code/assets/src

FROM node:11.10-slim AS node-prod-deps
WORKDIR /usr/src/app

# NOTE:package.json not likely to change between dev builds
COPY package.json /usr/src/app/
ENV NODE_ENV production
RUN yarn install --production && \
    yarn add wait-port@"~0.2.2" && \
    # This is needed to clean up the examples files as these cause collectstatic to fail (and take up extra space)
    find /usr/src/app/node_modules -type d -name "examples" -print0 | xargs -0 rm -rf

# FROM directive instructing base image to build upon
FROM python:3.6 AS app

# EXPOSE port 5000 to allow communication to/from server
EXPOSE 5000
WORKDIR /code

# NOTE: requirements.txt not likely to change between dev builds
COPY requirements.txt /code/requirements.txt
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3-dev xmlsec1 cron && \
    apt-get clean -y && \
    pip install -r requirements.txt

# NOTE: project files likely to change between dev builds
COPY . /code/
# copy build react components for production mode
COPY --from=node-webpack /usr/src/app/assets /code/assets
COPY --from=node-webpack /usr/src/app/webpack-stats.json /code/webpack-stats.json
# copy node libraries for production mode
COPY --from=node-prod-deps /usr/src/app/node_modules /code/node_modules

# This DJANGO_SECRET_KEY is set here just so collectstatic runs with an empty key. It can be set to anything
RUN DJANGO_SECRET_KEY="collectstatic" python manage.py collectstatic --noinput --verbosity 0

# Sets the local timezone of the docker image
ARG TZ
ENV TZ ${TZ:-America/Detroit}
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD ["/code/start.sh"]
# done!