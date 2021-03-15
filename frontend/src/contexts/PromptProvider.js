import React, { useContext, useState } from "react";

const PromptContext = React.createContext();

export function usePrompt() {
  return useContext(PromptContext);
}

export function PromptProvider({ children }) {
  const [activePrompt, setActivePrompt] = useState(undefined);

  return (
    <PromptContext.Provider
      value={{
        activePrompt,
        setActivePrompt,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}
