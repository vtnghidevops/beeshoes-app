FROM alpine:3.22.1

RUN apk add --no-cache mysql-client
WORKDIR /init

COPY bee-shoes-db-1.sql /init/bee-shoes-db-1.sql
COPY wait-for-mysql-and-init.sh /init/wait-for-mysql-and-init.sh

RUN chmod +x /init/wait-for-mysql-and-init.sh

CMD ["sh", "-c", "ls -ltra /init && /init/wait-for-mysql-and-init.sh"]