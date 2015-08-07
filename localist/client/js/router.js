Router.route('/', function(){
    this.render('main');
})

Router.route('/about', function(){
    this.render('about');
});

Router.route('/map', function(){
    this.render('app');
},{name: 'Map'});

// Meteor.startup(function(){
//     GoogleMaps.load();
// });

Router.onBeforeAction(function(){
    GoogleMaps.load();
    GoogleMaps.loadUtilityLibrary('maplabel.js');
    GoogleMaps.loadUtilityLibrary('infobox.js');
    console.log('action taken');
    this.next();
},{only: ['Map']});
