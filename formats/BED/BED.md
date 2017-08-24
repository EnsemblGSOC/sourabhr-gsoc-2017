## BED file format

BED stands for browser extensible data and is a way of adding feature tracks to the genome data. Technically it is a tab-delimited text file that defines a feature track. There could be 
multiple feature tracks in one region one below another. There are also thickRegions in the features specified in the BED data. Only 3 fields are mandatory and the rest 9 out of 12 are optional
There can be additional custom defined fields in the compressed version of BED ( bigbed ) which is known as autoSQL. 

### 3 mandatory fields

These fields come at the start of the BED record and are :

| No. | Field | Description |
|---|---|---|
|1. |chrom| The name of the chromosome| 
|2. |chromStart| The starting position of the feature in the chromosome|
|3. |chromEnd | The ending position of the feature in the chromosome |

### 9 optional fields 

These fields cannot be empty in between meaning the starting i fields can be present (i <= 9).

| No. | Field | Description |
|---|---|---|
|4. | name | Defines the name of the BED line. | 
|5. | score | A score between 0 and 1000 |
|6. | strand | Defines the strand. Either "." (=no strand) or "+" or "-". |
|7. | thickStart | The starting position at which the feature is drawn thickly  |
|8. | thickEnd |The ending position at which the feature is drawn thickly|
|9. | itemRGB |  This RBG value will determine the display color of the data| 
|10.| blockCount| The number of blocks (exons) in the BED line |
|11.| blockSizes | A comma-separated list of the block sizes|
|12.| blockStarts| A comma-separated list of block starts|
