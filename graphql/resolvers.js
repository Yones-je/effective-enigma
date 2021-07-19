const dotenv = require('dotenv');
const { GraphQLScalarType } = require('graphql');

dotenv.config({ path: '../.env' });

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  parseValue(value) {
    return new Date(value).toISOString().substring(0, 10);
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
    updateUserProfile: (
      _,
      {
        userId,
        birthdate,
        biologicalSex,
        height,
        startingWeight,
        targetWeight,
        activityLevel,
        weeklyWeightGoal,
        goalsOn,
      },
      { dataSources }
    ) => {
      const profile = {
        birthdate,
        biologicalSex,
        height,
        startingWeight,
        targetWeight,
        activityLevel,
        weeklyWeightGoal,
        goalsOn,
      };
      return dataSources.suggesticAPI.updateUserProfile(userId, profile);
    },
  },
};
