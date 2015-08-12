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

Router.route('/blog', function(){
    this.render('blogLayout');
});

Router.route('/insertPost', function(){
    this.render('insertPost');
});

Router.route('/blog/:_id', {
    template: 'postPage',
    data: function(){
        return Posts.findOne({_id: this.params._id});
    }
});

Router.onBeforeAction(function(){
    GoogleMaps.load();
    GoogleMaps.loadUtilityLibrary('maplabel.js');
    GoogleMaps.loadUtilityLibrary('infobox.js');
    console.log('action taken');
    this.next();
},{only: ['Map']});
