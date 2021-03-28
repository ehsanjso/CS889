import React, { useContext, useState, useEffect, useCallback } from "react";
import * as R from "ramda";
import { message } from "antd";
import { Node } from "slate";
import axios from "axios";
import { useSocket } from "./SocketProvider";
import { host } from "../actions/consts/host";
import { useDispatch } from "react-redux";
import { changeFetchInProg } from "../actions/fetchInProgress";

const PromptContext = React.createContext();

export function usePrompt() {
  return useContext(PromptContext);
}

export function PromptProvider({ children, user }) {
  const socket = useSocket();
  const dispatch = useDispatch();

  const [activePrompt, setActivePrompt] = useState(undefined);
  const [prompts, setPrompts] = useState([]);
  const [textData, setTextData] = useState();
  const [generalNoteData, setGeneralNoteData] = useState();

  useEffect(() => {
    async function getText() {
      const { data } = await axios.get(`${host}/text/${user["_id"]}`);
      setTextData(JSON.parse(data[0].text));
    }
    getText();
  }, []);

  useEffect(() => {
    async function getPrompts() {
      const { data } = await axios.get(`${host}/prompts/${user["_id"]}`);
      setPrompts(data);
    }
    getPrompts();
  }, []);

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

  const changeLoading = (loadState) => {
    dispatch(changeFetchInProg(loadState));
  };

  const askForPrompt = () => {
    initiatePrompt();
  };

  useEffect(() => {
    if (socket == null) return;
    socket.on("receive-prompt", addPrompt);
    socket.on("change-loading", changeLoading);
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
    dispatch(changeFetchInProg(true));
    socket.emit("initiate-prompt", { text: serialize(textData) });
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

// Define a serializing function that takes a value and returns a string.
const serialize = (value) => {
  return (
    value
      // Return the string content of each paragraph in the value's children.
      .map((n) => Node.string(n))
      // Join them all with line breaks denoting paragraphs.
      .join("\n")
  );
};
