# CHAT APP [ SOCKET IO AND NODE JS]

## ABOUT
The chat application is a simple backend application built using socket-io and node js. A client side has been built using HTML, CSS and Vanilla JavaScript. The server runs on the port 3000.

## FEATURES
The server side uses `socket.io and node js` to create a websocket server for bidirectional communication with the client. 
The connection in the server is an asynchronous process which deals with multiple requests from the client side asynchronously. The server runs on the port 3000.



Once the connection is established, the socket associated with the client side is used for emmiting and handling events in the server side. 

The server side is deployed in: https://chat-app-uhfv.onrender.com

## HOW TO RUN THE PROJECT 

To run the server [locally]
 - Open a terminal
 - Change to server dirctory
 - Execute the command `npm install`, this installs all dependencies
 - Execute command `npm start`, to start the server

To run the client [locally]
- Open VSCode
- Enable Live Server extension
- Change to client directory
- Open app.js
- Change the socket connection address from 'https://chat-app-uhfv.onrender.com' to 'ws://localhost:3000'
- Open the index.html file
- Right click and open with live server


To run the client when the `server is deployed`

- Change to client directory 
- Open index.html with any browser
