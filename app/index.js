'use strict';

/**
 * The core of our generator
 */

var fs        = require('fs')
  , path      = require('path')
  , util      = require('util')
  , genUtils  = require('../util.js')
  , yeoman    = require('yeoman-generator')
  , chalk     = require('chalk')
  , wiredep   = require('wiredep');


/**
 * Our generator will extend Yeoman's base generator
 */
var AngularMaterialFullstackGenerator = yeoman.generators.Base.extend({

  /**
   * Initialize variables and global settings
   */
  init: function () {
    this.argument('name', { type: String, required: false });
    this.appname = this.name || path.basename(process.cwd());
    this.appname = this._.camelize(this._.slugify(this._.humanize(this.appname)));

    this.option('app-suffix', {
      desc: 'Allow a custom suffix to be added to the module name',
      type: String,
      required: 'false'
    });
    this.scriptAppName = this.appname + genUtils.appName(this);
    this.appPath = this.env.options.appPath;
    this.pkg = require('../package.json');

    this.filters = {};
  },

  /**
   * Output the Yeoman logo and the description of our generator
   */
  info: function () {
    this.log(this.yeoman);
    this.log('Out of the box I create an Angular app with Angular Material and an Express server.\n');
  },

  /**
   * Check for existing Yeoman configs
   */
  checkForConfig: function() {
    var cb = this.async();

    if (this.config.get('filters')) {
      this.prompt([{
        type: "confirm",
        name: "skipConfig",
        message: "Existing .yo-rc configuration found, would you like to use it?",
        default: true,
      }], function (answers) {
        this.skipConfig = answers.skipConfig;

        if (typeof this.oauth === 'undefined') {
          var strategies = Object.keys(this.filters).filter(function(key) {
            return key.match(/Auth$/) && key;
          });

          if (strategies.length) this.config.set('oauth', true);
        }

        cb();
      }.bind(this));
    } else {
      cb();
    }
  },

  /**
   * Prompts for technologies to use in the front-end
   */
  clientPrompts: function() {
    if(this.skipConfig) return;
    var cb = this.async();

    this.log('# Client\n');

    this.prompt([{
        type: "list",
        name: "script",
        message: "What would you like to write scripts with?",
        choices: [ "JavaScript", "CoffeeScript"],
        filter: function( val ) {
          var filterMap = {
            'JavaScript': 'js',
            'CoffeeScript': 'coffee'
          };

          return filterMap[val];
        }
      }, {
        type: "confirm",
        name: "babel",
        message: "Would you like to use Javascript ES6 in your client by preprocessing it with Babel?",
        when: function (answers) {
          return answers.script === 'js';
        }
      }, {
        type: "list",
        name: "markup",
        message: "What would you like to write markup with?",
        choices: [ "HTML", "Jade"],
        filter: function( val ) { return val.toLowerCase(); }
      }, {
        type: "list",
        name: "stylesheet",
        default: 1,
        message: "What would you like to write stylesheets with?",
        choices: [ "CSS", "Sass"],
        filter: function( val ) { return val.toLowerCase(); }
      },  {
        type: "list",
        name: "router",
        default: 1,
        message: "What Angular router would you like to use?",
        choices: [ "ngRoute", "uiRouter"],
        filter: function( val ) { return val.toLowerCase(); }
      }], function (answers) {

        this.filters.babel = !!answers.babel;
        if(this.filters.babel){ this.filters.js = true; }
        this.filters[answers.script] = true;
        this.filters[answers.markup] = true;
        this.filters[answers.stylesheet] = true;
        this.filters[answers.router] = true;
        this.filters.material = true;
      cb();
      }.bind(this));
  },

  /**
   * Prompts for technologies to use in the back-end
   */
  serverPrompts: function() {
    if(this.skipConfig) return;
    var cb = this.async();
    var self = this;

    this.log('\n# Server\n');

    this.prompt([{
      type: "confirm",
      name: "mongoose",
      message: "Would you like to use mongoDB with Mongoose for data modeling?"
    }, {
      type: "confirm",
      name: "auth",
      message: "Would you scaffold out an authentication boilerplate?",
      when: function (answers) {
        return answers.mongoose;
      }
    }, {
      type: 'checkbox',
      name: 'oauth',
      message: 'Would you like to include additional oAuth strategies?',
      when: function (answers) {
        return answers.auth;
      },
      choices: [
        {
          value: 'googleAuth',
          name: 'Google',
          checked: false
        },
        {
          value: 'facebookAuth',
          name: 'Facebook',
          checked: false
        },
        {
          value: 'twitterAuth',
          name: 'Twitter',
          checked: false
        }
      ]
    }, {
      type: "confirm",
      name: "socketio",
      message: "Would you like to use socket.io?",
      // to-do: should not be dependent on mongoose
      when: function (answers) {
        return answers.mongoose;
      },
      default: true
    }], function (answers) {
      if(answers.socketio) this.filters.socketio = true;
      if(answers.mongoose) this.filters.mongoose = true;
      if(answers.auth) this.filters.auth = true;
      if(answers.oauth) {
        if(answers.oauth.length) this.filters.oauth = true;
        answers.oauth.forEach(function(oauthStrategy) {
          this.filters[oauthStrategy] = true;
        }.bind(this));
      }

      cb();
    }.bind(this));
  },

  /**
   * Set some global configurations
   */
  saveSettings: function() {
    if(this.skipConfig) return;
    this.config.set('insertRoutes', true);
    this.config.set('registerRoutesFile', 'server/routes.js');
    this.config.set('routesNeedle', '// Insert routes below');

    this.config.set('routesBase', '/api/');
    this.config.set('pluralizeRoutes', true);

    this.config.set('insertSockets', true);
    this.config.set('registerSocketsFile', 'server/config/socketio.js');
    this.config.set('socketsNeedle', '// Insert sockets below');

    this.config.set('filters', this.filters);
    this.config.forceSave();
  },

  compose: function() {
    if(this.skipConfig) return;
    var appPath = 'client/app/';
    var extensions = [];
    var filters = [];

    if(this.filters.ngroute) filters.push('ngroute');
    if(this.filters.uirouter) filters.push('uirouter');
    if(this.filters.babel) extensions.push('babel');
    if(this.filters.coffee) extensions.push('coffee');
    if(this.filters.js) extensions.push('js');
    if(this.filters.html) extensions.push('html');
    if(this.filters.jade) extensions.push('jade');
    if(this.filters.css) extensions.push('css');
    if(this.filters.sass) extensions.push('scss');

    this.composeWith('ng-component', {
      options: {
        'routeDirectory': appPath,
        'directiveDirectory': appPath,
        'filterDirectory': appPath,
        'serviceDirectory': appPath,
        'filters': filters,
        'extensions': extensions,
        'basePath': 'client'
      }
    }, { local: require.resolve('generator-ng-component/app/index.js') });
  },

  /**
   * Stringify the angular modules used in the app
   */
  ngModules: function() {
    this.filters = this._.defaults(this.config.get('filters'), {
      material: true
    });

    var angModules = [
      "'ngCookies'",
      "'ngResource'",
      "'ngSanitize'",
      "'ngAnimate'",
      "'ngMessages'"
    ];

    if(this.filters.ngroute) angModules.push("'ngRoute'");
    if(this.filters.socketio) angModules.push("'btford.socket-io'");
    if(this.filters.uirouter) angModules.push("'ui.router'");
    if(this.filters.material) angModules.push("'ngMaterial'");

    this.angularModules = "\n  " + angModules.join(",\n  ") +"\n";
  },

  /**
   * Process all the files
   */
  generate: function() {
    this.sourceRoot(path.join(__dirname, './templates'));
    genUtils.processDirectory(this, '.', '.');
  },

  /**
   * Install dependencies
   */
  end: function() {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});

module.exports = AngularMaterialFullstackGenerator;
