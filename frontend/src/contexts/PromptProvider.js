import React, { useContext, useState, useEffect, useRef } from "react";
import * as R from "ramda";
import { message } from "antd";
import axios from "axios";
import { useSocket } from "./SocketProvider";
import { host } from "../actions/consts/host";

const PromptContext = React.createContext();

export function usePrompt() {
  return useContext(PromptContext);
}

export function PromptProvider({ children }) {
  const [activePrompt, setActivePrompt] = useState(undefined);
  const socket = useSocket();

  const updateText = (textObject) => {
    console.log("hi");
    console.log(textObject);
  };

  const updateGeneralNote = (noteObject) => {
    console.log(noteObject);
  };

  const updatePromptNote = (promptId, noteObject) => {
    console.log(noteObject, promptId);
  };

  const addPrompt = (prompt) => {
    console.log(prompt);
  };

  useEffect(() => {
    if (socket == null) return;

    socket.on("receive-prompt", addPrompt);

    return () => socket.off("receive-comment");
  }, [socket]);

  return (
    <PromptContext.Provider
      value={{
        activePrompt,
        setActivePrompt,
        updateText,
        updateGeneralNote,
        updatePromptNote,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}
