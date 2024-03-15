// Server side code

import { Server } from 'socket.io'
import express from 'express'

// Setting a PORT for the server to run on
const PORT = 3000;

const app = express();

// Setting a constant vale for ADMIN messages
const ADMIN = "Admin"

// Setting the server to listen to PORT 
const expressServer = app.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
});

/****
 * The User State will be used to manage the current state if the users
 * The state contains an empty array of users which will ve updated as each user connects,
 * and a setUsers function that is responisble for updating the users array
 */
const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray
    }
}

/**
 * Setting up a Socket.io server, which allows CROS[Cross Origin Resource Sharing]
 * to take place with the cors option
 */

const io = new Server(expressServer, {
    cors: {
        origin: '*'
    }
})

/***
 * 
 * Establising a connection using io. 
 * Passing a socket instance as a parameter, which will deal with the client sepcific events, asynchronously.
 * Deals with all the client server interactions and chat logic
 */
io.on('connection', async (socket) => {
    console.log(`User ${socket.id} connected`)

    // Send a message to the connected user
    socket.emit('message', buildMessage(ADMIN, "Welcome to Chat App!"))

    // Handle client when they enter a specific room
    socket.on('enterRoom', async({ name, room }) => {

        // Get the prvious room the user was in, may be null if its a new user
        const prevRoom = getUser(socket.id)?.room

        // If previous room exists for the current user then leave the current room first and let the other users know
        if (prevRoom) {
            await socket.leave(prevRoom)
            io.to(prevRoom).emit('message', buildMessage(ADMIN, `${name} has left the room`))
        }

        // If no previous room exists for the current user then activate a new user
        const user = activateUser(socket.id, name, room);

        // If previous room exists get rest of the users of that room
        if (prevRoom) {
            io.to(prevRoom).emit('activeUsers', {
                users: getUsersInRoom(prevRoom)
            })
        }

        // Join the current user to the room
        socket.join(user.room)

        //Send a joining message to user who joined
        socket.emit('message', buildMessage(ADMIN, `You have joined the ${user.room} chat room`))

        // Broadcast the joining to the rest of the users in the room
        socket.broadcast.to(user.room).emit('message', buildMessage(ADMIN, `${user.name} has joined the ${user.room} chat room`))


        // Update user list for the active room
        io.to(user.room).emit('activeUsers', {
            users: getUsersInRoom(user.room)
        })

        // Update rooms list for all the users
        io.emit('activeRooms', {
            rooms: getAllActiveRooms()
        })
       
    })


    // On user disconnection hande the client and server event
    socket.on('disconnect', () => {
        // Get the current users socket id
        const user = getUser(socket.id)
        // Disconnect the user
        userDisconnects(socket.id)

        // If the user exists, let the other users know that the current user has left the room, 
        // and then get the updated list of all the users,and the active rooms
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



    // Listening for message event, and send the message to the current room except the current user
    socket.on('message', ({name, text}) => {
        // Get the current room
        const room  =  getUser(socket.id)?.room

        if(room) {
            socket.broadcast.to(room).emit('message', buildMessage(name, text))
            // io.to(room).emit('message', buildMessage(name, text))
        }
        
    })


    // Listen for all activities, and emit the activity in the room
    socket.on('activity', (name) => {
        const room  =  getUser(socket.id)?.room
        if(room) {
            socket.broadcast.to(room).emit('activity', name)
        }
    })
})

/**
 * Helper function to build messages, that will be sent to the client
 * @param {String} name 
 * @param {String} text 
 * @returns 
 */
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

/**
 * Helper function to activate user, and update user array accordingly
 * @param {String} id 
 * @param {String} name 
 * @param {String} room 
 * @returns 
 */
function activateUser(id, name, room) {
    const user = { id, name, room }
    UsersState.setUsers([
        ...UsersState.users.filter(user => user.id !== id),
        user
    ])
    return user
}

/**
 *  Helper function to disconnect a user and activate the user array
 * @param {String} id 
 */
function userDisconnects(id) {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id != id)
    )
}

/**
 * Helper function to get a user based on the user id
 * @param {String} id 
 * @returns List of users with a given id
 */
function getUser(id) {
    return UsersState.users.find(user => user.id === id)
}

/**
 * Helper function to get all the users in a room
 * @param {String} room 
 * @returns Array of Users
 */
function getUsersInRoom(room) {
    console.log(UsersState.users)
    console.log(Array.isArray(UsersState.users))
    return UsersState.users.filter((user) => user.room === room)
}

/**
 * Helper function to get all the active room
 * @returns An array of active rooms
 */
function getAllActiveRooms() {
    return Array.from(new Set(UsersState.users.map(user => user.room)))
}

