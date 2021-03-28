import React, { useState } from "react";
import { PromptProvider } from "../contexts/PromptProvider";
import { SocketProvider } from "../contexts/SocketProvider";
import { TrackProvider } from "../contexts/TrackProvider";
import { StudyProvider } from "../contexts/StudyProvider";
import { useSelector } from "react-redux";
import WritingDashboard from "./WritingDashboard";
import "../styles/components/dashboard.scss";

export const Dashboard = () => {
  const user = useSelector((state) => state.auth);

  return (
    <div className="dashboard">
      <SocketProvider user={user}>
        <StudyProvider user={user}>
          <TrackProvider user={user}>
            <PromptProvider user={user}>
              <WritingDashboard user={user} />
            </PromptProvider>
          </TrackProvider>
        </StudyProvider>
      </SocketProvider>
    </div>
  );
};

export default Dashboard;
