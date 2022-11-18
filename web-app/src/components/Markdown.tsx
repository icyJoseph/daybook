import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import gfm from "remark-gfm";
import rehype from "rehype-raw";

import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type {
  CodeProps,
  HeadingProps,
  ReactMarkdownProps,
  UnorderedListProps,
  OrderedListProps,
} from "react-markdown/lib/ast-to-react";

import { Text, Title, Anchor, List } from "@mantine/core";

type ParagraphProps = ReactMarkdownProps & ComponentPropsWithoutRef<"p">;
type AnchorProps = ReactMarkdownProps & ComponentPropsWithoutRef<"a">;

const isValidHeading = (level: number): level is 1 | 2 | 3 | 4 | 5 | 6 =>
  level > 0 && level <= 6;

const TitleAdapter = (props: HeadingProps) => {
  const { level, node, ...rest } = props;

  if (!isValidHeading(level))
    throw new Error(`Invalid heading level: ${level}`);

  return <Title {...rest} order={level} />;
};

const TextAdapter = ({ node, ...rest }: ParagraphProps) => {
  return <Text {...rest} size="md" component="p" />;
};

const AnchorAdapter = ({ node, ...props }: AnchorProps) => {
  // TODO: potentially handle relative links
  return <Anchor {...props} />;
};

const UnOrderedListAdapter = ({
  ordered,
  node,
  ...props
}: UnorderedListProps) => {
  return <List {...props} type="unordered" withPadding />;
};

const OrderedListAdapter = ({ ordered, node, ...props }: OrderedListProps) => {
  return (
    <List
      {...props}
      type="ordered"
      listStyleType="numeric"
      withPadding
      sx={{ listStylePosition: "outside" }}
    />
  );
};

const components = {
  h1: TitleAdapter,
  h2: TitleAdapter,
  h3: TitleAdapter,
  h4: TitleAdapter,
  h5: TitleAdapter,
  h6: TitleAdapter,
  p: TextAdapter,
  a: AnchorAdapter,
  ul: UnOrderedListAdapter,
  ol: OrderedListAdapter,
  code({ node, inline, className, children, ...props }: CodeProps) {
    const match = /language-(\w+)/.exec(className || "");

    return !inline && match ? (
      <SyntaxHighlighter
        {...props}
        language={match[1]}
        PreTag="div"
        children={String(children).replace(/\n$/, "")}
        style={dracula}
      />
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export const Markdown = ({ children }: { children: string }) => (
  <ReactMarkdown
    remarkPlugins={[gfm]}
    rehypePlugins={[rehype]}
    components={components}
  >
    {children}
  </ReactMarkdown>
);
