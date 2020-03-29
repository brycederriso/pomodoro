#! /bin/bash
docker run -dit --name dev-server -p 8080:80 --mount type=bind,src="$(pwd)/src",dst="/usr/local/apache2/htdocs/" httpd:2.4-alpine
