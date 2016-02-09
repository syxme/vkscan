var mongoose 	= require("mongoose"),
	async	 	= require("async"),
	Schema		= mongoose.Schema,
	ObjectId 	= Schema.Types.ObjectId;
	
const root = __dirname+"/";


function timeConverter(UNIX_timestamp){
  var a = new Date((UNIX_timestamp+28800) * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

//new Buffer("SGVsbG8gV29ybGQ=", 'base64').toString('ascii')

//mongoose.connect("mongodb://admin:BSP7tveEdR1t@"+process.env.OPENSHIFT_MONGODB_DB_HOST+":"+process.env.OPENSHIFT_MONGODB_DB_PORT+"/nodetestgo");
mongoose.connect("mongodb://localhost:27017/langate");

scanlist = new Schema({
	name:String,
	messages:[{}],
	id:String,
	image:String,
	url:String,
	last_id:String
});

// scanlist.virtual("time").get(function(){
//  timeConverter(this._id;

// });

scanlist.statics.Update = function(data,cb){
	this.update({id:data.id},{id:data.id,name:data.first_name+' '+data.last_name,url:'vk.com/id'+data.id},{upsert:true},function(err,e){
		cb(err,e);	
	});
};


scanlist.statics.addNewMessage = function(data,cb){
	models.ScanList.update({id:data.id},{$pushAll:{messages:data.messages},last_id:data.last_id},function(err,res){
		cb(err,res);
	});
};

scanlist.statics.List = function(cb){
	models.ScanList.find({},function(err,res){
		for(m in res){
			res[m].countM = res[m].messages.length;
			res[m].messages = [];
		}
		cb(err,res);
	});
};
scanlist.statics.RM = function(cb){
	models.ScanList.remove({},function(err,e){
		cb(err);
	});
};
scanlist.statics.ListId = function(id,cb){
	models.ScanList.findOne({id:id},function(err,res){
		if (res){
			if (res.messages){
				for(m in res.messages){
					if (res.id!=res.messages[m].from_id){
						res.messages[m].user_out = true;
					}else{
						res.messages[m].user_out = false;
						res.messages[m].name = res.name;

					}
					res.messages[m].time = timeConverter(res.messages[m].date);
				}
				cb(err,res);
			}else{
				cb('error',0)
			}
		}else{
			cb('error',0)
		}
	});
};

models = {
	ScanList:mongoose.model("ScanList", scanlist),
};

module.exports = models;
