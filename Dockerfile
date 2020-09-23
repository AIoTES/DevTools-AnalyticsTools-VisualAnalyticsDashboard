 FROM nginx
 COPY ./dist /usr/share/nginx/html
 COPY ./start.sh /usr/share/nginx/html/start.sh
 EXPOSE 4650
