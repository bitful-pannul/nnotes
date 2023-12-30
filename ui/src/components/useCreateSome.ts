import { useState } from 'react';
import { Note } from '../types';
import { APP_NAME } from '../App';

const useFolderFileCreation = (basePath: string, refreshData: () => void) => {
    const handleNewFolder = () => {
        const folderName = window.prompt("Enter the new folder name");
        if (folderName) {
            const newPath = `${basePath}/${folderName}`;
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
                // Refresh the data
                refreshData();
            });
        }
    };

    const handleNewFile = () => {
        const fileName = window.prompt("Enter the new file name");
        if (fileName) {
            const newPath = `${basePath}/${fileName}`;
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
                // Refresh the data
                refreshData();
            });
        }
    };

    return { handleNewFolder, handleNewFile };
};

export default useFolderFileCreation;