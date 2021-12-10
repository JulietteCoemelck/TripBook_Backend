var mongoose = require('mongoose')

// SOUS DOCUMENT ETAPES //
var etapesSchema = mongoose.Schema({
    ville: String,
    duree : Number
})
// SOUS DOCUMENT ACTIVITES //
var activitySchema = mongoose.Schema({
    name: String,
    desc: String,
    creator: String,
    date: Date,
    ville: String,
    votesPour : [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    votesContre : [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}]
})
// SOUS DOCUMENT CHECKLIST //
var checklistSchema = mongoose.Schema({
    name: String,
    desc: String,
    pour: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    deadline: Date,
    statut: String
})

// SOUS DOCUMENT VOYAGEURS //
var voyageursSchema = mongoose.Schema({
    organisateur: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    adultes: Number,
    enfants : Number
})

// SCHEMA VOYAGES //
var voyageSchema = mongoose.Schema({
    tripName : String,
    villeDepart : String,
    villeArrivee : String,
    dateDepart : String,
    dateRetour : String,
    organisateurs : [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    etapes: [etapesSchema],
    activies: [activitySchema],
    checklist : [checklistSchema],
    voyageurs : [voyageursSchema]

});

const voyageModel = mongoose.model('voyages', voyageSchema)

module.exports = voyageModel;

