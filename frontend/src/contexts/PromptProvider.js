import React, { useContext, useState, useEffect } from "react";
import * as R from "ramda";
import { message } from "antd";
import axios from "axios";
import { useSocket } from "./SocketProvider";
import { host } from "../actions/consts/host";

const PromptContext = React.createContext();

export function usePrompt() {
  return useContext(PromptContext);
}

export function PromptProvider({ children, userId }) {
  const [activePrompt, setActivePrompt] = useState(undefined);
  const [textData, setTextData] = useState();
  const [generalNoteData, setGeneralNoteData] = useState();
  const socket = useSocket();

  useEffect(() => {
    if (socket == null) return;

    socket.on("receive-prompt", addPrompt);
  }, [socket]);

  const updateText = (textObject) => {
    setTextData(textObject);
    addText(textObject, generalNoteData);
  };

  const updateGeneralNote = (noteObject) => {
    setGeneralNoteData(noteObject);
  };

  const updatePromptNote = (noteObject) => {
    console.log("updatePromptNote");
    console.log(noteObject);
  };

  const addPrompt = (prompt) => {
    console.log(prompt);
  };

  const addText = (textObject, generalNoteData) => {
    socket.emit("update-text", {
      userId,
      textObject,
      generalNoteData,
    });
  };

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
