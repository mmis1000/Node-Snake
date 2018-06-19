FROM node:9.11.2-jessie

WORKDIR '/app'
RUN npm install bower -g\
 && npm install webpack webpack-cli -g

ADD . /app
RUN npm install\
 && bower install --allow-root\
 && webpack
 
CMD node /app/server.js