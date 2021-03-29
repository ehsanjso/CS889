// Import React dependencies.
import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import * as R from "ramda";
import isHotkey from "is-hotkey";
import { Editable, withReact, Slate } from "slate-react";
import { Editor, createEditor, Text } from "slate";
import { withHistory } from "slate-history";
import { usePrompt } from "../contexts/PromptProvider";
import { v4 as uuidv4 } from "uuid";
import Controls from "./Controls";

// const HOTKEYS = {
//   "mod+b": "bold",
//   "mod+i": "italic",
//   "mod+u": "underline",
//   "mod+`": "code",
//   "mod+h": "highlight",
// };

const EditorWrapper = ({ noToolbar, storageKey, promptId, text }) => {
  const [value, setValue] = useState(
    text || [
      {
        type: "paragraph",
        children: [{ text: "" }],
      },
    ]
  );
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const {
    updateText,
    updateGeneralNote,
    updatePromptNote,
    filteredPrompts,
  } = usePrompt();
  const renderElement = useCallback((props) => <Element {...props} />, [
    filteredPrompts,
  ]);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [
    filteredPrompts,
  ]);
  const didMount = useRef(false);

  const debouncedFetch = useMemo(() => {
    if (storageKey.includes("prompt-notes")) {
      return debounce(updatePromptNote, 1000);
    } else if (storageKey.includes("notes")) {
      return debounce(updateGeneralNote, 1000);
    } else {
      return debounce(updateText, 1000);
    }
  }, [updatePromptNote, updateGeneralNote, updateText, storageKey]);

  // useDebounce;
  useEffect(() => {
    if (didMount.current) {
      if (promptId) {
        debouncedFetch(value, storageKey, promptId);
      } else {
        debouncedFetch(value, storageKey);
      }
    } else {
      didMount.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const decorate = useCallback(
    ([node, path]) => {
      const ranges = [];
      const tempRanges = [];
      for (let j = 0; j < filteredPrompts.length; j++) {
        tempRanges[j] = [];
      }

      if (!R.isEmpty(filteredPrompts)) {
        filteredPrompts.forEach((prompt, index) => {
          const character = prompt.character;

          if (character && Text.isText(node)) {
            const { text } = node;
            const parts = text.split(character);
            let offset = 0;

            parts.forEach((part, i) => {
              if (i !== 0) {
                tempRanges[index].push({
                  anchor: { path, offset: offset - character.length },
                  focus: { path, offset },
                  highlight: true,
                  promptId: prompt._id,
                });
              }

              offset = offset + part.length + character.length;
            });
          }
        });
      }

      tempRanges.forEach((element, index) => {
        element.sort((a, b) => {
          return (
            Math.abs(filteredPrompts[index].startIdx - a.anchor.offset) -
            Math.abs(filteredPrompts[index].startIdx - b.anchor.offset)
          );
        });
        if (!R.isEmpty(element)) {
          ranges.push(element[0]);
        }
      });

      return ranges;
    },
    [filteredPrompts]
  );

  return (
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      {/* {!noToolbar && <Controls />} */}
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        decorate={decorate}
        spellCheck
        autoFocus
        // onKeyDown={(event) => {
        //   for (const hotkey in HOTKEYS) {
        //     if (isHotkey(hotkey, event)) {
        //       event.preventDefault();
        //       const mark = HOTKEYS[hotkey];
        //       toggleMark(editor, mark);
        //     }
        //   }
        // }}
        className="editor"
        placeholder="Type or paste your text here!"
      />
    </Slate>
  );
};

// const toggleMark = (editor, format) => {
//   const isActive = isMarkActive(editor, format);

//   if (isActive) {
//     Editor.removeMark(editor, format);
//   } else {
//     Editor.addMark(editor, format, true);
//   }

//   if (format === "highlight") {
//     if (isActive) {
//       Editor.removeMark(editor, "key");
//     } else {
//       Editor.addMark(editor, "key", uuidv4());
//     }
//   }
// };

// const isMarkActive = (editor, format) => {
//   const marks = Editor.marks(editor);
//   return marks ? marks[format] === true : false;
// };

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
    const { promptId } = leaf;
    if (promptId) {
      setActivePrompt(leaf.promptId);
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
        className={`highlight ${
          activePrompt === leaf.promptId ? "selected" : ""
        }`}
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

export default EditorWrapper;
