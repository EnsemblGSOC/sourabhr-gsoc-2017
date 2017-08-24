## Google Summer of Code 2017 
## Final Work Product Submission Report

### Introduction

[Genoverse](https://github.com/wtsi-web/Genoverse) is a genome browser written in javascript and my job was to enable support for large binary file formats like [BigWig](https://genome.ucsc.edu/goldenpath/help/bigWig.html), [BigBed](https://genome.ucsc.edu/goldenpath/help/bigBed.html), [compressed VCF](https://genome.ucsc.edu/goldenpath/help/vcf.html). In the process I also enabled support for [Wiggle](https://genome.ucsc.edu/goldenpath/help/wiggle.html) and [BED](https://genome.ucsc.edu/FAQ/FAQformat.html#format1) as these were required for the binary versions (Bigwig and Bigbed) to work and made the code structure simpler. The simple VCF support was already in place so I just had to work on parsing the binary format. 

### File Format Explanations and Parsing :

|Explanation | Parsing|
|---|---|
|[BIGWIG.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/BIGWIG/BIGWIG.md) | [BIGWIG\_parsing.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/BIGWIG/BIGWIG_parsing.md)|
|[BED.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/BED/BED.md) |--|
|[VCF.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/VCF/VCF.md) |--|
|[WIG.md](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/blob/master/formats/WIG/WIG.md) |--|

### What work was done ?

I first researched the existing C++ libraries that could do the job ([HTSLib](https://github.com/samtools/htslib), [libBigWig](https://github.com/dpryan79/libBigWig)) and tried porting them to javascript using [emscripten](https://github.com/kripken/emscripten) but I quickly realized that this was the more tedious and unreliable approach as emscripten doesn't convert C++ to javascript perfectly, the resulting code is almost human unreadable hence not maintainable. I dropped this idea and decided to write my own parsers taking inspiration from already existing open source implementations : [dalliance](https://github.com/dasmoth/dalliance), [libBigWig](https://github.com/dpryan79/libBigWig). I understood the logic and implemented my own parsers there after. I wrote javascript parsers and the rendering code for the file formats mentioned above. In some cases there was some code lying around in Genoverse which I partially reused, in most cases I had to write code from scratch. 

I enabled support for [BigWig]( https://genome.ucsc.edu/goldenpath/help/bigWig.html), [BigBed](https://genome.ucsc.edu/goldenpath/help/bigBed.html), [compressed / tabix VCF](https://genome.ucsc.edu/goldenpath/help/vcf.html) , [Wiggle](https://genome.ucsc.edu/goldenpath/help/wiggle.html) and [BED]( https://genome.ucsc.edu/FAQ/FAQformat.html#format1) formats in Genoverse. 

### Repository worked on : [Genoverse](https://github.com/wtsi-web/Genoverse)
### How to use ?

#### Method 1
1) Load this onto your browser : http://wtsi-web.github.io/Genoverse/
2) Drag any of your genome data files onto the browser area : extensions .bw, .bb, .vcf.gz, .wig, .bed all are now supported through code written during this project.

#### Method 2 ( local deployment )
1) Clone this repository through git ``` git clone https://github.com/EnsemblGSOC/sourabhr-gsoc-2017.git ```
2) Copy the contents of this folder to your server and load SERVER\_IP://Genoverse/expanded.html onto your browser
3) Edit expanded.html to add a source track as demonstrated in [**code\_usage**](https://github.com/EnsemblGSOC/sourabhr-gsoc-2017/edit/master/README.md#L61) 
4) Save expanded.html and reload to see a new track of the type you have chosen.
Keep changing the URLs in the added track source to experiment with 

### What code got merged ?

The below pull requests were either directly merged into the main repo or manually merged by the [author](https://github.com/simonbrent) into the main repo. 

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

I wrote a webapp to compare the speed and verify the correctness of my Bigwig and Bigbed parsers against [dalliance](https://github.com/dasmoth/dalliance)'s parsers. First both scripts were run in the same page which led to the problem of one script using the other one's cache hence leading to false timing analysis. I tried disabling the cache and putting them in seperate windows but the timings don't follow a set pattern as network requests could take random times to finish. Due to this reason this code wasn't merged into the main repo but rather kept away as an experiment. 

### Testing setup :

I initially setup a jasmine + karma test suite and automated the testing through travis-CI so that every time I commit code to the repository it gets checked. The main repo had a mocha testing environment already in place which was pushed later so I have to rewrite my tests in mocha. 

### Code Usage :

To add a track in the newly supported formats :

```
Genoverse.Track.File.BIGWIG.extend({
  name : 'bigwig-demo',
  url  : 'path/to/bigwig/file'
});
```

The above example holds true for all other file formats as well by just replacing BIGWIG with the appropriate symbol , so for BED it would be : 

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

### Current State of the Project 

The goals for this project have been accomplished, support for required file formats has been achieved. 

### Challenges and Learning :

The main challenge I faced was that I had absolutely no knowledge of bioinformatics when I started my GSoC project, but I got enormous amounts of help from my mentor and other members of my organization. I slowly learnt what my project was actually about, what exactly is NGS (Next Generation Sequencing) and how are all these large binary file formats important to genome researchers. Once I understood the importance it gave a new found sense of satisfaction to work on the project as I understood the impact my code would have.

In fact my main aha moments came when I fully understood how these file formats work, they are so cleverly designed for faster remote access, it is sheer genius. My favourite parts of the journey were my code reviews, I learnt a lot through them. It improved my coding style. I learnt how to write tests and documentation which are so important to further maintain the code. I really enjoyed my journey so far and I plan to keep contributing to Genoverse furher as it helps me learn so many things I wouldn't have ever learnt otherwise. 
 
