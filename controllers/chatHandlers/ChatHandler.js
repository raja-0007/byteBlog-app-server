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

// const getChat = async (req, res, io) => {

//     console.log("chst requested ")
//     const { from, to, roomId } = req.query
//     // const io = getIo();

//     const names1 = { firstName: from, secondName: to };

//     const chatId = generateBase64Id(names1);

//     const chat = await models.chatList.find({ chatId: chatId })
//     if (chat.length == 0) {
//         const newChat = new models.chatList({
//             chatId: chatId,
//             participants: [from, to],
//             lastMessage: { from: from, message: 'new chat' },
//             updatedAt: new Date().toISOString()
//         })
//         await newChat.save()
//     }

//     const messages = await models.chat.find({ chatId: chatId }).sort({ sentAt: 1 })
//     console.log('message documents array with chatId', messages)

//     if (io) {
//         // const socket = io.sockets.sockets.get(socketId);
//         // if (io) {
//         console.log("messages sent to client")

//         io.to(roomId).emit('message', { messages: [...messages] });
//         // } else {
//         //     console.error(`Socket with ID ${socketId} not found`);
//         // }
//     } else {
//         console.error('Socket.IO is not initialized');
//     }

//     res.send("messages sent")



// }

const getChat = async (req, res, io) => {
    try {
      console.log("chat requested");
      const { from, to, roomId } = req.query;
  
      const chatId = generateBase64Id({ firstName: from, secondName: to });
      const messages = await models.chat.find({ chatId }).sort({ sentAt: 1 });
  
      // Safe socket emit (never block HTTP response)
      setImmediate(() => {
        try {
          if (io && roomId) {
            io.to(roomId).emit('message', { messages });
            console.log("messages sent via socket");
          }
        } catch (err) {
          console.error("socket emit failed:", err);
        }
      });
  
      // Always respond to the HTTP client
      res.status(200).json({ messages });
  
    } catch (err) {
      console.error("getChat error:", err);
      res.status(500).json({ error: err.message });
    }
  };
  

  const newMessage = async ({ body }, io, connectedUsers) => {
    const { from, to, message, roomId } = body;
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
                console.log(`Message from ${from} to ${to} in room ${roomId}:`, message);

                const receiverEntry = [...connectedUsers.entries()].find(([_, user]) => user.username === to);
                const receiverSocketId = receiverEntry ? receiverEntry[0] : null;

                const roomSockets = io.sockets.adapter.rooms.get(roomId) || new Set();

                console.log('receiverSocketId', receiverSocketId, 'roomSockets', roomSockets)

                if (receiverSocketId && !roomSockets.has(receiverSocketId)) {
                    console.log('Receiver is NOT in the room, sending a direct message.');
                    io.to(receiverSocketId).emit('new_message', { status: 'message saved', newMessage });
                }

                // Send message to the room so sender also sees it
                io.to(roomId).emit('message', { status: 'message saved', newMessages: [...messages, newMessage] });

                // ✅ Send acknowledgment back to the sender
                // callback({ status: 'success', message: 'Message processed' });

            } else {
                console.error('Socket.IO is not initialized');
            }

            // res.send('successfully message saved')
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