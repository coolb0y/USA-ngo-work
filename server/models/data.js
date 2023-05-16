const mongoose = require('mongoose');

const dataSchema = mongoose.Schema({
        id: { type: String,default:""},
        title: { type: String },
        fileName:{ type: String},
        fileType:{ type: String},
        fileSize:{ type: Number },
        url:{ type: String },
        fileDetails:{ type: String },
        artist:{ type: String },
        album:{ type: String },
        track:{ type: String },
       
        duration:{ type: Number},
        bitrate:{ type: Number},
        length:{ type: Number },
        width:{ type: Number },
       
       
       
       
        imgtags:{ type: String },
       
        baseurl:{ type: String},

});
dataSchema.index({url: 1 }, { unique: true });

module.exports = mongoose.model('lunrtest2', dataSchema);