// App.tsx
import { useState, useEffect } from 'react';
import Editor from './components/editor';
import Item from './components/Item';
import { TreeItem, TreeView } from '@mui/x-tree-view';
import { Note } from './types';

export const APP_NAME = "nnotes:nnotes:template.uq"

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const rootNote: Note = {
    path: 'notes',
    is_dir: true,
    body: '',
  };

  return (
    <div className="app">
      <h2>nnotes, edit files in your app drive</h2>
      <div className="treeview">
        <TreeView defaultExpanded={['/notes']}>
          <Item key={rootNote.path} note={rootNote} setCurrentEditorText={setCurrentNote} />
        </TreeView>
      </div>
      <div className="editor">
        {currentNote && (
          <Editor note={currentNote} isOpen={!!currentNote} />
        )}
      </div>
    </div>
  );
}
export default App;