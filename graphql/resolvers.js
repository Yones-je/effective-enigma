const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { GraphQLScalarType } = require('graphql');
const User = require('../db/models/userModel');
const MealPlan = require('../db/models/mealPlanModel');
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
    getMealPlanFromSuggestic: (_, { userId }, { dataSources }) => {
      return dataSources.suggesticAPI.getMealPlan(userId);
    },

    getMealPlanFromDb: async (_, { userId }) => {
      const mealplan = await MealPlan.findOne({ id: userId });
      console.log(mealplan);
      return mealplan;
    },

    getAllSuggesticUsers: (_, __, { dataSources }) => {
      return dataSources.suggesticAPI.getAllUsers();
    },
    getAllDbUsers: async (_, __) => {
      const users = await User.find();
      return users;
    },
    LoginUserByEmail: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user)
        return { success: false, message: 'No account with that email exists' };

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid)
        return { success: false, message: 'Email or Password is incorrect.' };
      return { success: true, message: 'Welcome in', user };
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
    generateMealPlan: async (
      _,
      {
        userId,
        addDays,
        ignoreLock,
        kcalLimit,
        maxNumOfServings,
        breakfastDistribution,
        lunchDistribution,
        dinnerDistribution,
        snackDistribution,
      },
      { dataSources }
    ) => {
      const mealPlanOptions = {
        addDays,
        ignoreLock,
        kcalLimit,
        maxNumOfServings,
        breakfastDistribution,
        lunchDistribution,
        dinnerDistribution,
        snackDistribution,
      };

      let filteredOptions = Object.fromEntries(
        Object.entries(mealPlanOptions).filter(([_, v]) => v != null)
      );

      const isGenerated = await dataSources.suggesticAPI.generateMealPlan(
        userId,
        filteredOptions
      );

      if (isGenerated.success) {
        const mealPlan = await dataSources.suggesticAPI.getMealPlan(userId);
        const existingMealPlan = await MealPlan.findOne({ id: userId });
        if (existingMealPlan) {
          await MealPlan.findOneAndUpdate({ id: userId }, { mealPlan });
          mongoLog(`Updated mealplan in DB`);
        } else if (!existingMealPlan) {
          await new MealPlan({ id: userId, mealPlan }).save();
          mongoLog(`Saved mealplan to DB`);
        }
      }
      return isGenerated;
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
