var ElectronPDF = require('electron-pdf');
var express = require('express');
var bodyParser = require('body-parser');
var promise = require('bluebird');
var ejs = require('ejs');
var fs = require('fs');


promise.promisifyAll(fs);

var app = express();
var exporter = new ElectronPDF();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/download',  function (req, res) {

	this.htmlUrl =  __dirname+'/email.html';
	this.tempUrl = __dirname+'/tmp/invoice_'+invoiceId+'.html';

	return new promise(function(resolve,reject){
		
		return shopInfo(shopId,token).bind({})
		.then(function(shop){
			this.shop = shop;
			return getInvoiceData(shopId, invoiceId, token);
		}).then(function(invoice){
			return gatherInvoiceData(invoice, this.shop);
		}).then(function(result){

			return generateDynamicHtml(result, this.htmlUrl, this.tempUrl);
		})
		.then(function(url){
			return generateInvoicePdf(url, invoiceId);
		}).then(function(pdfUrl){
			this.pdfUrl = pdfUrl;
			return download(pdfUrl, invoiceId, res);
		}).then(function(){
			fs.unlinkSync(this.pdfUrl);
			fs.unlinkSync(this.tempUrl);
			return resolve(true);
		}).catch(function(err){
			console.log("Failed",err.message);
			res.end();
		});
	});	
});



function generateDynamicHtml(invoice, htmlUrl, output){
	
	return new promise(function(resolve, reject){
		console.log(invoice)
		return ejs.renderFile(htmlUrl, { invoice : invoice },function (err, html) {
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

function generateInvoicePdf(pdfUrl, invoiceId){
	var jobOptions = {
		inMemory: false,
		closeWindow: false
	};

	var options = {
		pageSize : "A4",
		landscape: false,
		marginsType: 0
	};

	var output = 'pdf/invoice-'+invoiceId+'.pdf';

	return exporter.createJob(pdfUrl, output, options, jobOptions)
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