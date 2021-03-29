import React, { useState } from "react";
import { Button, message } from "antd";
import { Node } from "slate";
import * as R from "ramda";
import TypeWriter from "./TypeWriter";
import { usePrompt } from "../contexts/PromptProvider";
import Prompt from "./Prompt";
import "../styles/components/prompts.scss";

export default function Prompts() {
  const { filteredPrompts, askForPrompt, textData } = usePrompt();
  const isEnoughText = textData ? serialize(textData).length > 20 : false;
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
        <Button
          type="primary"
          onClick={() => {
            if (isEnoughText) {
              askForPrompt();
            } else {
              message.warning("To generate new prompts we need more text!");
            }
          }}
          className={`${isEnoughText ? "" : "disabled"}`}
        >
          Get Help!
        </Button>
      </div>
    </div>
  );
}

// Define a serializing function that takes a value and returns a string.
const serialize = (value) => {
  return (
    value
      // Return the string content of each paragraph in the value's children.
      .map((n) => Node.string(n))
      // Join them all with line breaks denoting paragraphs.
      .join("\n")
  );
};
