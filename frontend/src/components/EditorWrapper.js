// Import React dependencies.
import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, Slate } from "slate-react";
import { Editor, createEditor } from "slate";
import { withHistory } from "slate-history";
import { usePrompt } from "../contexts/PromptProvider";
import { v4 as uuidv4 } from "uuid";
import Controls from "./Controls";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
  "mod+h": "highlight",
};

const EditorWrapper = ({ noToolbar, localStorageKey }) => {
  const [value, setValue] = useState(
    JSON.parse(localStorage.getItem(`${localStorageKey}-content`)) || [
      {
        type: "paragraph",
        children: [{ text: "" }],
      },
    ]
  );
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const { updateText, updateGeneralNote, updatePromptNote } = usePrompt();
  const didMount = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useMemo(() => {
    if (localStorageKey.includes("prompt-notes")) {
      return debounce(updatePromptNote, 1000);
    } else if (localStorageKey.includes("notes")) {
      return debounce(updateGeneralNote, 1000);
    } else {
      return debounce(updateText, 1000);
    }
  }, []);

  // useDebounce;
  useEffect(() => {
    if (didMount.current) {
      debouncedFetch(value, localStorageKey);
    } else {
      didMount.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        const content = JSON.stringify(value);
        localStorage.setItem(`${localStorageKey}-content`, content);
      }}
    >
      {!noToolbar && <Controls />}
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
        className="editor"
        placeholder="Type or paste your text here!"
      />
    </Slate>
  );
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }

  if (format === "highlight") {
    if (isActive) {
      Editor.removeMark(editor, "key");
    } else {
      Editor.addMark(editor, "key", uuidv4());
    }
  }
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  const { activePrompt, setActivePrompt } = usePrompt();
  const onClick = () => {
    const { key } = leaf;
    if (key) {
      setActivePrompt(leaf.key);
    } else {
      setActivePrompt(undefined);
    }
  };

  if (leaf.bold) {
    children = <strong onClick={onClick}>{children}</strong>;
  }

  if (leaf.code) {
    children = <code onClick={onClick}>{children}</code>;
  }

  if (leaf.italic) {
    children = <em onClick={onClick}>{children}</em>;
  }

  if (leaf.underline) {
    children = <u onClick={onClick}>{children}</u>;
  }

  if (leaf.highlight) {
    children = (
      <span
        className={`highlight ${activePrompt === leaf.key ? "selected" : ""}`}
        onClick={onClick}
      >
        {children}
      </span>
    );
  }

  return (
    <span onClick={onClick} {...attributes}>
      {children}
    </span>
  );
};

const debounce = (func, delay) => {
  let debounceHandler;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceHandler);
    debounceHandler = setTimeout(() => func.apply(context, args), delay);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default EditorWrapper;
