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
      {R.isEmpty(prompts) ? (
        <div className="ask-prompt">
          <TypeWriter />
          <p>Do you feel stuck?</p>
          <Button type="primary" onClick={() => setPrompts(["hi", "hiii"])}>
            Get Help!
          </Button>
        </div>
      ) : (
        prompts.map((prompt) => <Prompt id={prompt} />)
      )}
    </div>
  );
}
