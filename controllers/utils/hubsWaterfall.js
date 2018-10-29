var Hub = require('../../models/hub');
var Follower = require('../../models/hub_follower');
var Muter = require('../../models/hub_muter');
var async = require('async');
var _ = require('lodash');

module.exports = function(query, userId, hubType, hubTypeFilter) {

  return {
    getHubs: function(asyncWaterfallCb) {
      Hub.find(hubTypeFilter)
        .sort('-date_created')
        .populate('created_by')
        .skip((query.page - 1) * query.size)
        .limit(query.size)
        .exec(function(err, hubs) {
          asyncWaterfallCb(err, hubs)
        });
    },

    addFollowingFlag: function(hubs, asyncWaterfallCb) {
      var hubsWithCurrentUserStatus = [];
      async.eachSeries(hubs, function(hub, cb) {
        var isFollowed = false;
        Follower.findOne({hub: hub.id, user: userId}, function(err, existingFollower) {
          if (existingFollower) {
            isFollowed = true;
          }
          hubsWithCurrentUserStatus.push({
            hub: hub,
            isFollowed: isFollowed
          });
          cb(err);
        })
      }, function(err) {
        if (hubType === 'following') {
          hubsWithCurrentUserStatus = _.filter(hubsWithCurrentUserStatus, function(item) {
            return item.isFollowed === true;
          });
        }
        asyncWaterfallCb(err, hubsWithCurrentUserStatus);
      });
    },

    addMutedFlag: function(items, asyncWaterfallCb) {
      async.eachSeries(items, function(item, cb) {
        var isMuted = false;
        Muter.findOne({hub: item.hub.id, user: userId}, function(err, existingMuter) {
          if (existingMuter) {
            isMuted = true;
          }
          item.isMuted = isMuted;
          cb(err);
        })
      }, function(err) {
        if (hubType === 'muted') {
          items = _.filter(items, function(item) {
            return item.isMuted === true;
          });
        }
        asyncWaterfallCb(err, items);
      });
    }
  }
};
