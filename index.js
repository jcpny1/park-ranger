/**
 * Establish and manage environment-specific variables, settings and resources
 * @module
 */

var debug = require('debug')('park-ranger');
var dotenv = require('dotenv');
var fs = require('fs');
var Path = require('path');

/** 
 * Return park ranger with loaded cert, config and env properties properties
 * @param {string} [envName] - Name of environment. Used to suffix files with preceding dash (e.g. ".env-test"). If null, files without suffix will be used.
 * @param {boolean} [localEnv] - Whether to just return environment variables and not apply them to process.env as well
 */
module.exports = (envName, localEnv) => {
  envName = envName ? envName : process.env.ENV_NAME;

  var envPath = function(filename, extension) {
    var suffix = envName ? '-' + envName : '';
    suffix = extension ? suffix + '.' + extension : suffix;

    return Path.resolve(__dirname, '../../', filename + suffix);
  };

  var ranger = {
    loadEnv: function() {
      var path = envPath('.env');

      if (fs.existsSync(path)) {
        this.env = Object.assign({}, dotenv.parse(fs.readFileSync(path)), process.env);

        if (!localEnv) {
          dotenv.config({ path: path });
        }
      } else {
        this.env = Object.assign({}, process.env);
      }
    },

    loadCert: function() {
      var ca, cert, key,
          path = envPath('.cert'),
          caPath = Path.resolve(path, 'ca'),
          certPath = Path.resolve(path, 'crt'),
          keyPath = Path.resolve(path, 'key');

      if (!fs.existsSync(keyPath)) {
        debug('failed to find a SSL key file for certificate');
      } else {
        ca = fs.readFileSync(caPath, 'utf8');
      }

      if (!fs.existsSync(certPath)) {
        debug('failed to find a SSL certificate file for certificate');
      } else {
        cert = fs.readFileSync(certPath, 'utf8');
      }

      if (!fs.existsSync(caPath)) {
        debug('failed to find a SSL intermediate CA certificate file for certificate');
      } else {
        key = fs.readFileSync(keyPath, 'utf8');
      }

      this.cert = {
        ca: ca,
        cert: cert,
        key: key,
      };
    },

    loadConfig: function() {
      var path = envPath('.config', 'json');
      this.config = fs.existsSync(path) ? require(path) : {};
    }
  };

  ranger.loadEnv();
  ranger.loadCert();
  ranger.loadConfig();

  return ranger;
};