import { useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';

export function useAnalysis() {
    const [analysis, setAnalysis] = useState(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [showCustomPromptSettings, setShowCustomPromptSettings] = useState(false);
    const [promptSettings, setPromptSettings] = useState({
        dialog_analysis_prompt: '',
        system_prompt: '',
        default_dialog_analysis_prompt: '',
        default_system_prompt: ''
    });
    const [showAdvancedPromptSettings, setShowAdvancedPromptSettings] = useState(false);
    const [globalPrompts, setGlobalPrompts] = useState({
        dialog_analysis: '',
        global_prompt: '',
        system_settings: ''
    });
    const [showGlobalPromptSettings, setShowGlobalPromptSettings] = useState(false);

    // Auto-fetch global prompts on initialization
    useEffect(() => {
        console.log('useAnalysis hook initialized, calling fetchGlobalPrompts');
        fetchGlobalPrompts();
    }, []);

    const fetchGlobalPrompts = useCallback(async () => {
        console.log('fetchGlobalPrompts function called');
        try {
            const response = await api.getGlobalPrompts();
            console.log('API /api/prompts response:', response.data);
            // Transform the response to match our expected structure
            const promptsData = {};
            response.data.forEach(prompt => {
                promptsData[prompt.name] = prompt.prompt_text;
            });

            // Set the global prompts with the received data
            setGlobalPrompts(prev => ({
                ...prev,
                ...promptsData,
                // Ensure we have default values if specific prompts aren't found
                dialog_analysis: promptsData.dialog_analysis || prev.dialog_analysis,
                global_prompt: promptsData.global_prompt || prev.global_prompt,
                system_settings: promptsData.neiro_work || prev.system_settings
            }));
        } catch (err) {
            console.error('Error fetching global prompts:', err);
        }
    }, []);

    const updateGlobalPrompt = useCallback(async (promptType, promptValue) => {
        try {
            await api.updateGlobalPrompt(promptType, promptValue);
            // Update local state
            setGlobalPrompts(prev => ({
                ...prev,
                [promptType]: promptValue
            }));
        } catch (err) {
            console.error('Error updating global prompt:', err);
        }
    }, []);

    const fetchAnalysis = useCallback(async (chatId) => {
        try {
            const response = await api.getAnalysis(chatId);
            if (response.data.analysis_text) {
                setAnalysis(response.data.analysis_text);
            }
        } catch (err) {
            console.error('Error fetching analysis:', err);
        }
    }, []);

    const analyzeChat = useCallback(async (chatId) => {
        setAnalysisLoading(true);
        try {
            const response = await api.analyzeChat(chatId);
            if (response.data && response.data.analysis) {
                setAnalysis(response.data.analysis);
                setShowAnalysis(true);
            }
        } catch (err) {
            console.error('Error analyzing chat:', err);
        } finally {
            setAnalysisLoading(false);
        }
    }, []);

    const fetchCustomPrompt = useCallback(async (chatId) => {
        try {
            const response = await api.getCustomPrompt(chatId);
            setCustomPrompt(response.data.custom_prompt || '');
        } catch (err) {
            console.error('Error fetching custom prompt:', err);
        }
    }, []);

    const updateCustomPrompt = useCallback(async (chatId) => {
        try {
            await api.updateCustomPrompt(chatId, customPrompt);
            setShowCustomPromptSettings(false);
        } catch (err) {
            console.error('Error updating custom prompt:', err);
        }
    }, [customPrompt]);

    const fetchPromptSettings = useCallback(async (chatId) => {
        try {
            const response = await api.getPromptSettings(chatId);
            setPromptSettings(response.data);
        } catch (err) {
            console.error('Error fetching prompt settings:', err);
        }
    }, []);

    const updatePromptSettings = useCallback(async (chatId) => {
        try {
            await api.updatePromptSettings(chatId, {
                dialog_analysis_prompt: promptSettings.dialog_analysis_prompt,
                neirowork_prompt: promptSettings.chat_specific_system_settings
            });
            setShowAdvancedPromptSettings(false);
        } catch (err) {
            console.error('Error updating prompt settings:', err);
        }
    }, [promptSettings]);

    return {
        analysis,
        setAnalysis,
        showAnalysis,
        setShowAnalysis,
        analysisLoading,
        customPrompt,
        setCustomPrompt,
        showCustomPromptSettings,
        setShowCustomPromptSettings,
        promptSettings,
        setPromptSettings,
        showAdvancedPromptSettings,
        setShowAdvancedPromptSettings,
        fetchAnalysis,
        analyzeChat,
        fetchCustomPrompt,
        updateCustomPrompt,
        fetchPromptSettings,
        updatePromptSettings,
        globalPrompts,
        fetchGlobalPrompts,
        updateGlobalPrompt,
        showGlobalPromptSettings,
        setShowGlobalPromptSettings
    };
}