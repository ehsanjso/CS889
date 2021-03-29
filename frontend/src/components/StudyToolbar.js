import React, { useState } from "react";
import { Button, Input, Modal } from "antd";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import { useStudy } from "../contexts/StudyProvider";
import "../styles/components/study-toolbar.scss";

export default function StudyToolbar() {
  const {
    isPlaying,
    showPauseModal,
    setShowPauseModal,
    setStudyPause,
    studyDone,
    handleCountDown,
    countDown,
    isCountDown,
    user,
    firstUse,
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
    <div className={`study-toolbar ${studyDone || !isPlaying ? "active" : ""}`}>
      <Button
        size="large"
        onClick={() => handleCountDown(isPlaying)}
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

      <div className="overlay">
        <div className="overlay-box">
          {isCountDown ? (
            <h1 className="count-down">{countDown}</h1>
          ) : (
            <>
              {firstUse ? (
                <>
                  <h1>Welcome to our study!</h1>
                  <p>
                    Please write a story about a child who is having a bizarre
                    day at school.
                  </p>
                </>
              ) : (
                <>
                  <h1>
                    {studyDone ? "Study is finished!" : "Study is paused!"}
                  </h1>
                  {studyDone ? (
                    <p>
                      Thanks for your participation. Please click on the{" "}
                      <a
                        href={`${
                          user.studyType === "control"
                            ? "https://forms.gle/QLUGY95fdNJCdTkn7"
                            : "https://forms.gle/RJHSGA9KUZnjAh1C8"
                        }`}
                      >
                        link
                      </a>{" "}
                      to fill out the post-study questionnaire.
                    </p>
                  ) : (
                    <p>To continue the study click on the play button.</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
