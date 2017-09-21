'use strict';
module.exports = {
  probe: probe
};

function probe(req, res) {
  // this sends back a JSON response which is a single string
  res.json('OK');
}
