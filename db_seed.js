var Role = require('./models/role');
var Category = require('./models/business_category');
var rolesData = require('./config/default_roles');
var User = require('./models/user');
var superUserData = require('./config/batman');
var Type = require('./models/event_type');
var typesData = require('./config/default_event_types');
var async = require('async');
var primaryCategories = require('./config/business_categories/primary.js');
var secondaryCategories = require('./config/business_categories/secondary.js');
var tertiaryCategories = require('./config/business_categories/tertiary.js');

module.exports = function() {
  var createDefaultRoles = function(asyncWaterfallCb) {
    var handler = function(aRole, cb) {
      Role.findOne({name: aRole.name}).exec(function(err, existingRole) {
        if (!existingRole) {
          var role = new Role(aRole);
          role.save(function(err) {
            cb(err);
          });
        } else {
          cb();
        }
      })
    };
    var rolesCallback = function(err) {
      asyncWaterfallCb(err);
    };
    async.each(rolesData, handler, rolesCallback);
  };

  var createSuperUser = function(err, asyncWaterfallCb) {
    if (!asyncWaterfallCb) {
      asyncWaterfallCb = err;
      err = null;
    }
    var superUserHandler = function(err, existingUser) {
      if (!existingUser) {
        Role.findOne({name: 'super_user'}, function(err, role) {
          superUserData.role = role._id;
          var batman = new User(superUserData);
          batman.save(function(err) {
            asyncWaterfallCb(err);
          });
        });
      } else {
        return asyncWaterfallCb(err);
      }
    };
    User.findOne({email: superUserData.email}).exec(superUserHandler);
  };

  var createDefaultEventTypes = function(err, asyncWaterfallCb) {
    if (!asyncWaterfallCb) {
      asyncWaterfallCb = err;
      err = null;
    }
    var handler = function(aType, cb) {
      Type.findOne({type: aType.type}).exec(function(err, existingType) {
        if (!existingType) {
          var type = new Type(aType);
          type.save(function(err) {
            cb(err)
          });
        } else {
          cb(err);
        }
      });
    };
    var eventTypesCallback = function(err) {
      asyncWaterfallCb(err);
    };
    async.each(typesData, handler, eventTypesCallback);
  };

  var createPrimaryBusinessCategories = function(asyncWaterfallCb) {
    var handler = function(aCategory, cb) {
      Category.findOne({name: aCategory.name, type: aCategory.type}).exec(function(err, existingCategory) {
        if (!existingCategory) {
          var category = new Category(aCategory);
          category.save(function(err) {
            cb(err);
          });
        } else {
          cb();
        }
      })
    };
    var rolesCallback = function(err) {
      asyncWaterfallCb(err);
    };
    async.each(primaryCategories, handler, rolesCallback);
  };

  var createSecondaryBusinessCategories = function(asyncWaterfallCb) {
    var handler = function(aCategory, cb) {
      Category.findOne({name: aCategory.name, type: aCategory.type}).exec(function(err, existingCategory) {
        if (!existingCategory) {
          Category.findOne({name: aCategory.parent, type: 1}).exec(function(err, existingParentCategory) {
            if (existingParentCategory) {
              var category = new Category({
                name: aCategory.name,
                type: aCategory.type,
                parent_category: existingParentCategory._id
              });
              category.save(function(err) {
                cb(err);
              });
            } else {
              cb('No parent category found for the secondary category: ' + aCategory.name);
            }
          });
        } else {
          cb();
        }
      })
    };
    var rolesCallback = function(err) {
      asyncWaterfallCb(err);
    };
    async.each(secondaryCategories, handler, rolesCallback);
  };

  var createTertiaryBusinessCategories = function(asyncWaterfallCb) {
    var handler = function(aCategory, cb) {
      Category.findOne({name: aCategory.name, type: aCategory.type}).exec(function(err, existingCategory) {
        if (!existingCategory) {
          Category.findOne({name: aCategory.parent, type: 2}).exec(function(err, existingParentCategory) {
            if (existingParentCategory) {
              var category = new Category({
                name: aCategory.name,
                type: aCategory.type,
                parent_category: existingParentCategory._id
              });
              category.save(function(err) {
                cb(err);
              });
            } else {
              cb('No parent category found for the tertiary category: ' + aCategory.name);
            }
          });
        } else {
          cb();
        }
      })
    };
    var rolesCallback = function(err) {
      asyncWaterfallCb(err);
    };
    async.each(tertiaryCategories, handler, rolesCallback);
  };

  var finalWaterfallCallback = function(err) {
    if (!err) {
      console.log('Default DB docs created');
    } else {
      throw(err);
    }
  };

  async.waterfall([
    createDefaultRoles,
    createSuperUser,
    createDefaultEventTypes,
    createPrimaryBusinessCategories,
    createSecondaryBusinessCategories,
    createTertiaryBusinessCategories,
  ], finalWaterfallCallback);
};
