FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
ARG REACT_APP_API_URL=http://localhost:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
