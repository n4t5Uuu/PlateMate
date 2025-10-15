FROM alpine:3.19

WORKDIR /pb

# Download PocketBase 
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.10/pocketbase_0.22.10_linux_amd64.zip /pb/pb.zip

RUN apk add --no-cache unzip \
    && unzip pb.zip \
    && rm pb.zip

EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
