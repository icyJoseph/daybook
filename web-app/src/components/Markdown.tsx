// @ts-nocheck
import React from "react";
import ReactMarkdown, { propTypes, TransformOptions } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import gfm from "remark-gfm";
import { List, Paragraph, Anchor, Heading } from "grommet";

import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { MdStyle } from "components/MdStyle";

const components = {
  h1: Heading,
  h2: Heading,
  h3: Heading,
  h4: Heading,
  h5: Heading,
  h6: Heading,
  p: Paragraph,
  a: Anchor,
  code({
    node,
    inline,
    className,
    children,
    ...props
  }: TransformOptions["components"]) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={dracula}
        language={match[1]}
        PreTag="div"
        children={String(children).replace(/\n$/, "")}
        {...props}
      />
    ) : (
      <code className={className} {...props} />
    );
  }
};

export const Markdown = ({ children }: { children: string }) => (
  <MdStyle>
    <ReactMarkdown remarkPlugins={[gfm]} components={components}>
      {children}
    </ReactMarkdown>
  </MdStyle>
);
