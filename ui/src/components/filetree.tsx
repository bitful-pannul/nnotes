// FileTree.tsx
import React from 'react';
import { Note } from '../types';

interface FileTreeProps {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ notes, onNoteSelect }) => {
  return (
    <div>
      {notes.map(note => (
        <div key={note.path} onClick={() => onNoteSelect(note)}>
          {note.path}
        </div>
      ))}
    </div>
  );
}

export default FileTree;