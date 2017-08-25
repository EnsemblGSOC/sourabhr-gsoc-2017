## VCF file format explanation

Variant call format ( VCF ) is a file format used to store the differences in bases between genomes. This is of high importance to researchers. The 1000genomes project
is a good source to get your hands on VCF data and start experimenting with it. VCF files like any other file can also be compressed using bgzf and indexed using tabix , 
so we have 'vcf.gz' compressed file and a '.tbi' index file which makes remote access to large remote vcf data possible in real time. 
fun fact : any data can be compressed using bgzf , the size is bigger than what can be achieved with gzip but the speed of random access is greater !

After the header info lines come the data lines which have 8 compulsory fields , which are as follows :

| No. | Field | Description |
|---|---|---|
| 1. | CHROM| chromosome: an identifier from the reference genome|
| 2. | POS  | position: The reference position, with the 1st base having position 1|
| 3. | ID   | semi-colon separated list of unique identifiers where available|
| 4. | REF  | reference base(s): Each base must be one of A,C,G,T,N|
| 5. | ALT  | comma separated list of alternate non-reference alleles called on at least one of the samples|
| 6. | QUAL |  phred-scaled quality score for the assertion made in ALT.|
| 7. | FILTER| filter: PASS if this position has passed all filters|
| 8. | INFO |additional information: (Alphanumeric String) INFO fields are encoded as a semicolon-separated series |
