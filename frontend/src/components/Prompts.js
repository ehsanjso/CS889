import React, { useState } from "react";
import { Button } from "antd";
import * as R from "ramda";
import TypeWriter from "./TypeWriter";
import Prompt from "./Prompt";
import "../styles/components/prompts.scss";

export default function Prompts() {
  const [prompts, setPrompts] = useState([]);
  return (
    <div className="prompts-sidebar">
      <div className={`prompt-inner ${R.isEmpty(prompts) ? "" : "not-empty"}`}>
        {prompts.map((prompt) => (
          <Prompt id={prompt} key={prompt} />
        ))}
      </div>
      <div className={`ask-prompt ${R.isEmpty(prompts) ? "" : "not-empty"}`}>
        <TypeWriter />
        <p>Do you feel stuck?</p>
        <Button type="primary" onClick={() => setPrompts(["hi", "hiii"])}>
          Get Help!
        </Button>
      </div>
    </div>
  );
}
