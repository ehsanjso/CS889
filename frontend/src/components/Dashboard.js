import React, { useState } from "react";
import Writing from "./Writing";
import Prompts from "./Prompts";
import { Drawer } from "antd";
import {
  FileTextOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import "../styles/components/dashboard.scss";

export const Dashboard = () => {
  const [visible, setVisible] = useState(false);

  const toggleDrawer = () => {
    setVisible((prevState) => !prevState);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <div className="dashboard">
      <Writing localStorageKey="cs889" />
      <Prompts />
      <Drawer
        title="Notes"
        placement="right"
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
        {visible ? <CaretRightOutlined /> : <CaretLeftOutlined />}
        <FileTextOutlined />
      </div>
    </div>
  );
};

export default Dashboard;
