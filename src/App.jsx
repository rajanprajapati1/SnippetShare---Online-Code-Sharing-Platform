import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import ChatOptions from './components/ChatOptions';

const socket = io('wss://snippet-share-backend.vercel.app'); // Using wss:// for secure WebSocket connection
const generateSessionId = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export default function App() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [deletedSessionsCount, setDeletedSessionsCount] = useState(0);

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('sessionId');
    if (!sessionId) {
      const newSessionId = generateSessionId(); 
      navigate(`/?sessionId=${newSessionId}`); 
    }
  
    const fetchSessionData = async () => {
      try {
        console.log('Fetching session data...');
        const res = await fetch(`https://snippet-share-backend.vercel.app/api/v1/session/${sessionId}`);
        if (!res.ok) throw new Error('Session not found');
        const data = await res.json();
        console.log('Session data:', data);
        setCode(data.code || '');
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSessionData()
    

    return () => {
      socket.off('receiveCodeChange'); 
    };
  }, [location, navigate]);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedHandleEditorChange = useCallback(debounce(async (value) => {
    setCode(value);
    socket.emit('codeChange', value);
    
    try {
      const sessionId = new URLSearchParams(location.search).get('sessionId');
      const response = await fetch(`https://snippet-share-backend.vercel.app/api/v1/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, code: value }),
      });
      
      if (!response.ok) {
        throw new Error('Error saving session');
      }
      const data = await response.json();
      console.log('Session saved:', data);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }, 300), [location]);

  const handleEditorChange = (value) => {
    debouncedHandleEditorChange(value);
  };

  useEffect(() => {
    socket.on('receiveCodeChange', (newCode) => {
      console.log('Received new code:', newCode);
      setCode(newCode);
    });

    socket.on('sessionDeleted', (count) => {
      setDeletedSessionsCount(count);
      window.location.reload();
      // alert(`${count} session(s) were deleted.`); 
      // window.location.reload();
    });
    return () => {
      socket.off('receiveCodeChange');
      socket.off('sessionDeleted'); 
    };
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
  
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div className='container'>
      <ChatOptions/>
       {deletedSessionsCount > 0 && (
        <div>
          <p>{deletedSessionsCount} session(s) deleted.</p>
        </div>
      )}
      <CodeEditor code={code} onChange={handleEditorChange}/>
    </div> 
  );
}
