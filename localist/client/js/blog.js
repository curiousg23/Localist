Meteor.subscribe("posts");
Meteor.subscribe("markers");

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
    },

    containsImg: function(){
        return this.containsImg;
    },

    imgRequest: function(){
        var marker = Markers.find({_id: this.markerId}).fetch()[0];
            lat = marker.lat,
            lng = marker.lng,
            heading = marker.pov.heading,
            pitch = marker.pov.pitch;
        var htmlStr = "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" + lat + "," + lng + "&fov=90&heading=" + heading + "&pitch=" + pitch;
        return htmlStr;
    }
});

Template.insertPost.events({
    'submit #insert-post-form':function(e, t){
        e.preventDefault();
        var title = $('#new-post-title').val();
        var description = $('#new-post-description').val();
        var id = $('#new-post-id').val();
        var containsImg = $('#new-post-contains-img').val();
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

        // Posts.insert({
        //     title: title,
        //     description: description,
        //     fullText: fullText
        // });
        Posts.insert({
            title: title,
            description: description,
            fullText: fullText,
            markerId: id,
            containsImg: containsImg
        });
    }
});
