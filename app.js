// Setup
var VK = require('vksdk');
var async = require('async');
var vk = new VK({
   'appId'     : 5016020,
   'appSecret' : 'S3e22qAKkEWi36nENw9T',
   'language'  : 'ru',
   'mode'      : 'oauth'
});

var blackList = [
	44868438,
	138078296,
	192668407,
	65539100,
	54537846];
var users = [];
var blackList_of = {};

 // Moй токен	- c18c2c80308cbf55a19ecb258d47ef64bbc4c7c13ef1e1edc23301b1533088678ff00283d667b16740bf5
 // Яна 		- 6d77eb395049120969da329828b172df1be0cfa6470c11a8107a8d391a39efb98259375c745c7690e5a55  79525716428@yandex.ru

vk.setToken('6d77eb395049120969da329828b172df1be0cfa6470c11a8107a8d391a39efb98259375c745c7690e5a55');
vk.setSecureRequests(true);
vk.request("users.get",{user_ids:blackList.join(',')},function(e){
		users = e.response;
});


function getDialogs(){
	vk.request('messages.getDialogs', {count:30}, function(_o) {
	    var items = _o.response.items;
	    var ids = [];
	    for(var i=0;i<=30-1;i++){
	    	ids.push(items[i].message.user_id);
	    }
	    vk.request("users.get",{user_ids:ids.join(',')},function(e){
	    	console.log(e);
	    });
	});
}
// for (var l in blackList){
// 	console.log(l);
// 	vk.request('messages.getHistory',{user_id:l,count:3},function(e){
// 		console.log(e.response.items.body);
// 	});
// }
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
function getValue(array, search) {
  var i = array.length;
  while (i--) {
      if (array[i].id === search) {
         return array[i].first_name +' '+ array[i].last_name ;
      }
  }
} 
//getDialogs();


function scanFuck(){
	
	var messages = [];
	console.log("++++++++++++++NEW START+++++++++++++++")

	async.each(blackList, function iterator(item, callback) {
	    vk.request('messages.getHistory',{user_id:item,count:5,rev:0},function(e,cb){
	    	//console.log(e.response.items);
	    	messages.push(e.response.items);
			callback(null);
		});
	}, function(err) {
		for (var ms in messages){

			for (var index = 4; index>=0;index--){

				if (index == 0){
					if (messages[ms][index].id>blackList_of[messages[ms][index].user_id] || blackList_of[messages[ms][index].user_id]==null){

						blackList_of[messages[ms][index].user_id] = messages[ms][index].id;
						console.log('Изменение данных');
					}
				}

				if (messages[ms][index].from_id ==170113147){
					console.log(timeConverter(messages[ms][index].date)+':яна пишет '+getValue(users,messages[ms][index].user_id)+':'+messages[ms][index].body+'  :'+messages[ms][index].id);				
				}else{
					console.log(timeConverter(messages[ms][index].date)+':'+getValue(users,messages[ms][index].user_id)+':'+messages[ms][index].body+'    :'+messages[ms][index].id);				
				}
			}
			console.log('-----------------------')
		}
			console.log(blackList_of);

			setTimeout(scanFuck,15000);

	});
}
scanFuck();

// vk.request('messages.getHistory', {user_id:170113147,count:2}, function(_o) {
//      console.log(_o.response.items);
//  });

// 170113147
//
// Turn on requests with access tokens
//https://oauth.vk.com/authorize?client_id=5016020&display=popup&redirect_uri=https://oauth.vk.com/blank.html&scope=8192,4194304,65536,4096,2&response_type=token&v=5.44