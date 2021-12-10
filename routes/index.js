var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
var uid2 = require('uid2');

var userModel = require('../models/users')

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


// HOMESREEN //
router.post('/homescreen', async function (req, res, next) {
  var result = false;
  var user = await userModel.findOne({
    token: req.body.token
  })

  if(user){
    result = true
  }
  res.json({username: user.username, result})
})



module.exports = router;
