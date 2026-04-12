import React from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

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
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalBody = styled.div`
  padding: 24px;
  flex: 1;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  padding: 24px;
  border-top: 1px solid #dee2e6;
  background: white;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

const ModalTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #343a40;
`;

const CompanyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
`;

const CompanyItem = styled.div`
  padding: 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f9fa;

  &:hover {
    background: #e9ecef;
    border-color: #667eea;
  }
`;

const CompanyName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #212529;
`;

const CompanyDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #6c757d;
`;

const CurrentCompany = styled.div`
  padding: 16px;
  background: #d4edda;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
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

function CompanySelectorModal({ isOpen, onClose, onCreateCompanyClick, onJoinCompanyClick }) {
    const { user, company, setCompany } = useAuth();
    const [companies, setCompanies] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    
    // Filter companies based on search term
    const filteredCompanies = companies.filter(companyData => 
        companyData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (companyData.description && companyData.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    React.useEffect(() => {
        if (isOpen) {
            fetchCompanies();
        }
    }, [isOpen]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectCompany = async (companyData) => {
        try {
            setCompany(companyData);
            onClose();
        } catch (error) {
            console.error('Error selecting company:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalBody>
                    <ModalTitle>Выбор компании</ModalTitle>

                    {company && (
                        <CurrentCompany>
                            <CompanyName>Текущая компания: {company.name}</CompanyName>
                            {company.description && <CompanyDescription>{company.description}</CompanyDescription>}
                        </CurrentCompany>
                    )}

                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            fontSize: '14px',
                            margin: '10px 0 20px 0',
                            boxSizing: 'border-box'
                        }}
                    />

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка компаний...</div>
                    ) : (
                        <CompanyList>
                            {filteredCompanies.map((companyData) => (
                                <CompanyItem
                                    key={companyData.id}
                                    onClick={() => selectCompany(companyData)}
                                >
                                    <CompanyName>{companyData.name}</CompanyName>
                                    {companyData.description && <CompanyDescription>{companyData.description}</CompanyDescription>}
                                </CompanyItem>
                            ))}
                        </CompanyList>
                    )}
                </ModalBody>
                <ModalFooter>
                    <ModalButtons>
                        <Button onClick={onCreateCompanyClick} style={{ backgroundColor: '#28a745' }}>
                            New Company
                        </Button>
                        <Button onClick={onJoinCompanyClick} style={{ backgroundColor: '#17a2b8' }}>
                            Join Company
                        </Button>
                        <Button onClick={onClose} style={{ backgroundColor: '#6c757d' }}>
                            Закрыть
                        </Button>
                    </ModalButtons>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
}

export default CompanySelectorModal;