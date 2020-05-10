require('dotenv').config({ path: ".env" })
const http = require('http');
const socketio = require("socket.io")
const mongoose = require("mongoose")
const app = require('./app'); //express app

mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => console.log("Connected to database")).catch(err => console.log(err))

const server = http.createServer(app); // create node server

const io = socketio(server) // create websocket server

const Filter = require("bad-words")
const filter = new Filter()

const Room = require("./src/models/room")
const Chat = require("./src/models/chat")
const Server = require("./src/utils/server")

//client A emit something in event "chat"
//server listens to the event "chat" => broadcast.emit OR io.emit to event "messages"
//clients A,B,C will listen to event "messages" => setState => render

io.on("connection", async (socket) => {
    
    // ROOMS => render rooms
    socket.emit("rooms", await Room.find()) // send room array to front end
    
    //LOGIN => render username
    socket.on("login", async (userName, cb) => { // get userName data from browser
        // console.log(userName)
        try {
            //check if username exists in our db or create new user
            const user = await Server.login(userName, socket.id)
            return cb({ ok:true, data:user })
        } catch (er) {
            return cb({ok: false, error: er.message})
        }
    })

    //JOIN ROOM
    socket.on("joinRoom", async (rId, cb)=> {
        // 1. Check user, return an instance
        const server = await Server.checkUser(socket.id) //socket.id is also the user's token
        // 2. Update DB when user joins a room; User.room and Room.members
        await server.joinRoom(rId)
        // 3. Update current room to client
        socket.emit("selectedRoom", server.user.room)
        // 4. Subscribe user to a channel
        socket.join(rId)
        // Show previous messages
        socket.emit("oldChats", 
            await Chat.find({room: rId})
            // {'subjects':{"$elemMatch":{'name':'Math'}
        )
        // 5. Send welcome msg to the client
        socket.emit("messages", {
            name: "System",
            text: `Welcome ${server.user.name}, to ${server.user.room.name}!`})
        //6. Send notification to other clients in the new room
        socket.to(rId).broadcast.emit("messages", {
            name: "System",
            text: `${server.user.name} has joined.`
        })
        //7. Update rooms globally to reflect changes
        io.emit("rooms", await Room.find())
    })

    // LEAVE ROOM
    socket.on("leaveRoom", async (_,cb)=>{
       try{
        const server = await Server.checkUser(socket.id)
        
        await server.leaveRoom()
        //notify other clients in that room
        socket.to(server.user.rId).broadcast.emit("messages", {
            name: "System",
            text: `${server.user.name} has left.`
        })
        //unsubscribe from the channel
        socket.leave(server.user.rId)
       }catch (er){
           return cb({ok:false, error: er.message})
       }
    })

    // DISCONNECT
    socket.on("disconnect", async () => {
        try {
          const server = await Server.checkUser(socket.id)
          socket.broadcast.to(server.user.room._id).emit("messages", {name:"System", text: `${server.user.name} has left`})
          await server.leaveRoom()
          io.emit("rooms", await Room.find({}))
        } catch (err) {
          console.log(err.message)
        }
      });

    socket.on("chat", async (obj, cb) => {
        try {
            console.log("REQ", obj.text)
            const server = await Server.checkUser(socket.id);
            if (filter.isProfane(obj.text)) {
                socket.emit("messages", {
                    name: "System",
                    text: "Profanity is not allowed."})
            return cb({ok: false, message: err.message})
            }
            const chat = await server.chat(obj.text)
            io.to(server.user.room._id).emit("messages", await server.newChatObject(chat))
            console.log("SERVER NEW CHAT", await server.newChatObject(chat))
            console.log("CHATS", await Chat.find({}))
        } catch(err) {
            console.log(err)
            return cb({ ok : false, message: err.message })
        }
        // event validatoin
        // console.log(filter.isProfane(obj.text))
        // if (filter.isProfane(obj.text)) {
        //     return cb("Profanity is not allowed")
        // }
        // io.emit("messages", obj)
    })
});

server.listen(process.env.PORT, () => { //start listening on express app
    console.log("server listening on port " + process.env.PORT);
});
