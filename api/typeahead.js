var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');


// The Type Ahead API.
module.exports = function(req, res) {
  var term = req.query.text.trim();
  if (!term) {
    res.json([{
      title: '<i>(enter a stock symbol)</i>',
      text: ''
    }]);
    return;
  }

  var response;

  try {
    response = sync.await(request({
      url: 'http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json',
      qs: {
        input: term,
      },
      gzip: true,
      json: false,
      timeout: 10 * 1000
    }, sync.defer()));
  } catch (e) {
    res.status(500).send('Error');
    return;
  }

  if(!IsJsonString(response.body))
    return;

  var recs = JSON.parse(response.body);
  var results = [];
  for (var i=0; i<recs.length;i++){
    var symbol = recs[i].Symbol;
    var name = recs[i].Name;

    results.push({
      title: "" + name + ": " + symbol,
      text: symbol
    })
  }

  if (results.length === 0) {
    res.json([{
      title: '<i>(no results)</i>',
      text: ''
    }]);
  } else {
    res.json(results);
  }

};

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
