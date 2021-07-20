const { RESTDataSource } = require('apollo-datasource-rest');
const dotenv = require('dotenv');
const { mongoLog, apiLog } = require('./utils/eventLogger');
dotenv.config();

const baseURL = process.env.API_URL;
const apiKey = process.env.API_KEY;

class SuggesticSource extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = baseURL;
  }

  async createUser(name, email) {
    const results = await this.post(
      '',
      {
        query: `mutation {
          createUser(name: "${name}" email: "${email}") {
            success
            message
            user {
              databaseId
              name
              email
            }
          }
        }
      `,
      },
      {
        // prettier-ignore
        headers: { 'Authorization': `Token ${apiKey}` },
      }
    );

    if (!results.data.createUser.sucess) {
      apiLog(`Error creating user: ${results.data.createUser.message}`);
    } else {
      apiLog(`Created user ${results.data.createUser}`);
    }

    return results.data.createUser;
  }

  async updateUserProfile(userId, profile) {
    const results = await this.post(
      '',
      {
        query: `mutation {
        profileMacroGoalsSettings(
          birthdate: "${profile.birthdate}"
          biologicalSex: ${profile.biologicalSex}
          height: ${profile.height}
          startingWeight: ${profile.startingWeight}
          targetWeight: ${profile.targetWeight}
          weeklyWeightGoal: ${profile.weeklyWeightGoal}
          activityLevel: ${profile.activityLevel}
          goalsOn: ${profile.goalsOn}
        ) {
          success
          bmr 
          tdee 
          cd
          dcig 
        }
      }`,
      },
      {
        headers: {
          'Content-type': 'application/json',
          // prettier-ignore
          'Authorization': `Token ${apiKey}`,
          'sg-user': userId,
        },
      }
    );
    apiLog(`Updated profile for ${userId}`);
    return results.data.profileMacroGoalsSettings;
  }

  async deleteUser(userId) {
    const results = await this.post(
      '',
      {
        query: `mutation{
        deleteMyProfile{
          success
        }
      }`,
      },
      {
        headers: {
          'Content-type': 'application/json',
          // prettier-ignore
          'Authorization': `Token ${apiKey}`,
          'sg-user': userId,
        },
      }
    );
    apiLog(`Deleted user ${userId}`);
    return results.data.deleteMyProfile;
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
    apiLog('Retrieved all users');
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
    apiLog(`Retrieved meal plan for ${id}`);
    return results.data.mealPlan;
  }
}

module.exports = { SuggesticSource };
