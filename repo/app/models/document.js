// load the things we need
var mongoose = require('mongoose');
var user = require('./user.js');
var mongoosastic = require('mongoosastic');
//var paginate = require('mongoose-paginate');


var documentschema = new mongoose.Schema({
        uploader : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        title        : { type:String,es_indexed:true},
        author_firstname        : String,
        author_lastname         : String,
        publisher         : String,
        abstract         : { type:String,es_indexed:true},
        keywords :  [
         {
          type: String,
          required: false
        }
        ],
        path_pdf         : String,
        path_bibtex         : String,
        doi         : String,
        license        : String,
        mentor_firstname        : String,
        mentor_lastname        : String,
        language        : String,
        createdAt: {
    type: Date,
    "default": Date.now
    },
    updated_at    : { type: Date },
    thesis_type     : { type: mongoose.Schema.Types.ObjectId, ref: 'Thesistype' },
    type     : String

});

var Thesistype = require('./thesis_type.js');
documentschema.plugin(mongoosastic); //mongoosastic plugin
//documentschema.plugin(paginate)

// create the model for users and documents and expose it to our app
module.exports = mongoose.model('Document', documentschema);
