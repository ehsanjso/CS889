import React, { useContext, useEffect } from "react";
import * as R from "ramda";
import { useSocket } from "./SocketProvider";

const TrackContext = React.createContext();

export function useTrack() {
  return useContext(TrackContext);
}

export function TrackProvider({ user, children }) {
  const socket = useSocket();

  const trackEvent = (data) => {
    log({
      ...data,
      userId: user._id,
      userEmail: user.email,
      timestamp: Date.now(),
    });
  };

  const log = (data) => {
    const isInlogMode = R.propOr(false, "logData", user);
    if (isInlogMode) {
      socket.emit("log", data);
    }
  };

  return (
    <TrackContext.Provider value={{ trackEvent }}>
      {children}
    </TrackContext.Provider>
  );
}
