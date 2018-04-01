var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

UserSchema = new Schema({
    name: {type: String, "default": 'user'},
    email: {type: String, "default": ''},
    password: {type: String, "default": ''}
});

mongoose.model('users', UserSchema);