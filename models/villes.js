var mongoose = require('mongoose')


var villeSchema = mongoose.Schema({
    nom : String,
    latitude : Number,
    longitude : Number,
});

const villeModel = mongoose.model('villes', villeSchema)

module.exports = villeModel;