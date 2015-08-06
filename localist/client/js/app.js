Meteor.subscribe("markers");
var tempMarker;
var tempInfoWindow;
Template.app.events({
    // go to street view
    'click #add-marker-btn': function(e,t){
        e.preventDefault();
        var map = GoogleMaps.maps.appMap.instance;
        var panorama = map.getStreetView();

        var point = new google.maps.LatLng(Session.get('newMarkerAddedLat'), Session.get('newMarkerAddedLng'));
        var panoramaOptions = {
            enableCloseButton: false,
            position: point,
            pov:{
                heading: 45,
                pitch: 10
            },
            linksControl: false,
            addressControl: false
        }
        Session.set('insertingMarker', true);
        panorama.setOptions(panoramaOptions);
        panorama.setVisible(true);
        tempInfoWindow.close();
        $('.overmap-container').css("visibility", "visible");
    },
    // don't add new marker
    'click #no-marker-btn': function(e,t){
        e.preventDefault();
        if(tempMarker){
            tempInfoWindow.close();
            tempMarker.setMap(null);
        }
    },

    // go back to regular map w/marker
    'click #cancel-marker-btn': function(){
        Session.set('insertingMarker', false);
        var map = GoogleMaps.maps.appMap.instance;

        var panorama = map.getStreetView();
        if(panorama){
            var pos = panorama.getLocation();

            panorama.setVisible(false);
            if(tempMarker){
                tempMarker.setMap(null);
            }
        }
        $('.overmap-container').css("visibility", "hidden");
    },

    // place marker
    'click #insert-marker-btn': function(){
        Session.set('insertingMarker', false);
        var map = GoogleMaps.maps.appMap.instance;
        var panorama = map.getStreetView();
        if(panorama){
            if(tempMarker){
                tempMarker.setMap(null);
            }
            var pos = panorama.getLocation();
            panorama.setVisible(false);
            var description = $('.marker-description').val();
            var title = $('.marker-title').val();
            // turn this insertion into a meteor.method
            Markers.insert({lat: pos.latLng.G,
                lng: pos.latLng.K,
                description: description,
                title: title,
                position: panorama.getPosition(),
                pov: panorama.getPov(),
                zoom: panorama.getZoom()
            });
        }
        $('.overmap-container').css("visibility", "hidden");
    },
    // go back to the map
    'click #back-to-map': function(){
        Session.set('isInStreetView', false);
        Session.set('displayInfo', false);
        var map = GoogleMaps.maps.appMap.instance;
        var panorama = map.getStreetView();
        if(panorama){
            panorama.setVisible(false);
        }
        $('.overmap-container').css("visibility", "visible");
    }
});

Template.app.helpers({
    // standard load if no geolocation
    stdMapOptions: function(){
        if(GoogleMaps.loaded()){
            return {
                center: new google.maps.LatLng(-37.8136, 144.9631),
                zoom: 15
            }
        }
    },

    geolocationFails: function(){
        var error = Geolocation.error();
        return error && error.message;
    },

    appMapOptions: function(){
        console.log("place map at your location...");
        var latLng = Geolocation.latLng();
        console.log(latLng);
        if(GoogleMaps.loaded()){
            return {
                center: new google.maps.LatLng(latLng.lat, latLng.lng),
                zoom: 15
            }
        }
    },

    insertingMarker: function(){
        return Session.get('insertingMarker');
    },

    displayInfo: function(){
        return Session.get('displayInfo');
    }
});

Template.markerInfo.helpers({
    title: function(){
        return Session.get('markerTitle');
    },

    description: function(){
        return Session.get('markerDescription');
    },

    streetView: function(){
        return Session.get('isInStreetView');
    }
})

