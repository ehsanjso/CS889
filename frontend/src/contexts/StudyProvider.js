import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import * as R from "ramda";
import moment from "moment";
import { message } from "antd";
import axios from "axios";
import { useSocket } from "./SocketProvider";
import { host } from "../actions/consts/host";
import { useDispatch } from "react-redux";

const StudyContext = React.createContext();

export function useStudy() {
  return useContext(StudyContext);
}

export function StudyProvider({ children, user }) {
  const dispatch = useDispatch();
  const socket = useSocket();

  const [isPlaying, setIsPlaying] = useState(false);
  const [studyDone, setStudyDone] = useState(user.isStudyDone);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauses, setPauses] = useState(user.pauses);
  const [sec, setSec] = useState(user.studyTime);
  const didMountRef = useRef(false);

  const studyTimeLength = 15 * 60;
  const remainingTime = studyTimeLength - sec;

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
    if (didMountRef.current) {
      if (isPlaying) {
        requestAnimationFrame(performAnimation);
      } else {
        cancelAnimationFrame(request);
        setShowPauseModal(true);
        updateStudyTime(sec);
      }
    } else {
      didMountRef.current = true;
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

    if (remainingTime < 0) {
      setStudyDone(true);
      updateStudyTime(studyTimeLength - remainingTime);
      updateStudyDone(true);
    }
  }, [remainingTime, dispatch, studyTimeLength]);

  const setStudyPause = (reason) => {
    updatePauses({ studyTime: sec, reason });
    setPauses((prevPauses) => {
      const finalPauses = prevPauses ? [...prevPauses] : [];
      finalPauses.push({ studyTime: sec, reason });
      return finalPauses;
    });
  };

  const onFocus = () => {};

  const onBlur = () => {
    setIsPlaying(false);
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

  useEffect(() => {
    if (socket == null) return;
    socket.on("update-user", updateUser);
    return () => socket.off("update-user");
  }, [socket]);

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", userData });
  };

  const updateStudyTime = (studyTime) => {
    socket.emit("update-study-time", {
      userId: user._id,
      studyTime,
    });
  };

  const updateStudyDone = (isStudyDone) => {
    socket.emit("update-study-done", {
      userId: user._id,
      isStudyDone,
    });
  };

  const updatePauses = (pause) => {
    socket.emit("update-pauses", {
      userId: user._id,
      pause,
    });
  };

  return (
    <StudyContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        showPauseModal,
        setShowPauseModal,
        studyDone,
        setStudyPause,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}
