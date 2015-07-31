Meteor.subscribe("markers");
var tempMarker;
Template.app.events({
    // go to street view
    'click #add-marker-btn': function(){
        var map = GoogleMaps.maps.appMap.instance;
        var panorama = map.getStreetView();

        var point = new google.maps.LatLng(Session.get('newMarkerAddedLat'), Session.get('newMarkerAddedLng'));
        // panorama.setPosition(point);
        // panorama.setPov({
        //     heading:45,
        //     pitch:10
        // });
        var panoramaOptions = {
            enableCloseButton: false,
            position: point,
            pov:{
                heading: 45,
                pitch: 10
            },
            linksControl: false
        }
        Session.set('insertingMarker', true);
        panorama.setOptions(panoramaOptions);
        panorama.setVisible(true);
    },
    // don't add new marker
    'click #no-marker-btn': function(){
        Session.set('newMarkerAdded', false);
        if(tempMarker){
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
            tempMarker = new google.maps.Marker({
                position: new google.maps.LatLng(pos.latLng.G, pos.latLng.K),
                map: map
            });
        }

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

    newMarkerAdded: function(){
        return Session.get('newMarkerAdded');
    },

    insertingMarker: function(){
        return Session.get('insertingMarker');
    }
});

Template.app.onCreated(function(){
    GoogleMaps.ready('appMap', function(map){
        google.maps.event.addListener(map.instance, 'click', function(evt){
            // eventually move this insertion to Meteor.methods
                console.log(evt.latLng);
                // for some reason lat is G and lng is K
                if(tempMarker){
                    tempMarker.setMap(null);
                }
                tempMarker = new google.maps.Marker({
                    position: new google.maps.LatLng(evt.latLng.G, evt.latLng.K),
                    map: map.instance
                });
                // confirm if they want to put marker here
                Session.set('newMarkerAdded', true);
                Session.set('newMarkerAddedLat', evt.latLng.G);
                Session.set('newMarkerAddedLng', evt.latLng.K);
                // Markers.insert({lat: evt.latLng.G, lng: evt.latLng.K});
        });

        var markers = {};
        Markers.find().observe({
            added: function(document){
                var marker = new google.maps.Marker({
                    draggable: false,
                    animation: google.maps.Animation.DROP,
                    position: new google.maps.LatLng(document.lat, document.lng),
                    map: map.instance,
                    id: document._id
                });

                markers[marker.id] = marker;
            },

            removed: function(document){
                markers[document._id].setMap(null);
                google.maps.event.clearInstanceListeners(markers[document._id]);
                delete markers[document._id];
            }

        });

    });
});
