/**
	This is my bigwig parser class
	@constructor	
*/
var BigWig2 = function(f, name, remote, callback){
	// constants : bigwig/bigbed file header signatures (magic numbers) (32 bit) , can be swapped ( big-endian | BE )
	var BIG_WIG_MAGIC = 0x888FFC26;
	var BIG_WIG_MAGIC_BE = 0x26FC8F88;

	var BIG_BED_MAGIC = 0x8789F2EB;
	var BIG_BED_MAGIC_BE = 0xEBF28987;

	var CIRTREE_MAGIC = 0x78ca8c91;
	var IDXTREE_MAGIC = 0x2468ace0;

	//type of file converted to bigwig bedgraph |variable step wiggle | fixed step wiggle
	var BIG_WIG_TYPE_GRAPH = 1;
	var BIG_WIG_TYPE_VSTEP = 2;
	var BIG_WIG_TYPE_FSTEP = 3;

	//bigbed data color regex
	var BED_COLOR_REGEXP = new RegExp("^[0-9]+,[0-9]+,[0-9]+");

	var M1 = 256;
	var M2 = 256*256;
	var M3 = 256*256*256;
	var M4 = 256*256*256*256;

	var data;
	var pos = -1;
	var latest_start = 0;
	var latest_length = 0;
	var error;
	var ba, la, fa, buffer;
	var bbi = {};
	var vals = [];
	var outstanding = 0;

	/**
		This is the init method
	*/
	function init(){
		//initialize object
		if(remote) data = new URLFetchable(f);
		else data = new dataHolder(f);

		checkSignature();
	}

	function getData(start, length, cb){
		data.slice(start,length).fetch(function(d){
			buffer = d;
			ba = new Uint8Array(d);
			latest_start = start;
			latest_length = length;
			pos = 0;
			cb();
		});
	}

	function checkSignature(){
		//read first 4 bytes to check signature
		getData(0,512,function(){
			var magic = read32Bit();

			if(magic == BIG_WIG_MAGIC) bbi.type = "bigwig";
			else if(magic == BIG_BED_MAGIC) bbi.type= "bigbed";
			else if(magic == BIG_WIG_MAGIC_BE || magic == BIG_BED_MAGIC_BE){
				error = "big-endian files not supported yet!";
			}else{
				error = "unsupported file format";
			}

			error ? callback(null,error) : readHeader();
		});
	}

	function readHeader(){
			bbi.version = read16Bit();
			bbi.numZoomLevels = read16Bit();
			bbi.chromTreeOffset = read64Bit();
			bbi.unzoomedDataOffset = read64Bit();
			bbi.unzoomedIndexOffset = read64Bit();

			// useful for bigbed files only, 0 for bigwig
			bbi.fieldCount = read16Bit();
			bbi.definedFieldCount = read16Bit();
			bbi.asOffset = read64Bit();

			bbi.totalSummaryOffset = read64Bit();
			bbi.uncompressBufSize = read32Bit();
			bbi.extHeaderOffset = read64Bit();
			bbi.zoomHeaders = new Array(bbi.numZoomLevels);

			if(bbi.uncompressBufSize>0) bbi.compressed = true;
			if(bbi.totalSummaryOffset>0) bbi.summary = true;
			if(bbi.extHeaderOffset>0) bbi.extHeader = true;

			readZoomHeaders();
	}

	function readZoomHeaders(){
		for(var i=0; i < bbi.numZoomLevels; i++){
			var reduction = read32Bit();
			read32Bit(); // reserved
			var dataOffset    = read64Bit();
			var indexOffset    = read64Bit();
			bbi.zoomHeaders[i] = {reductionLevel :reduction, dataOffset:dataOffset, indexOffset:indexOffset};
		}
		readAutoSQL(readChromTree); // reading autoSQL passing next task as callback
	}

	//reading B+ tree which maps chrom names to ids used in R-tree
	function readChromTree(){
		var len = bbi.unzoomedDataOffset - bbi.chromTreeOffset;

		//reading chrom tree header
		console.log("fetching "+len);
		getData(bbi.chromTreeOffset,len,function(){
			var magic = read32Bit();

			if(magic == CIRTREE_MAGIC){
				bbi.bpTree = {};
				bbi.bpTree.itemsPerBlock = read32Bit();
				bbi.bpTree.keySize = read32Bit();
				bbi.bpTree.valueSize = read32Bit();
				bbi.bpTree.itemCount = read64Bit();

				seek(pos+8); // 8 bytes of padding after B+ tree header

				bbi.chroms = new Array(bbi.bpTree.itemCount);
				bbi.lengths = new Array(bbi.bpTree.itemCount);
			}
			else error = "chromosome id B+ tree not found!";

			error ? callback(null,error) : readChromTreeLeaf();
			readRTreeIndex();
		});
	}

	function readChromTreeLeaf(){
		var isLeaf = read8Bit();
		read8Bit(); //padding
		var children = read16Bit();

		while(children>0){
			children--;
			var chrom = "";
			for(var j=0;j<bbi.bpTree.keySize;j++){
				var c = read8Bit();
				if(c!=0) chrom += String.fromCharCode(c);
			}
			var idx = read32Bit();
			var len = read32Bit();
			bbi.chroms[idx] = chrom;
			bbi.lengths[idx] = len;
		}
	}

	function readRTreeIndex(){
		getData(bbi.unzoomedIndexOffset,48,function(){
			var magic = read32Bit();

			if(magic==IDXTREE_MAGIC){
				bbi.Rheader = readRTreeHeader();
				bbi.rootOffset = pos+latest_start;
				bbi.getValues = getValues;
				callback(bbi);
			}else{
				callback(null,"R-tree not found!");
			}
		});
	}

	function readRTreeHeader(){
		var Rheader = {};
		Rheader.blockSize = read32Bit();
		Rheader.nItems = read64Bit();
		Rheader.chrIdxStart = read32Bit();
		Rheader.baseStart = read32Bit();
		Rheader.chrIdxEnd = read32Bit();
		Rheader.baseEnd = read32Bit();
		Rheader.endFileOffset = read64Bit();
		Rheader.nItemsPerSlot = read32Bit();

		read32Bit(); // padding
		return Rheader;
	}

	function getRTreeNode(offset){
			seek(offset-latest_start);
			return getRNodeInfo();
	}

	function getRNodeInfo(){
		var node = {};
		node.isLeaf = read8Bit();
		read8Bit(); // reserved;
		node.children = read16Bit();
		node.chrIdxStart = new Array(node.children);
		node.baseStart = new Array(node.children);
		node.chrIdxEnd = new Array(node.children);
		node.baseEnd = new Array(node.children);
		node.dataOffset = new Array(node.children);
		node.x = {};

		if(node.isLeaf){
			node.x.size = new Array(node.children);
		} else {
			node.x.child = new Array(node.children);
			node.x.child.fill(-1);
		}

		getRNodeChildren(node);
		return node;
	}

	function getRNodeChildren(node){
		for(var i=0;i<node.children;i++){
			node.chrIdxStart[i] = read32Bit();
			node.baseStart[i] = read32Bit();
			node.chrIdxEnd[i] = read32Bit();
			node.baseEnd[i] = read32Bit();
			node.dataOffset[i] = read64Bit();

			if(node.isLeaf){
				node.x.size[i] = read64Bit();
			}
		}
	}

	function getValues(chrom, start, end, cb){
		bbi.query = { chromid : bbi.chroms.indexOf(chrom), start: start, end: end};
		bbi.cb2 = cb;
		bbi.blocks = [];
		vals = [];
		traverseRTree();
	}

	function traverseRTree(){
		outstanding = 0;
		fetchRTreeKids([bbi.rootOffset],1);
	}

	var fetchRTreeKids = function(offset, level){
		outstanding += offset.length;
		var min = offset[0];
		var maxNodeSize = (4 + bbi.Rheader.blockSize*32);
		var max = offset[offset.length - 1] + maxNodeSize;

		getData(min, max-min, function(){
			for(var i=0; i< offset.length; i++){
				traverseRTreeKids(offset[i], level);
				--outstanding;
				if(outstanding == 0) getBlocks();
			}
		});
	}

	var traverseRTreeKids = function(offset, level){
		var node = getRTreeNode(offset);
		var overlaps = findOverlaps(node);
		//console.log(overlaps.length);
		if(node.isLeaf){
			console.log("leaf");
			for(var j=0; j<overlaps.length; j++){
				var key = overlaps[j];
				bbi.blocks.push({offset : node.dataOffset[key], size : node.x.size[key]});
			}
			//console.log(bbi.blocks);
		}else{
			console.log("index "+level);
			var recurOffsets = [];
			for(var j=0; j<overlaps.length; j++){
				var key = overlaps[j];
				recurOffsets.push(node.dataOffset[key]);
			}
			fetchRTreeKids(recurOffsets, level+1);
		}
	}

	var findOverlaps = function(node){
		var children = node.children;
		var overlaps = [];
		for(var j=0; j<children; j++){
			var startChrom = node.chrIdxStart[j];
			var startBase = node.baseStart[j];
			var endChrom = node.chrIdxEnd[j];
			var endBase = node.baseEnd[j];
			var cnt = node.children;

			if ((startChrom < bbi.query.chromid || (startChrom == bbi.query.chromid && startBase <= bbi.query.end)) &&
				(endChrom   > bbi.query.chromid || (endChrom == bbi.query.chromid && endBase >= bbi.query.start)))
			{
				overlaps.push(j);
				//bbi.blocks.push({offset : node.dataOffset[j], size : node.x.size[j]});
			}
		}
		return overlaps;
	}

	// this is the main speed killer. try to optimize it as much as possible
	/*
		note : these points are from my own experiments using this script on a 1gb BigWig file

		1) using a glbal scope for variables being accessed very frequently improved the speed by a large amount ( 5 times )
		2) pass minimum variables into functions being called recursively, as they add up to the memory stack and slow the
		execution

	*/
	function getBlocks(){
		if(bbi.blocks.length == 0){
			console.log("finished!");
			bbi.cb2(vals);
		}else{
			if(!bbi.blocks[0].data) fetchblocks();
			else{
				for(var i=0; i<bbi.blocks.length; i++){
					processBlocks(bbi.blocks[i].data);
				}
				console.log("finished!");
				bbi.cb2(vals);
			}
		}
	}

	function fetchblocks(){
		console.log(bbi.blocks);
		console.log("fetched blocks, now fetching values .....");
		var totalSize = 0;
		var base = bbi.blocks[0].offset;

		for(var i=0;i<bbi.blocks.length;i++) totalSize += bbi.blocks[i].size;
		getData(base,totalSize,function(){
			var offset = 0;
			var bi = 0;
			while(offset < totalSize){
				var fb = bbi.blocks[bi];
				var data;

				if(bbi.uncompressBufSize>0) data = jszlib_inflate_buffer(buffer, offset + 2, fb.size - 2);
				else data = buffer.slice(offset,offset+fb.size);

				bbi.blocks[bi].data = data;
				offset += fb.size;
				bi++;
			}
			getBlocks();
		});
	}

	function processBlocks(data){
		ba = new Uint8Array(data);
		pos = 0;

		if(bbi.type == "bigwig") WiggleParser(data);
		else if(bbi.type == "bigbed") BEDparser();
		else console.log("unsupported");
	}

	function WiggleParser(data){
		var sa = new Int16Array(data);
		var la = new Int32Array(data);
		var fa = new Float32Array(data);


		var chromId = la[0];
		var blockStart = la[1];
		var blockEnd = la[2];
		var itemStep = la[3];
		var itemSpan = la[4];
		var blockType = ba[20];
		var itemCount = sa[11];

		// fixedStep wiggle
		if(blockType == BIG_WIG_TYPE_FSTEP){
			//console.log("fixed step");
			for(var j = 0; j < itemCount; j++){
				var score = fa[j+6];
				var start = blockstart + j*itemStep + 1;
				var end = start + itemSpan - 1;
				//console.log(start,end,score);
				if(start <= bbi.query.end && end >= bbi.query.start && chromId == bbi.query.chromid) vals.push([start,end,score]);
			}
		}// variable step wiggle
		else if(blockType == BIG_WIG_TYPE_VSTEP){
			// 	log("variable step");
			for(var j = 0; j < itemCount; j++){
				var start = la[(j*2) + 6] + 1;
				var end = start + itemSpan - 1;
				var score = fa[(j*2) + 7];
				if(start <= bbi.query.end && end >= bbi.query.start && chromId == bbi.query.chromid) vals.push([start,end,score]);
			}
		}// bedGraph
		else if(blockType == BIG_WIG_TYPE_GRAPH){
			//log("graph");
			for(var j = 0; j < itemCount; j++){
				var start = la[(j*3)+6] +1;
				var end = la[(j*3)+7];
				var score = fa[(j*3)+8];
				//console.log(start,end,score);
				if(start > end) start = end;
				if(start <= bbi.query.end && end >= bbi.query.start && chromId == bbi.query.chromid) vals.push([start,end,score]);
			}
		}
	}

	// this huge chunk of code handles BED data parsing and should totally go into its own module for the
	// well being of our eyes >_< ( TODO : BEDparser and readAutoSQL to be shifted to BED module)
	function BEDparser(){
		while(pos < ba.length){
			var bbRecord = {};
			var dfc = bbi.definedFieldCount;

			console.log("bigbed");
			bbRecord.chromid = read32Bit();
			bbRecord.start = read32Bit()+1;
			bbRecord.end = read32Bit();

			//console.log(bbRecord);
			//console.log("record found");
			var customFields = [];
			var extraFields = "";
			var bedColumns;

			while(true){
				var ch = ba[pos++];
				if(ch != 0) extraFields += String.fromCharCode(ch);
				else break;
			}


			if(bbRecord.start <= bbi.query.end && bbRecord.end >= bbi.query.start && bbRecord.chromid == bbi.query.chromid){
				bbRecord.chrom = bbi.query.chromid;
				if(extraFields) bedColumns = extraFields.split('\t');

				//parsing extrafields
				if(bedColumns.length > 0 && dfc > 3) bbRecord.name = bedColumns[0];
				if(bedColumns.length > 1 && dfc > 4) bbRecord.score = parseInt(bedColumns[1]);
				if(bedColumns.length > 2 && dfc > 5) bbRecord.strand = bedColumns[2];
				if(bedColumns.length > 3 && dfc > 6) bbRecord.thickStart = parseInt(bedColumns[3]);
				if(bedColumns.length > 4 && dfc > 7) bbRecord.thickEnd = parseInt(bedColumns[4]);
				if(bedColumns.length > 5 && dfc > 8) bbRecord.itemRGB = bedColumns[5];
				if(bedColumns.length > 6 && dfc > 9) bbRecord.blockCount = bedColumns[6];
				if(bedColumns.length > 7 && dfc > 10) bbRecord.blockSizes = bedColumns[7].split(',');
				if(bedColumns.length > 8 && dfc > 11) bbRecord.blockStarts = bedColumns[8].split(',');

				if(bedColumns.length > dfc-3 && bbi.schema){
					for(var col = dfc-3; col < bedColumns.length; col++){
						customFields[bbi.schema.fields[col+3].name] = bedColumns[col];
					}
					bbRecord.customFields = customFields;
				}

				if(dfc < 12){
					bbRecord.type = 'bigbed';
					vals.push(bbRecord);
				}else{
					var spans = [];
					for(var i=0; i< parseInt(bbRecord.blockCount); i++){
						var bbRecordChild = {};
						bbRecordChild.strand = bbRecord.strand;
						bbRecordChild.score = bbRecord.score;
						bbRecordChild.chrom = bbRecord.chrom;
						bbRecordChild.start = parseInt(bbRecord.blockStarts[i])+parseInt(bbRecord.start);
						bbRecordChild.end = bbRecordChild.start + parseInt(bbRecord.blockSizes[i]) -1;
						bbRecordChild.name = bbRecord.name;
						if(bbRecord.customFields) bbRecordChild.customFields = bbRecord.customFields;
						bbRecordChild.itemRGB = bbRecord.itemRGB;
						vals.push(bbRecordChild);
						spans.push([bbRecordChild.start, bbRecordChild.end]);
					}

					if(bbRecord.thickStart && bbRecord.thickEnd > bbRecord.thickStart){
						//find intersections with blocks with [thickStart, thickEnd]
						var intersecion = [];

						for(var l=0; l<spans.length; l++){
							if(bbRecord.thickEnd < spans[l][0]) break;
							else if(bbRecord.thickStart > spans[l][1]) continue;
							else{
								intersecion.push(spans[l]);
							}
						}

						for(var i=0;i<intersecion.length; i++){
							var bbRecordChild = {};
							bbRecordChild.strand = bbRecord.strand;
							bbRecordChild.score = bbRecord.score;
							bbRecordChild.chrom = bbRecord.chrom;
							bbRecordChild.type = 'translation';
							bbRecordChild.start = intersecion[i][0];
							bbRecordChild.end = intersecion[i][1];
							bbRecordChild.name = bbRecord.name;
							vals.push(bbRecordChild);
						}
					}
				}

			}
		}
	}

	// parsing autoSQL using regexes
	function readAutoSQL(cb){
		if(bbi.asOffset==0){
			console.log("no autoSQL present!");
			cb();
		}
		else{
			log("autoSQL present!, need to parse");
			getData(bbi.asOffset,2048,function(){
				var s = '';
				for(var i=0;i < ba.length;i++){
					if(ba[i]==0) break;
					s += String.fromCharCode(ba[i]);
				}

				var header_re = /(\w+)\s+(\w+)\s+("([^"]+)")?\s+\(\s*/;
				var field_re = /([\w\[\]]+)\s+(\w+)\s*;\s*("([^"]+)")?\s*/g;

				var headerMatch = header_re.exec(s);
				if(headerMatch){
					var as = {
						declType: headerMatch[1],
						name: headerMatch[2],
						comment: headerMatch[4],

						fields: []
					};
				}
				s = s.substring(headerMatch[0]);
				for (var m = field_re.exec(s); m != null; m = field_re.exec(s)) {
					as.fields.push({type: m[1],
								 name: m[2],
								 comment: m[4]});
				}
				bbi.schema = as;
				cb();
			})
		}
	}

	function show64Bit(){
		var o = pos;
		console.log(ba[o],ba[o+1],ba[o+2],ba[o+3],ba[o+4],ba[o+5],ba[o+6],ba[o+7]);
	}

	//reads 8 bytes from data
	function read64Bit(){
			var o = pos;
			var val = ba[o] + ba[o+1]*M1 + ba[o+2]*M2 + ba[o+3]*M3 + ba[o+4]*M4;
			pos = o+8;
		    return val;
	}

	function readFloat(o){
		var a = new Uint8Array([ba[o],ba[o+1],ba[o+2],ba[o+3]]);
		var b = a.buffer;
		var c = new Float32Array(b);
		return c[0];
	}
	//reads 4bytes from data
	function read32Bit(){
		var o = pos;
		pos = o+4;
		var a = ba[o], b = ba[o+1],c=ba[o+2],d= ba[o+3];
		var r = (a | ((b<<8)>>>0) | ((c<<16)>>>0) | ((d<<24)>>>0))>>>0;
		return r;
	}

	//reads 2 bytes from data
	function read16Bit(){
		var o = pos;
		pos = o+2;
		var r = (ba[o])|(ba[o+1]<<8);
		return r;
	}

	//reads 1 byte from data
	function read8Bit(){
		return ba[pos++];
	}

	// sets the data cursor to point to p
	function seek(p){
		pos = p;
	}

	init();
}
