Template.app.helpers({
    appMapOptions: function(){
        if(GoogleMaps.loaded()){
            return {
                center: new google.maps.LatLng(-37.8136, 144.9631),
                zoom: 8
            }
        }
    }
});

Template.app.onCreated(function(){
    GoogleMaps.ready('appMap', function(map){
        var marker = new google.maps.Marker({
            position: map.options.center,
            map: map.instance
        });
    });
});
