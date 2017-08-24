## High level explanation of the Bigwig / Bigbed parsing process: 

## Initialization

1) Read the header
2) Fetch the B+ tree
3) Fetch R tree header and cache it

## Query

1) Depth first search the R tree for desired range
2) Gather all block offsets , fetch the blocks
3) Process the blocks to get actual records as per the type of block ( wiggle or bigbed )

## Code explanation

## Initialization 

#### BWReader.init()
> fires a new parser and calls checkSignature()

#### BWReader.getData(start, length , cb)
> fetches data from file or network accordingly

>| Argument  | Type | Description |
>| --- | --- | --- |
>| start  | number | start fileoffset |
>| length  | number  | data size |
>|cb | function | callaback |

#### BWReader.checkSignature()
>reads 64 byte file header, checks signature / magic number to be valid, fetches info like R Tree offset, B+ Tree offset, zoom headers, etc
then calls readAutoSQL() which then calls readChromTree()

#### BWReader.readAutoSQL()
> autoSQL is custom defined fields in bigbed files, for bigwig files teh autoSQL offset in file header is 0 as it is irrelevant for bigwig

#### BWReader.readChromTree()
> fetches B+ tree info and chrom ids associated with chromosomes

#### BWReader.readRTreeIndex()
> fetches R Tree header based on the offset present in the file header and caches it as it is used for every query. It is just before the 
root node and gives us useful info like max number of children per node.

function flow :
` init() -> checkSignature() -> readAutoSQL() -> readChromTree() -> readRTreeIndex() `

## Query

#### BWReader.getValues(chrom, start, end, cb)
> fired everytime user queries for a region

>| Argument  | Type | Description |
>| --- | --- | --- |
>| chrom | string | chromosome |
>| start  | number  | regionStart |
>| end  | number  | regionEnd |
>| cb | function | callaback |

#### BWReader.traverseRTree()
> traverses the R Tree starting from the root node which was cached during initialization, go deeper if overlap found between node region and query region. The leaves contain file offsets to actual data 

#### BWReader.fetchRTreeKids(offset, level)
> every R Tree node has offsets to its kids, fetch these kids into memory then traverse through them till we reach leaves

#### BWReader.traverseRTreeKids(treedata, relative_offset, level)
>| Argument  | Type | Description |
>| --- | --- | --- |
>| treedata | ArrayBuffer | tree node data |
>| relative_offset | number | offset inside treeData |
>| level | number | tree level |

#### BWReader.findOverlaps(node)
> takes in a node and outputs if which of its kids has overlapping regions with the region in query

#### BWReader.fetchBlocks()
> fetches the actual blockdata after getting the offsets of the blocks through the R Tree leaves

#### BWReader.getBlocks()
> processes the blocks as per its type to get the actual records


function flow :
` getValues() -> traverseRTree() -> fetchRTreeKids() -> traverseRTreeKids() <-> findOverlaps() -> fetchBlocks() -> getBlocks() -> parser()`

