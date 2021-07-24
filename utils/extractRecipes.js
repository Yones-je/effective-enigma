const extractRecipes = mp => {
  const recipes = [];
  const ids = [];

  mp.forEach(day => {
    day.meals.forEach(meal => {
      if (!ids.includes(meal.recipe.id)) {
        ids.push(meal.recipe.id);
        recipes.push(meal.recipe);
      }
    });
  });

  return recipes;
};

module.exports = extractRecipes;
