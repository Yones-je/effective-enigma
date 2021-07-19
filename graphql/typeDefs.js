const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # SCALARS
  scalar Date

  # QUERIES
  type Query {
    hello: String
    getMealPlan(userId: ID!): [MealPlan]
    recipe(id: ID!): Recipe
    recipeSwapOptions(recipeId: ID!, serving: Int): [Recipe]
    getAllUsers: [User]
  }

  # MUTATIONS
  type Mutation {
    generateMealPlan(userId: ID!): GenerateMealPlan
    createUser(name: String!, email: String!): CreateUserResponse
    # Creates AND updates profile
    updateUserProfile(
      userId: ID
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

  # TYPES
  type GenerateMealPlan {
    addDays: Boolean
    ignoreLock: Boolean
    includeFavorites: Boolean
    repeat: Date
    kcalLimit: Float
    maxNumOfServings: Int
    maxServingWeight: Int
    minServingWeight: Int
    breakfastDistribution: Float
    lunchDistribution: Float
    dinnerDistribution: Float
    snackDistribution: Float
  }

  type CreateUserResponse {
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

  type User {
    databaseId: String
    name: String
    email: String
    profile: Profile
    mealplan: MealPlan
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

  type MealPlan {
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
    mealTags: String
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
