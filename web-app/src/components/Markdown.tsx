import React from "react";
import ReactMarkdown, { TransformOptions } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import gfm from "remark-gfm";
import { Paragraph, Anchor, Heading } from "grommet";

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
    // @ts-expect-error
    node,
    // @ts-expect-error
    inline,
    // @ts-expect-error
    className,
    // @ts-expect-error
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
      // @ts-expect-error
      <code className={className} {...props} />
    );
  }
};

export const Markdown = ({ children }: { children: string }) => (
  <MdStyle>
    {/* @ts-expect-error */}
    <ReactMarkdown remarkPlugins={[gfm]} components={components}>
      {children}
    </ReactMarkdown>
  </MdStyle>
);
