/**
 * This service has the responsability to prepare event data to post.
 */
'use strict';
app.service('EventHelper', function() {
  this.prepareEventObj = function(event, markers, isDraft) {
    event.is_draft = isDraft;
    event.start_datetime.setHours(event.start_time.getHours(), event.start_time.getMinutes());
    event.end_datetime.setHours(event.end_time.getHours(), event.end_time.getMinutes());
    if (markers) {
      if (!event.location.display_name) {
        event.location.display_name = markers.eventMarker.display_name;
      }
      event.location.lat = markers.eventMarker.lat;
      event.location.lng = markers.eventMarker.lng;
    } else {
      event.location = null;
    }
    event.businessProvider = null;

    return event;
  };

  this.resetEvent = function(event) {
    event.description = '';
    event.hubs = [];
    event.name = '';
    event.type = null;
    event.tags = [];
    event.business = null;

    return event;
  };
});
