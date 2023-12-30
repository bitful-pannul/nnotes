// Editor.tsx
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { APP_NAME } from '../App';

interface EditorProps {
  note: Note;
  isOpen: boolean;
}

const TextEditor: React.FC<EditorProps> = ({ note, isOpen }) => {
  const [text, setText] = useState(note.body || '');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    console.log('note: in editor', note);
    setText(note.body || '');
  }, [note]);

  const handleSave = () => {
    console.log("note path saving: ", note.path);

    fetch(`/${APP_NAME}/${note.path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        SaveNote: {
          path: note.path,
          body: text,
        },
      }),
    })
      .then(response => {
        if (response.status === 201) {
          setSaveMessage('saved!');
          setTimeout(() => setSaveMessage(''), 1000); 
        }
      })
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div>
      <textarea value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleSave}>Save</button>
      {saveMessage && <p>{saveMessage}</p>}
    </div>
  );
};

export default TextEditor;