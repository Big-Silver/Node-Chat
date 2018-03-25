var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('users', {
    email : {type : String, default: 'test@c.com'},
    password: {type : String, default: 'test123'}
});