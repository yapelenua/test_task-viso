import React from 'react';
import {MapComponent} from './pages/MapComponent';
import './App.css';
export const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Map App!</h1>
      <MapComponent />
    </div>
  );
};

