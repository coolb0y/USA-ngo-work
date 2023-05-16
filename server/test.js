client.index('test50').updateSettings({
    
    distinctAttribute: 'id',
    searchableAttributes: [
        'title',
        'fileDetails',
        'artist',
        'album',
    ],
    "filterableAttributes": ['fileType','fileSize','duration','bitrate','width','fps','audioChannels','audioBitrate','audioSamplerate','codec','audioCodec','resolution','imgtags','baseurl'],
    typoTolerance: {
        'minWordSizeForTypos': {
            'oneTypo': 4,
            'twoTypos': 8
        }
    },
    pagination: {
        maxTotalHits: 5000
    },
    faceting: {
        maxValuesPerFacet: 200
    }
})