import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import "./index.css";
import AppRouter from './App.router';

const Main: React.FC = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Main />);