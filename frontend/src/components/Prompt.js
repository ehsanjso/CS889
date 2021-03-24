import React from "react";
import Writing from "./Writing";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import Duck from "../assets/images/duck.png";

export default function Prompt({ prompt }) {
  return (
    <div className="prompt">
      <div className="prompt-message">
        <img src={Duck} alt="duck" />
        <p>{prompt.question}</p>
      </div>
      <div className="prompt-star">
        Is this usefull?{" "}
        <div className="star-btn">
          {/* <StarFilled /> */}
          <StarOutlined />
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
