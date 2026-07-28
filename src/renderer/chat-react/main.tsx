import React from "react";
import ReactDOM from "react-dom/client";
import "../ui/tokens.css";
import "../ui/fonts.css";
import "../ui/base.css";
import "../ui/theme.css";
import "./styles/tokens.css";
import "./styles/components.css";
import { ChatApp } from "./components/ChatApp";

const root = document.getElementById("chat-react-root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ChatApp />
    </React.StrictMode>
  );
}
