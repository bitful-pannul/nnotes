// Item.tsx
import React, { useState, useEffect } from 'react';
import { TreeItem } from '@mui/x-tree-view';
import { Note } from '../types';
import { APP_NAME } from '../App';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/CreateNewFolder';
import FileIcon from '@mui/icons-material/InsertDriveFile';


interface ItemProps {
    note: Note;
    setCurrentEditorText: (note: Note) => void;
}

const Item: React.FC<ItemProps> = ({ note, setCurrentEditorText }) => {
    const [children, setChildren] = useState<Note[]>([]);

    useEffect(() => {
        if (note.is_dir) {
            fetch(`/${APP_NAME}/${note.path}`)
                .then(response => response.json())
                .then(data => {
                    setChildren(data.Notes.notes);
                });
        }
    }, [note]);

    const handleClick = () => {
        if (!note.is_dir) {
            fetch(`/${APP_NAME}/${note.path}`)
                .then(response => response.json())
                .then(data => {
                    // Replace the body of the note with the fetched text
                    const updatedNote = { ...note, body: data.Note.body };
                    setCurrentEditorText({ ...updatedNote });
                });
        }
    };

    const handleNewFolder = (event) => {
        event.stopPropagation();
        const folderName = window.prompt("Enter the new folder name");
        if (folderName) {
            const newPath = `${note.path}/${folderName}`;
            fetch(`/${APP_NAME}/${newPath}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    AddFolder: {
                        path: newPath,
                    },
                }),
            })
            .then(() => {
                // Refresh the children
                fetch(`/${APP_NAME}/${note.path}`)
                    .then(response => response.json())
                    .then(data => {
                        setChildren(data.Notes.notes);
                    });
            });
        }
    };

    const handleNewFile = (event) => {
        event.stopPropagation();
        const fileName = window.prompt("Enter the new file name");
        if (fileName) {
            const newPath = `${note.path}/${fileName}`;
            fetch(`/${APP_NAME}/${newPath}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    SaveNote: {
                        path: newPath,
                        body: '',
                    },
                }),
            })
            .then(() => {
                // Refresh the children
                fetch(`/${APP_NAME}/${note.path}`)
                    .then(response => response.json())
                    .then(data => {
                        setChildren(data.Notes.notes);
                    });
            });
        }
    };

    // Get the last part of the path
    const label = note.path.split('/').pop();
    return (
        <TreeItem nodeId={note.path} label={
            <div>
                {label}
                {note.is_dir && (
                    <>
                        <IconButton size="small" onClick={handleNewFolder}>
                            <FolderIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton size="small" onClick={handleNewFile}>
                            <FileIcon fontSize="inherit" />
                        </IconButton>
                    </>
                )}
            </div>
        } onClick={handleClick}>
            {children.map(childNote => (
                <Item key={childNote.path} note={childNote} setCurrentEditorText={setCurrentEditorText} />
            ))}
        </TreeItem>
    );
};

export default Item;