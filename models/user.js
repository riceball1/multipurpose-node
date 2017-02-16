/** USER MODEL **/

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  itemIdArray: [mongoose.Schema.Types.ObjectId],
  tipIdArray: [mongoose.Schema.Types.ObjectId],
  admin: {
    type: Boolean,
  default: [false]
  }
});


/* MODULE EXPORTS */

const User = module.exports = mongoose.model('User', userSchema);

/* export functions */
module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	let query = {username: username.toLowerCase()};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword.toLowerCase(), hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}
