'use strict';

var express = require('express');

var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var visits = require('monk')(procecss.env.MONGODB_URI || 'localhost/coachvisits').get('visits');
app.post('/', function(req, res) {
  visits.insert(req.body)
  .then(function(data) {
    res.send('success!');
  })
  .catch(function(err) {
    res.send('failure!');
    console.log(err);
  });
});

app.get('/', function(req, res) {
  visits.find()
  .then(function(data) {
    res.send(data);
  })
  .catch(function(err) {
    res.send('failure!');
    console.log(err);
  })
});

app.listen(3000, function() {
    console.log('Application is running on port 3000');
});
