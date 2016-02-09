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
var longtime = 0;
var models = require('./models');
var thread_scan = 0;
var http = require('http');
var vkx = '';
var ixt =0;

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

function off_thread() {
    clearTimeout(thread_scan);
	clearTimeout(longtime);	
    ixt = 0 ;
}

vk.setToken('6d77eb395049120969da329828b172df1be0cfa6470c11a8107a8d391a39efb98259375c745c7690e5a55');
vk.setSecureRequests(true);
function gtn(){
	var timex = new Date(new Date().getTime()+(8*timeG)); 
	return timex.getHours()+":"+timex.getMinutes()+":"+timex.getSeconds();
}
function GetScanList(cb){
	vk.request("users.get",{user_ids:blackList.join(',')},function(e){
		users = e.response;
		console.log(users);
		async.each(users, function iterator(item, callback) {
			blackList_of[item.id] = '';
			models.ScanList.Update(item,function(err,e){
				callback(null);
			});

		}, function(err) {
			models.ScanList.List(function(err,r_users){
				//console.log(r_users);
				for (usr in r_users){
					if (r_users[usr].last_id){
						blackList_of[r_users[usr].id] = r_users[usr].last_id; 	
					}
				}
				cb(null);
			});
		});
	});
}

GetScanList(function(err){});

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

function scanFuck(){
	clearTimeout(longtime);
	const countMessage = 10
	var messages = [];

 	console.log('<b>'+gtn()+"</b> - run "+' '+ixt);
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
		for (var ms in messages){
			messages[ms] = messages[ms].reverse();
			for (var index = 0; index<=countMessage;index++){
				if (index == countMessage){
					if (messages[ms][index].id>blackList_of[messages[ms][index].user_id] || blackList_of[messages[ms][index].user_id]==''){
						for (var x = 0; x<=countMessage;x++){
							if (messages[ms][x].id>=blackList_of[messages[ms][index].user_id]){
								var arm = messages[ms];
								arm = arm.slice(x+1);
								console.log('from id: '+messages[ms][index].user_id);
								models.ScanList.addNewMessage({id:messages[ms][index].user_id,messages:arm,last_id:messages[ms][index].id},function(err,e){
									console.log(e);
								});
								break;
							}

						}
						blackList_of[messages[ms][index].user_id] = messages[ms][index].id;
						console.log("new changes");
					}
				}
			}
		}
			if (thread_scan!=0){
				if (thread_scan._idleTimeout>0){
					clearTimeout(longtime);
					console.log('wait 15 sec')
					thread_scan = setTimeout(scanFuck,15000);
				}
			}else{
				if (longtime._idleTimeout>0){
					console.log('wait 15 sec')
					clearTimeout(longtime);
					thread_scan = setTimeout(scanFuck,15000);
				}
			}
	});
	longtime = setTimeout(restart,60000);
	
}


function restart(){
	off_thread();
	console.log(gtn()+' Функция зависла, перезапуск через 30 секунд');
	setTimeout(function(){
		console.log(gtn()+' Перезапуск');
		thread_scan = 0;
		scanFuck();
	},30000);
}
scanFuck();




app.post('/api/restart',function(req,res){	
	off_thread();
	setTimeout(function(){
		models.ScanList.RM(function(err){
			GetScanList(function(err){
				thread_scan = 0;scanFuck();
				res.redirect('/');
			});
		})
	},10000);
});

app.get('/logs',function(req,res){
	var text = 'sadf';//fs.readFileSync('/var/lib/openshift/56abb90d2d5271237c000175/app-root/logs/nodejs.log', 'utf8').replace(/\r\n/g, "<br />").replace(/\n/g, "<br />");
	res.render('list',{List:[],messages:[],bodyLog:text,header:'Нету сообщений',profilesL:true});

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

console.log('SCanfuckloaded');
server.listen(port, ip);

console.log("APP START:"+ip+':'+port);

//https://oauth.vk.com/authorize?client_id=5016020&display=popup&redirect_uri=https://oauth.vk.com/blank.html&scope=4272130&response_type=token&v=5.44
