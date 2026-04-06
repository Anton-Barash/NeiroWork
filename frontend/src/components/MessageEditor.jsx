import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const EditorTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  &:focus { border-color: #007bff; box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); }
`;

const EditorButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
`;

const CancelButton = styled(Button)`
  background: #6c757d;
  color: white;
  &:hover { background: #5a6268; }
`;

const SaveButton = styled(Button)`
  background: #007bff;
  color: white;
  &:hover { background: #0056b3; }
  &:disabled { background: #b6d4fe; cursor: not-allowed; }
`;

const CharCount = styled.span`
  font-size: 11px;
  color: #6c757d;
  text-align: right;
`;

const MessageEditor = ({ initialContent = '', onSave, onCancel, maxLength = 4000 }) => {
    const [content, setContent] = useState(initialContent);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, []);

    const handleSave = () => {
        if (content.trim() && content !== initialContent) {
            onSave?.(content);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave();
        if (e.key === 'Escape') onCancel?.();
    };

    return (
        <EditorContainer>
            <EditorTextarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
                onKeyDown={handleKeyDown}
                placeholder="Редактировать сообщение..."
            />
            <CharCount>{content.length} / {maxLength}</CharCount>
            <EditorButtons>
                <CancelButton onClick={onCancel}>Отмена</CancelButton>
                <SaveButton onClick={handleSave} disabled={!content.trim() || content === initialContent}>
                    Сохранить
                </SaveButton>
            </EditorButtons>
        </EditorContainer>
    );
};

export default MessageEditor;