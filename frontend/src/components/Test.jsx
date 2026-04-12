import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Test = () => {
  const [testData, setTestData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const divRef = useRef(null);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await axios.get('/api/chat/test');
        setTestData(response.data.test);
      } catch (err) {
        console.error('Error fetching test data:', err);
        setError('Failed to fetch test data');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  const handleSave = async () => {
    if (!divRef.current) return;
    
    const newText = divRef.current.textContent.trim();
    if (newText === testData) return;

    setIsSaving(true);
    try {
      const response = await axios.put('/api/chat/test', { test: newText });
      setTestData(response.data.test);
    } catch (err) {
      console.error('Error updating test data:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h1>Editable Test Data</h1>
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning={true}
        style={{
          border: '1px solid #ced4da',
          borderRadius: '8px',
          padding: '16px',
          minHeight: '100px',
          marginBottom: '16px',
          outline: 'none',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px'
        }}
        onBlur={handleSave}
      >
        {testData}
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default Test;