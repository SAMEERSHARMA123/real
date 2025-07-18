import {
  ApolloClient,
  InMemoryCache,
  
} from "@apollo/client";
// Use the correct ESM export for apollo-upload-client v18+
import { createUploadLink } from "apollo-upload-client";

const uploadLink = createUploadLink({
  uri: "http://localhost:5000/graphql", // ✅ your backend GraphQL URL
  credentials: "include", // ✅ if you're using cookies
});

const client = new ApolloClient({
  link: uploadLink,
  cache: new InMemoryCache(),
});
export default client;



// // src/apolloClient.js
// import { ApolloClient, InMemoryCache } from "@apollo/client";

// const client = new ApolloClient({
//   uri: "http://localhost:5000/graphql",
//   credentials: "include", // for sending cookies with every request
//   cache: new InMemoryCache(),
// });

// export default client;
