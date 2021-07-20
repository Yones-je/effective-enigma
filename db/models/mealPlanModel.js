const { Schema, model } = require('mongoose');

const MealPlanSchema = new Schema({
  id: String,
  day: Number,
  date: Date,
  calories: Number,
  meals: [Object],
});

module.exports = model('MealPlan', MealPlanSchema);
