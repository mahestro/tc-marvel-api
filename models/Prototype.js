var mongoose = require('mongoose'),
    ProjectDevice = mongoose.model('ProjectDevice');

var PrototypeSchema = new mongoose.Schema({
  title: String,
  idPrototypeMarvelApp: String,
  projectType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectDevice'
  }
}, { timestamps: true });

PrototypeSchema.methods.toJSONFor = function() {
  return {
    id: this._id,
    title: this.title,
    idPrototypeMarvelApp: this.idPrototypeMarvelApp,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    projectType: this.projectType
  };
};

mongoose.model('Prototype', PrototypeSchema);
