import React from "react";
import { Button } from "antd";
import TypeWriter from "./TypeWriter";
import "../styles/components/prompts.scss";

export default function Prompts() {
  return (
    <div className="prompts-sidebar">
      <div className="ask-prompt">
        <TypeWriter />
        <p>Do you feel stuck?</p>
        <Button type="primary">Get Help!</Button>
      </div>
    </div>
  );
}
