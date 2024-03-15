const socket = io('ws://localhost:3000')


const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')

const activity  =  document.querySelector('.activity')
const activeUsers  =  document.querySelector('.active-users')
const activeRooms  =  document.querySelector('.active-rooms')
const chatDisplay  =  document.querySelector('.chat-box')





function sendMessage(e) {
    e.preventDefault()
    if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message',{
            text:  msgInput.value,
            name : nameInput.value,
        })
        msgInput.value = ''
    }
    msgInput.focus()
}


function enterRoom(e){
    e.preventDefault()
    if(nameInput.value && chatRoom.value) {
        socket.emit('enterRoom',  {
            name: nameInput.value,
            room: chatRoom.value,
        })
    }
}

document.querySelector('.messege-box').addEventListener('submit', sendMessage)
document.querySelector('.join-form').addEventListener('submit', enterRoom)

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})




socket.on('message', (data) => {
    activity.textContent = ''
    const {name, text, time} = data
    const li = document.createElement('li')
    li.className = 'post'
    if(name === nameInput.value) li.className = 'post post--right'
    if(name !== nameInput.value && name !== 'Admin') li.className = 'post post--left'
    if(name !== 'Admin') {
        console.log(name)
        li.innerHTML = `<div class="post__header ${name === nameInput.value ? 'post__header--user' :  'post__header--reply'}">
        <span class="post__header--name">${name} </span>
        <span class="post__header--time">${time} </span>
        </div>
        <div class = "post__text">${text}</div>`
    } else {
        li.innerHTML = `<div class="post__text">${text}</div>`
    }
    document.querySelector('.chat-box').appendChild(li)

    chatDisplay.scrollTop = chatDisplay.scrollHeight
} )



let activityTimer 

socket.on('activity', (name) => {
    activity.textContent = `${name} is typing ....`


    // clear after 2 seconds
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() =>{
        activity.textContent = ''
    }, 3000)
})


socket.on('activeUsers', ({ users }) => {
    showUsers(users)
})

socket.on('activeRooms', ({ rooms }) => {
    showRooms(rooms)
})


function showUsers(users) {
    activeUsers.textContent = ''
    if (users) {
        activeUsers.innerHTML = `<em>Users in ${chatRoom.value}:</em>`
        users.forEach((user, i) => {
            activeUsers.textContent += ` ${user.name}`
            if (users.length > 1 && i !== users.length - 1) {
                activeUsers.textContent += ","
            }
        })
    }
}

function showRooms(rooms) {
    activeRooms.textContent = ''
    if (rooms) {
        activeRooms.innerHTML = '<em>Active Rooms:</em>'
        rooms.forEach((room, i) => {
            activeRooms.textContent += ` ${room}`
            if (rooms.length > 1 && i !== rooms.length - 1) {
                activeRooms.textContent += ","
            }
        })
    }
}