Template.app.onCreated(function(){
    GoogleMaps.ready('appMap', function(map){
        // drop marker on click
        var markers = {};
        var markerInfos = {};
        google.maps.event.addListener(map.instance, 'click', function(evt){
            if(Session.get('displayInfo') === true){
                // reset if on someone's marker
                Session.set('insertingMarker', false);
            }
            else{
                if(tempMarker){
                    tempMarker.setMap(null);
                }
                tempMarker = new google.maps.Marker({
                    position: new google.maps.LatLng(evt.latLng.G, evt.latLng.K),
                    map: map.instance
                });
                tempInfoWindow = new google.maps.InfoWindow({
                    content: "<a href='#' id='add-marker-btn'>Place marker</a><br><a href='#' id='no-marker-btn'>Cancel</a>",
                    map: map.instance
                });
                google.maps.event.addListener(tempInfoWindow, 'closeclick', function(evt){
                    if(tempMarker){
                        tempMarker.setMap(null);
                    }
                });
                tempInfoWindow.open(map.instance, tempMarker);

                // confirm if they want to put marker here
                Session.set('newMarkerAddedLat', evt.latLng.G);
                Session.set('newMarkerAddedLng', evt.latLng.K);
            }
                Session.set('displayInfo', false);
        });

        Markers.find().observe({
            added: function(doc){
                var marker = new google.maps.Marker({
                    draggable: false,
                    position: new google.maps.LatLng(doc.lat, doc.lng),
                    map: map.instance,
                    id: doc._id,
                    title: doc.title
                });
                Session.set('markerTitle', doc.title);
                Session.set('markerDescription', doc.description);
                markers[marker.id] = marker;

                // label for markers
                var markerLabel = new MapLabel({
                    text: "",
                    position: new google.maps.LatLng(doc.lat, doc.lng),
                    map: map.instance,
                    fontSize: 12,
                    align: "left"
                });

                markerInfos[marker.id] = markerLabel;
                google.maps.event.addListener(markers[marker.id], 'mouseover', function(){
                    console.log('mouseover event');
                    // offset label right amount
                    var newLatlng = offsetLabel(map.instance, markers[marker.id].position);
                    markerInfos[marker.id].set('position', newLatlng);
                    markerInfos[marker.id].set('text', markers[marker.id].title);
                });
                google.maps.event.addListener(markers[marker.id], 'mouseout', function(){
                    markerInfos[marker.id].set('text', '');
                });
                google.maps.event.addListener(markers[marker.id], 'click', function(){
                    console.log('marker clicked');
                    Session.set('isInStreetView', true);
                    Session.set('displayInfo', true);

                    var panorama = map.instance.getStreetView();
                    var panoObj = Markers.find({_id: marker.id}).fetch()[0];
                    var panoramaOptions = {
                        enableCloseButton: false,
                        position: new google.maps.LatLng(panoObj.position.G, panoObj.position.K),
                        pov: {
                            heading: panoObj.pov.heading,
                            pitch: panoObj.pov.pitch,
                            zoom: panoObj.zoom
                        },
                        linksControl: false,
                        addressControl: false
                    }
                    panorama.setOptions(panoramaOptions);
                    panorama.setVisible(true);
                    $('.overmap-container').css("visibility", "visible");
                });
            },

            removed: function(doc){
                markers[doc._id].setMap(null);
                google.maps.event.clearInstanceListeners(markers[doc._id]);
                delete markers[doc._id];
            }

        });

    });
});

function offsetLabel(map, latLng){
    // convert latlng into pixel
    var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
    var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
    var scale = Math.pow(2, map.getZoom());
    var markerPoint = map.getProjection().fromLatLngToPoint(latLng);
    var pt = new google.maps.Point((markerPoint.x - bottomLeft.x) * scale, (markerPoint.y - topRight.y) * scale);
    // offset
    pt.x += 15;
    pt.y -= 35;
    // convert pixel back into latlng
    var newLatlng = map.getProjection().fromPointToLatLng(new google.maps.Point(pt.x/scale + bottomLeft.x, pt.y/scale + topRight.y));
    return newLatlng;
}
