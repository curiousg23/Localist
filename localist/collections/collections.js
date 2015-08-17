Emails = new Meteor.Collection("emails");
Markers = new Meteor.Collection("markers");
Posts = new Meteor.Collection("posts");
Pages = new Meteor.Pagination(Posts, {
    itemTemplate: "postItem"
});
