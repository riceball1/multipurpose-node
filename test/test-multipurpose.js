const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const index = require('/routes/index');


describe('index', function() {
  it('should return homepage', function() {
    return chai.request(app)
      .get('/')
      .then(function(res) {
        res.should.have.status(200);
      });
  });

});
