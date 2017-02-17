const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const should = chai.should();

const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, PORT } = require('../config/database');

console.log(TEST_DATABASE_URL);
const Tip = require('../models/tip');
const User = require('../models/user');
const Item = require('../models/item');

chai.use(chaiHttp);

function seedTipData() {


    console.info('seeding tip data');
    const seedData = [];

    for (let i = 1; i <= 5; i++) {
      seedData.push(generateTipData());
    }
    //console.log(seedData);
    return Tip.insertMany(seedData);


}

// generate an object for seed data
function generateTipData() {
  return {
    userId: mongoose.Types.ObjectId(faker.random.number()),
    upvote: 1,
    downvote: 1,
    content: faker.lorem.paragraph(),
    itemId: mongoose.Types.ObjectId(faker.random.number()),
    userName: faker.name.firstName()
  }
}

// delete the entire database
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Multipurpose API', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function() {
    return seedTipData();
  });
  afterEach(function() {
    //return tearDownDb();
  });
  after(function() {
    return closeServer();
  });

  it('should increment the upvote', function(done) {
    // Tip
    // .findOne()
    // .exec()
    // .then(function(tip) {
    //
    //   // let res;
    //   // return chai.request(app)
    //   // .get('/tips')
    //   // .then((_res) => {
    //   //   res = _res;
    //   //   console.log(res);
    //   //   done();
    //   // })
    //
    //   chai.request(app)
    //   .post(`/${tip.id}/upvote`)
    //   .send(tip.id)
    //   .then(function(res) {
    //     res.should.have.status(201);
    //     res.should.be.json;
    //     res.body.should.be.a('object');
    //     done()
    //   })
    //
    // }
    //})

  });

  it('should increment the downvote', function() {

    Tip
    .findOne()
    .exec()
    .then(function(tip) {
      var downvotes=tip.downvote;

      return chai.request(app)
      .post(`/${tip._id}/downvote`)

      .then(function(res) {

        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        resTip = res.body[0];

        return Tip.findById(resTip.id)
      })
      .then(function(tip) {
          console.log("this",tip);
        tip.content.should.equal();
      })
    })

  });

  it('should remove a tip ', function() {

    Tip
    .findOne()
    .exec()
    .then(function(tip) {
      return chai.request(app)
      .put(`/${tip.id}/${tip.userId}/${tip.itemId}/deletetip`)
      .send(tip)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
      })
    })

  });

  it('should remove a bookmarked item', function() {
    const user = new User({
      userId: faker.random.number,
      itemIdArray: [faker.random.number]
    })
    user.save((err, user) => {
      return chai.request(app)
      .put(`/${user.itemIdArray[0]}/deletebookmark`)
      .send(user)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
      })
    });
  })
});
