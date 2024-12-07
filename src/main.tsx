import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter as Router } from 'react-router-dom';
import "./index.css";
import '@aws-amplify/ui-react/styles.css';
import MenuComponent from './Menu';

const Main: React.FC = () => {
  return (
    <React.StrictMode>
      <Router>
        <Authenticator>
          <MenuComponent />
        </Authenticator>
      </Router>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Main />);