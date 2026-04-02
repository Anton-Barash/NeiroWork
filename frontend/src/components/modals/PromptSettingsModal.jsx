import React from 'react';
import axios from 'axios';
import * as S from '../../App.styles';

const PromptSettingsModal = ({
  isOpen,
  onClose,
  promptSettings,
  setPromptSettings,
  useCustomPrompt,
  setUseCustomPrompt,
  customPrompt,
  setCustomPrompt,
  updateCustomPrompt,
  updatePromptSettings
}) => {
  if (!isOpen) return null;
  return (
    <S.CreateChatModal onClick={onClose}>
      <S.ModalContent onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '700px' }}>
        <S.ModalTitle>Настройки промпта анализа</S.ModalTitle>
        {/* Global Prompt */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#343a40' }}>
            Общий промт (для всех чатов):
          </label>
          <S.ModalTextarea
            value={promptSettings.dialog_analysis_prompt || ''}
            onChange={e => setPromptSettings({ ...promptSettings, dialog_analysis_prompt: e.target.value })}
            placeholder="Введите общий промт для анализа диалогов..."
            rows={4}
          />
        </div>
        {/* Checkbox */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="useCustomPrompt"
            checked={useCustomPrompt}
            onChange={e => setUseCustomPrompt(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="useCustomPrompt" style={{ fontSize: '14px', color: '#495057', cursor: 'pointer' }}>
            Использовать индивидуальный промт для этого чата
          </label>
        </div>
        {/* Individual Prompt */}
        {useCustomPrompt && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#667eea' }}>
              Индивидуальный промт (для этого чата):
            </label>
            <S.ModalTextarea
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Введите индивидуальный промт для этого чата..."
              rows={4}
            />
          </div>
        )}
        <S.ModalButtons>
          <S.CancelButton onClick={onClose}>
            Отмена
          </S.CancelButton>
          <S.ConfirmButton onClick={() => {
            updateCustomPrompt();
            if (!useCustomPrompt && promptSettings.dialog_analysis_prompt) {
              // Update the global prompt in ai_prompts table
              axios.put('/api/prompts/global_prompt', {
                name: 'global_prompt',
                prompt_text: promptSettings.dialog_analysis_prompt
              }).catch(err => console.error('Error updating global prompt:', err));
            } else {
              // Update the chat-specific prompt in chat_prompts_settings table
              updatePromptSettings();
            }
          }}>
            Сохранить
          </S.ConfirmButton>
        </S.ModalButtons>
      </S.ModalContent>
    </S.CreateChatModal>
  );
};

export default PromptSettingsModal;
