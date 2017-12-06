var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Comment = require ("../models/comment");
var Campground = require("../models/campground");


//root route
router.get("/", function(req, res){
    res.render("home");
});

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        
      });

    

    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/campgrounds"); 
        });
    });
});
//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome to Eagle Eye Job' 
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "BYE BYE :)");
   res.redirect("/campgrounds");
});

// USER PROFILE
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Ups.. Something went wrong.");
      res.redirect("/");
    }
    Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Ups.. Something went wrong.");
        res.redirect("/");
      }
      res.render("users/show", {user: foundUser, campgrounds: campgrounds});
    })
  });
});

router.delete("/users/:id/:name",function(req,res){
  if(req.user){
    if(req.user._id.equals(req.params.id) || req.user._id.equals("5a26364cd134282d28772228")){
      Campground.remove({"author.username": req.params.name}, function(err) {
        if(err){
          res.redirect("/campgrounds");
        }
      });
      Comment.remove({"author.username": req.params.name}, function(err) {
        if(err){
          res.redirect("/campgrounds");
        }
      });
      User.findByIdAndRemove(req.params.id,function(err){
        if(err){
          console.log(err);
          res.redirect("/campgrounds");
        }else{
          req.flash("success","Delete Successfully!");
          res.redirect("/campgrounds");
        }
      })
    }
  }else{
    res.redirect("back")
  }

});

module.exports = router;