import React, { useState } from "react";
import { Button } from "antd";
import * as R from "ramda";
import TypeWriter from "./TypeWriter";
import { usePrompt } from "../contexts/PromptProvider";
import Prompt from "./Prompt";
import "../styles/components/prompts.scss";

export default function Prompts() {
  const { prompts, askForPrompt } = usePrompt();
  return (
    <div className="prompts-sidebar">
      <div className={`prompt-inner ${R.isEmpty(prompts) ? "" : "not-empty"}`}>
        {prompts.map((prompt) => (
          <Prompt prompt={prompt} key={prompt._id} />
        ))}
      </div>
      <div className={`ask-prompt ${R.isEmpty(prompts) ? "" : "not-empty"}`}>
        <TypeWriter />
        <p>Do you feel stuck?</p>
        <Button type="primary" onClick={() => askForPrompt()}>
          Get Help!
        </Button>
      </div>
    </div>
  );
}
