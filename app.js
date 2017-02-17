var ElectronPDF = require('electron-pdf');
var express = require('express');
var promise = require('bluebird');
var ejs = require('ejs');
var fs = require('fs');


promise.promisifyAll(fs);

var app = express();
var exporter = new ElectronPDF();

app.set('view engine', 'ejs');

app.get('/download',  function (req, res) {
	var input = __dirname+'/index.html';
	var output = __dirname+'/output.pdf';
	
	return new promise(function(resolve,reject){
		return generatePDF(input, output)
		.then(function(pdfUrl){
			console.log("PDF conversion Done. URL : ", pdfUrl);
			return resolve(true);
		}).catch(function(err){
			reject(err);
		});
	});	
});

app.get('/dynamic/pdf',function(req,res){

	var input = __dirname+'/dynamic.html';
	var output = __dirname+'/dynamic.pdf';
	var temp = __dirname+'/temp.pdf';
	var data = {
		name : 'Test Person',
		mobile : '01717346500'
	}

	return new promise(function(resolve, reject){
		return generateDynamicHtml(data,input,temp)
		.then(function(url){
			return generatePDF(url, output);
		}).then(function(result){
			console.log("PDF conversion Done. URL : ", result);
			resolve(true);
		}).catch(function(err){
			reject(err);
		})
	})
})



function generateDynamicHtml(data, htmlUrl, output){
	
	return new promise(function(resolve, reject){
		return ejs.renderFile(htmlUrl, { data : data },function (err, html) {
			if(err)
				reject(new Error(err.message));
			else if(html){
				fs.writeFile(output,html, function (err) {
					if(err)
						reject(new Error(err.message));
					else
						resolve(output);
				});
			}
		});
	});
}

function generatePDF(input, output){
	var jobOptions = {
		inMemory: false,
		closeWindow: false
	};

	var options = {
		pageSize : "A4",
		landscape: false,
		marginsType: 0
	};

	return exporter.createJob(input, output, options, jobOptions)
	.then(function (job) {
		job.render();
		return new promise(function(resolve){
			job.on('job-complete', function (r) {
				resolve(r.results);
			});
		});
	}).then(function(result){
		return result[0];
	}).catch(function(err){
		return err.message;
	});
}

exporter.on('charged', function () {
    app.listen(3000,function(){
    	console.log("App is Running on 3000");
    });
});

exporter.start();