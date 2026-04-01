import { useState, useCallback } from 'react';
import * as api from '../services/api';

export function useChats() {
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchChats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.getChats();
            setChats(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createChat = useCallback(async (topic) => {
        try {
            const response = await api.createChat(topic);
            setChats(prev => [response.data, ...prev]);
            setCurrentChat(response.data);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteChat = useCallback(async (chatId) => {
        try {
            await api.deleteChat(chatId);
            setChats(prev => prev.filter(c => c.id !== chatId));
            if (currentChat?.id === chatId) {
                setCurrentChat(null);
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [currentChat]);

    const selectChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    const clearCurrentChat = useCallback(() => {
        setCurrentChat(null);
    }, []);

    return {
        chats,
        currentChat,
        isLoading,
        error,
        fetchChats,
        createChat,
        deleteChat,
        selectChat,
        clearCurrentChat
    };
}