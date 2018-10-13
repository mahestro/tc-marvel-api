var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator');

var DeviceSchema = new mongoose.Schema({
  marvelAppId: {
    type: String,
    unique: true
  },
  projectName: {
    type: String,
    unique: true
  }
});

DeviceSchema.plugin(uniqueValidator, { message: 'is already taken.' });

DeviceSchema.methods.toJSONFor = function() {
  return {
    id: this._id,
    marvelAppId: this.marvelAppId,
    projectName: this.projectName
  };
};

mongoose.model('ProjectDevice', DeviceSchema);
