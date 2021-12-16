var mongoose = require('mongoose')


var messageSchema = mongoose.Schema({
    message : String,
    auteur: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    date : Date,
    voyages: {type: mongoose.Schema.Types.ObjectId, ref: 'voyages'},

});

const messageModel = mongoose.model('messages', messageSchema)

module.exports = messageModel;