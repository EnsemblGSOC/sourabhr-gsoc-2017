## Code implementation of parser

parser at js/Track/Model/File/WIG.js

#### Genoverse.Track.Model.File.WIG.prototype.getData()

It fetches the data for a requested region and passes it on to parseData()

#### Genoverse.Track.Model.File.WIG.prototype.parseData()

the parsing logic differs by which type of wiggle is to be processed, the variableStep wiggle, fixedStep wiggle or the bedGraph
wiggle.
