import React from 'react';
import {createRoot} from 'react-dom/client';
import Classroom from './app/classroom';
import './app/globals.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Classroom/></React.StrictMode>);
