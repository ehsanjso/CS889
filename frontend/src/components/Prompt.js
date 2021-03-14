import React from "react";
import Writing from "./Writing";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import Duck from "../assets/images/duck.png";

export default function Prompt({ id }) {
  return (
    <div className="prompt">
      <div className="prompt-message">
        <img src={Duck} alt="duck" />
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu
          vulputate mi. Mauris consectetur blandit felis in malesuada. Integer
          auctor mi at elementum placerat.
        </p>
      </div>
      <div className="prompt-star">
        Is this usefull?{" "}
        <div className="star-btn">
          {/* <StarFilled /> */}
          <StarOutlined />
        </div>
      </div>
      <div className="prompt-note">
        <Writing noToolbar={true} localStorageKey={`${id}-notes`} />
      </div>
    </div>
  );
}
