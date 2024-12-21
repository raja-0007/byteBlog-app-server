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
    const newMessage = {
        "from": from,
        "message": message,
        "sent_at": new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false }),
        "date": new Date().toLocaleDateString('en-US', { day: 'numeric', year: 'numeric', month: 'short' })

    }
    const messages = await models.chat.find({ chatId: chatId })
    console.log('message documents array with chatId', messages)
    if (messages.length == 0) {
        const newChat = new models.chat({
            chatId: chatId,
            messages: [newMessage]
        })
        await newChat.save()
            .then((res) => {
                if (io) {
                    // const socket = io.sockets.sockets.get(socketId);
                    // if (io) {
                        io.emit('message', { status: 'message saved', newMessages: newMessage });
                    // } else {
                    //     console.error(`Socket with ID ${socketId} not found`);
                    // }
                } else {
                    console.error('Socket.IO is not initialized');
                }
            })

    }
    else {
        let newmessages = [...messages[0].messages, newMessage]
        await models.chat.findOneAndUpdate(
            { chatId: chatId },
            { messages: newmessages }
        )
            .then((res) => {
                if (io) {
                    // const socket = io.sockets.sockets.get(socketId);

                    io.emit('message', { status: 'message saved', newMessages: newMessage });

                } else {
                    console.error('Socket.IO is not initialized');
                }
            })
    }


}


const messageHandler = {
    newMessage
}

module.exports = messageHandler;