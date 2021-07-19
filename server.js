const express = require('express');
const dotenv = require('dotenv');
const { typeDefs } = require('./graphql/typeDefs.js');
const { resolvers } = require('./graphql/resolvers.js');
const { ApolloServer } = require('apollo-server-express');
const SuggesticSource = require('./suggesticSource');
dotenv.config();

const baseURL = process.env.API_URL;
const port = process.env.PORT || 4000;

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      suggesticAPI: new SuggesticSource(),
    };
  },
});

server.applyMiddleware({ app });

app.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  )
);
