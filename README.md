# r101-negapollo: TypeScript Bug Squash

<img width="761" alt="Screen Shot 2020-11-17 at 9 22 38 AM" src="https://user-images.githubusercontent.com/5973981/99424742-e53bea00-28b6-11eb-9a81-34b0a9428345.png">


`r101-negapollo` is a proxy that routes all queries to `r101-apollo`, our GraphQL service, and makes a second request to a dark-launched query when needed. In this specific case, the dark launch query is made when the query string matches `nonV2ClassById`. `r101-negapollo` also has diffing logic to log if the responses of the current query and the dark-launched query were a match or a mismatch.

### Example Use Case
If we wanted to make a change to make a query more performant, we could use `r101-negapollo` and its diffing functionality to ensure that our new query worked as expected and returned the exact same data as our old query - without actually rolling it out and running the risk of returning bad data to our users.

# Your Goal: Squash The Bug!

< TBD - More details about the bug go here >

### Getting Started
1. Install the dependencies and run the dev server.
```
yarn install && yarn dev
```

2. Install [httpie](https://httpie.io/docs#installation). If you have `homebrew`, you can run the following:
```
brew install httpie
````

3. Go to https://www.classchirp.com and log in with the credentials provided by your interviewer. Make note of your auth token and CSRF token.

4. Make your first request using `httpie`!

```
# The class ID in this request is correct for the account we've set up!

http -v POST http://localhost:8081/graphql 'Cookie:auth_token=<INSERT_AUTH_TOKEN_HERE>;csrf_token=<INSERT_CSRF_TOKEN_HERE>;
client_uuid=8b3eab46-deba-4f11-aa3f-9f7f78f8398c' Accept-Encoding:text x-csrf-token:<INSERT_CSRF_TOKEN_HERE>
query="query="{ nonV2ClassById(id: 242461) { className, classCode, joinUrl } }""
```

5. Check the server logs. As long as you see < TBD - desired log line >, you're good to go - happy bug squashing!
