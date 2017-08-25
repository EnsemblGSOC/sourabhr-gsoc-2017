describe('BigWig Parser', function() {
	var bb, bb2;
	var data1, data2;
	var chrom, low =0, high=500000;
	var bbURI = 'http://ftp.ebi.ac.uk/pub/databases/blueprint/data/homo_sapiens/GRCh38/venous_blood/S00BKK/mature_eosinophil/ChIP-Seq/NCMLS/S00BKKH1.ERX406921.H3K27me3.bwa.GRCh38.20150528.bw';

	var originalTimeout;

    beforeEach(function() {
	    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
	    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    });

    afterEach(function() {
	  jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

	it('can be created by connecting to a URL', function(done){
		new BigWig2(bbURI, "test track", true, function(_bb, _err){
			bb = _bb;
			chrom = bb.chroms[0];
			expect(bb).not.toBeNull();
			done();
		});
	});

	it('parses file header correctly', function(done){
		makeBwg(bbURI, "test track", true, function(_b,_e){
			bb2 = _b;
			expect(bb.type).toEqual(bb2.type);
			expect(bb.version).toEqual(bb2.version);
			expect(bb.chromTreeOffset).toEqual(bb2.chromTreeOffset);
			expect(bb.unzoomedIndexOffset).toEqual(bb2.unzoomedIndexOffset);
			expect(bb.unzoomedDataOffset).toEqual(bb2.unzoomedDataOffset);
			expect(bb.numZoomLevels).toEqual(bb2.numZoomLevels);
			done();
		});
	});

	it('can query file for a range and chromosome',function(done){
		bb.getValues(chrom , low, high, function(d, err){
			data1 = d;
			expect(d).not.toBeNull();
			done();
		})
	});

	it('can query values correctly', function(done){
		bb2.readWigData(chrom, low, high, function(d, err){
			data2 = d;
			console.log("comparing both arrays ");
			var correct = true;
			
			expect(data1.length).toEqual(data2.length);
			for(var i = 0; i< data1.length; i++){
				if( (data1[i][0] != data2[i].min) || (data1[i][1] != data2[i].max) || (data1[i][2] != data2[i].score)){
					correct = false;
					break;
				}
			}
			expect(correct).toBeTruthy();
			done();
		})
	});

});
