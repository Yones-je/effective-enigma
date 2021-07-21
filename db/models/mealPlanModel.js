const { Schema, model } = require('mongoose');

const daySchema = new Schema({
  day: Number,
  date: Date,
  calories: Number,
  meals: [Object],
});

const MealPlanSchema = new Schema({
  id: String,
  mealPlan: [daySchema],
});

module.exports = model('MealPlan', MealPlanSchema);
