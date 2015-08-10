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
        Meteor.call('submitNewPost', $('#new-post-title').val(), $('#new-post-description').val());
        // Meteor.call('submitNewPost', $('#new-post-title').val(), $('#new-post-description').val(), $('#new-post-id').val());
    }
});
