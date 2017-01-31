const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  // username: {
  //   type: String,
  //   index: true
  // },
  password: {
    type: String
  },
  email: {
    type: String
  }
  // name: {
  //   type: String
  // }
});

// /* METHODS */
//
// userSchema.methods.createUser = (newUser) => {
//       bcrypt.hash(newUser.password, (err, hash) => {
//         // Store hash in your password DB
//         newUser.password = hash;
//     });
//     mongoose.connection.collection('users').insert(newUser);
//     console.log(newUser);
// };
//
// userSchema.methods.getUserByUsername = (username, callback) => {
//     const query = {username: username};
//     User.findOne(query, callback);
// }
//
// userSchema.methods.getUserById = (id, callback) => {
//     User.findById(id, callback);
// }
//
// userSchema.methods.comparePassword = (candidatePassword, hash, callback) => {
//   bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
//     if(err) throw err;
//     callback(null, isMatch);
//   });
// };

// From Easy Node auth, modified for bycryptjs
// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hash(password, 10);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compare(password, this.password);
};

/* MODULE EXPORTS */

module.exports = mongoose.model('User', userSchema);

module.exports.createUser = (newUser, callback) => {
    bcrypt.hash(newUser.password, (err, hash) => {
        // Store hash in your password DB
        newUser.password = hash;
        newUser.save(callback);
    });
};
