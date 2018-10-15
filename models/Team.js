var mongoose = require('mongoose'),
    ProjectDevice = mongoose.model('ProjectDevice');

var TeamSchema = new mongoose.Schema({
  idTeamMarvelApp: String,
  idTopcoderChallenge: String,
  teamName: String,
  baseName: String,
  projectTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectDevice'
  }]
});

TeamSchema.methods.toJSONFor = function() {
  return {
    id: this._id,
    idTeamMarvelApp: this.idTeamMarvelApp,
    idTopcoderChallenge: this.idTopcoderChallenge,
    teamName: this.teamName,
    baseName: this.baseName,
    projectTypes: this.projectTypes,
  };
};

mongoose.model('Team', TeamSchema);
