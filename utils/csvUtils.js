// utils/csvUtils.js
const { Parser } = require("json2csv");

// data: array of objects, fields: array of keys
const generateCSV = (data, fields) => {
  const parser = new Parser({ fields });
  return parser.parse(data);
};

module.exports = { generateCSV };
