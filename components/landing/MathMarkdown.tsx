import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { cn } from '@/lib/utils';

interface MathMarkdownProps {
  className?: string;
  content: string;
}

const components: Components = {
  blockquote: ({ node, ...props }) => {
    void node;
    return (
      <blockquote
        className="border-l-2 border-[color:var(--border-strong)] pl-4 text-[color:var(--foreground-muted)]"
        {...props}
      />
    );
  },
  code: ({ node, className, ...props }) => {
    void node;
    return (
      <code
        className={cn(
          'rounded-md bg-[color:var(--surface-strong)] px-1.5 py-0.5 font-mono text-[0.94em] text-[color:var(--foreground)]',
          className,
        )}
        {...props}
      />
    );
  },
  ol: ({ node, ...props }) => {
    void node;
    return <ol className="space-y-2 pl-5" {...props} />;
  },
  p: ({ node, ...props }) => {
    void node;
    return <p className="leading-7" {...props} />;
  },
  strong: ({ node, ...props }) => {
    void node;
    return <strong className="font-semibold text-[color:var(--foreground)]" {...props} />;
  },
  ul: ({ node, ...props }) => {
    void node;
    return <ul className="space-y-2 pl-5" {...props} />;
  },
};

export function MathMarkdown({ className, content }: MathMarkdownProps) {
  return (
    <div className={cn('math-markdown', className)}>
      <ReactMarkdown components={components} rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
