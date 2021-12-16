var express = require('express');
var router = express.Router();

var request = require('sync-request');

var bcrypt = require('bcrypt');
var uid2 = require('uid2');

var userModel = require('../models/users');
const voyageModel = require('../models/voyages');
var villeModel = require('../models/villes')
const messageModel = require('../models/messages');


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
router.get('/home', async function (req, res, next) {
  var user = await userModel.findOne({
    token: req.query.token
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

  // Pour mettre à jour le reducer avec tous les voyages du user //
  var allTrips = await voyageModel.find({
    organisateurs: [user._id]
  })

  res.json({resultnewTrip: resultnewTrip, resultUser: resultUser, tripId: tripSaved._id, allTrips: allTrips})
})


//  ROUTE DELETE TRIP  //
router.post('/deletetrip', async function (req, res, next) {

  var trip = await voyageModel.deleteOne({
    _id: req.body.idTripFromFront
  })

  var user = await userModel.findOne({
    token: req.body.token
  })

  var voyages = await voyageModel.find({
    organisateurs: [user._id]
  })

  res.json({trip: trip, voyages: voyages})
})
 
// ROUTE TCHAT //

router.post('/addMessage', async function (req, res, next) {
  var resultnewMessage = false;
  var resultUser = false;

  var user = await userModel.findOne({
    token: req.body.token
  })

  if (user){
    resultUser = true
  }

  var newMessage = new messageModel({
    message: req.body.messagefromFront,
    auteur: [user._id],
    date: req.body.dateFromFront,
    voyages: [voyages._id],
    

  })
  var MessageSaved = await newMessage.save();

  if(MessageSaved){
    resultnewMessage = true
  }

  res.json({resultnewMessage: resultnewMessage, resultUser: resultUser})
})

// ROUTE ITINERARY //
router.post('/itinerary', async function (req, res, next) {
  var trip = await voyageModel.findOne({
    _id: req.body.voyageId
  })
  console.log(trip)
  // renvoyer la liste des villes géographiques du voyage dans le front //
  var listeVilles = trip.etapes
  // console.log( "fait ?",listeVilles)

  var villesMarked = []
  for (i = 0; i<listeVilles.length; i++){
    var marked = await villeModel.findOne({
      name : listeVilles[i].ville
    })
    if (marked == null) {
      console.log('no city found')
    } else {
      villesMarked.push(marked)
    }
  }


  // renvoyer les villes (géographiques) de départ et de retour dans le front //
  //récupération ville de départ
  // var tripUser = await voyageModel.findOne({
  //   _id : req.body.voyageId
  // })
  // console.log("ICI CICI CICI  TRIPUSER", tripUser)
  // console.log("ICI CICI CICI  est ce que cest bon ?", tripUser.villeDepart)
  // var cityDeparture = tripUser.villeDepart
  // var cityDDate = tripUser.dateDepart
  // //récupération ville de retour
  // var cityArrival = tripUser.villeRetour
  // var cityADate = tripUser.dateRetour

  
  
  // var tableauDate = [cityDDate, cityADate]
  // var tableauVilles = [cityDeparture, cityArrival]
  // var tableauCoord = []

  // if (cityArrival === undefined) {
  // var tableauVilles = [cityDeparture, cityDeparture]
  // }


  //   console.log("ICI CICI CICI  TABLEAU ?", tableauVilles)
  // for (i=0; i<tableauVilles.length; i++) {
  //   var data = await request('POST', `https://api.openweathermap.org/data/2.5/weather?q=${tableauVilles[i]}&lang=fr&appid=e265a8c2c641174271693732b4d1faec`);
  //   var dataAPI = JSON.parse(data.body);

  //       //console.log("ICI CICI CICI  est ce que cest bon ?",dataAPI)
  //   var latitudeAPI = dataAPI.coord.lat
  //   var longitudeAPI = dataAPI.coord.lon
  //   var nom = tableauVilles[i]
  //   var cityDate = tableauDate[i]
  //   tableauCoord.push({nom, latitudeAPI, longitudeAPI, cityDate})
  // }
  //, villesMarked, tableauCoord

  res.json({trip, villesMarked})
})

// ROUTE ADD VILLE DEPART //
router.post('/addvilledepart', async function (req, res, next) {
  var trip = await voyageModel.findOne({
    _id: req.body.voyageId
  })
  var tripUpdate = await voyageModel.updateOne({
    _id: trip._id
  }, {
    villeDepart: req.body.villeDepartFromFront
  })

  var tripSaved = await voyageModel.findOne({
    _id: req.body.voyageId
  })

  res.json(tripSaved.villeDepart)
})

// ROUTE ADD VILLE RETOUR //
router.post('/addvilleretour', async function (req, res, next) {
  var trip = await voyageModel.findOne({
    _id: req.body.voyageId
  })
  var tripUpdate = await voyageModel.updateOne({
    _id: trip._id
  }, {
    villeRetour: req.body.villeRetourFromFront
  })

  var tripSaved = await voyageModel.findOne({
    _id: req.body.voyageId
  })

  res.json(tripSaved.villeRetour)
})

// ROUTE ADD ETAPES //
router.post('/addetape', async function (req, res, next) {
  var trip = await voyageModel.findOne({
    _id: req.body.voyageId
  })

  // var potentialCity = await villeModel.findOne({
  //   name : req.body.villeEtapeFromFront
  // })
  // if (potentialCity == null) {
  //   var data = await request('POST', `https://api.openweathermap.org/data/2.5/weather?q=${req.body.villeEtapeFromFront}&lang=fr&appid=e265a8c2c641174271693732b4d1faec`);
  //   var dataAPI = JSON.parse(data.body);
  //     console.log("DATADATDATADTAD API",dataAPI)
  //   var latitudeAPI = dataAPI.coord.lat
  //   var longitudeAPI = dataAPI.coord.lon
  //   var newville = new villeModel({
  //      name: req.body.villeEtapeFromFront, 
  //      lat: latitudeAPI,
  //      longi: longitudeAPI,
  //   });
  //   var city = await newville.save();
  // } else {
  //   console.log('deja la')
  // }
  
  trip.etapes.push({ville: req.body.villeEtapeFromFront, duree: req.body.dureeFromFront})
  console.log(trip.etapes)
  
  var tripSaved = await trip.save(); 

  
  
  res.json({tripEtapes : tripSaved.etapes})
})

// ROUTE DELETE ETAPE //
router.post('/deleteetape', async function (req,res,next) {
  var trip = await voyageModel.updateOne({
    _id: req.body.voyageID
  },{
    $pull: {etapes: {_id: req.body.etapeIDFromFront}}
  })

  var allTrips = await voyageModel.findOne({
    _id: req.body.voyageID
  })

  res.json({allEtapes: allTrips.etapes})
})

// ROUTE GET ACTIVITIES //
router.post('/activities', async function(req, res, next) {
  var trip = await voyageModel.findOne({
    _id: req.body.voyageID
  })

  res.json({tripActivities: trip.activities})
})

// ROUTE ADD ACTIVITY //
router.post('/addactivity', async function (req, res, next) {
  var trip = await voyageModel.findOne({
    _id: req.body.voyageID
  })

  var user = await userModel.findOne({
    token: req.body.token
  })

  trip.activities.push({name: req.body.activityName, creator: user._id, date: req.body.date, heure: req.body.heure})
  var tripSaved = await trip.save();

  res.json({trip: trip})
})

// ROUTE API VILLES //
//voir route addEtape

// MARQUEURS
router.post('/marqueurs', async function(req, res, next) {
  var trip = await voyageModel.findOne({
    _id: req.body.voyageIDFromFront
  })
  console.log('chargement effectué')
  
  //récupération étapes
  var listeVilles = trip.etapes
      console.log("LISTE VILLES //////////////", listeVilles)
      console.log("iiiiiiiii",listeVilles.length )

  var villesToMarked = []
  for (i=0; i<listeVilles.length; i++) {
    var data = await request('POST', `https://api.openweathermap.org/data/2.5/weather?q=${listeVilles[i].ville}&lang=fr&appid=e265a8c2c641174271693732b4d1faec`);
    var dataAPI = JSON.parse(data.body);
     console.log("DATADATDATADTAD API",dataAPI)

    var latitudeAPI = dataAPI.coord.lat
    var longitudeAPI = dataAPI.coord.lon
    var nomVille = listeVilles[i].ville
    var dureeVille= listeVilles[i].duree

    villesToMarked.push({nomVille, latitudeAPI, longitudeAPI, dureeVille})
  }

  console.log("MARKED API",villesToMarked)  

  //récupération des durées
      // var tableauDureeEtapes = []
      // for (i=0; i<listeVilles.length; i++) {
      //   tableauDureeEtapes.push(listeVilles[i].duree)
      // }
      //console.log('durees')
      //console.log(tableauDureeEtapes)
  
  //récupération ville de départ
  var cityDeparture = trip.villeDepart
  var cityDDate = trip.dateDepart
  //récupération ville de retour
  var cityArrival = trip.villeRetour
  var cityADate = trip.dateRetour
  
  var tableauDate = [cityDDate, cityADate]
  var tableauVilles = [cityDeparture, cityArrival]
  var tableauCoord = []

  if (cityArrival === undefined) {
    var tableauVilles = [cityDeparture, cityDeparture]
    }

  for (i=0; i<tableauVilles.length; i++) {
    var data = await request('POST', `https://api.openweathermap.org/data/2.5/weather?q=${tableauVilles[i]}&lang=fr&appid=e265a8c2c641174271693732b4d1faec`);
    var dataAPI = JSON.parse(data.body);

    var latitudeAPI = dataAPI.coord.lat
    var longitudeAPI = dataAPI.coord.lon
    var nom = tableauVilles[i]
    var cityDate = tableauDate[i]
    tableauCoord.push({nom, latitudeAPI, longitudeAPI, cityDate})
  }


  res.json ({tableauVilleDetA : tableauCoord, villesToMarked : villesToMarked})
})

module.exports = router;
