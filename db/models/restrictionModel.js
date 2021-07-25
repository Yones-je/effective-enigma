const { Schema, model } = require('mongoose');

const restrictionSchema = new Schema({
  id: String,
  name: String,
  subcategory: String,
  slugname: String,
});

module.exports = model('Restriction', restrictionSchema);
