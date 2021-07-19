const dotenv = require('dotenv');
const { GraphQLScalarType } = require('graphql');

dotenv.config({ path: '../.env' });

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  parseValue(value) {
    return new Date(value).toISOString();
  },
});

module.exports.resolvers = {
  Date: dateScalar,
  Query: {
    hello: () => 'Hello World!',
    getMealPlan: (_, { userId }, { dataSources }) => {
      return dataSources.suggesticAPI.getMealPlan(userId);
    },
    getAllUsers: (_, __, { dataSources }) => {
      return dataSources.suggesticAPI.getAllUsers();
    },
  },
  Mutation: {
    createUser: (_, { name, email }, { dataSources }) => {
      return dataSources.suggesticUserAPI.createUser(name, email);
    },
  },
  //My discord is frozen
};
