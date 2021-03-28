import React, { useState } from "react";
import Writing from "./Writing";
import Prompts from "./Prompts";
import Loading from "./Loading";
import { Drawer } from "antd";
import {
  FileTextOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { PromptProvider } from "../contexts/PromptProvider";
import { SocketProvider } from "../contexts/SocketProvider";
import { TrackProvider } from "../contexts/TrackProvider";
import { StudyProvider } from "../contexts/StudyProvider";
import { useSelector } from "react-redux";
import StudyToolbar from "./StudyToolbar";
import "../styles/components/dashboard.scss";

export const Dashboard = () => {
  const [visible, setVisible] = useState(false);
  const user = useSelector((state) => state.auth);
  const fetchInProgress = useSelector((state) => state.fetchInProgress);

  const toggleDrawer = () => {
    setVisible((prevState) => !prevState);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <div className="dashboard">
      <SocketProvider user={user}>
        <StudyProvider user={user}>
          <TrackProvider user={user}>
            <PromptProvider user={user}>
              <Writing localStorageKey="cs889" />
              <Prompts />
              <Drawer
                title="Notes"
                className="note-drawer"
                placement="left"
                closable={true}
                onClose={onClose}
                visible={visible}
                mask={false}
                width={500}
              >
                <Writing noToolbar={true} localStorageKey="cs889-notes" />
              </Drawer>
              <div
                className={`note-btn ${visible ? "active" : ""}`}
                onClick={toggleDrawer}
              >
                {visible ? <CaretLeftOutlined /> : <CaretRightOutlined />}
                <FileTextOutlined />
              </div>

              {user.studyMode && <StudyToolbar />}
              {fetchInProgress && <Loading />}
            </PromptProvider>
          </TrackProvider>
        </StudyProvider>
      </SocketProvider>
    </div>
  );
};

export default Dashboard;
