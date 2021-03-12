import React from "react";
import { Tooltip } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import { useSlate } from "slate-react";
import { Editor, Transforms, Element as SlateElement } from "slate";
import "../styles/components/controls.scss";

const LIST_TYPES = ["numbered-list", "bulleted-list"];

export default function Controls() {
  return (
    <div className="controls">
      <div className="controls-left">
        <div className="control-section">
          <MarkButton>
            <FontSizeOutlined />
          </MarkButton>
        </div>
        <div className="control-section">
          <MarkButton format="bold" text="Bold">
            <BoldOutlined />
          </MarkButton>
          <MarkButton format="italic" text="Italic">
            <ItalicOutlined />
          </MarkButton>
          <MarkButton format="underline" text="Underlined">
            <UnderlineOutlined />
          </MarkButton>
        </div>

        <div className="control-section">
          <BlockButton format="bulleted-list" text="Bullet list">
            <UnorderedListOutlined />
          </BlockButton>
          <BlockButton format="numbered-list" text="Numbered list">
            <OrderedListOutlined />
          </BlockButton>
        </div>

        <div className="control-section">
          <div className="control-btn" format="bold">
            <AlignLeftOutlined />
          </div>
          <div className="control-btn" format="bold">
            <AlignCenterOutlined />
          </div>
          <div className="control-btn" format="bold">
            <AlignRightOutlined />
          </div>
        </div>
      </div>

      <div className="controls-right">
        <div className="control-section">
          <div className="control-btn" format="bold">
            <PictureOutlined />
          </div>
          <div className="control-btn" format="bold">
            <VideoCameraOutlined />
          </div>
        </div>
      </div>
    </div>
  );
}

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      LIST_TYPES.includes(
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type
      ),
    split: true,
  });
  const newProperties = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const BlockButton = ({ format, children, text }) => {
  const editor = useSlate();
  return (
    <Tooltip placement="bottom" title={text} color="#9e8ef6">
      <div
        className={`control-btn ${
          isBlockActive(editor, format) ? "active" : ""
        }`}
        onMouseDown={(event) => {
          event.preventDefault();
          toggleBlock(editor, format);
        }}
      >
        {children}
      </div>
    </Tooltip>
  );
};

const MarkButton = ({ format, children, text }) => {
  const editor = useSlate();
  return (
    <Tooltip placement="bottom" title={text} color="#9e8ef6">
      <div
        className={`control-btn ${
          isMarkActive(editor, format) ? "active" : ""
        }`}
        onMouseDown={(event) => {
          event.preventDefault();
          toggleMark(editor, format);
        }}
      >
        {children}
      </div>
    </Tooltip>
  );
};
