import React, { useContext, useState, useEffect, useCallback } from "react";
import * as R from "ramda";
import { message } from "antd";
import { Node } from "slate";
import axios from "axios";
import { useSocket } from "./SocketProvider";
import { useTrack } from "./TrackProvider";
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
  const { trackEvent } = useTrack();

  const [activePrompt, setActivePrompt] = useState(undefined);
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [textData, setTextData] = useState();
  const [generalNoteData, setGeneralNoteData] = useState();
  const [initiated, setInitiated] = useState(false);

  useEffect(() => {
    async function getData() {
      dispatch(changeFetchInProg(true));

      const textRes = await axios.get(`${host}/text/${user["_id"]}`);
      const text = textRes.data[0].text
        ? JSON.parse(textRes.data[0].text)
        : undefined;
      const generalNote = textRes.data[0].note
        ? JSON.parse(textRes.data[0].note)
        : undefined;
      setTextData(text);
      setGeneralNoteData(generalNote);
      const promptRes = await axios.get(`${host}/prompts/${user["_id"]}`);
      const finalData = promptRes.data.map((el) => {
        const note = el.note ? JSON.parse(el.note) : undefined;
        return {
          ...el,
          note,
        };
      });
      setPrompts(finalData);
      dispatch(changeFetchInProg(false));
      setInitiated(true);
    }
    getData();
  }, []);

  useEffect(() => {
    setFilteredPrompts(filterPrompts(prompts, textData));
  }, [prompts, textData]);

  const filterPrompts = (prompts, textData) => {
    return prompts.filter((el) => {
      const isInText = serialize(textData).includes(el.character);
      return isInText;
    });
  };

  const updateText = (textObject) => {
    setTextData(textObject);
    addText(textObject, generalNoteData);
    const text = serialize(textObject);
    trackEvent({
      text: text,
      wordCount: text.split(" ").length,
      section: "main-text",
    });
  };

  const updateGeneralNote = (noteObject) => {
    setGeneralNoteData(noteObject);
    const text = serialize(noteObject);
    trackEvent({
      text: text,
      wordCount: text.split(" ").length,
      section: "note-text",
    });
  };

  const updatePromptNote = (noteObject, localStorageKey, promptId) => {
    socket.emit("update-prompt-note", {
      noteObject,
      promptId,
    });
    const text = serialize(noteObject);
    trackEvent({
      text: text,
      wordCount: text.split(" ").length,
      section: "prompot-note-text",
      promptId,
    });
  };

  const updatePromptFeedback = (hasStar, promptId) => {
    socket.emit("update-prompt-feedback", {
      hasStar,
      promptId,
    });
    trackEvent({
      promptId,
      section: "prompt-feedback",
      value: hasStar,
    });
  };

  const addPrompt = (prompt) => {
    setPrompts((prevPrompts) => {
      const prompts = prevPrompts ? [...prevPrompts] : [];
      prompts.push(prompt);
      return prompts;
    });
  };

  const updatePrompt = (prompt) => {
    setPrompts((prevPrompt) => {
      return prevPrompt.map((el) => {
        if (el["_id"] === prompt["_id"]) {
          const note = prompt.note ? JSON.parse(prompt.note) : undefined;
          return { ...prompt, note };
        }
        return el;
      });
    });
  };

  const changeLoading = (loadState) => {
    dispatch(changeFetchInProg(loadState));
  };

  const askForPrompt = () => {
    initiatePrompt();
    const text = serialize(textData);
    trackEvent({
      text: text,
      wordCount: text.split(" ").length,
      section: "ask-prompt",
    });
  };

  useEffect(() => {
    if (socket == null) return;
    socket.on("receive-prompt", addPrompt);
    socket.on("change-loading", changeLoading);
    socket.on("update-prompt", updatePrompt);
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
    socket.emit("initiate-prompt", {
      text: serialize(textData),
      userId: user._id,
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
        askForPrompt,
        prompts,
        filteredPrompts,
        updatePromptFeedback,
        textData,
        generalNoteData,
        initiated,
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
