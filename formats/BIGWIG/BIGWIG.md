# Bigwig / Bigbed file format explanation

Important Resources :
* [binary byte layout of the format](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2922891/bin/supp_btq351_bbiSuppFINAL.doc)
* [paper detailing the format](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2922891/)
* [range-tree original paper](http://www-db.deis.unibo.it/courses/SI-LS/papers/Gut84.pdf)

## Basic Working :

In order to browse a huge genome dataset these file formats had been developed as self contained databases. They internally use 
B+ trees and range trees to efficiently retreve data for the requested region. The magic of this format lies in the fact that 
no matter where the data you requested be it will take no more than 4-6 reads to retrieve it. When the file is on disk it doesn't 
matter much but when it is being served over a network this makes a huge difference and also enables us to view large datasets 
without downloading TerraBytes of data.

## Parsing process :

So we need to parse the header first which gives us the location of the B+ Tree and the R Tree. BigWig stores wiggle data so is of the
form  `[ baseStart, baseEnd, score ]` , this is our actual data record, many such records are clubbed together as a continuous data block
in the file and file offsets to these blocks are contained as leaves of the range tree. So every node of the range tree has a base range 
and a chromosome. We keep comparing our desired range for an overlap with the node and if found go deeper into the node eventually landing 
at the leaves which tell us at which locations in the file our data blocks are located. You guessed it right, its a DFS ! but with a small 
twist. So we know our desired ranges lie deeper in this node how do we traverse its children ? every node has dataOffsets for its kids. So 
the range tree is actually dispersed over the entire file but we can know the locations for the desired nodes. 

Wait a sec then what is the B+ tree for ? well to save space in the range tree they assign unique numerical id to every chromosome so the 
R tree node can be smaller , the association between chrom and id is maintained through the B+ tree. 

The range tree generally has a a large number of kids (I have seen 256 ) so it takes utmost 3-4 reads to arrive at the data blocks. 
It is necessary to minimize the amount of reads as in case of network files these would be expensive network requests. 

Coming to the actual code implementation of the high level explanation above -> [code](https://github.com/sourabh2k15/Genoverse/blob/docs/js/docs/lib/BWReader.js.md)
