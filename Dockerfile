FROM node

RUN mkdir -p /home/Service
WORKDIR /home/Service

# Bundle app source
COPY helloapi/. /home/Service
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]
