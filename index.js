/**
 * Manager for environment variables, configuration files and SSL certificate files.
 * @module
 */

var debug = require('debug')('park-ranger');
var dotenv = require('dotenv');
var fs = require('fs');
var Path = require('path');

/** 
 * Return park ranger with loaded cert, config and env properties
 * @param {boolean} [localEnv] - Whether to just return environment variables and not apply them to process.env as well
 */
module.exports = (localEnv) => {
  var envName = process.env.ENV_NAME;

  var envPath = function(filename, extension) {
    var suffix = envName ? '-' + envName : '';
    suffix = extension ? suffix + '.' + extension : suffix;

    return Path.resolve(__dirname, '../../', filename + suffix);
  };

  var ranger = {
    loadEnv: function() {
      var path = envPath('.env');

      if (fs.existsSync(path)) {
        this.env = Object.assign({}, process.env, dotenv.parse(fs.readFileSync(path)));

        if (!localEnv) {
          dotenv.config({ path: path });
        }
      } else {
        this.env = Object.assign({}, process.env);
      }
    },

    loadCert: function() {
      var path = envPath('.cert');

      var loadCertFile = function(name, filenames) {
        var file;

        filenames.forEach((filename) => {
          var filePath = Path.resolve(path, filename);
          debug('filePath', filePath);

          if (fs.existsSync(filePath)) {
            debug('loading %s for %s', filePath, name);
            file = fs.readFileSync(filePath, 'utf8');
          }
        });

        if (!file) {
          debug('failed to find a %s file for certificate', name);
        }

        return file;
      };

      this.cert = {
        ca: loadCertFile('SSL intermediate CA', ['ca', 'chain.pem']),
        cert: loadCertFile('SSL certificate', ['crt', 'cert.pem']),
        key: loadCertFile('SSL key', ['key', 'privkey.pem'])
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