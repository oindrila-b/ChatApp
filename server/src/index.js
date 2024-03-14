import path from 'path'
import { fileURLToPath } from 'url';
import {Server} from 'socket.io'
import express from 'express'

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();
app.use(express.static(path.join(__dirname, 'public')))   


const expressServer = app.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
});

const io = new Server(expressServer, {
    cors:{
        origin: process.env.NODE_ENV === 'production' ? 'false' :
         ['http://localhost:5500', 'http://127.0.0.1:5500']
    }
})

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    // send message to connected user
    socket.emit('message', "Welcome to Chat App")

     // send message to all the user
     socket.broadcast.emit('message', `User ${socket.id.substring(0,5)} connected`)

     // listening for message event
    socket.on('message', data => {
        console.log(data)
        io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
    })

    // on user disconnection
    socket.on('disconnect', () => {
        socket.broadcast.emit('message', `User ${socket.id.substring(0,5)} disconnected`)
    })

    socket.on('activity', (name) => {
        socket.broadcast.emit('activity', name)
    })
})
