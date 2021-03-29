import React, { useState } from "react";
import { Button } from "antd";
import * as R from "ramda";
import TypeWriter from "./TypeWriter";
import { usePrompt } from "../contexts/PromptProvider";
import Prompt from "./Prompt";
import "../styles/components/prompts.scss";

export default function Prompts() {
  const { filteredPrompts, askForPrompt } = usePrompt();
  return (
    <div className="prompts-sidebar">
      <div
        className={`prompt-inner ${
          R.isEmpty(filteredPrompts) ? "" : "not-empty"
        }`}
      >
        {filteredPrompts.map((prompt) => (
          <Prompt prompt={prompt} key={prompt._id} />
        ))}
      </div>
      <div
        className={`ask-prompt ${
          R.isEmpty(filteredPrompts) ? "" : "not-empty"
        }`}
      >
        <TypeWriter />
        <p>Do you feel stuck?</p>
        <Button type="primary" onClick={() => askForPrompt()}>
          Get Help!
        </Button>
      </div>
    </div>
  );
}
