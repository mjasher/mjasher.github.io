```
docker run -it -v $PWD:/shared -w /shared node:alpine npm install

docker run -it -v $PWD:/shared -w /shared node:alpine npm install --only=dev

docker run -it -v $PWD:/shared -w /shared node:alpine npm install --global gulp-cli
```

```
FROM library/node:alpine
RUN npm install -g gulp-cli
WORKDIR /shared
CMD ["bash"]
```