import React, { useState } from "react";
import StudyToolbar from "./StudyToolbar";
import Writing from "./Writing";
import Prompts from "./Prompts";
import Loading from "./Loading";
import { Drawer } from "antd";
import {
  FileTextOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { usePrompt } from "../contexts/PromptProvider";

export default function WritingDashboard({ user }) {
  const [visible, setVisible] = useState(false);
  const fetchInProgress = useSelector((state) => state.fetchInProgress);
  const { textData, generalNoteData, initiated } = usePrompt();

  const toggleDrawer = () => {
    setVisible((prevState) => !prevState);
  };
  const onClose = () => {
    setVisible(false);
  };
  return (
    <>
      {initiated && (
        <>
          <Writing storageKey="cs889" text={textData} />
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
            <Writing
              noToolbar={true}
              storageKey="cs889-notes"
              text={generalNoteData}
            />
          </Drawer>
          <div
            className={`note-btn ${visible ? "active" : ""}`}
            onClick={toggleDrawer}
          >
            {visible ? <CaretLeftOutlined /> : <CaretRightOutlined />}
            <FileTextOutlined />
          </div>
        </>
      )}

      {user.studyMode && <StudyToolbar />}
      {fetchInProgress && <Loading />}
    </>
  );
}
