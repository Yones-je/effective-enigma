const objectToString = object =>
  Object.entries(object)
    .map(el => el.join(':'))
    .join(' ');

module.exports = objectToString;
