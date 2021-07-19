const { RESTDataSource } = require('apollo-datasource-rest');
const dotenv = require('dotenv');
dotenv.config();

const baseURL = process.env.API_URL;
const apiKey = process.env.API_KEY;

class SuggesticSource extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = baseURL;
  }

  async getMealPlan(id) {
    const results = await this.post(
      '',
      {
        query: `{
            mealPlan {
              day
              date(useDatetime: false)
              calories
              meals {
                id
                calories
                meal
                numOfServings
                recipe {
                  name
                  numberOfServings
                  nutrientsPerServing {
                    calories
                  }
                }
              }
            }
          }`,
      },
      {
        headers: {
          'Content-type': 'application/json',
          'sg-user': id,
          // prettier-ignore
          "Authorization": `Token ${apiKey}`,
        },
      }
    );
    return results.data.mealPlan;
  }
}

module.exports = SuggesticSource;
