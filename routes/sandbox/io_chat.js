var io = require('../../app').io;

var chat_sockets = {};

var chat = io
  .of('/chat')
  .on('connection',function(socket){
    socket.on('connect',function(data){
      var id = data.id;
      socket.set('page_id',id ,function(){
        if(chat_sockets[id]){
          chat_sockets[id].push(socket);
        }
        else{
          chat_sockets[id] = [socket];
        }
        var sockets = chat_sockets[id];
        for(var i = 0; i< sockets.length; i+=1){
          sockets[i].emit('count',{ n:chat_sockets[id].length });
        }
      });
    });
    socket.on('message',function(data){
      var id = data.id;
      var sockets = chat_sockets[id];
      var msg = data.user+': '+data.content;
      for(var i = 0; i< sockets.length; i+=1){
        sockets[i].emit('message',{ message: msg });
      }
    });
    socket.on('disconnect',function(data){
      socket.get('page_id', function(err, id){
        if(err){
          console.log(err);
        }else{
          var sockets = chat_sockets[id];
          if(sockets){
            sockets.splice(sockets.indexOf(socket),1);
            chat_sockets[id] = sockets;
          }
        }
      });
    });
  });

module.exports = io;
