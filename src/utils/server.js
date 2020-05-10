const User = require("../models/user")
const Room = require("../models/room")
const Chat = require("../models/chat")

//OOP vocab
//class is a blueprint for what an object will look like, no data or info
//the object itself will give the data/info, an instantiated version of the class, values defined and what methods will be returned
//constructor inside of a class: how to take a class and turn it into an object

class Server {
    constructor(user) {
        this.user = user; //placeholder that well pass info thru
    }

    static async login(userName, socketId) {
        console.log(socketId)
        const name = userName.toLowerCase()
        let user = await User.findOne({ name: name })
        if (!user) {
            user = await User.create({ name: name, token: socketId })
        }
        user.token = socketId
        user.online = true;
        await user.save()
        return user
    }

    static async checkUser(socketId) {
        console.log("SOCKET", socketId)
        const user = await User.findOne({ token: socketId })
        if (!user) throw new Error("user not found, please login")
        return new Server(user) //create new instance of the server with the user object
    }

    async joinRoom(rId) { //why not a static
        const room = await Room.findById(rId)
        if (!room.members.includes(this.user._id)) {
            room.members.push(this.user._id)
            await room.save()
        }
        this.user.room = rId;
        await this.user.save();
        console.log("ROOM", room)
        this.user.room = room; //reassign room obj

    }

    async leaveRoom(){
        let rId = this.user.room
        const room = await Room.findById(this.user.room)
        if(!room) throw new Error("room not found")
        room.members.remove(this.user._id)
        await room.save()
        this.user.room = null;
        await this.user.save()
        this.user.rId = rId
    }

    async chat(text) {
        console.log("CHAT",text)
        console.log("CHAT FX",this.user.name)
        const chat = await Chat.create({
          text: text,
          user: this.user._id,
          room: this.user.room._id
        });
        return chat
      }

    async newChatObject(chat){
        const name = await User.findById(this.user)
        console.log("NEW CHAT OBJ", this.user.name)
        const chatObj = {
            text: chat.text,
            name: this.user.name,
            createdAt: this.createdAt
        }
        return chatObj
    }

    async displayOldChats(){
        const chats = await chats.find({})
        const oldChat = {
            text: chats.text,
            name: chats.user.name
        }
        return oldChat
    }
}

module.exports = Server