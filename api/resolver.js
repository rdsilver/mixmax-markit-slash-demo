var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');


// The API that returns the in-email representation.
module.exports = function(req, res) {
  var term = req.query.text.trim();
  handleSearchString(term, req, res);
};

function handleSearchString(term, req, res) {
  var response;
  try {
    response = sync.await(request({
      url: 'http://dev.markitondemand.com/MODApis/Api/v2/Quote/json',
      qs: {
        symbol: term,
      },
      gzip: true,
      json: true,
      timeout: 15 * 1000
    }, sync.defer()));
  } catch (e) {
    res.status(500).send('Error');
    return;
  }
  
  // If there is a message this means a stock was not found
  if (response.body.Message) {
      res.json({ body: "Stock not found!" });
    return;
  }

  var data = response.body;
  var name = data.Name;
  name = name.length > 20 ? name.substr(0, 17) + "..." : name;
  var symbol = data.Symbol;
  var price = data.LastPrice;
  var change = parseFloat(data.Change).toFixed(3) + '%';
  var color = "green";

  if (change[0] == "-")
    color = "red";

  res.json({
    body: "<div style='width:400px;height:100px;border:1px rgb(89,89,89) solid;padding-left:5px;font-family:Arial,sans-sarif;'>" + 
          "<span style='display:block;font-size:35px;font-weight:bold;'>" + name + " </span>" + 
          "<span style='display:block;color:#878787;padding-left:5px'>" + symbol + " </span>" + 
          "<span style='font-size:30px'>" + price + " </span>" + 
          "<span style='color:"+ color +";font-size:25px'>" + change + " </span>" + 
          "</div>"
  });
}