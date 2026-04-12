import React, { memo } from 'react';
import * as S from '../App.styles';

const InputArea = memo(({ 
  newMessage, 
  setNewMessage, 
  uploadedFiles, 
  uploadedImages, 
  isLoading, 
  sendMessage, 
  handleImageUpload, 
  removeImage,
  formatFileSize 
}) => {
  return (
    <S.InputArea>
      <S.FileUploadArea>
        {
          uploadedFiles.map((file) => (
            <S.FileItem key={file.id}>
              <S.FileName>{file.filename}</S.FileName>
              <S.FileSize>
                {formatFileSize(file.size)}
              </S.FileSize>
            </S.FileItem>
          ))}
        {
          uploadedImages.map((image) => (
            <div key={image.id} style={{ position: 'relative', display: 'inline-block', margin: '5px' }}>
              <img src={image.url} alt={image.filename} style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
              <button
                onClick={() => removeImage(image.id)}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          ))}
      </S.FileUploadArea>
      <S.InputContainer>
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <label
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '1px solid #e0e0e0',
              backgroundColor: '#f8f9fa'
            }}
          >
            📷
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
          <S.MessageInput
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) =>
              e.key === 'Enter' && !e.shiftKey && sendMessage()
            }
          />
          <S.SendButton
            onClick={sendMessage}
            disabled={(!newMessage.trim() && uploadedImages.length === 0) || isLoading}
          >
            Send
          </S.SendButton>
        </div>
      </S.InputContainer>
    </S.InputArea>
  );
});

export default InputArea;
