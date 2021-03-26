import React from "react";
import { Button } from "antd";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import { useStudy } from "../contexts/StudyProvider";
import "../styles/components/study-toolbar.scss";

export default function StudyToolbar() {
  const { isPlaying, setIsPlaying } = useStudy();
  return (
    <div className="study-toolbar">
      <Button
        size="large"
        onClick={() => setIsPlaying((prevIsPlaying) => !prevIsPlaying)}
        danger
        icon={isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
        className="study-btn"
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>
    </div>
  );
}
