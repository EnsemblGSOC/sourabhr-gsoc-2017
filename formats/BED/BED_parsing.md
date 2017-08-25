## High level explanation of the BED parsing process

We have a chromosome number and a region denoted by [start, end] for which the BED data is to be fetched. In the 1st 3 fields of 
BED we get the chrom start and end of that feature. If we have nonzero thickStart and thickEnd and thickEnd > thickStart it means 
that some portion of this feature would be drawn thick starting at the overlap of feature and thickStart and ending at overlap of feature
and thickEnd. 

We parse the first 3 essential fields and then go on to check and process the optional fields. 

In order to determine if 2 ranges [x1, y1] and [x2, y2] overlap it is sufficient to check if ( x1 <= y2 && x2 <= y1 )

## Code implementation

parser at js/Track/Model/File/BED.js 

#### Genoverse.Track.Model.File.BED.prototype.parseData 

|Argument| Type | Description |
|---|---|---|
|text| string | text BED data |
|chr | string | chromosome |

It splits the data by new line (\n) splitting into individual BED records, which are then split by tabs (\t) to get the fields. 

The fields are then processed to get subfeatures and are painted onto the canvas.
The thickFeature and thinFeature regions are handled as per the case is as to the position of [thickStart, thickEnd] relative to 
[start, end]
