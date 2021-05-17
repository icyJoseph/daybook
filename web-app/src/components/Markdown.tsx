// @ts-nocheck
import React from "react";
import ReactMarkdown, { TransformOptions } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import gfm from "remark-gfm";

import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

const components = {
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
  <ReactMarkdown remarkPlugins={[gfm]} components={components}>
    {children}
  </ReactMarkdown>
);
