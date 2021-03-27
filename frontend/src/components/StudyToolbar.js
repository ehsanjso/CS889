import React, { useState } from "react";
import { Button, Input, Modal } from "antd";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import { useStudy } from "../contexts/StudyProvider";
import "../styles/components/study-toolbar.scss";

export default function StudyToolbar() {
  const {
    isPlaying,
    showPauseModal,
    setIsPlaying,
    setShowPauseModal,
    setStudyPause,
    studyDone,
  } = useStudy();
  const [reason, setReason] = useState(undefined);

  const handleOk = () => {
    setReason(undefined);
    setShowPauseModal(false);
    setStudyPause(reason);
  };

  const setReasonHandler = (e) => {
    const reasonValue = e.target.value;
    setReason(reasonValue);
  };
  return (
    <div className="study-toolbar">
      <Button
        size="large"
        onClick={() => setIsPlaying((prevIsPlaying) => !prevIsPlaying)}
        danger
        type="primary"
        icon={isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
        className="study-btn"
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>

      <Modal
        title="Why did you pause? (optional)"
        visible={showPauseModal && !studyDone}
        onOk={handleOk}
        centered
        closable={false}
        footer={[
          <Button key="submit" type="primary" onClick={() => handleOk()}>
            Submit
          </Button>,
        ]}
      >
        <Input
          value={reason}
          placeholder="Type a reason ..."
          className="ant-input-revert ltr app-name"
          size="large"
          onChange={setReasonHandler}
        />
      </Modal>

      <Modal
        title="Study is finished!"
        visible={studyDone}
        centered
        closable={false}
      >
        <p>
          Thanks for your participation. Please click on the{" "}
          <a href="#">link</a> and fill the post-study questionnaire.
        </p>
      </Modal>
    </div>
  );
}
