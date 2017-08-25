## Google Summer of Code 2017
## Final Work Product Submission Report

### Introduction

[Genoverse](https://github.com/wtsi-web/Genoverse) is a genome browser written in javascript. My project was to add support to Genoverse for large binary file formats such as  [BigWig](https://genome.ucsc.edu/goldenpath/help/bigWig.html), [BigBed](https://genome.ucsc.edu/goldenpath/help/bigBed.html), [compressed VCF](https://genome.ucsc.edu/goldenpath/help/vcf.html). In the process I also enabled support for [Wiggle](https://genome.ucsc.edu/goldenpath/help/wiggle.html) and [BED](https://genome.ucsc.edu/FAQ/FAQformat.html#format1) as these were required for the binary versions (BigWig and BigBed respectively) to work. Genoverse supported uncompressed VCF and [BAM](https://samtools.github.io/hts-specs/SAMv1.pdf) prior to the commencement of this project.

### What work was done ?

I first researched the existing C++ libraries used to parse these file formats  ([HTSLib](https://github.com/samtools/htslib), [libBigWig](https://github.com/dpryan79/libBigWig)) and ported them into javascript using [emscripten](https://github.com/kripken/emscripten). However I quickly realized that this approach was unreliable since emscripten doesn't convert C++ to javascript perfectly, and the resulting code is also almost human unreadable and hence not maintainable. I therefore reverted the original plan of writing my own parsers taking inspiration from already existing open source implementations : [dalliance](https://github.com/dasmoth/dalliance), [libBigWig](https://github.com/dpryan79/libBigWig). This required both [understanding of the structure of the binary file formats](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/README.md#L90) and writing the javascript parsers themselves.

Finally I added support for rendering of these in Genoverse, either by reusing components of the existing Genoverse code base or by writing code from scratch:
tabix indexed VCF: new parsing code, existing rendering code
BigWig and Wiggle: new parsing code and extension of the preexisting Bar.lineGraph drawing code component
(Big)Bed: new parsing code and new rendering code. 


### Current State of the Project

The goals for this project have been accomplished in that support for [BigWig]( https://genome.ucsc.edu/goldenpath/help/bigWig.html), [BigBed](https://genome.ucsc.edu/goldenpath/help/bigBed.html), [compressed / tabix VCF](https://genome.ucsc.edu/goldenpath/help/vcf.html) , [Wiggle](https://genome.ucsc.edu/goldenpath/help/wiggle.html) and [BED]( https://genome.ucsc.edu/FAQ/FAQformat.html#format1) formats has been added to  Genoverse. 

### How to use ?

#### Method 1
This is suitable for small, uncompressed files but does also work with binary files.
1) Load this onto your browser : http://wtsi-web.github.io/Genoverse/
2) Drag any of your genome data files onto the browser area : extensions .bw, .bb, .vcf.gz, .wig, .bed all are now supported through code written during this project.

#### Method 2 ( local deployment )
This is suitable for attachment of large files over http 
1) Clone this repository through git ``` git clone https://github.com/EnsemblGSOC/sourabhr-gsoc-2017.git ```
2) Copy the contents of this folder to your server and load SERVER\_IP://Genoverse/expanded.html onto your browser
3) Edit expanded.html to add a source track. For example for BigWig file:

```
Genoverse.Track.File.BIGWIG.extend({
  name : 'bigwig-demo',
  url  : 'path/to/bigwig/file'
});
```

For other formats replace BIGWIG with the appropriate data type, for example for BED it would be : 

```
Genoverse.Track.File.BED.extend({
  name : 'bigbed-demo',
  url  : 'path/to/bed/file'
})
```

You can use all of the normal track parameters like 
```
height : 100,
```
to set track height etc options that work with normal Genoverse tracks. 

 4) Save expanded.html and reload to see a new track of the type you have chosen.
You can change the url field in the added track source to try a different remote file.

### Testing setup :

I initially setup a jasmine + karma test suite and automated the testing through travis-CI so that everytime I committed additional code to the repository, travis automatically tested it to comply with certain test cases. During the course of my project a mocha testing environment within the the main Genoverse repo was made public and I have therefore not committed my testing suite to the main repo.


### Repository contributed to :
[Genoverse](https://github.com/wtsi-web/Genoverse).

### What code got merged ?

The below pull requests were either automatically or manually merged into the main Genoverse repo by the [author](https://github.com/simonbrent).

#### List of pull requests

>| Link | Description |
>|---|---|
>| https://github.com/wtsi-web/Genoverse/pull/37 |  The binary VCF parser code was merged in this PR |
>| https://github.com/wtsi-web/Genoverse/pull/38 |  Added parsing and rendering for BED data |
>| https://github.com/wtsi-web/Genoverse/pull/39 |  Support added for Wiggle data |
>| https://github.com/wtsi-web/Genoverse/pull/40 |  Respect thickStart and thickEnd fields while displaying BED data |
>| https://github.com/wtsi-web/Genoverse/pull/42 |  Support added for Bigwig and Bigbed data |

#### [List of commits](https://github.com/wtsi-web/Genoverse/commits/gh-pages?author=sourabh2k15)

### What code didn't get merged ?

I wrote a [webapp](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/tree/master/webapp) to compare the speed and verify the correctness of my Bigwig and Bigbed parsers for remote files by comparing the output against that from [dalliance](https://github.com/dasmoth/dalliance)'s parsers. This demonstrated that the contents were parsed correctly and showed that there was no apparent difference in performance of my parsers compared to those of dalliance. The variability in timings between different requests was however very large meaning that I could not give accurate measurements of performance. The code has been committed to the Ensembl GSOC repository.

The emscripten study work described above has not been committed. 

### File Format Explanations and Parsing :

|Explanation | Parsing|
|---|---|
|[BIGWIG.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/BIGWIG/BIGWIG.md) | [BIGWIG\_parsing.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/BIGWIG/BIGWIG_parsing.md)|
|[BED.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/BED/BED.md) |[BED\_parsing.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/BED/BED_parsing.md)|
|[VCF.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/VCF/VCF.md) |[VCF\_parsing.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/VCF/VCF_parsing.md)|
|[WIG.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/WIG/WIG.md) |[WIG\_parsing.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/WIG/WIG_parsing.md)|

### Challenges and Learning :

The main challenge I faced was that I had absolutely no knowledge of bioinformatics when I started my GSoC project, but I got enormous amounts of help from my mentor and other members of my organization. I slowly learnt about the complexities of the project I had taken on, I learnt about NGS (Next Generation Sequencing) and how all these large binary file formats are important to genome researchers. Once I understood the importance it gave a new found sense of satisfaction to work on the project as I understood the impact my code would have.

In fact my main aha moments came when I fully understood how these file formats work, they are so cleverly designed for faster remote access, it is sheer genius. My favourite parts of the journey were my code reviews, I learnt a lot through them. It improved my coding style. I learnt how to write tests and documentation which are so important to further maintain the code. I really enjoyed my journey so far and I plan to keep contributing to Genoverse further as it helps me learn so many things I wouldn't have ever learnt otherwise.
