// Client side js

// Create a socket connection in the server side port
const socket = io('https://chat-app-uhfv.onrender.com')

// DOM selectors for message, name and room value 
const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')

// DOM selectors for activity, active users, active rooms and chat display 
const activity  =  document.querySelector('.activity')
const activeUsers  =  document.querySelector('.active-users')
const activeRooms  =  document.querySelector('.active-rooms')
const chatDisplay  =  document.querySelector('.chat-box')



/**
 * The send message function emits a message event from the client side to the server side
 * @param {Object} e 
 */
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

/**
 * This functions emits a enter room event to the server side
 * @param {Object} e 
 */
function enterRoom(e){
    e.preventDefault()
    if(nameInput.value && chatRoom.value) {
        socket.emit('enterRoom',  {
            name: nameInput.value,
            room: chatRoom.value,
        })
    }
}

// DOM selection for messaging and room-joining events

document.querySelector('.messege-box').addEventListener('submit', sendMessage)
document.querySelector('.join-form').addEventListener('submit', enterRoom)

// Event listener for user typing activity
msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})


/**
 * Function to handle the message displaying logic in the chat display,
 * Once the client receives the message from the server, it checks if the name is ADMIN or not.
 * If the name is not Admin, based on the current user name, it diplays the message to the right,
 *  otherwise to the left , indicating a differeny user.
 * If the message is from the ADMIN user, it displays a full width message 
 */
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


/**
 * On user activity event, emit user activity message
 */
let activityTimer 
socket.on('activity', (name) => {
    activity.textContent = `${name} is typing ....`


    // clear after 2 seconds
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() =>{
        activity.textContent = ''
    }, 3000)
})

// When the client side receives an active users event, call the showUsers method
socket.on('activeUsers', ({ users }) => {
    showUsers(users)
})

// When the client side receives an active rooms event, call the showRooms method
socket.on('activeRooms', ({ rooms }) => {
    showRooms(rooms)
})

/**
 * Shows the list of active users in the current room
 * @param {Object} users 
 */
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

/**
 * Shows the list of active room to all users in the current room
 * @param {Object} rooms 
 */
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