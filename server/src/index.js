
import { Server } from 'socket.io'
import express from 'express'

const PORT = 3000;

const app = express();

const ADMIN = "Admin"

const expressServer = app.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
});

// User State
const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray
    }
}

const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? 'false' :
            ['http://localhost:5500', 'http://127.0.0.1:5500']
    }
})

io.on('connection', async (socket) => {
    console.log(`User ${socket.id} connected`)

    // send message to connected user
    socket.emit('message', buildMessage(ADMIN, "Welcome to Chat App!"))


    socket.on('enterRoom', async({ name, room }) => {

        const prevRoom = getUser(socket.id)?.room

        if (prevRoom) {
            await socket.leave(prevRoom)
            io.to(prevRoom).emit('message', buildMessage(ADMIN, `${name} has left the room`))
        }

        const user = activateUser(socket.id, name, room);

        if (prevRoom) {
            io.to(prevRoom).emit('activeUsers', {
                users: getUsersInRoom(prevRoom)
            })
        }

        socket.join(user.room)

        //To user who joined
        socket.emit('message', buildMessage(ADMIN, `You have joined the ${user.room} chat room`))

        // To the rest of the users in the room
        socket.broadcast.to(user.room).emit('message', buildMessage(ADMIN, `${user.name} has joined the ${user.room} chat room`))


        // Update user list
        io.to(user.room).emit('activeUsers', {
            users: getUsersInRoom(user.room)
        })

        // update rooms list for all
        io.emit('activeRooms', {
            rooms: getAllActiveRooms()
        })
       
    })


    // on user disconnection
    socket.on('disconnect', () => {
        const user = getUser(socket.id)
        userDisconnects(socket.id)

        if(user) {
            io.to(user.room).emit('message', buildMessage(ADMIN, `${user.name} has left the room`))
            io.to(user.room).emit('activeUsers', {
                users: getUsersInRoom(user.room)
            })

            io.emit('activeRooms', {
                rooms: getAllActiveRooms()
            })

            console.log(`User ${socket.id} disconnected`)
        }
    })



    // listening for message event
    socket.on('message', ({name, text}) => {
        const room  =  getUser(socket.id)?.room
        if(room) {
            io.to(room).emit('message', buildMessage(name, text))
        }
        
    })

    socket.on('activity', (name) => {
        const room  =  getUser(socket.id)?.room
        if(room) {
            socket.broadcast.to(room).emit('activity', name)
        }
    })
})


function buildMessage(name, text) {
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(new Date())
    }
}

// User state util functions
function activateUser(id, name, room) {
    const user = { id, name, room }
    UsersState.setUsers([
        ...UsersState.users.filter(user => user.id !== id),
        user
    ])
    return user
}

function userDisconnects(id) {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id != id)
    )
}

function getUser(id) {
    return UsersState.users.find(user => user.id === id)
}

function getUsersInRoom(room) {
    console.log(UsersState.users)
    console.log(Array.isArray(UsersState.users))
    return UsersState.users.filter((user) => user.room === room)
}


function getAllActiveRooms() {
    return Array.from(new Set(UsersState.users.map(user => user.room)))
}

