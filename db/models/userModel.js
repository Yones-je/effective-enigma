const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  databaseId: String,
  name: String,
  email: String,
  password: String,
  profile: {
    birthdate: Date,
    biologicalSex: String,
    height: Number,
    startingWeight: Number,
    targetWeight: Number,
    activityLevel: String,
    weeklyWeightGoal: String,
    goalsOn: Boolean,
    success: Boolean,
    dcig: Number,
    cd: Number,
    tdee: Number,
    bmr: Number,
  },
});
module.exports = model('User', UserSchema);
