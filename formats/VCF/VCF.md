## VCF file format explanation

Variant call format ( VCF ) is a file format used to store the differences in bases between genomes. This is of high importance to researchers. The 1000genomes project
is a good source to get your hands on VCF data and start experimenting with it. VCF files like any other file can also be compressed using bgzf and indexed using tabix , 
so we have 'vcf.gz' compressed file and a '.tbi' index file which makes remote access to large remote vcf data possible in real time. 
fun fact : any data can be compressed using bgzf , the size is bigger than what can be achieved with gzip but the speed of random access is greater !
