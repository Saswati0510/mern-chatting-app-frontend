import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChartProvider'
import { Box, Text, IconButton, Spinner, useToast, FormControl, Input } from "@chakra-ui/react";
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../config/chatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import axios from 'axios';
import './styles.css'
import animationData from '../animations/6652-dote-typing-animation.json'
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client';
import Lottie from 'react-lottie';
const ENDPOINT = 'http://localhost:5000'
const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const toast = useToast()

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }

            }
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            console.log(data);
            setMessages(data);
            setLoading(false);
            socket.emit('join room', selectedChat._id)
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to load the messages of this chat",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
        }
    }
    const sendMessage = async (event) => {
        if (event.key === 'Enter' && newMessage) {
            socket.emit('stop typing', selectedChat._id);
            try {
                setLoading(true);
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`
                    }

                }
                setNewMessage("");
                const { data } = await axios.post('/api/message', { content: newMessage, chatId: selectedChat._id }, config);
                socket.emit('new message', data);
                setLoading(false);
                //console.log(data)
                setMessages([...messages, data])

            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });

            }
        }

    }
    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        //typing indicator logic
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);

    }

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (
                !selectedChatCompare || // if chat is not selected or doesn't match current chat
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });

    return (
        <>
            {
                selectedChat ? (
                    <>
                        <Text
                            fontSize={{ base: "28px", md: "30px" }}
                            pb={3}
                            px={2}
                            w="100%"
                            fontFamily="Work sans"
                            display="flex"
                            justifyContent={{ base: "space-between" }}
                            alignItems="center"
                        >
                            <IconButton
                                display={{ base: "flex", md: "none" }}
                                icon={<ArrowBackIcon />}
                                onClick={() => setSelectedChat("")}
                            />

                            {!selectedChat.isGroupChat ? (<>
                                {getSender(user, selectedChat.users)}
                                <ProfileModal
                                    user={getSenderFull(user, selectedChat.users)}
                                />
                            </>) : (
                                <>
                                    {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages}></UpdateGroupChatModal>
                                </>
                            )}
                        </Text>
                        <Box
                            display="flex"
                            flexDir="column"
                            justifyContent="flex-end"
                            p={3}
                            bg="#E8E8E8"
                            w="100%"
                            h="100%"
                            borderRadius="lg"
                            overflowY="hidden"
                        >
                            {loading ? (<Spinner size='xl' w={20} h={20} alignSelf='center' margin='auto'></Spinner>)
                                : (<div className='messages'>
                                    <ScrollableChat messages={messages}></ScrollableChat>
                                </div>)}

                            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                                {isTyping ? <div>
                                    <Lottie width={70} style={{ marginBottom: 15, marginLeft: 0 }} options={defaultOptions}></Lottie>
                                </div> : <></>}
                                <Input variant='filled' placeholder='enter a message...' bg='white' onChange={typingHandler} value={newMessage}>
                                </Input>
                            </FormControl>
                        </Box>
                    </>

                ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                        <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                            Click on a user to start chatting
                        </Text>
                    </Box >

                )
            }
        </>

    )
}

export default SingleChat