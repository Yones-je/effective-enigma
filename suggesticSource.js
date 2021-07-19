const { RESTDataSource } = require('apollo-datasource-rest');
const dotenv = require('dotenv');
dotenv.config();

const baseURL = process.env.API_URL;
const apiKey = process.env.API_KEY;
const userURL = process.env.USER_URL;
class SuggesticUserSource extends RESTDataSource {
  constructor() {
    super();
  }

  async createUser(name, email) {
    const results = await this.post(
      userURL,
      /* {
        mutation: `
      createUser(name: ${name} email: ${email}) {
        success
        message
        user {
          id
          databaseId
          name
          email
        }
      }
      `,
      }, */ {
        name: name,
        email: email,
      },
      {
        // prettier-ignore
        headers: { 'Authorization': `Token ${apiKey}` },
      }
    );
    console.log(results);
    return results.user_id;
  }
}

class SuggesticSource extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = baseURL;
  }

  async getAllUsers() {
    const results = await this.post(
      '',
      {
        query: `{
          users {
            edges {
              node {
                name
                phone
                email
                databaseId
              }
            }
          }
        }
      `,
      },
      {
        headers: {
          'Content-type': 'application/json',
          // prettier-ignore
          'Authorization': `Token ${apiKey}`,
        },
      }
    );
    return results.data.users.edges.map(el => el.node);
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
          'Authorization': `Token ${apiKey}`,
        },
      }
    );
    return results.data.mealPlan;
  }
}

module.exports = { SuggesticSource, SuggesticUserSource };
