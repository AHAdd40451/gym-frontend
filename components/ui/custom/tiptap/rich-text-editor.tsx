"use client";

export function RichTextEditorDemo(props: any) {
  return (
    <textarea
      className="min-h-[160px] w-full rounded-md border p-3 text-sm"
      placeholder="Write note..."
      value={props?.value || props?.content || ""}
      onChange={(e) => {
        props?.onChange?.(e.target.value);
        props?.setContent?.(e.target.value);
      }}
    />
  );
}
