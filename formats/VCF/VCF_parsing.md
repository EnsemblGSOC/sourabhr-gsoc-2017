## High level explanation of the parsing process

There are a lot of info headers starting with #, we skip them and proceed to the row records which have 8 essential fields. 
We process them and use REF and ALT to show the differences in bases. In case the VCF file is compressed with bgzf and indexed
using tabix, we would have an additional .tbi file. We need to process the .tbi file using its binary byte layout in order to 
extract the bins. Once we get bins we can get the location to data for any given region, as we know the location we fetch that data 
from the .vcf.gz file and then decompress it ( again using knowledge of bgzf binary byte layout ) to get actual VCF data

## Code implementation 

parser at js/Track/Model/File/VCF.js

#### Genoverse.Track.Model.File.VCF.prototype.getData()

|Argument| Type | Description |
|---|---|---|
|chr | string| chromosome number|
|start| number| start of region|
|end| number| end of region| 

fetches data for that region and makes a VCF object which internally has a vcf object and a tbi object ( in case of compressed VCF).
If it is a simple VCF the text data is fetched and passed on to parseData()

#### Genoverse.Track.Model.File.VCF.prototype.makeVCF()

|Argument| Type | Description |
|---|---|---|
|vcfFile| BlobFetchable / URLFetchable| VCF data source|
|tbiFile| BlobFetchable / URLFetchable| TBI data source|

Processes a VCF file and a TBI file to initialize a VCFReader object and to get records in that region

#### Genoverse.Track.Model.File.VCF.prototype.parseData()

This function simply splits off the text and processes the fields and then inserts the feature so it can be drawn 
onto the canvas
