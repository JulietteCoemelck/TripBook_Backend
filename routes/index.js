var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
var uid2 = require('uid2');

var userModel = require('../models/users');
const voyageModel = require('../models/voyages');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// SIGN UP

router.post('/sign-up', async function (req, res, next) {
  const cost = 10
  
  var error = []
  var result = false
  var saveUser = null
  var token = null
  
  const data = await userModel.findOne({
    email: req.body.emailFromFront
  })
  
  if(data != null){
    error.push('Utilisateur déjà présent')
  }
  
  if(req.body.usernameFromFront == ''
  || req.body.emailFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('Champs vides')
  }
  
  if (error.length === 0) {
    const hash = bcrypt.hashSync(req.body.passwordFromFront, cost);
    var newUser = new userModel ({
      username : req.body.usernameFromFront,
      email : req.body.emailFromFront,
      password: req.body.passwordFromFront,
      password: hash,
      token: uid2(32)
    }) 
    
    saveUser = await newUser.save()
  

    if (saveUser){
      result = true
      token = saveUser.token
    }
  }

  res.json({result, saveUser, error, token})
})



// SIGN IN


router.post ('/sign-in', async function(req, res, next) {

  var result = false
  var user = null
  var error = []
  var token = null
  
  if(req.body.emailFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('Champs vides')
  }

  if(error.length == 0){
     user = await userModel.findOne({
      email: req.body.emailFromFront,
    })

    if(user){
      if (bcrypt.compareSync(req.body.passwordFromFront, user.password)) {
        result = true
        token = user.token
      } else {
        error.push('Mot de passe incorrect')
      }
    } else {
      error.push('Email incorrecte')
    }
  
  }
  res.json({result, user, token, error})
})


// ROUTE HOMESREEN //
router.post('/home', async function (req, res, next) {
  var result = false;
  var resultvoyage = false;
  var user = await userModel.findOne({
    token: req.body.token
  })

  if(user){
    result = true
  }
// trouver les voyages de l'utilisateur //
  var voyages = await voyageModel.find({
    organisateurs: [user._id]
  })

  if(voyages){
    resultvoyage = true;
  } 
  res.json({username: user.username, result: result, resultvoyage: resultvoyage, voyages : voyages})
})


// ROUTE NEWTRIP //
router.post('/newtrip', async function (req, res, next) {
  var resultnewTrip = false;
  var resultUser = false;

  var user = await userModel.findOne({
    token: req.body.token
  })

  if (user){
    resultUser = true
  }

  var newTrip = new voyageModel({
    tripName: req.body.tripNamefromFront,
    dateDepart: req.body.dateDepartFromFront,
    dateRetour: req.body.dateRetourFromFront,
    voyageurs: [{organisateur: user._id, adultes: req.body.adultesFromFront, enfants: req.body.enfantsFromFront}],
    organisateurs: [user._id]

  })
  var tripSaved = await newTrip.save();

  if(tripSaved){
    resultnewTrip = true
  }

  res.json({resultnewTrip: resultnewTrip, resultUser: resultUser})
})


//  ROUTE DELETE TRIP  //
router.post('/deletetrip', async function (req, res, next) {


  var trip = await voyageModel.deleteOne({
    _id: req.body.idTripFromFront
  })

  res.json({trip: trip})
})


// ROUTE ITINERARY //
router.post('/itinerary', async function (req, res, next) {
  var trip = await voyageModel.findOne({
    _id: req.body.voyageId
  })


  res.json({trip})
})

// ROUTE ADD ETAPES //
router.post('/addetape', async function (req, res, next) {
  var trip = voyageModel.findOne({
    _id: req.body.voyageId
  })

// trip.etapes.push({ville: req.body.villeEtapeFromFront, duree: req.body.dureeFromFront})
// var tripSaved = await trip.save(); 

  res.json({tripEtapes : tripSaved.etapes, trip: trip})
})


module.exports = router;
