var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

WorkspaceSchema = new Schema({
    name: {type: String, "default": ''},
    fullName: {type: String, "default": ''},
    admin: { type: Schema.ObjectId, ref: 'users' },
    users: [{ type: Schema.ObjectId, ref: 'users' }]
});

mongoose.model('workspaces', WorkspaceSchema);