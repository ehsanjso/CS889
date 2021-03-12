import React from "react";
import EditorWrapper from "./EditorWrapper";
import "../styles/components/writing.scss";

export default function Writing({ noToolbar, localStorageKey }) {
  return (
    <div className="writing">
      <EditorWrapper noToolbar={noToolbar} localStorageKey={localStorageKey} />
    </div>
  );
}
