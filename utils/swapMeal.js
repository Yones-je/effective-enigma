const swapMeal = (mealPlan, recipe, mealId) => {
  const newMealPlan = mealPlan;
  for (day of newMealPlan) {
    for (meal of day.meals) {
      if (meal.id === mealId) {
        meal.recipe = recipe;
      }
    }
  }
  return newMealPlan;
};

module.exports = swapMeal;

/* const mealplan = [
  {
    meals: [
      { id: 1, recipe: { name: '1' } },
      { id: 2, recipe: { name: '2' } },
    ],
  },
  {
    meals: [
      { id: 3, recipe: { name: '3' } },
      { id: 4, recipe: { name: '4' } },
    ],
  },
];

const recipe = { name: 'new recipe' };

console.log(JSON.stringify(swapMeal(mealplan, recipe, 4))); */
