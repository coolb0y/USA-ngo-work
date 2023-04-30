const mongoose = require('mongoose');

const dataSchema = mongoose.Schema({
        id: { type: String,default:""},
        title: { type: String,default:"" },
        fileName:{ type: String,default:"" },
        fileType:{ type: String,default:"" },
        fileSize:{ type: Number,default:0 },
        url:{ type: String,default:"" },
        fileDetails:{ type: String,default:"" },
        artist:{ type: String,default:"" },
        album:{ type: String,default:"" },
        track:{ type: String,default:"" },
        codec:{ type: String,default:"" },
        duration:{ type: Number,default:0},
        bitrate:{ type: Number,default:0 },
        length:{ type: Number,default:0 },
        width:{ type: Number,default:0 },
        fps:{ type: Number,default:0 },
        resolution:{ type: String,default:"" },
        audioCodec:{ type: String,default:"" },
        audioChannels:{ type: Number,default:0 },
        audioBitrate:{ type: Number,default:0 },
        imgtags:{ type: String,default:"" },
        audioSamplerate:{ type: Number,default:0 },
        baseurl:{ type: String,default:"" },

});
dataSchema.index({url: 1 }, { unique: true });

module.exports = mongoose.model('Data', dataSchema);