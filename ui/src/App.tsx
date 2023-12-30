// App.tsx
import React, { useState, useEffect } from 'react';
import Editor from './components/editor';
import FileTree from './components/filetree';
import { Note } from './types';

function App() {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNoteName, setNewNoteName] = useState<string>("");

  useEffect(() => {
    fetch(`/notenecs:notenecs:template.uq/notes${currentPath}`)
      .then(response => response.json())
      .then(data => setNotes(data.AllNotes.notes));
  }, [currentPath]);

  const handleNoteSelect = (note: Note) => {
    if (note.is_dir) {
      setCurrentPath(note.path);
    } else {
      setSelectedNote(note);
    }
  };

  const handleNewNote = () => {
    // TODO: Implement new note creation
  };

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div style={{ display: 'flex' }}>
      <nav className="nav">
        {pathParts.map((part, index) => (
          <a 
            href={pathParts.slice(0, index + 1).join('/')} 
            key={index} 
            onClick={(event) => {
              event.preventDefault();
              setCurrentPath(pathParts.slice(0, index + 1).join('/'));
            }}
          >
            {part.split('/').pop()}
          </a>
        ))}
        <input value={newNoteName} onChange={e => setNewNoteName(e.target.value)} />
        <button onClick={handleNewNote}>New</button>
      </nav>
      <div className="filetree">
        <FileTree notes={notes} onNoteSelect={handleNoteSelect} />
      </div>
      <div className="editor">
        {selectedNote && <Editor note={selectedNote} />}
      </div>
    </div>
  );
}

export default App;