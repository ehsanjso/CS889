import React, { useContext, useState, useEffect, useCallback } from "react";
import * as R from "ramda";
import { message } from "antd";
import axios from "axios";
import { useSocket } from "./SocketProvider";
import { host } from "../actions/consts/host";

const PromptContext = React.createContext();

export function usePrompt() {
  return useContext(PromptContext);
}

export function PromptProvider({ children, user }) {
  const [activePrompt, setActivePrompt] = useState(undefined);
  const [prompts, setPrompts] = useState([]);
  const [textData, setTextData] = useState();
  const [generalNoteData, setGeneralNoteData] = useState();
  const socket = useSocket();

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
    setPrompts((prevPrompts) => {
      const prompts = prevPrompts ? [...prevPrompts] : [];
      prompts.push(prompt);
      return prompts;
    });
  };

  const askForPrompt = () => {
    initiatePrompt();
  };

  useEffect(() => {
    if (socket == null) return;
    socket.on("receive-prompt", addPrompt);
    return () => socket.off("receive-prompt");
  }, [socket]);

  const addText = (textObject, generalNoteData) => {
    socket.emit("update-text", {
      userId: user._id,
      textObject,
      generalNoteData,
    });
  };

  const initiatePrompt = () => {
    socket.emit("initiate-prompt", {});
  };

  return (
    <PromptContext.Provider
      value={{
        activePrompt,
        setActivePrompt,
        updateText,
        updateGeneralNote,
        updatePromptNote,
        askForPrompt,
        prompts,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}
