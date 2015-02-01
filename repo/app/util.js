var exif = require('exiftool');
var fs = require('fs');
var Thesistype = require('./models/thesis_type.js');
var mongoose = require('mongoose');

var exports = module.exports = {};

// Uploads updatepdf function
exports.updatepdf = function(postparams,pdf_path,bibtex_path,user,doc,result) {
             var result = {}
             fs.readFile(pdf_path, function (err, data) {
                          if (err)
                                throw err;
                          else {
                                exif.metadata(data, function (err, metadata) {
                                  if (err)
                                        throw err;
                                  else
                                        //var description = 'description(en-US)';
                                        //console.log(metadata[var1]);


                                        //console.log("FU");
                                        //console.log(req.body.parsepdf);
                                        console.log(metadata.title);
                                        //d1.title = metadata.title;
                                        result["title"] = metadata.title;
                                        result["publisher"] = metadata.publisher;
                                        result["keywords"] = metadata.keywords;
                                        console.log(metadata.title);

                                        exports.updatethesisfromreq(postparams,pdf_path,bibtex_path,user,doc,result);
                                         return result;
                                });
                          }
                        });
}

// Update to postparams
exports.updatethesisfromreq = function(postparams,pdf_path,bibtex_path,user,doc,result) {

        Thesistype.findOneAndUpdate({
            name: postparams.thesis_type2
        },{name: postparams.thesis_type2},{upsert: true}, function(err, obj){
            doc.thesis_type = mongoose.Types.ObjectId(obj._id);
            doc.path_pdf = pdf_path;
            doc.path_bibtex = bibtex_path;
            doc.uploader = mongoose.Types.ObjectId(user);
            console.log(result);
            if(postparams.parsepdf == 1) {
            doc.title=result["title"];
            doc.publisher=result["publisher"];
            doc.keywords=result["keywords"].split(",");
            }
            //if("title" in result) {
            //doc.title = result["title"];
            //}
            doc.save();
        });
    return true
}
