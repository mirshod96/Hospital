import React, { useState, useEffect, useRef } from 'react';

export default function ChatPanel({ socket, playerInfo }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [activeChannel, setActiveChannel] = useState('Global');
  const chatBottomRef = useRef(null);

  // Channels to switch between
  const channels = ['Global', 'ER', 'ICU', 'Surgery', 'Direct'];

  useEffect(() => {
    socket.on('chatUpdate', (newMsgs) => {
      setMessages(newMsgs);
    });
    return () => socket.off('chatUpdate');
  }, [socket]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChannel]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    socket.emit('sendMessage', { text: inputVal.trim(), channel: activeChannel });
    setInputVal('');
  };

  const filteredMsgs = messages.filter(m => m.channel === activeChannel);

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '350px', flexShrink: 0 }}>
      {/* Channel Header */}
      <div style={{ borderBottom: '1px solid var(--glass-border)', padding: '1rem' }}>
        <h3 style={{ margin: 0 }}>Communications</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {channels.map(c => (
            <button 
              key={c}
              onClick={() => setActiveChannel(c)}
              style={{
                background: activeChannel === c ? 'var(--text-accent)' : 'transparent',
                color: activeChannel === c ? '#000' : 'var(--text-main)',
                border: '1px solid var(--glass-border)',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Message List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {filteredMsgs.map(msg => {
          const isMe = msg.senderName === playerInfo.name;
          return (
            <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textAlign: isMe ? 'right' : 'left' }}>
                {msg.senderName} ({msg.senderRole})
              </div>
              <div style={{ 
                background: isMe ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)', 
                border: `1px solid ${isMe ? 'rgba(56, 189, 248, 0.4)' : 'var(--glass-border)'}`,
                padding: '0.75rem', 
                borderRadius: '8px',
                borderTopRightRadius: isMe ? '2px' : '8px',
                borderTopLeftRadius: isMe ? '8px' : '2px',
                wordBreak: 'break-word',
                lineHeight: 1.4
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid var(--glass-border)', padding: '1rem' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            className="input-field" 
            placeholder={`Message ${activeChannel}...`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button type="submit" className="btn primary" style={{ minWidth: 'auto', padding: '0.75rem 1rem' }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
