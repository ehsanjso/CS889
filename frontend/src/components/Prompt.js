import React from "react";
import Writing from "./Writing";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import Duck from "../assets/images/duck.png";
import { usePrompt } from "../contexts/PromptProvider";

export default function Prompt({ prompt }) {
  const { updatePromptFeedback } = usePrompt();

  return (
    <div className="prompt">
      <div className="prompt-message">
        <img src={Duck} alt="duck" />
        <p>{prompt.question}</p>
      </div>
      <div className="prompt-star">
        Is this usefull?{" "}
        <div
          className="star-btn"
          onClick={() => updatePromptFeedback(!prompt.hasStar, prompt._id)}
        >
          {prompt.hasStar ? <StarFilled className="star" /> : <StarOutlined />}
        </div>
      </div>
      <div className="prompt-note">
        <Writing
          noToolbar={true}
          localStorageKey={`${prompt._id}-prompt-notes`}
        />
      </div>
    </div>
  );
}
