import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import MenuComponent from './Menu';

Amplify.configure(outputs);

const Main: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('form');

  return (
    <React.StrictMode>
      <Authenticator>
        <MenuComponent setCurrentScreen={setCurrentScreen} />
        <App currentScreen={currentScreen} />
      </Authenticator>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Main />);
