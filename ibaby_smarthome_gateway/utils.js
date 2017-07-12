/* ------------------------------------------
LICENSE

 * \version 
 * \date    2017-6-21
 * \author  Xiangcai Huang
 * \brief   function for iBaby Gateway.
--------------------------------------------- */
var fs = require("fs");

var srcName = "./img/boot.bin";
var dstName = "";

var fileNum;//number of files divided
var fileSize = 10;//(less than 999)max size of single files divided
var buff = new Buffer(500);

function fileDivide(callback){
	fs.stat(srcName, function(err, stats){
		console.log("\nThe size of the source file - " + srcName + " is " +　stats.size + " bytes.");
		
		for (var i = 1; ; i++) {
			if (stats.size/i < fileSize) {
				break;
			}
		}
		fileNum = i;
	});

	fs.open(srcName, "r+", function(err, fd){
		if (err) {
			return console.error(err);
		}

		fs.read(fd, buff, 0, buff.length, 0, function(err, bytes){
			if (err) {
				return console.error(err);
			}

			var blocklen = fileSize;
			var offset;
			for (var i = 0; i < fileNum; i++) {
				dstName = "./img/boot" + i.toString() + ".bin";
				var fileHead = fileNum.toString() + "\n" + i.toString() + "\n";

				offset = blocklen * i;
				if (i == fileNum-1) {
					blocklen = bytes - blocklen*(fileNum-1);
				}
				singleFileCreate(dstName, fileHead, buff, offset, blocklen);
			}
		});

		console.log("\nThe file - " + srcName + 
					" has been divided into " + fileNum + " files");

		fs.close(fd, function(err){
			if (err) {
				return console.error(err);
			}
			// console.log("\nComplete.");

			callback(fileNum);
		});
	});
}

function singleFileCreate(filePath, fileHead, buffer, offset, length){
	fs.open(filePath, "w+", function(err, fd){
		if (err) {
			console.error("\nThe file " + filePath + " open failed");
			return console.error(err);
		}

		fs.write(fd, fileHead, 0, fileHead.length, 0, function(err){
			if (err) {
				console.error("\nThe file " + filePath + " write fileHead failed");
				return console.error(err);
			}
		});

		fs.write(fd, buffer, offset, length, fileHead.length, function(err){
			if (err) {
				console.error("\nThe file " + filePath + " write data failed");
				return console.error(err);
			}
			fs.close(fd);
		});
	});
}

function deepCopy(input){
	var output = {};
	var empty,
		key,
		del = true;
		
	for(key in input){
		if (typeof(input[key]) == "object"){
			output[key] = deepCopy(input[key]);
		} else {
			output[key] = input[key];
		}
	}

	return output;
}

function getDifferent(obj1, obj2){
	var objDifferent = {};
	var empty,
		key,
		del = true;
	for(key in obj1){
		if (typeof(obj1[key]) == "object"){
			if(obj2[key] == undefined){
				obj2[key] = deepCopy(obj1[key]);
				objDifferent[key] = deepCopy(obj1[key]);
			}else{
				objDifferent[key] = getDifferent(obj1[key], obj2[key]);
			}
		} else {
			if(obj1[key] != obj2[key]){
				objDifferent[key] = obj1[key];
				obj2[key] = obj1[key];
			} else{
				return ;
			}
		}
	}
	for (key in objDifferent){
		if(objDifferent[key] != undefined)
		del = false;		
	}
	if(del)
		return ;
	return objDifferent;
}

module.exports.fileDivide = fileDivide;
module.exports.deepCopy = deepCopy;
module.exports.getDifferent = getDifferent;