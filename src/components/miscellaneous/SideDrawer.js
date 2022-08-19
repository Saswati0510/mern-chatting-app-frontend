import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../../context/ChartProvider';
import ChatLoading from '../ChatLoading';
import UserListItem from '../userAvatar/UserListItem';
import ProfileModal from './ProfileModal';
import { Spinner } from "@chakra-ui/spinner";
import { getSender } from '../../config/chatLogics';
import NotificationBadge from 'react-notification-badge/lib/components/NotificationBadge';
import { Effect } from 'react-notification-badge';

const SideDrawer = () => {

    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState("");
    const [loadingChat, setLoadingChat] = useState("");
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const {
        setSelectedChat,
        user,
        chats,
        setChats,
        notification,
        setNotification
    } = ChatState();


    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate('/');
    }
    const handleSearch = async () => {
        if (!search) {
            toast({
                title: 'please enter something to search',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left",

            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios(`/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResults(data);

        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });

        }
    }

    const accessChat = async (userId) => {
        //console.log(userId);

        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`/api/chat`, { userId }, config);

            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (error) {
            toast({
                title: "Error fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };


    return (
        <>
            <Box display='flex' justifyContent='space-between' alignItems='center' bg='white' w='100%' borderWidth='5px' p='5px 10px 5px 10px' >
                <Tooltip label='Search users to chat' hasArrow placement='bottom-end'>
                    <Button variant='ghost' onClick={onOpen}>
                        <i className="fas fa-search"></i>
                        <Text display={{ base: 'none', md: 'flex' }} px='4'>Search user</Text>
                    </Button>

                </Tooltip>
                <Text fontSize="2xl" fontFamily="Work sans">
                    Talk-A-Tive
                </Text>
                <div>

                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            />
                            <BellIcon fontSize='2xl' m={1}></BellIcon>
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No New Messages"}
                            {notification.map((notif) => (
                                <MenuItem
                                    key={notif._id}
                                    onClick={() => {
                                        setSelectedChat(notif.chat);
                                        setNotification(notification.filter((n) => n !== notif));
                                    }}
                                >
                                    {notif.chat.isGroupChat
                                        ? `New Message in ${notif.chat.chatName}`
                                        : `New Message from ${getSender(user, notif.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
                            <Avatar
                                size="sm"
                                cursor="pointer"
                                name={user.name}
                                src={user.pic}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>{" "}
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay>
                    <DrawerContent>
                        <DrawerHeader borderBottomWidth='1px'>
                            Search User
                        </DrawerHeader>
                        <DrawerBody>
                            <Box display='flex' pb={2}>
                                <Input
                                    placeholder='search by name or email'
                                    mr={2}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Button onClick={handleSearch}>Go</Button>
                            </Box>
                            {loading ? (<ChatLoading></ChatLoading>) : (
                                searchResults?.map((user) => (
                                    <UserListItem key={user._id} user={user} handleFunction={() => accessChat(user._id)}></UserListItem>
                                ))
                            )}
                            {loadingChat && <Spinner ml="auto" d="flex" />}
                        </DrawerBody>
                    </DrawerContent>

                </DrawerOverlay>

            </Drawer>
        </>
    )
}

export default SideDrawer