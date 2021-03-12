import React from "react";
import "../styles/components/type-writer.scss";

export default function TypeWriter() {
  return (
    <div className="typewriter">
      <div className="slide">
        <i></i>
      </div>
      <div className="paper"></div>
      <div className="keyboard"></div>
    </div>
  );
}
