var fs = require('fs');
var youtubedl = require('youtube-dl');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var mysql      = require('mysql');
var config = require('./socket.js'); //socketIO settings for OPENSHIFT's server
var diskspace = require('diskspace');
var drive_letter = '/var/lib/openshift/5830baeb7628e136e9000106/app-root/runtime/repo/download/';
var mysqlInfo;
mysqlInfo = {
  host     : '5893b7750c1e665026000010-freshboybg.rhcloud.com',
  port     : '49151',
  user     : 'admingRsCPhx',
  password : '8atwVzR3QqVw',
  database : 'yt',
  charset  : 'utf8_general_ci'
};
var mysqlConnection = mysql.createConnection(mysqlInfo);

app.get('/download/:file(*)', function(req, res, next){
  var file = req.params.file
    , path = __dirname + '/download/' + file;

  res.download(path); // allowing files to be downloaded from '/download/...'
});
app.get('/', function(req, res){
  res.sendfile('index.html');
});
http.listen(config.serverport, config.serverip, function(){
  console.log('SocketIO is ON!');
});

diskspace.check(drive_letter, function (err, total, free, status)
{
    console.log('err: ' + err);
	console.log('Total: ' + total);
	console.log('Free: ' + free);
	console.log('Status: ' + status);
});

//////////////////////////////////////////////////////////////////////////////////////////////

io.on('connection', function(socket) {
	socket.on('clientmsg', function(m) {
		if(m.type == "convert") return convert(m, socket);
	});
});

function convert(m, socket) {
	handleDisconnect(mysqlConnection);
	if (m.CT == 1) {
		var url = youtubedl('http://www.youtube.com/watch?v=' + m.url, ['-f', '140']); //best audio quality
		var fileformat = 1;
		//var file = path.join('./download/mp3/', m.url + ".mp3");
	} else if (m.CT == 2) {
		var url = youtubedl('http://www.youtube.com/watch?v=' + m.url, ['-f', 'best']); //only 720p for now :D
		var fileformat = 2;
		//var file = path.join('./download/mp4/', m.url + ".mp4");
	}
var onlyoneerror = 0;	
var size = 0;	
var file = null;
var songname1211 = null;
url.on('info', function(info) {
  'use strict';
				songname1211 = info.title;
				if (info.duration.length > 3) {
				var result=/([^-]+):([^-]+)/.exec(info.duration);
				if ((result[1]) > 10 || info.duration.length >= 6) {
					socket.emit('servermsg', {
					type: 'addalertfromserver',
					alerttype: 4,
					alerttext: 'We only support videos with maximum of 10 minutes.'
				});	
					return;
				}
				}
	size = info.size;
		socket.emit('servermsg', {
			type: 'videoinfo',
			title: info.title,
			thumbnail: info.thumbnail
		});	
		var tws = info.title;
		tws = tws.replace(/\//g, "-");
		if (fileformat == 1) {
			 file = path.join('./download/mp3/', tws +'-'+ m.url + ".mp3")
		} else if (fileformat == 2) {
			 file = path.join('./download/mp4/', tws +'-'+ m.url + ".mp4")
		}
		console.log(info.title);
	checkordownload();
});
function checkordownload() {
fs.stat(file, function(err, stat) {
	'use strict';
    if(err == null) {
     	socket.emit('servermsg', {
		type: 'download',
		newurl: file
	});
    } else if(err.code == 'ENOENT') {
		
	url.pipe(fs.createWriteStream(file));
var percentage = 0;
var pos = 0;

url.on('data', function data(chunk) {
  'use strict';
  pos += chunk.length;

  // `size` should not be 0 here.
  if (size) {
    var percent = (pos / size * 100).toFixed(0);
	percentage = percent; // May cause crashes due to high load of data!
  }
});

var customloop = setInterval(function(){ percentageloop() }, 200); // Fix - SocketIO overflow

function percentageloop() {
   				socket.emit('servermsg', {
				type: 'percentage',
				percentage: percentage
			});	
}


url.on('end', function end() {
  'use strict';
  onlyoneerror = 1;
  clearInterval(customloop);
     			socket.emit('servermsg', {
				type: 'download',
				newurl: file
			});	
	mysqlConnection.query('INSERT INTO `History` (`name`,`url`,`downloadurl`,`datetime`) VALUES (\''+songname1211+'\',\''+ m.url +'\',\''+ file +'\',CURRENT_TIMESTAMP())', function(err, row, fields) {});
	mysqlConnection.query('UPDATE `info` SET `value`=`value`+1  WHERE `name`=\'current\'', function(err, row, fields) {});
		
});



} else {
				socket.emit('servermsg', {
				type: 'addalertfromserver',
				alerttype: 4,
				alerttext: 'Error proceeding your request'
				});	
}
});
}
			process.setMaxListeners(0);
			process.on('uncaughtException', function(err) {
				if (onlyoneerror == 0){
				onlyoneerror = 1;
				socket.emit('servermsg', {
					type: 'addalertfromserver',
					alerttype: 4,
					alerttext: 'Error proceeding your request'
				});
				console.log(err.stack);
				}
			});


}	
	

function handleDisconnect(client) {
  client.on('error', function (error) {
    if (!error.fatal) return;
    if (error.code !== 'PROTOCOL_CONNECTION_LOST') throw err;

    console.error('> Re-connecting lost MySQL connection: ' + error.stack);
	
	mysqlConnection = mysql.createConnection(client.config);
    handleDisconnect(mysqlConnection);
    mysqlConnection.connect();
  });
};

