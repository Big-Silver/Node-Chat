var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

MessageSchema = new Schema({
    userId: {type: String, "default": ''},
    user: {type: String, "default": ''},
    message: {type: String, "default": ''},
    date: {type: Date, "default": ''}
});

mongoose.model('generalMessages', MessageSchema);