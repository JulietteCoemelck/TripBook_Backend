var mongoose = require('mongoose')


var villeSchema = mongoose.Schema({
    name : String,
    lat : Number,
    longi : Number,
});

const villeModel = mongoose.model('villes', villeSchema)

module.exports = villeModel;