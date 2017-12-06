var Comment = require("../models/comment");
var Campground = require("../models/campground");
module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "Sign In to Add New Job/ Comments !");
        res.redirect("/login");
    },
    checkUserCampground: function(req, res, next){
        if(req.isAuthenticated()){
            Campground.findById(req.params.id, function(err, campground){
               if(campground.author.id.equals(req.user._id) || req.user._id.equals("5a26364cd134282d28772228")){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   console.log("Not Good");
                   res.redirect("/campgrounds/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "Sign In to Add New Job/ Comments !");
            res.redirect("/login");
        }
    },
    checkUserComment: function(req, res, next){
        console.log("YOU MADE IT!");
        if(req.isAuthenticated()){
            Comment.findById(req.params.commentId, function(err, comment){
               if(comment.author.id.equals(req.user._id) || req.user._id.equals("5a26364cd134282d28772228")){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("/campgrounds/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "Sign In to Add New Job/ Comments  !");
            res.redirect("login");
        }
    }
}