const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { GraphQLScalarType } = require('graphql');
const User = require('../db/models/userModel');
const { mongoLog, apiLog } = require('../utils/eventLogger');

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
    getAllSuggesticUsers: (_, __, { dataSources }) => {
      return dataSources.suggesticAPI.getAllUsers();
    },
    getAllDbUsers: async (_, __) => {
      const users = await User.find();
      return users;
    },
  },
  Mutation: {
    createUser: async (_, { name, email, password }, { dataSources }) => {
      const suggesticUser = await dataSources.suggesticAPI.createUser(
        name,
        email
      );

      if (suggesticUser.success) {
        const hashedPassword = await bcrypt.hash(password, 10);

        await new User({
          databaseId: suggesticUser.user.databaseId,
          name: suggesticUser.user.name,
          email: suggesticUser.user.email,
          password: hashedPassword,
        }).save();

        mongoLog(`Created user ${suggesticUser.user.databaseId}`);
      }

      return suggesticUser;
    },

    deleteUser: async (_, { userId }, { dataSources }) => {
      try {
        const isDeletedUser = await User.findOneAndDelete({
          databaseId: userId,
        });
        if (!isDeletedUser) throw new Error(`Could not delete user ${userId}`);

        mongoLog(`Deleted user ${userId}`);
        return dataSources.suggesticAPI.deleteUser(userId);
      } catch (err) {
        mongoLog(err);
      }
    },
    updateUserProfile: async (
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

      try {
        const updatedUser = await dataSources.suggesticAPI.updateUserProfile(
          userId,
          profile
        );
        if (!updatedUser) {
          throw new Error(`Could not update user ${userId}`);
        }
        if (updatedUser.success) {
          const update = { profile };
          await User.findOneAndUpdate({ databaseId: userId }, update, {
            new: true,
          });
          mongoLog(`Updated user ${userId}`);
        }
        return updatedUser;
      } catch (err) {
        mongoLog(err);
        return err;
      }
    },
  },
};
