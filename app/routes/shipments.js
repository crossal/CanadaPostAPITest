
const express = require('express');
const router = express.Router();
var config = require('../../config');
var https = require('https');
var xmlParseString = require('xml2js').parseString;

router.get('/', (req, res, next) => {

  return res.status(200).json('Welcome home, Machoolian')

});

router.get('/generateSampleNonContractShipmentLabel', function(req, res) {

  var authString = config.canadaPostDevAPIKey;
  var buffer = new Buffer(authString);
  var authBase64 = buffer.toString('base64');

  var senderInfo =
  '<sender>'+
    '<company>Canada Post Corporation</company>'+
    '<contact-phone>555-555-5555</contact-phone>'+
    '<address-details>'+
      '<address-line-1>2701 Riverside Drive</address-line-1>'+
      '<city>Ottawa</city>'+
      '<prov-state>ON</prov-state>'+
      '<postal-zip-code>K1A0B1</postal-zip-code>'+
    '</address-details>'+
  '</sender>';

  var recipientInfo =
  '<destination>'+
    '<name>John Doe</name>'+
    '<company>Consumer</company>'+
    '<address-details>'+
      '<address-line-1>2701 Receiver Drive</address-line-1>'+
      '<city>Ottawa</city>'+
      '<prov-state>ON</prov-state>'+
      '<country-code>CA</country-code>'+
      '<postal-zip-code>K1A0B1</postal-zip-code>'+
    '</address-details>'+
  '</destination>';

  var parcelInfo =
  '<parcel-characteristics>'+
    '<weight>15</weight>'+
    '<dimensions>'+
      '<length>1</length>'+
      '<width>1</width>'+
      '<height>1</height>'+
    '</dimensions>'+
  '</parcel-characteristics>';

  var postData =
  '<?xml version="1.0" encoding="utf-8"?>'+
  '<non-contract-shipment xmlns="http://www.canadapost.ca/ws/ncshipment-v4">'+
    '<requested-shipping-point>J8R1A2</requested-shipping-point>'+
    '<delivery-spec>'+
      '<service-code>DOM.EP</service-code>'+
      senderInfo+
      recipientInfo+
      '<options>'+
        '<option>'+
          '<option-code>DC</option-code>'+
        '</option>'+
      '</options>'+
      parcelInfo+
      '<preferences>'+
        '<show-packing-instructions>true</show-packing-instructions>'+
      '</preferences>'+
    '</delivery-spec>'+
  '</non-contract-shipment>';

  var post_options = {
      host: 'ct.soa-gw.canadapost.ca',
      path: '/rs/0008547674/ncshipment',
      method: 'POST',
      headers: {
          'Accept' : 'application/vnd.cpc.ncshipment-v4+xml',
          'Content-Type': 'application/vnd.cpc.ncshipment-v4+xml',
          'Authorization' : 'Basic ' + authBase64,
          'Accept-language' : 'en-CA'
      }
  };

  var post_req = https.request(post_options, function(response) {
    var body = '';
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      xmlParseString(body, function (err, result) {
        var links = result['non-contract-shipment-info']['links'][0]['link'];
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          if (link.$.rel == 'label') {
            return res.redirect(link.$.href);
          }
        }
      });
      return res.status(500).json({error: 'No label provided.'});
    });
    response.on('error', function(e) {
      return res.status(500).send(xml(e));
    });
  }).on('error', function(e) {
    return res.status(500).send(xml(e));
  });

  post_req.write(postData);
  post_req.end();
});

module.exports = router;
