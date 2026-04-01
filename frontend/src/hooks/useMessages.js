import { useState, useCallback, useRef } from 'react';
import * as api from '../services/api';

export function useMessages() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [files, setFiles] = useState([]);
    const messagesEndRef = useRef(null);

    const fetchMessages = useCallback(async (chatId) => {
        try {
            const response = await api.getMessages(chatId);
            setMessages(response.data);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }, []);

    const sendMessage = useCallback(async (chatId) => {
        if (!newMessage.trim() && uploadedImages.length === 0) return;

        setIsSending(true);
        try {
            const response = await api.sendMessage(
                chatId,
                newMessage,
                uploadedImages.map(img => ({ url: img.url }))
            );

            setMessages(prev => [...prev, response.data.userMessage]);
            setNewMessage('');
            setUploadedFiles([]);
            setUploadedImages([]);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setIsSending(false);
        }
    }, [newMessage, uploadedImages]);

    const fetchFiles = useCallback(async (chatId) => {
        try {
            const response = await api.getFiles(chatId);
            setFiles(response.data);
        } catch (err) {
            console.error('Error fetching files:', err);
        }
    }, []);

    const handleFileUpload = useCallback(async (file, chatId) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.uploadFile(formData, chatId);
            setFiles(prev => [response.data, ...prev]);
            setUploadedFiles(prev => [...prev, response.data]);
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    }, []);

    const handleImageUpload = useCallback(async (file, chatId) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.uploadFile(formData, chatId);
            const imageUrl = `${window.location.origin}${response.data.filepath}`;
            setUploadedImages(prev => [...prev, {
                id: response.data.id,
                url: imageUrl,
                filename: response.data.filename
            }]);
        } catch (err) {
            console.error('Error uploading image:', err);
        }
    }, []);

    const removeImage = useCallback((imageId) => {
        setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    }, []);

    const deleteFile = useCallback(async (fileId) => {
        try {
            await api.deleteFile(fileId);
            setFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (err) {
            console.error('Error deleting file:', err);
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setUploadedFiles([]);
        setUploadedImages([]);
    }, []);

    return {
        messages,
        newMessage,
        setNewMessage,
        isSending,
        uploadedFiles,
        uploadedImages,
        files,
        messagesEndRef,
        fetchMessages,
        sendMessage,
        fetchFiles,
        handleFileUpload,
        handleImageUpload,
        removeImage,
        deleteFile,
        clearMessages
    };
}