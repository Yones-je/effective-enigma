const { Schema, model } = require('mongoose');

const mealSchema = new Schema({
  id: String,
  calories: Number,
  meal: String,
  numOfServings: Number,
  recipe: Object,
});

const daySchema = new Schema({
  day: Number,
  date: Date,
  calories: Number,
  meals: [mealSchema],
});

const MealPlanSchema = new Schema({
  id: String,
  mealPlan: [daySchema],
});

module.exports = model('MealPlan', MealPlanSchema);
