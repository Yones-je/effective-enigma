const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { GraphQLScalarType } = require('graphql');
const User = require('../db/models/userModel');
const MealPlan = require('../db/models/mealPlanModel');
const Recipe = require('../db/models/recipeModel');
const Restriction = require('../db/models/restrictionModel');
const { mongoLog, apiLog } = require('../utils/eventLogger');
const extractRecipes = require('../utils/extractRecipes');
const swapMeal = require('../utils/swapMeal');
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
      return await MealPlan.findOne({ id: userId });
    },

    getAllSuggesticUsers: (_, __, { dataSources }) => {
      return dataSources.suggesticAPI.getAllUsers();
    },
    getAllDbUsers: async (_, __) => {
      return await User.find();
    },
    LoginUserByEmail: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user)
        return { success: false, message: 'No account with that email exists' };

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return { success: false, message: 'Email or Password is incorrect.' };
      }
      return { success: true, message: 'Welcome in', user };
    },
    getRecipeFromDb: async (_, { id }) => {
      return await Recipe.findOne({ id });
    },
    recipeSwapOptions: async (_, { userId, recipeId }, { dataSources }) => {
      const swappedRecipes = await dataSources.suggesticAPI.recipeSwapOptions(
        userId,
        recipeId
      );
      const dbRecipes = await Recipe.find({}, 'id');
      const existingIds = dbRecipes.map(r => r.id);
      swappedRecipes.forEach(async recipe => {
        if (!existingIds.includes(recipe.id)) {
          await new Recipe(recipe).save();
        }
      });
      return swappedRecipes;
    },
    getAllRestrictions: async (_, __) => {
      return await Restriction.find({});
    },
    getRecipesByIds: async (_, { ids }) => {
      return await Recipe.find({ id: { $in: ids } });
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
          mongoLog(`Updated mealplan in DB...`);
        } else if (!existingMealPlan) {
          await new MealPlan({ id: userId, mealPlan }).save();
          mongoLog(`Saved mealplan to DB...`);
        }
        const recipes = extractRecipes(mealPlan);
        const dbRecipes = await Recipe.find({}, 'id');
        const existingIds = dbRecipes.map(r => r.id);

        recipes.forEach(async recipe => {
          if (!existingIds.includes(recipe.id)) await new Recipe(recipe).save();
        });
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
          mongoLog(`Updated user ${userId}...`);
        }
        return updatedUser;
      } catch (err) {
        mongoLog(err);
        return err;
      }
    },
    addRecipeToFavorites: async (_, { recipeId, userId }) => {
      mongoLog(`Adding favorite...`);
      await User.findOneAndUpdate(
        { databaseId: userId },
        // prettier-ignore
        { "$push": { "favoriteRecipes": recipeId } }
      );
      return {
        success: true,
        message: `Added recipe: ${recipeId} to user: ${userId}'s favorites`,
      };
    },
    removeRecipeFromFavorites: async (_, { recipeId, userId }) => {
      mongoLog(`Removing favorite...`);
      await User.findOneAndUpdate(
        { databaseId: userId },
        { $pull: { favoriteRecipes: recipeId } }
      );
      return {
        success: true,
        message: `Removed recipe: ${recipeId} from user: ${userId}'s favorites`,
      };
    },

    addRestriction: async (_, { id, name, subcategory, slugname }) => {
      mongoLog(`Adding restriction ${name}...`);
      await new Restriction({ id, name, subcategory, slugname }).save();
      return {
        success: true,
      };
    },

    profileRestrictionsUpdate: async (
      _,
      { userId, restrictions },
      { dataSources }
    ) => {
      const user = await User.findOneAndUpdate(
        { databaseId: userId },
        { restrictions },
        { new: true }
      );
      console.log(user.restrictions);
      apiLog('Updating user food restrictions...');

      return await dataSources.suggesticAPI.profileRestrictionsUpdate(
        userId,
        user.restrictions
      );
    },
    swapMealPlanRecipe: async (
      _,
      { recipeId, mealId, userId },
      { dataSources }
    ) => {
      apiLog(`Swapping meal...`);
      const suggesticSwap = await dataSources.suggesticAPI.swapMealPlanRecipe(
        recipeId,
        mealId,
        userId
      );

      if (suggesticSwap.success) {
        mongoLog(`Fetching user's meal plan...`);
        const mealPlan = await MealPlan.findOne({ id: userId });

        mongoLog(`Fetching recipe...`);
        const newRecipe = await Recipe.findOne({ id: recipeId });

        mongoLog(`Swapping...`);
        const newPlan = swapMeal(mealPlan.mealPlan, newRecipe, mealId);

        mongoLog(`Updating meal plan...`);
        const newDbPlan = await MealPlan.findOneAndUpdate(
          { id: userId },
          { mealPlan: newPlan },
          {
            new: true,
          }
        );
        return newDbPlan;
      }
      return;
    },
  },
};
