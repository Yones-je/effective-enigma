const dotenv = require('dotenv');
const { GraphQLScalarType } = require('graphql');

dotenv.config({ path: '../.env' });

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.toISOString();
  },
});

module.exports.resolvers = {
  Date: dateScalar,
  Query: {
    hello: () => 'Hello World!',
    recipe: id => {
      `The recipe id is ${id}`;
    },
  },
};
