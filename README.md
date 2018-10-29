Netmino V2
=======================

Local setup
-------------

**Prerequisities**

- [MongoDB](http://www.mongodb.org/downloads)
- [Node.js](http://nodejs.org)
- [Grunt](http://gruntjs.com)
- [Bower](http://bower.io)
- [jscs](http://jscs.info)

**Installation**

- clone the repo git

        $ git clone https://github.com/sbutalia/bmc-netmino.git netmino
        $ cd netmino

- switch to the dev branch

        $ git checkout hacklathon_boilerplate

- install dependencies

        $ npm install
        $ bower install

- build the app

        $ grunt build:dev
        $ grunt build:dist

- config the app

        $ nano config/secrets.js

- start mongo daemon

        $ sudo mongod

- start the app

        $ npm start
        or
        $ grunt run

- open your browser and navigate to localhost:3000

**Coding rules**

- udate jscs config

        $ nano .jscsrc

- execute the linter

        $ npm run-script linter

**Execute server-side tests**

        $ npm test

**Execute e2e client-side tests**

        $ ./node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update
        $ NODE_ENV=test npm start
        $ grunt e2e
