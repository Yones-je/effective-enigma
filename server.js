const express = require('express');
const dotenv = require('dotenv');
const { dbConnect } = require('./db/index');
const { typeDefs } = require('./graphql/typeDefs.js');
const { resolvers } = require('./graphql/resolvers.js');
const { ApolloServer } = require('apollo-server-express');
const { SuggesticSource } = require('./suggesticSource');

dotenv.config();
const port = process.env.PORT || 4000;

const app = express();

dbConnect(process.env.DB_CONNECTION);

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
    `🚀 ${new Date().toLocaleString()}: Server running on http://localhost:${port}${
      server.graphqlPath
    }`
  )
);
