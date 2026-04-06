import React from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';

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
  max-width: 400px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #343a40;
  text-align: center;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
`;

const LoginButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  width: 100%;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
  padding: 10px;
  background: #f8d7da;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
`;

function LoginModal({ isOpen, onClose }) {
    const { login, loading } = useAuth();
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    if (!isOpen) return null;

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setError('Введите имя пользователя и пароль');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await login(username.trim(), password.trim());
            if (result.success) {
                onClose();
            } else {
                setError(result.error || 'Ошибка входа');
            }
        } catch (err) {
            setError('Ошибка при входе');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Вход в систему</ModalTitle>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#343a40' }}>
                        Имя пользователя:
                    </label>
                    <ModalInput
                        type="text"
                        placeholder="Введите имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoFocus
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#343a40' }}>
                        Пароль:
                    </label>
                    <ModalInput
                        type="password"
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                </div>
                <ModalButtons>
                    <LoginButton
                        onClick={handleLogin}
                        disabled={isLoading || !username.trim() || !password.trim()}
                    >
                        {isLoading ? 'Вход...' : 'Войти'}
                    </LoginButton>
                </ModalButtons>
            </ModalContent>
        </ModalOverlay>
    );
}

export default LoginModal;