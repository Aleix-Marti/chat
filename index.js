// index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Importa el paquete cors

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "https://stage.knwy-tools.com", // Permite todas las orígenes
        methods: ["GET", "POST"] // Métodos permitidos
    }
});
// const io = socketIo(server, {
//     cors: {
//         origin: "http://miaplicacion.com",
//         methods: ["GET", "POST"]
//     }
// });


//app.use(cors());
app.use(cors({ origin: 'https://stage.knwy-tools.com' }));

//app.use(express.json()); // para poder recibir y parsear JSON en los request bodies
app.use(express.urlencoded({ extended: true })); // necesario para poder leer el cuerpo de las peticiones POST en formato application/x-www-form-urlencoded


let rooms = {};

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('joinRoom', ({username, roomId}) => {
        if (!rooms[roomId]) {
            rooms[roomId] = { users: [] };
        }

        rooms[roomId].users.push(username);
        socket.join(roomId);

        socket.to(roomId).emit('userJoined', { username });
    });

    socket.on('sendMessage', ({username, roomId, message}) => {
        io.to(roomId).emit('newMessage', { username, message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Lógica para manejar la desconexión del usuario
    });
});

app.post('/createRoom', (req, res) => {
    const { username, roomId } = req.body;
    if (!rooms[roomId]) {
        rooms[roomId] = { users: [username] };
        res.status(201).send({message: "Room created successfully!"});
    } else {
        res.status(409).send({message: "Room already exists!"});
    }
});

const port = process.env.PORT || 4001;
server.listen(port, () => console.log(`Server running on port ${port}`));
