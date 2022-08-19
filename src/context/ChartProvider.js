import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [user, setUser] = useState();
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState();
    const [notification, setNotification] = useState([]);

    //const [notification, setNotification] = useState([]);
    const [chats, setChats] = useState([]);
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);
        if (!userInfo) {
            navigate('/');
        }
    }, [navigate])

    return (
        <ChatContext.Provider value={{
            selectedChat,
            setSelectedChat,
            user,
            setUser,
            chats,
            setChats,
            notification,
            setNotification
        }}>{children}</ChatContext.Provider>
    )
}

export default ChatProvider;


export const ChatState = () => {
    return useContext(ChatContext);
}