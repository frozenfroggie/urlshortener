var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;
var assert = require("assert");
var validator = require('validator');
 
var url = process.env.MONGOLAB_URI;
var number; 

 
// home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// get original url from user and save to mongodb collection
router.get('/new/:url(*)', function(req, res) {
    mongo.connect(url, function(err, db) {
        assert.equal(null, err);  
        var sites = db.collection('sites');
        var url = req.params.url;
        number = Math.floor((Math.random() * 10000) + 1);
        if(validator.isURL(url,{require_protocol: true})){
            sites.insert({
  	            original_url: url,
  	            short_url: "https://get-short-url.herokuapp.com/" +  number
            }, function(err, result){
  	            assert.equal(null, err);  
  	            var obj = {
  	              "original_url": result["ops"][0]["original_url"],
  	              "short_url": result["ops"][0]["short_url"]
  	            };
                res.json(obj);
                db.close();
            });
        } else {
            res.json({"error": "Wrong url format, make sure you have a valid protocol and real site."});
        }
    });
});

// get shortid from user and check if there is any site associated with it
router.get('/:shortid(*)', function(req, res) {
      mongo.connect(url, function(err, db) {
        assert.equal(null, err);  
        var sites = db.collection('sites');
        sites.findOne({"short_url": "https://get-short-url.herokuapp.com/" + req.params.shortid }, {
               original_url: 1,
               _id: 0
        }, function(err, result) {
            assert.equal(null, err);  
            if(result) {
                res.redirect(result["original_url"]);
            } else {
                res.json({"error": "This url is not on the database."});
            }
            db.close();
        });
      });
});
    
module.exports = router;
