Meteor.subscribe("posts");
Template.postList.helpers({
    posts: function(){
        // will need to put a limit here, and work out some pagination when the amount of posts gets too large
        return Posts.find({});
    }
});

Template.postItem.helpers({
    title: function(){
        return this.title;
    },

    description: function(){
        return this.description;
    }
});

Template.postPage.helpers({
    title: function(){
        return this.title;
    },

    fullText: function(){
        return this.fullText;
    }
});

Template.insertPost.events({
    'submit #insert-post-form':function(e, t){
        e.preventDefault();
        var title = $('#new-post-title').val();
        var description = $('#new-post-description').val();
        // var id = $('#new-post-id').val();
        //     var heading = marker.pov.heading;
        //     var pitch = marker.pov.pitch;
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
        //     Posts.insert({
        //         title: title,
        //         description: description,
        //         fullText: fullText,
        //         heading: heading,
        //         pitch: pitch
        //     });
    }
});
