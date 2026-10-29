import React from 'react';
import {restoreInterfaceTheme} from './lib/interface-theme';
import {createRoot} from 'react-dom/client';
import Classroom from './app/classroom';
import './app/globals.css';
restoreInterfaceTheme();
createRoot(document.getElementById('root')!).render(<React.StrictMode><Classroom/></React.StrictMode>);
