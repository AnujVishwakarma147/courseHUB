import parse from "html-react-parser";

interface RenderDescriptionProps {
  content: string;
}

export function RenderDescription({ content }: RenderDescriptionProps) {
  return (
    <div className="prose max-w-none text-muted-foreground dark:prose-invert prose-headings:text-foreground prose-strong:text-foreground">
      {parse(content)}
    </div>
  );
}
