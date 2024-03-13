import {createServer} from 'http'
import {Server} from 'socket.io'


const httpServer = createServer();

const io = new Server(httpServer, {
    cors:{
        origin: process.env.NODE_ENV === 'production' ? 'false' :
         ['http://localhost:5500']
    }
})

io.on('connection', (socket) => {
    console.log(`User: ${socket.id} connected`)
    socket.on('message', (message) =>{
        console.log(message)
        io.emit('Message : ',`${socket.id.substring(0,5)}: ${message}`)
    })
})

httpServer.listen(3000, () => {
    console.log('Listening')
})