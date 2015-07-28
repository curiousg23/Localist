Template.main.events({
    'click #subscribe-btn':function(e,t){
        e.preventDefault();
        Meteor.call('sendJoinEmail', $('#email-addr').val(), function(err, res){
            if(err){
                console.log(err);
            }
            else{
                console.log(res);
            }
        });
        $('#email-addr').val("");
        Session.set('userSubscribed', true);
    }
});

Template.main.userSubscribed = function(){
    return Session.get('userSubscribed');
}
