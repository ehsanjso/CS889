import React from "react";
import EditorWrapper from "./EditorWrapper";
import "../styles/components/writing.scss";

export default function Writing({ noToolbar, storageKey, promptId, text }) {
  return (
    <div className="writing">
      <EditorWrapper
        noToolbar={noToolbar}
        storageKey={storageKey}
        promptId={promptId}
        text={text}
      />
    </div>
  );
}
