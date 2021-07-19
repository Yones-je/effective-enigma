const { HTTPDataSource } = require('apollo-datasource-http');
const dotenv = require('dotenv');
dotenv.config();

const dataSource = new (class SuggesticAPI extends HTTPDataSource {
  constructor(baseURL) {
    super(baseURL, {
      requestOptions: {
        headers: {
          'sg-user': process.env.DEV_USER_ID,
          Authorization: `Token ${process.env.API_KEY}`,
        },
      },
    });
  }
  async getMealPlan(id) {
    return this.get;
  }
})();

module.exports = dataSource;
