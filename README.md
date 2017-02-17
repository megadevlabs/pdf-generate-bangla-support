# pdf-generate-bangla-support
Pdf File Generation with Bangla Language Support

## To make pdf we have use electron-pdf. So at first you need to install electron-pdf install on your mechine. 
```
sudo npm install electron-pdf -g
```

## For gnu/linux installations without a graphical environment:
```
sudo apt-get install xvfb 
export DISPLAY=':99.0'
Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
electron-pdf 
```

## To check is electron-pdf installed or not:
```
electron-pdf
```

## To convert html file to pdf file through command line or terminal :
```
electron input.html output.pdf
```

## To convert html file to pdf file:
```
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
})
```

You you have facing problems then contact me @ bilashcse@gmail.com