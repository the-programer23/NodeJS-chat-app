const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 9000;

const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath))


io.on('connection', (socket) => {
    console.log("New Websocket connection");

    socket.on('join', (userData, callback) => {

        const {error, user} = addUser({ id: socket.id, ...userData });

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.userName} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        
        if(filter.isProfane(msg)){
           return callback('Profane words are not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.userName, msg))
        callback('Delivered!')
        

    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.userName, `http://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
        
    })



    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.userName} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
}) 