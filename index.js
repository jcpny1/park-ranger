/**
 * Load environment variables with dotenv, environment name and config file in base directory.
 * @module
 */

var dotenv = require('dotenv');
var fs = require('fs');

module.exports = (name) => {
  var suffix = name ? '-' + name : '';
  var path = `${__dirname}/../../.env${suffix}`;

  if (fs.existsSync(path)) {
    dotenv.config({ path: path });
  }
};