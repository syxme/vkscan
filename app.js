// Setup
var fs = require('fs');
var VK = require('vksdk');
var async = require('async');
var vk = new VK({
   'appId'     : 5016020,
   'appSecret' : 'S3e22qAKkEWi36nENw9T',
   'language'  : 'ru',
   'mode'      : 'oauth'
});
const root = __dirname+"/";
const timeG = 3600000;
var express		= require('express'),
	hbs			= require('express3-handlebars'),
	app			= express(),
	server		= require('http').createServer(app),
	bodyParser	= require('body-parser');

var models = require('./models');

var http = require('http');
var vkx = '';

app.use(express.static(root+'public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('hbs', hbs({defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

var port =process.env.OPENSHIFT_NODEJS_PORT || 8080 ;
var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

var blackList = [
	44868438,
	138078296,
	192668407,
	65539100,
	54537846];

var users = [];
var blackList_of = {};


vk.setToken('6d77eb395049120969da329828b172df1be0cfa6470c11a8107a8d391a39efb98259375c745c7690e5a55');
vk.setSecureRequests(true);

vk.request("users.get",{user_ids:blackList.join(',')},function(e){
		users = e.response;
console.log(users);
		async.each(users, function iterator(item, callback) {
		    models.ScanList.Update(item,function(err,e){
				callback(null);
			});

		}, function(err) {
			
		});
});

app.get('/logs',function(req,res){
res.send(fs.readFileSync('/var/lib/openshift/56abb90d2d5271237c000175/app-root/logs/nodejs.log', 'utf8').replace(/\r\n/g, "<br />").replace(/\n/g, "<br />"));
});

app.get('/', function(req,res){
	models.ScanList.List(function(err,list){
		res.render('list',{List:list,header:'Профили',profilesL:true});
	});
});
app.get('/list/:id', function(req,res){
	var id = req.params.id;
	models.ScanList.List(function(errs,list){
		models.ScanList.ListId(id,function(err,messages){
			if (err){
				res.render('list',{List:list,messages:[],header:'Нету сообщений',profilesL:true});
			}else{
				res.render('list',{List:list,messages:messages.messages,header:'Сообщения',profilesL:true});

			}
		});
	});
});
app.get('/auth',function(req,res){
vk.request('messages.getHistory',{user_id:65539100,count:10,rev:0},function(e,cb){
               	res.send(e);
                     
               });

});
function getDialogs(){
	vk.request('messages.getDialogs', {count:30}, function(_o) {
	    var items = _o.response.items;
	    var ids = [];
	    for(var i=0;i<=30-1;i++){
	    	ids.push(items[i].message.user_id);
	    }
	    vk.request("users.get",{user_ids:ids.join(',')},function(e){
	    	console.log('');
	    });
	});
}




//getDialogs();
var outMes = [];

var ixt =0;
function scanFuck(){
	const countMessage = 5
	var messages = [];
	var timex = new Date(new Date().getTime()+(8*timeG)); 
	timex = timex.getHours()+":"+timex.getMinutes()+":"+timex.getSeconds();
 	console.log(timex+" - Call "+' '+ixt);
	ixt++;
	async.each(blackList, function iterator(item, callback) {
	    vk.request('messages.getHistory',{user_id:item,count:countMessage+1,rev:0},function(e,cb){
		console.log(' async '+item);
		if (!e.response.items){
			console.log(e);
		}
		    	messages.push(e.response.items);
			callback(null);
		});
	}, function(err) {

		//console.log(messages);
		for (var ms in messages){
			messages[ms] = messages[ms].reverse();
			for (var index = 0; index<=countMessage;index++){
				if (index == countMessage){
					console.log(messages[ms][index]);
					if (messages[ms][index].id>blackList_of[messages[ms][index].user_id] || blackList_of[messages[ms][index].user_id]==null){
						for (var x = 0; x<=countMessage;x++){
							if (messages[ms][x].id>=blackList_of[messages[ms][index].user_id]){
								var arm = messages[ms];
								arm = arm.slice(x+1);
								outMes.push(arm);
								console.log(blackList[ms]+' '+messages[ms][index].user_id);
								models.ScanList.addNewMessage({id:messages[ms][index].user_id,messages:arm},function(err,e){
									console.log(e);
								});
								break;
							}

						}
						blackList_of[messages[ms][index].user_id] = messages[ms][index].id;
						console.log("RETIT");
					}
				}
			}
		}
		setTimeout(scanFuck,15000);
	});
}
 scanFuck();
console.log('SCanfuckloaded');
server.listen(port, ip);

console.log("APP START:"+ip+':'+port);

//https://oauth.vk.com/authorize?client_id=5016020&display=popup&redirect_uri=https://oauth.vk.com/blank.html&scope=4272130&response_type=token&v=5.44
