import React from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import { useChatContext } from '../../context/ChatContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #343a40;
`;

const Description = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6c757d;
  line-height: 1.5;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;

  &:hover {
    background: #e9ecef;
  }
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }
`;

function PromptSettingsModal({ isOpen, onClose }) {
  const { customPrompt, setCustomPrompt, updateCustomPrompt, currentChat, globalPrompts, fetchGlobalPrompts, updateGlobalPrompt } = useChatContext();
  const [promptSettings, setPromptSettings] = React.useState({
    dialog_analysis_prompt: globalPrompts.dialog_analysis || ''
  });
  const [localCustomPrompt, setLocalCustomPrompt] = React.useState(customPrompt);
  const [useCustomPrompt, setUseCustomPrompt] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetchGlobalPrompts();
      setLocalCustomPrompt(customPrompt || '');
      setPromptSettings({
        dialog_analysis_prompt: globalPrompts.dialog_analysis || ''
      });
    }
  }, [isOpen, customPrompt, globalPrompts, fetchGlobalPrompts]);

  if (!isOpen || !currentChat) return null;

  const handleSave = async () => {
    if (!useCustomPrompt && promptSettings.dialog_analysis_prompt) {
      // Update the global prompt in ai_prompts table
      try {
        await updateGlobalPrompt('dialog_analysis', promptSettings.dialog_analysis_prompt);
      } catch (error) {
        console.error('Error updating global prompt:', error);
      }
    } else {
      // Update the chat-specific prompt in chat_custom_prompts table
      setCustomPrompt(localCustomPrompt);
      await updateCustomPrompt();
    }
    onClose();
  };

  // Additional function to update prompt settings
  const updatePromptSettings = async () => {
    try {
      await axios.put(`/api/chat/${currentChat.id}/prompt-settings`, {
        dialog_analysis_prompt: promptSettings.dialog_analysis_prompt,
        neirowork_prompt: promptSettings.neirowork_prompt
      });
    } catch (error) {
      console.error('Error updating prompt settings:', error);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Настройки промпта</ModalTitle>

        {/* Global Prompt Section */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px', color: '#343a40' }}>
            <input
              type="checkbox"
              checked={useGlobalPrompt}
              onChange={(e) => setUseGlobalPrompt(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Использовать общий промт (для всех чатов)
          </label>

          {useGlobalPrompt && (
            <ModalTextarea
              value={globalPromptValue}
              onChange={(e) => setGlobalPromptValue(e.target.value)}
              placeholder="Введите общий промт для всех чатов..."
              rows={4}
            />
          )}
        </div>

        {/* Custom Prompt Section */}
        {!useGlobalPrompt && (
          <>
            <Description>
              Добавьте дополнительные инструкции к стандартному промпту анализа.
            </Description>
            <ModalTextarea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              placeholder="Введите дополнительные инструкции..."
            />
          </>
        )}

        <ModalButtons>
          <CancelButton onClick={onClose}>Отмена</CancelButton>
          <SaveButton onClick={handleSave}>Сохранить</SaveButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
}

export default PromptSettingsModal;