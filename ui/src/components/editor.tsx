// Editor.tsx
import React, { useState, useEffect } from 'react';
import { Note } from '../types';

interface EditorProps {
  note: Note;
}

const Editor: React.FC<EditorProps> = ({ note }) => {
  const [content, setContent] = useState<string>(note.body || '');

  useEffect(() => {
    setContent(note.body || '');
  }, [note]);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleSave = () => {
    fetch(note.path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: content }),
    });
  };

  return (
    <div>
      <h2>{note.path}</h2>
      <textarea value={content} onChange={handleContentChange} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default Editor;