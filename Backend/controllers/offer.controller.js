import { User } from "../db/models/userSchema.js";
import Message from "../db/models/message.model.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUser}}).select("-password");
        res.status(200).json(filteredUsers);
    } catch(error) {
        console.log("Error in getusersForSidebar", error);
        res.status(500).json({error: "Internal server error"})
    }
}

export const getMessages = async (req, res) => {
    try {
        const {id: userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
              {senderId : myId, receiverId: userToChatId},
              {senderId : userToChatId, receiverId: myId}
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages : ", error.message);
        res.status(500).json({error: "Internal server error"})
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const newMessage = new Message({
            senderId,
            receiverId,
            message
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessages : ", error.message);
        res.status(500).json({error: "Internal server error"})
    }
}

export const handleSendOffer = async (req, res) => {
    try {
        const { offer } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const newOffer = new Message({
            senderId,
            receiverId,
            message: offer
        });

        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (error) {
        console.log("Error in handleSendOffer : ", error.message);
        res.status(500).json({error: "Internal server error"})
    }
}