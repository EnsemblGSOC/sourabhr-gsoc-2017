## Google Summer of Code 2017 
## Final Work Product Submission Report

### Introduction

[Genoverse](https://github.com/wtsi-web/Genoverse) is a genome browser written in javascript and my job was to enable support for large binary file formats like [BigWig](https://genome.ucsc.edu/goldenpath/help/bigWig.html), [BigBed](https://genome.ucsc.edu/goldenpath/help/bigBed.html), [compressed VCF](https://genome.ucsc.edu/goldenpath/help/vcf.html). In the process I also enabled support for [Wiggle](https://genome.ucsc.edu/goldenpath/help/wiggle.html) and [BED](https://genome.ucsc.edu/FAQ/FAQformat.html#format1) as these were required for the binary versions (Bigwig and Bigbed) to work and made the code structure simpler. 

### What work was done ?

I first researched the existing C++ libraries that could do the job (HTSLib, libBigwig) and tried porting them to javascript using [emscripten](https://github.com/kripken/emscripten) but I quickly realized that this was the more tedious and unreliable approach as emscripten doesn't convert C++ to javascript perfectly, the resulting code is almost human unreadable hence not maintainable. I dropped this idea and decided to write my own parsers taking inspiration from already existing open source implementations : [dalliance](https://github.com/dasmoth/dalliance), [libBigWig](https://github.com/dpryan79/libBigWig). I understood the logic and implemented my own parsers there after. I wrote javascript parsers and the rendering code for the file formats mentioned above. In some cases there was some code lying around in Genoverse which I partially reused, in most cases I had to write code from scratch. 

I enabled support for BigWig, BigBed, compressed VCF, Wiggle and BED formats in Genoverse. 

### Repository worked on : [Genoverse](https://github.com/wtsi-web/Genoverse)
### How to use ?

1) Load this onto your browser : http://wtsi-web.github.io/Genoverse/
2) Drag any of your genome data files onto the browser area : extensions .bw, .bb, .vcf.gz, .wig, .bed all are now supported through code written during this project.

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

### Current State of the Project 

The goals for this project have been accomplished, support for required file formats has been achieved. 

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
