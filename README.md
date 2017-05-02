# park-ranger

[![Code Climate](https://codeclimate.com/github/markmhx/park-ranger/badges/gpa.svg)](https://codeclimate.com/github/markmhx/park-ranger)
[![Code Climate issues badge](https://codeclimate.com/github/markmhx/park-ranger/badges/issue_count.svg)](https://codeclimate.com/github/markmhx/park-ranger/issues)
[![David badge](https://david-dm.org/markmhx/park-ranger.svg)](https://david-dm.org/markmhx/park-ranger)

This repository contains the source code for a Node module that helps with the management of environment-specific dependencies such as environment variables, configuration files and SSL certificate files.

## Setup

To include this module in your package, simply run:

``` 
npm install park-ranger --save
```

Then add the following to your code:

```
var ranger = require('park-ranger')();
```

## Environment name

By default, Park Ranger will load dependencies for the app depending on the value of environment variable `ENV_NAME` (with no spaces). As such, you can optionally call your app with the following assignment to make this variable available upfront:

```
ENV_NAME=example node index.js
```

The name will be used to determine the files that Park Ranger attempts to locate in your project's base directory and use as dependencies.

| Dependency                        | Filename (no ENV_NAME)      | Filename (ENV_NAME=example) |
| :-------------------------------- | :-------------------------- | :-------------------------- |
| Environment variables file        | .env                        | .env-example                |
| Configuration file                | .config.json                | .config-example.json        |
| SSL certificate directory         | .cert                       | .cert-example               |

## Environment variables

Environment variable files can be made available in [INI format](https://en.wikipedia.org/wiki/INI_file). By default, all variables found in these files will be applied automatically to `process.env` upon load of Park Ranger as a module. They will also be made available as the `env` property of the ranger.

Variables already available in the environment will be preserved in `process.env` with precedence over those in the file. They will also be made available in the `env` property of the ranger.

If the ranger is loaded with `true` as a parameter, then the environment variables will *not* be applied automatically to `process.env` but just the `env` property of the ranger. This is useful for accessing the environment variables in a task runner but not incurring the unintended consequence of setting them prematurely for tasks themselves.

#### Example #1 – no ENV_NAME

##### .env file

```
FOO=BAR
WHIZ=BANG
```

##### index.js file

```
var ranger = require('park-ranger')();
console.log(ranger.env.FOO);
console.log(process.env.WHIZ);
```

##### command

```
node index.js
```

##### output

```
BAR
BANG
```

--------

#### Example #2 – ENV_NAME=test

##### .env-test file

```
DB_NAME=test-db
SEND_EMAIL=false
```

##### index.js file

```
var ranger = require('park-ranger')();
console.log(ranger.env.DB_NAME);
console.log(process.env.SEND_EMAIL);
console.log(ranger.env.ENV_NAME);
```

##### command

```
ENV_NAME=test node index.js
```

##### output

```
test-db
false
test
```

--------

#### Example #3 – local environment variables only

##### .env-task-runner file

```
FOO=BAR
WHIZ=BANG
```

##### index.js file

```
var ranger = require('park-ranger')(true);
console.log(ranger.env.FOO);
console.log(process.env.FOO);
console.log(ranger.env.ENV_NAME);
```

##### command

```
ENV_NAME=task-runner node index.js
```

##### output

```
BAR
undefined
task-runner
```

## Configuration files

Configuration files can be made available in JSON format and must have ".json" as an extension. Their format should be documented in the parent repository using [MSON](https://github.com/apiaryio/mson) and will get loaded by the ranger into its `config` property.

These files have an advantage over environment variable files since they can nest properties and generally represent more complex settings. However, they are not applied to `process.env` and therefore rely on the ranger object for access.

#### Example

##### .config.json file

```
{
  "foo": "bar",
  "things": [ 1, 2, 3 ]
}
```

##### index.js file

```
var ranger = require('park-ranger')();
console.log(ranger.config.foo);
console.log(ranger.config.things.length); 
```

##### command

```
node index.js
```

##### output

```
bar
3
```

--------

## SSL certificate files

Certificate files can be made available in a directory and should correspond to a given certificate's private key, intermediate certificate authority (CA) and server certificate.

The names of these files can vary, with the following filenames supported:

| Certificate file                  | Filenames supported         |
| :-------------------------------- | :-------------------------- |
| Private key                       | key, privkey.pem            |
| Intermediate CA                   | ca, chain.pem               |
| Server certificate                | crt, cert.pem               |

The content of these files will be loaded into the `cert` property of the ranger with corresponding properties "key", "ca" and "crt" representing the file contents. As such, the `cert` property can be used to create an HTTPS server without additional file parsing.

#### Example

##### .cert directory

- privkey.pem
- chain.pem
- cert.pem

##### index.js file

```
var ranger = require('park-ranger')();
require('https').createServer(ranger.cert, function(req, res) { ... }).listen(443, () => {
  console.log('listening!');
});
```

##### command

```
node index.js
```

##### output

```
listening!
```

--------

## gitignore

With all of these files, make sure they are included in the parent respository's ".gitignore" file so they are not committed to version control.

```
.env*
.cert*
.config*
```