var mongoose = require('mongoose'),
  ProjectDevice = mongoose.model('ProjectDevice'),
  Request = mongoose.model('Request'),
  uniqueValidator = require('mongoose-unique-validator');

var TeamSchema = new mongoose.Schema({
  idTeamMarvelApp: {
    type: String,
    unique: true
  },
  idTopcoderChallenge: {
    type: String,
    unique: true
  },
  teamName: String,
  baseName: String,
  baseCount: {
    type: Number,
    default: 1
  },
  projectTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectDevice'
  }]
});

TeamSchema.plugin(uniqueValidator, { message: 'is already taken.' });

TeamSchema.methods.toJSONFor = function() {
  return {
    id: this._id.toString(),
    idTeamMarvelApp: this.idTeamMarvelApp,
    idTopcoderChallenge: this.idTopcoderChallenge,
    teamName: this.teamName,
    baseName: this.baseName,
    baseCount: this.baseCount - 1,
    projectTypes: this.projectTypes
  };
};

mongoose.model('Team', TeamSchema);
