var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



//INDEX - show all campgrounds
router.get("/", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all campgrounds from DB
      Campground.find({name: regex}, function(err, allCampgrounds){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allCampgrounds);
         }
      });
  } else {
      // Get all campgrounds from DB
      Campground.find({}, function(err, allCampgrounds){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allCampgrounds);
            } else {
              res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
            }
         }
      });
  }
});
router.get("/search",function(req,res){
  var search=req.body.search;
   if (req.query.search) {
       const regex = new RegExp(escapeRegex(req.query.search), 'gi');
       Campground.find({ "name": regex }, function(err, foundCampgrounds) {
           if(err) {
               console.log(err);
           } else {
              res.render("campgrounds/index",{campgrounds:foundCampgrounds, currentUser:req.user});
           }
       }); 
    }else{
      res.redirect("/campgrounds")
    }
})

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
 var name=req.body.name;
	var image=req.body.image;
	var description=req.body.description;
	var location = req.body.location;
	var cost = req.body.cost;
	var author = {
		id: req.user._id,
		username : req.user.username,
		image : req.user.image
	}
	var newCampgrounds={name:name,image:image,description:description,author:author,location:location,cost:cost};
	// simpan ke database
	Campground.create(newCampgrounds),function(err,newCampground){
		if(err){
			console.log(err)
		}else{
			res.redirect("/campgrounds")
			console.log(newCampground)
		}
	}
	res.redirect("/campgrounds")
})
  

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

router.get('/', (req, res) => {
    res.render('campgrounds/index.ejs');
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
          console.log(err);
        } else {
          console.log(foundCampground)
          //render show template with that campground
          res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

router.get("/:id/edit", middleware.checkUserCampground, function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

router.put("/:id", function(req, res){
  
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: req.body.location};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });


router.delete("/:id", function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err, campground) {
    Comment.remove({
      _id: {
        $in: campground.comments
      }
    }, function(err, comments) {
      req.flash('error', campground.name + ' deleted!');
      res.redirect('/campgrounds');
    })
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error","Please Login First");
  res.redirect("/login");
}
function checkOwnership(req,res,next){
    // check if the user is logged in
    if(req.isAuthenticated()){
      Campground.findById(req.params.id ,function(err,foundCampground){
        if(err){
          res.redirect("back");
        }else{
        // is the user own the campgrounds?
        if(foundCampground.author.id.equals(req.user._id) || req.user._id.equals("5a26364cd134282d28772228")){
          // tidak bisa pakai === karena satu object satu string
          next();
        }else{
          res.redirect("back");
        }
      }
    })
    }else{
      res.redirect("/login");
    }
}

module.exports = router;



