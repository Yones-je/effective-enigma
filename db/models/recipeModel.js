const { Schema, model } = require('mongoose');

const sourceSchema = new Schema({
  siteUrl: String,
  displayName: String,
  recipeUrl: String,
});

const RecipeSchema = new Schema({
  id: String,
  databaseId: String,
  totalTime: String,
  name: String,
  numberOfServings: Number,
  ingredientsCount: Number,
  ingredientLines: [String],
  courses: [String],
  cuisines: [String],
  mealTags: [String],
  source: Object,
  mainImage: String,
  instructions: [String],
  nutrientsPerServing: Object,
  caloriesPerServing: Object,
});

module.exports = model('Recipe', RecipeSchema);
