var mongoose = require('mongoose');
var s3 = require('../config/secrets').s3;
var provider = require('mongoose-attachments-aws2js');
var attachments = require('mongoose-attachments');
attachments.registerStorageProvider('aws2js', provider);

var attachmentSchema = new mongoose.Schema({
  name: String,
  date_created: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true}

});

attachmentSchema.plugin(attachments, {
  directory: s3.directory,
  storage : {
    providerName: 'aws2js',
    options: {
      key: s3.key,
      secret: s3.secret,
      bucket: s3.bucket,
      acl: 'public-read'
    }
  },
  properties: {
    file: {
      styles: {
        original: {
          // keep the original file
        }
      }
    }
  }
});

module.exports = mongoose.model('Attachment', attachmentSchema);
