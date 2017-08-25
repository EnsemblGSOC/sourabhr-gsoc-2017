## Wiggle file format 

Wiggle is a simple text file format showing the value of a particular characteristic at a point, so basically just a bar chart let loose to represent anything your imagination can think of.
There are 3 types of wiggle files : fixedStep, variablStep and BedGraph.

### FixedStep Wiggle

so as the name says the step is fixed . What is a step ? well simply put the distance between 2 adjacent bars is the step.

ex: fixedStep  chrom=chrN
    
    start=position  step=stepInterval
    
    [span=windowSize]
    
    dataValue1
    
    dataValue2

### VariableSTep Wiggle 

but what if all of my data is not at the same uniform distance from each other ? welcome to variable step where width of bars ( span is fixed ), but the step can be specified

ex: variableStep  chrom=chrN
    
    [span=windowSize]
    
    chromStartA  dataValueA
    
    chromStartB  dataValueB


### BedGraph Wiggle 

then comes the most flexible wiggle where the bars can be any width wide and can be spaced any distance apart from each other.

ex: chrom chromStart chromEnd dataValue

