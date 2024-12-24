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

const newMessage = async (req, res, io) => {
    const { from, to, message, socketId } = req.body
    // const io = getIo();

    const names1 = { firstName: from, secondName: to };

    const chatId = generateBase64Id(names1);
    const newMessage = new models.chat({
        "chatId": chatId,
        "from": from,
        "message": message,
        "sent_at": new Date().toISOString(),
    })
    const chat = await models.chatList.find({ chatId: chatId })
    if (chat.length == 0) {
        const newChat = new models.chatList({
            chatId: chatId,
            participants: [from, to],
            lastMessage: {from: from, message:message},
            updatedAt: new Date().toISOString()
        })
        await newChat.save()
    }
    else {
        await models.chatList.findOneAndUpdate(
            { chatId: chatId },
            { lastMessage: message, updatedAt: new Date().toISOString() }
        )
    }

    const messages = await models.chat.find({ chatId: chatId }).sort({ sent_at: 1 })
    console.log('message documents array with chatId', messages)
    // if (messages.length == 0) {
    //     const newChat = new models.chat({
    //         chatId: chatId,
    //         messages: [newMessage]
    //     })
    //     await newChat.save()
    //         .then((res) => {
    //             if (io) {
    //                 // const socket = io.sockets.sockets.get(socketId);
    //                 // if (io) {
    //                 io.emit('message', { status: 'message saved', newMessages: newMessage });
    //                 // } else {
    //                 //     console.error(`Socket with ID ${socketId} not found`);
    //                 // }
    //             } else {
    //                 console.error('Socket.IO is not initialized');
    //             }
    //         })

    // }
    // else {
    //     let newmessages = [...messages[0].messages, newMessage]
    //     await models.chat.findOneAndUpdate(
    //         { chatId: chatId },
    //         { messages: newmessages }
    //     )
    //         .then((res) => {
    //             if (io) {
    //                 // const socket = io.sockets.sockets.get(socketId);

    //                 io.emit('message', { status: 'message saved', newMessages: newMessage });

    //             } else {
    //                 console.error('Socket.IO is not initialized');
    //             }
    //         })
    // }

    await newMessage.save()
    .then((resp) => {
        if (io) {
            // const socket = io.sockets.sockets.get(socketId);
            // if (io) {
            io.emit('message', { status: 'message saved', newMessages: [...messages, newMessage] });
            // } else {
            //     console.error(`Socket with ID ${socketId} not found`);
            // }
        } else {
            console.error('Socket.IO is not initialized');
        }
    }
)




}

const getChats = async (req, res, io)=>{
    const { username } = req.query;
    console.log('chatlist requested', username)

    const chatList = await models.chatList.find({participants:{$in:[username]}})
    res.send(chatList)
}


const messageHandler = {
    newMessage,
    getChats
}

module.exports = messageHandler;