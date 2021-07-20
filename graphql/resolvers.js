const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { GraphQLScalarType } = require('graphql');
const User = require('../db/models/userModel');

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
    createUser: async (_, { name, email, password }, { dataSources }) => {
      const suggesticUser = await dataSources.suggesticAPI.createUser(
        name,
        email
      );

      const hashedPassword = await bcrypt.hash(password, 10);

      const mongoUser = await new User({
        databaseId: suggesticUser.user.databaseId,
        name: suggesticUser.user.name,
        email: suggesticUser.user.email,
        password: hashedPassword,
      }).save();

      return suggesticUser;
    },

    deleteUser: (_, { userId }, { dataSources }) => {
      return dataSources.suggesticAPI.deleteUser(userId);
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
