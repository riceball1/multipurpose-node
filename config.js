exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL
                       ||
                      'mongodb://dummy:dummy123@ds131109.mlab.com:31109/riceball3';
// exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
//                       'mongodb://localhost/blog-app-mongoose-challenge-solution';
exports.PORT = process.env.PORT || 8080;
