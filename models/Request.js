var mongoose = require('mongoose'),
    Prototype = mongoose.model('Prototype');

var RequestSchema = new mongoose.Schema({
  tcEmail: String,
  tcHandle: String,
  idTopcoderChallenge: String,
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prototype'
  }]
}, { timestamps: true });

RequestSchema.methods.toJSONFor = function() {
  return {
    id: this._id,
    tcEmail: this.tcEmail,
    tcHandle: this.tcHandle,
    idTopcoderChallenge: this.idTopcoderChallenge,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    projects: this.projects
  };
};

mongoose.model('Request', RequestSchema);
