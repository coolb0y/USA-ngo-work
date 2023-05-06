const mongoose = require('mongoose');

const dataSchema = mongoose.Schema({
        id: { type: String,default:""},
        title: { type: String },
        fileType:{ type: String },
        url:{ type: String },
        fileDetails:{ type: String },
        artist:{ type: String},
        album:{ type: String },
        duration:{ type: Number},
        bitrate:{ type: Number },
        length:{ type: Number },
        width:{ type: Number },
        imgtags:{ type: String },
      
        imgtitle:{type:String}

});
dataSchema.index({url: 1 }, { unique: true });

module.exports = mongoose.model('scanlight', dataSchema);