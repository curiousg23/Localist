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
            linksControl: false
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
    // street view of someone's marker--turn this into a meteor method
    'click .go-to-street': function(){
        Session.set('isInStreetView', true);
        Session.set('displayInfo', true);
        var map = GoogleMaps.maps.appMap.instance;
        var panorama = map.getStreetView();
        var panoObj = Markers.find({_id: Session.get('markerId')}).fetch()[0];
        console.log(panoObj);
        var panoramaOptions = {
            enableCloseButton: false,
            position: new google.maps.LatLng(panoObj.position.G, panoObj.position.K),
            pov: {
                heading: panoObj.pov.heading,
                pitch: panoObj.pov.pitch,
                zoom: panoObj.zoom
            },
            linksControl: false
        }
        panorama.setOptions(panoramaOptions);
        panorama.setVisible(true);
        $('.overmap-container').css("visibility", "visible");
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

        var markers = {};
        var markerInfos = {};
        Markers.find().observe({
            added: function(document){
                var marker = new google.maps.Marker({
                    draggable: false,
                    position: new google.maps.LatLng(document.lat, document.lng),
                    map: map.instance,
                    id: document._id
                });
                Session.set('markerTitle', document.title);
                Session.set('markerDescription', document.description);
                markers[marker.id] = marker;
                var infoWindow = new google.maps.InfoWindow({
                    content: document.title,
                    map: map.instance
                });
                markerInfos[marker.id] = infoWindow;
                markerInfos[marker.id].close();
                google.maps.event.addListener(markers[marker.id], 'mouseover', function(){
                    markerInfos[marker.id].open(map.instance, markers[marker.id]);
                    google.maps.event.addListener(markerInfos[marker.id], 'closeclick', function(){
                        markerInfos[marker.id].close();
                    });
                });
                google.maps.event.addListener(markers[marker.id], 'click', function(){
                    console.log('marker clicked');
                    Session.set('markerId', marker.id);
                });
            },

            removed: function(document){
                markers[document._id].setMap(null);
                google.maps.event.clearInstanceListeners(markers[document._id]);
                delete markers[document._id];
            }

        });

    });
});
