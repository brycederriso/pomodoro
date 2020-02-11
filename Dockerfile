FROM httpd:2.4-alpine as dev
COPY ./src /usr/local/apache2/htdocs/

FROM httpd:2.4-alpine
COPY --from=dev /usr/local/apache2/htdocs/ /usr/local/apache2/htdocs/
