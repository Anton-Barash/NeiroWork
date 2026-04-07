import React from 'react';
import * as S from '../App.styles';

const FilesList = React.memo(({ files, deleteFile, formatFileSize }) => {
  if (files.length === 0) return null;

  return (
    <S.FilesListContainer>
      <S.FilesTitle>Files</S.FilesTitle>
      {
        files.map((file) => (
          <S.FileItem key={file.id}>
            <S.FileName>{file.filename}</S.FileName>
            <S.FileSize>
              {formatFileSize(file.size)}
            </S.FileSize>
            <S.RemoveFileButton
              onClick={() => deleteFile(file.id)}
            >
              ×
            </S.RemoveFileButton>
          </S.FileItem>
        ))}
    </S.FilesListContainer>
  );
});

export default FilesList;
