Meteor.subscribe("markers");
var tempMarker;
var placeBox;
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
        placeBox.close();
        if(tempMarker){
            tempMarker.setMap(null);
        }
        $('.overmap-container').css("visibility", "visible");
    },
    // don't add new marker
    'click #no-marker-btn': function(e,t){
        console.log('called no-marker-btn');
        e.preventDefault();
        placeBox.close();
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
        }
        $('.overmap-container').css("visibility", "hidden");
    },

    // place marker
    'click #insert-marker-btn': function(){
        Session.set('insertingMarker', false);
        var map = GoogleMaps.maps.appMap.instance;
        var panorama = map.getStreetView();
        if(panorama){
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
        var mapSettings = [{
          elementType: "labels.icon",
          stylers: [
            { "visibility": "off" }
          ]
        }];
        map.instance.setOptions({styles: mapSettings});

        // drop marker on click
        var markers = {};
        var markerInfos = {};
        google.maps.event.addListener(map.instance, 'click', function(evt){
            if(tempMarker){
                placeBox.close();
                tempMarker.setMap(null);
            }
            tempMarker = new google.maps.Marker({
                position: new google.maps.LatLng(evt.latLng.G, evt.latLng.K),
                map: map.instance
            });

            placeBox = new google.maps.InfoWindow({
                content: "<a href='#' id='add-marker-btn'>Place marker</a><br><a href='#' id='no-marker-btn'>Cancel</a>",
                map: map.instance
            });
            placeBox.open(map.instance, tempMarker);
            google.maps.event.addListener(placeBox, 'domready', function(){
               // Reference to the DIV which receives the contents of the infowindow using jQuery
               var iwOuter = $('.gm-style-iw');

               /* The DIV we want to change is above the .gm-style-iw DIV.
                * So, we use jQuery and create a iwBackground variable,
                * and took advantage of the existing reference to .gm-style-iw for the previous DIV with .prev().
                */
               var iwBackground = iwOuter.prev();

               // Remove the background shadow DIV
               iwBackground.children(':nth-child(2)').css({'display' : 'none'});

               // Remove the white background DIV
               iwBackground.children(':nth-child(4)').css({'display' : 'none'});

               // remove arrow
               iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'display: none !important;'});
               iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'display: none !important;'});
            });

            Session.set('newMarkerAddedLat', evt.latLng.G);
            Session.set('newMarkerAddedLng', evt.latLng.K);
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
                    fontSize: 13,
                    fontFamily: "alegreyaReg",
                    align: "left",
                    fontColor: "#000033",
                    strokeWeight: 0
                });

                markerInfos[marker.id] = markerLabel;
                google.maps.event.addListener(markers[marker.id], 'mouseover', function(){
                    console.log('mouseover event');
                    // offset label right amount
                    var newLatlng = offsetLabel(map.instance, markers[marker.id].position, 15, 35);
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

function offsetLabel(map, latLng, offsetX, offsetY){
    // convert latlng into pixel
    var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
    var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
    var scale = Math.pow(2, map.getZoom());
    var markerPoint = map.getProjection().fromLatLngToPoint(latLng);
    var pt = new google.maps.Point((markerPoint.x - bottomLeft.x) * scale, (markerPoint.y - topRight.y) * scale);

    // offset
    pt.x += offsetX;
    pt.y -= offsetY;
    // convert pixel back into latlng
    var newLatlng = map.getProjection().fromPointToLatLng(new google.maps.Point(pt.x/scale + bottomLeft.x, pt.y/scale + topRight.y));
    return newLatlng;
}
