# Continuous Integration

This dir holds files used in our CI server.

`Dockerfile` has the docker image that our CI runs in. To update, make changes to Dockerfile, then run:
```
docker build -t remind101/buildpack-negapollo:[your tag] ./.circleci
docker login
docker push remind101/buildpack-negapollo:[your tag]
```
You will need dockerhub access to `push`.

Then specify this tag in `circle.yml`:
```
docker:
  - image: remind101/buildpack-negapollo:[your tag]
```

To run the container locally:
```
docker build -t remind101/buildpack-negapollo ./.circleci
docker run -itd remind101/buildpack-negapollo /bin/bash
docker cp . [hash]:/root/r101-negapollo
docker attach [hash]
```
