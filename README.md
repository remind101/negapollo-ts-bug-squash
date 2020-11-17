# r101-negapollo

<img width="761" alt="Screen Shot 2020-11-17 at 9 22 38 AM" src="https://user-images.githubusercontent.com/5973981/99424742-e53bea00-28b6-11eb-9a81-34b0a9428345.png">

`r101-negapollo` is a proxy that routes all queries to `r101-apollo`, our GraphQL service. `r101-negapollo` is used for doing dark launches and diffs when we want to test the rollout of new queries without the risk of returning bad data to our users.
