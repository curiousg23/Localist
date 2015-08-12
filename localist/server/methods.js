Meteor.methods({
    sendJoinEmail: function(email){
        this.unblock();

        var msg = "Hi there -- thanks for signing up to beta test Localist!\n\n" + "We're not quite ready to launch yet, but when we launch, you'll be the first to have access. If you have any suggestions of places you'd like to see at launch, send them over to reservationhunter@gmail.com, or place it yourself when we go live!";

        Email.send({
            to: email,
            from: 'no-reply@localist.co',
            subject: 'Thanks for joining Localist!',
            text: msg
        });

        Emails.insert({
            email: email
        });

        return "no issues";
    }
});

Posts.allow({
    // change these to check if userid === adminId later
    insert: function(userId, doc){
        return true;
    },
    update: function(userId, doc, fields, modifier){
        return true;
    },
    remove: function(userId, doc){
        return true;
    }
});
