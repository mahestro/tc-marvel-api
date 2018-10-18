var mongoose = require('mongoose'),
    ProjectDevice = mongoose.model('ProjectDevice'),
    uniqueValidator = require('mongoose-unique-validator');

var PrototypeSchema = new mongoose.Schema({
  title: String,
  idPrototypeMarvelApp: {
    type: String,
    unique: true
  },
  projectType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectDevice'
  }
}, { timestamps: true });

PrototypeSchema.plugin(uniqueValidator, { message: 'is already taken.' });

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
