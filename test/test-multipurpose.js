const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL, PORT} = require('../config/database');

chai.use(chaiHttp);

describe('index', function() {
  // before the tests runs statr the server once
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  // after all tests have been completed close out the server
after(function() {
  return closeServer();
});


  it('should return homepage', function() {
    return chai.request(app)
      .get('/')
      .then(function(res) {
        res.should.have.status(200);
      });
  });

});
