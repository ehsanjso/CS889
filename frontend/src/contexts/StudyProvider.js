import React, { useContext, useState, useEffect, useCallback } from "react";
import * as R from "ramda";
import moment from "moment";
import { message } from "antd";
import axios from "axios";
import { useSocket } from "./SocketProvider";
import { host } from "../actions/consts/host";

const StudyContext = React.createContext();

export function useStudy() {
  return useContext(StudyContext);
}

export function StudyProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sec, setSec] = useState(0);

  const studyTime = 15 * 60;
  const remainingTime = studyTime - sec;

  let request = null;
  let start = undefined;
  const performAnimation = (timestamp) => {
    request = requestAnimationFrame(performAnimation);
    if (start === undefined) start = timestamp;
    const elapsed = timestamp - start;

    if (elapsed > 1000) {
      setSec((prevSec) => prevSec + 1);
      start = undefined;
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestAnimationFrame(performAnimation);
    } else {
      cancelAnimationFrame(request);
    }
    return () => cancelAnimationFrame(request);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const reminder = (text) => {
    message.warning(text);
  };

  useEffect(() => {
    if (remainingTime === 10 * 60) {
      reminder("10 min is remaining!");
    } else if (remainingTime === 5 * 60) {
      reminder("5 min is remaining!");
    } else if (remainingTime === 60) {
      reminder("Less than 1 min is remaining!");
    }
  }, [remainingTime]);

  const onFocus = () => {
    console.log("Tab is in focus");
  };

  const onBlur = () => {
    console.log("Tab is in blur");
    setIsPlaying(false);
    // TODO: add reason
  };

  useEffect(() => {
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    // Specify how to clean up after this effect:
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  });

  return (
    <StudyContext.Provider value={{ isPlaying, setIsPlaying }}>
      {children}
    </StudyContext.Provider>
  );
}
