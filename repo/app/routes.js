var document = require('./models/document.js');
var Thesistype = require('./models/thesis_type.js');
_ = require("underscore")
var mongoose = require('mongoose');
var util = require('./util.js');
var fs = require('fs');

module.exports = function(app, passport) {




    // DATA UPLOAD ROUTE =========================
    app.post('/api/upload', isLoggedIn, function(req, res) {

        req.assert('thesis_type2', 'Thesis-Type is required').notEmpty(); //Validate name
        // Additional requirements
        //req.assert('author_firstname', 'author_firstname is required').notEmpty();           //Validate name
        //req.assert('title', 'title is required').notEmpty();           //Validate name
        //req.assert('author1surname', 'Author surname is required').notEmpty();           //Validate name
        //req.assert('abstract', 'abstract is required').notEmpty();           //Validate name
        //req.assert('mentor1surname', 'Mentor surname is required').notEmpty();           //Validate name
        //req.assert('mentor1name', 'Mentor name is required').notEmpty();           //Validate name
        //req.assert('language', 'language is required').notEmpty();           //Validate name
        //req.assert('doi', 'DOI is required').notEmpty();           //Validate name
        //req.assert('license', 'license is required').notEmpty();           //Validate name
        //req.assert('comment', 'comment is required').notEmpty();           //Validate name

        var errors = req.validationErrors();
        console.log(errors);

        if (errors == null) {
            errors = [];
        }


        if (typeof(req.files.bibtex) == 'undefined') {
            errors.push({
                param: 'bibtex',
                msg: 'bibtex file undefined'
            });
        }

        if (typeof(req.files.pdf) == 'undefined') {
            errors.push({
                param: 'pdf',
                msg: 'pdf file undefined'
            });
        }

        // PROCCESS DATA
        if (!errors || errors.length == 0) { //No errors
            var doc = new document(req.body);
            var postparams = req.body;

            var result = {}
            var pdf_path = req.files.pdf.path;
            var bibtex_path = req.files.bibtex.path;
            var user = req.session.passport.user;


            // parsePDF
            if (req.body.parsepdf) {
                util.updatepdf(postparams, pdf_path, bibtex_path, user, doc, result);
            } else {
                util.updatethesisfromreq(postparams, pdf_path, bibtex_path, user, doc, result);
            }
            res.render('submit.ejs', {

                title: 'Upload Thesis - Successfully inserted!',
                message: 'Successfully inserted!',
            });

        } else { //Display errors to user
            res.render('submit.ejs', {
                title: 'Upload Thesis - Errors occured',
                message: '',
                errors: errors
            });
        }
    });

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // SEARCHCATEGORY VIEW=========================
    app.get('/searchcategory/:id', function(req, res) {
        var id = req.params.id;

        Thesistype.findOne({
            name: id
        }).exec(function(err, thesistype, count) {
            console.log(thesistype);
            document.find({
                thesis_type: thesistype
            }).populate('thesis_type').sort({
                createdAt: 'desc'
            }).exec(function(err, theses, count) {
                res.render('search_results.ejs', {
                    queryparam: req.params.id,
                    theses: theses
                });
            });
        });
    });

    // Update individual Thesis VIEW=========================
    app.get('/api/update/:id',isLoggedIn, function(req, res) {
        var id = req.params.id;

        Thesistype.findOne({
            name: id
        }).exec(function(err, thesistype, count) {
            document.findOne({
                _id: id
            }).populate('thesis_type').sort({
                createdAt: 'desc'
            }).exec(function(err, thesis, count) {
                res.render('update.ejs', {
                    thesis: thesis
                });
            });
        });
    });


    // Update individual Thesis VIEW=========================
    app.get('/api/delete/:id',isLoggedIn, function(req, res) {
        var id = req.params.id;

        Thesistype.findOne({
            name: id
        }).exec(function(err, thesistype, count) {
            document.findOne({
                _id: id
            }).exec(function(err, thesis, count) {

                thesis.remove(function(err) {
                    if (err) throw err;

                    console.log('Thesis successfully deleted!');
                    });
                    res.redirect('/my_thesis');
            });
        });
    });


    // Update individual Thesis VIEW=========================
    app.post('/api/update/:id',isLoggedIn, function(req, res) {
        var id = req.params.id;
        var title = req.body.title;
        var author_firstname = req.body.author_firstname;
        var author_lastname  = req.body.author_lastname;
        var publisher = req.body.publisher;
        var abstract = req.body.abstract;
        var mentor_firstname = req.body.mentor_firstname;
        var mentor_lastname = req.body.mentor_lastname;
        var language = req.body.language;
        var doi = req.body.doi;

        Thesistype.findOne({
            name: id
        }).exec(function(err, thesistype, count) {
            document.findOne({
                _id: id
            }).exec(function(err, thesis, count) {
                thesis.title = title;
                thesis.author_firstname = author_firstname;
                thesis.author_lastname = author_lastname;
                thesis.publisher = publisher;
                thesis.abstract = abstract;
                thesis.mentor_firstname = mentor_firstname;
                thesis.mentor_lastname = mentor_lastname;
                thesis.language = language;
                thesis.doi = doi;

                thesis.save(function(err) {
                if (err) throw err;
                console.log('Thesis successfully updated!');
                });

                res.render('update.ejs', {
                    thesis: thesis,
                    message: 'Successfully updated!'
                });
            });
        });
    });


    // SEARCH VIEW POST=========================
    app.post('/search', function(req, res) {
        console.log(req.body.search_bar);
        document.search({
            query_string: {
                query: req.body.search_bar
            }
        }, function(err, results) {
            var searchids = [];

            results.hits.hits.forEach(function(searchobject) {
                searchids.push(searchobject._id);
            });

            document.find({
                '_id': {
                    $in: searchids
                }
            }, function(err, thesis) {
                res.render('search_results.ejs', {
                    queryparam: req.body.search_bar,
                    theses: thesis
                });
            });

        });
    });

    // SEARCH SECTION VIEW GET=========================
    app.get('/search', isLoggedIn, function(req, res) {
        document.find().populate('thesis_type').sort({
            createdAt: 'desc'
        }).limit(10).exec(function(err, ten_latest_thesis, count) {
            res.render('search.ejs', {
                user: req.user,
                theses: ten_latest_thesis
            });
        });
    });


    // REST THESIS ALL VIEW=========================
    app.get('/rest/theses', function(req, res) {

    var page = req.param('page') > 0 ? req.param('page') : 1
    document.paginate({}, page, 10, function(error, pageCount, paginatedResults, itemCount) {
      if (error) {
        console.error(error);
      } else {
        console.log('Pages:', pageCount);
        console.log(paginatedResults);
      }
    }, {language: 'eng', sortBy : { createdAt : -1 }})});

    app.get('/restapi', function(req, res) {
        res.render('restapi.ejs');
    });



    // INDIVIDUAL THESIS VIEW=========================
    app.get('/rest/thesis/:id', function(req, res) {
        var id = req.params.id;
        document.findOne({
            _id: id
        }).populate('thesis_type').sort({
            createdAt: 'desc'
        }).exec(function(err, thesis, count) {
            res.send(thesis);
        });
    });




    // ALL SECTION =========================
    app.get('/all', isLoggedIn, function(req, res) {
        document.find().sort({
            createdAt: 'desc'
        }).exec(function(err, theses, count) {
            res.render('all.ejs', {
                user: req.user,
                theses: theses
            });
        });
    });

    // Mythesis =========================
    app.get('/my_thesis', isLoggedIn, function(req, res) {
        document.find({
            'uploader': req.user._id
        }).populate('thesis_type').sort({
            createdAt: 'desc'
        }).exec(function(err, theses, count) {
            res.render('my_thesis.ejs', {
                user: req.user,
                theses: theses
            });
        });
    });

    // ALL DOC VIEW =========================
    app.get('/doc\_view\/:id', function(req, res) {
        //console.log(req.params.id);
        var id = req.params.id;
        document.findOne({
            _id: id
        }).populate('thesis_type').exec(function(err, thesis, count) {
            fs.readFile(thesis.path_bibtex, 'utf8', function(err, data) {
                if (err) {
                    res.render('doc_view.ejs', {
                    user: req.user,
                    thesis: thesis,
                    bibtexdata : "Not Available",
                });
                }
                else {
                res.render('doc_view.ejs', {
                    user: req.user,
                    thesis: thesis,
                    bibtexdata: data

                });
                }

            });


        });
    });

    // SUBMIT VIEW =========================
    app.get('/submit', isLoggedIn, function(req, res) {

        console.log(req.user);
        document.find({
            'uploader': req.user._id
        }).find(function(err, theses, count) {

            res.render('submit.ejs', {
                user: req.user,
                title: "Upload Form",
                theses: theses
            });
        });
    });

    // LOGOUT VIEW==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    // LOGIN VIEW===============================
    app.get('/login', function(req, res) {
        if (req.user) {
            res.redirect('/submit');
        }
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/search', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // SIGNUP =================================
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', {
            message: req.flash('signupMessage')
        });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/search', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}
