const models = require('../../models/Models')
// const {getIo} = require('../../index')
// function generateBase64Id(names) {
//         const sortedNames = Object.keys(names)
//             .sort() // Sort the keys alphabetically
//             .reduce((acc, key) => {
//                 acc[key] = names[key];
//                 return acc;
//             }, {});
//         const baseString = JSON.stringify(sortedNames); // Serialize sorted object
//         return btoa(baseString); // Encode the string to Base64
//     }

function generateBase64Id(names) {
    const sortedValues = Object.values(names)
        .sort() // Sort the values alphabetically
        .join(''); // Concatenate them into a single string

    return btoa(sortedValues); // Encode the string to Base64
}

const getChat = async (req, res, io) => {
    const { from, to, roomId } = req.query
    // const io = getIo();

    const names1 = { firstName: from, secondName: to };

    const chatId = generateBase64Id(names1);

    const chat = await models.chatList.find({ chatId: chatId })
    if (chat.length == 0) {
        const newChat = new models.chatList({
            chatId: chatId,
            participants: [from, to],
            lastMessage: { from: from, message: 'new chat' },
            updatedAt: new Date().toISOString()
        })
        await newChat.save()
    }

    const messages = await models.chat.find({ chatId: chatId }).sort({ sentAt: 1 })
    // console.log('message documents array with chatId', messages)

    if (io) {
        // const socket = io.sockets.sockets.get(socketId);
        // if (io) {
        io.to(roomId).emit('message', { messages: [...messages] });
        // } else {
        //     console.error(`Socket with ID ${socketId} not found`);
        // }
    } else {
        console.error('Socket.IO is not initialized');
    }



}

const newMessage = async (req, res, io, connectedUsers) => {
    const { from, to, message, roomId } = req.body
    // const io = getIo();

    const names1 = { firstName: from, secondName: to };

    const chatId = generateBase64Id(names1);
    console.log('new message request', from, to, message, 'roomID', roomId, 'chatId', chatId)
    const newMessage = new models.chat({
        "chatId": chatId,
        "from": from,
        "message": message,
        "sentAt": new Date().toISOString(),
        "date": new Date().toLocaleDateString()
    })
    const chat = await models.chatList.find({ chatId: chatId })
    await models.chatList.findOneAndUpdate(
        { chatId: chatId },
        {
            $set: {
                participants: [from, to],
                lastMessage: { from: from, message: message },
                updatedAt: new Date().toISOString()
            }
        },
        { upsert: true } // This ensures it inserts if not found
    );

    const messages = await models.chat.find({ chatId: chatId }).sort({ sentAt: 1 })

    await newMessage.save()
        .then((resp) => {
            console.log('message saved')
            if (io) {
                // const socket = io.sockets.sockets.get(socketId);
                // if (io) {
                const receiver = [...connectedUsers.entries()].find(([_, user]) => user.username === to);
                // const sender = [...connectedUsers.entries()].find(([_, user]) => user.username === from);


                console.log('receiver', receiver, 'connectedUsers', connectedUsers, 'to', to, 'filtered', [...connectedUsers.entries()].filter(([_, user]) => user.userId === to));

                if (receiver) {
                    const receiverSocketId = receiver[0];
                    // const senderSocketId = sender[0];

                    // Get receiver's socket ID
                    console.log('receiverSocketId and senders', receiverSocketId);

                    // Get all socket IDs in the room
                    const roomSockets = io.sockets.adapter.rooms.get(roomId) || new Set();

                    if (!roomSockets.has(receiverSocketId)) {
                        // Receiver is NOT in the room, send a direct message to them
                        console.log('now sending to the receiver to room')
                        // Also send the message to the room so the sender can see it
                        
                        io.to(roomId).emit('message', { status: 'message saved', newMessages: [...messages, newMessage] });
                        setTimeout(() => {
                            console.log('now sending to the receiver')
                        io.to(receiverSocketId).emit('new_message', { status: 'message saved', newMessage });
                        }, 500);
                    } else {

                        // Receiver is in the room, send to the whole room
                        console.log('receiver in room and direct  message to room')
                        io.to(roomId).emit('message', { status: 'message saved', newMessages: [...messages, newMessage] });
                    }
                } else {
                    // No receiver found, send to the entire room
                    console.log('no receiver found and direct message to room')
                    io.to(roomId).emit('message', { status: 'message saved', newMessages: [...messages, newMessage] });
                }

            } else {
                console.error('Socket.IO is not initialized');
            }

            res.send('successfully message saved')
        }
        )




}

const getChats = async (req, res, io, connectedUsers) => {
    const { username } = req.query;
    console.log('chatlist requested', username)
    const allUsers = await models.users.find({});
    const chatList = await models.chatList.find({ participants: { $in: [username] } })
    const activeUsers = [...connectedUsers.values()].filter(user => !chatList.some(chat => chat.participants.includes(user.userId)));
    // console.log('active users', activeUsers, connectedUsers)
    res.send({ chatList, activeUsers, allUsers })
}


const messageHandler = {
    newMessage,
    getChats,
    getChat
}

module.exports = messageHandler;