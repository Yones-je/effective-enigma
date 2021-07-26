const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # SCALARS
  scalar Date

  # QUERIES
  type Query {
    getMealPlanFromDb(userId: ID!): MealPlan
    getMealPlanFromSuggestic(userId: ID!): [MealPlanSuggestic]
    getRecipeFromDb(id: ID!): Recipe
    getRecipesByIds(ids: [ID!]!): [Recipe]
    getAllRestrictions: [Restriction]
    recipeSwapOptions(userId: ID!, recipeId: ID!): [Recipe]
    getAllSuggesticUsers: [User]
    getAllDbUsers: [User!]!
    LoginUserByEmail(email: String!, password: String!): UserResponse
  }

  # MUTATIONS
  type Mutation {
    generateMealPlan(
      userId: ID!
      addDays: Boolean
      ignoreLock: Boolean
      kcalLimit: Float
      maxNumOfServings: Int
      breakfastDistribution: Float
      lunchDistribution: Float
      dinnerDistribution: Float
      snackDistribution: Float
    ): SuccessMsgResponse

    addRestriction(
      id: ID!
      name: String!
      subcategory: String!
      slugname: String!
    ): SuccessResponse

    profileRestrictionsUpdate(
      userId: ID!
      restrictions: [String]!
    ): SuccessResponse

    createUser(name: String!, email: String!, password: String!): UserResponse

    deleteUser(userId: ID!): SuccessResponse

    addRecipeToFavorites(recipeId: ID!, userId: ID!): SuccessMsgResponse
    removeRecipeFromFavorites(recipeId: ID!, userId: ID!): SuccessMsgResponse

    swapMealPlanRecipe(recipeId: ID!, mealId: ID!, userId: ID!): MealPlan

    # Creates AND updates profile
    updateUserProfile(
      userId: ID!
      birthdate: Date
      biologicalSex: BiologicalSex
      height: Float
      startingWeight: Float
      targetWeight: Float
      activityLevel: ActivityLevel
      weeklyWeightGoal: WeeklyWeightGoal
      goalsOn: Boolean
    ): UpdateUserResponse
  }

  # RESPONSES

  type SuccessMsgResponse {
    success: Boolean
    message: String
  }

  type UserResponse {
    success: Boolean
    message: String
    user: User
  }

  type UpdateUserResponse {
    success: Boolean
    dcig: Int
    cd: Int
    tdee: Int
    bmr: Int
  }

  type SuccessResponse {
    success: Boolean
  }

  # TYPES
  type User {
    databaseId: String
    name: String
    email: String
    password: String
    favoriteRecipes: [ID]
    restrictions: [String]
    profile: Profile
    mealplanId: ID
  }

  type Restriction {
    id: String
    name: String
    subcategory: String
    slugname: String
  }

  type Profile {
    birthdate: Date
    biologicalSex: BiologicalSex
    height: Float
    startingWeight: Float
    targetWeight: Float
    activityLevel: ActivityLevel
    weeklyWeightGoal: WeeklyWeightGoal
    goalsOn: Boolean
    success: Boolean
    dcig: Int
    cd: Int
    tdee: Int
    bmr: Int
  }

  type MealPlanSuggestic {
    day: Int
    date: Date
    calories: Float
    meals: [Meal]
  }

  type MealPlan {
    id: ID!
    mealPlan: [DayPlan]
  }

  type DayPlan {
    day: Int
    date: Date
    calories: Float
    meals: [Meal]
  }

  type Meal {
    id: String
    calories: Float
    meal: String
    numOfServings: Int
    recipe: Recipe
  }

  type Recipe {
    id: ID!
    databaseId: String
    totalTime: String
    name: String
    numberOfServings: Int
    ingredientsCount: Int
    ingredients: [Ingredient]
    ingredientLines: [String]
    parsedIngredientLines: IngredientLine
    courses: [String]
    cuisines: [String]
    mealTags: [String]
    source: Source
    mainImage: String
    isUserFavorite: Boolean
    inUserShoppingList: Boolean
    weightInGrams: Float
    servingWeight: Float
    isLogged: Boolean
    instructions: [String]
    nutrientsPerServing: NutrientsPerServing
    caloriesPerServing: CaloriesPerServing
  }

  type Ingredient {
    name: String
    confirmed: Boolean
    cpc: String
    type: String
    priority: Float
  }

  type IngredientLine {
    ingredient: String
    ingredientLine: String
    quantity: String
    unit: String
  }

  type Source {
    siteUrl: String
    displayName: String
    recipeUrl: String
  }

  type NutrientsPerServing {
    calories: Float
    sugar: Float
    fiber: Float
    protein: Float
    carbs: Float
    fat: Float
  }

  type CaloriesPerServing {
    protein: Float
    carbs: Float
    fat: Float
  }

  # ENUMS
  enum BiologicalSex {
    MALE
    FEMALE
  }

  enum ActivityLevel {
    NOT_ACTIVE
    EXERCISE_1
    EXERCISE_2
  }

  enum WeeklyWeightGoal {
    MAINTAIN
    GOAL_1
    GOAL_2
    GOAL_3
    GOAL_4
  }
`;

module.exports = { typeDefs };
