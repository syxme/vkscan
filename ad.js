var logrunningFunction = function(){
  setTimeout(function(){
    console.log("Delayed");
    inspector();
  }, 500);

};


var inspector = function(){
  console.log("long running function completed");
};

logrunningFunction(inspector);

setTimeout(function(){
  inspector = function(){
    console.log("Overwrite long running handler");
  };
},5000);