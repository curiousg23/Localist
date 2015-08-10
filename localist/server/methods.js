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
    },

    submitNewPost: function(title, description){
        var counter = 0;
        var fullText = description.split('\n');
        console.log(fullText.length);
        // generate preview text
        for(var i = 0 ; i < description.length; i++){
            if(counter > 69 || description.charAt(i) == '\n')
                break;
            if((description.charAt(i) == ' ') || (description.charAt(i) == '\t')){
                counter++;
            }
        }
        description = description.substring(0, i);

        Posts.insert({
            title: title,
            description: description,
            fullText: fullText
        });
    }
    // for when i test w/actual markers
    // submitNewPost: function(title, description, id){
    //     var marker = Markers.find({_id: id}).fetch();
    //     var heading = marker.pov.heading;
    //     var pitch = marker.pov.pitch;
    //     var counter = 0;
    //     var fullText = description;
    //     // generate preview text
    //     for(var i = 0 ; i < description.length; i++){
    //         if(counter > 69 || description.charAt(i) == '\n')
    //             break;
    //         if((description.charAt(i) == ' ') || (description.charAt(i) == '\t')){
    //             counter++;
    //         }
    //     }
    //     description = description.substring(0, i);
    //
    //     Posts.insert({
    //         title: title,
    //         description: description,
    //         fullText: fullText,
    //         heading: heading,
    //         pitch: pitch
    //     });
    // }
});
