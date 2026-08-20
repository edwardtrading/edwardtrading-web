"use client";

import {
  Bold,
  Code2,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Table,
  Underline,
  Undo2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ToolbarAction = {
  label: string;
  icon: typeof Bold;
  run: (editor: HTMLDivElement) => void;
  /** execCommand name used to light the button up when the caret is inside it. */
  state?: string;
};

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function formatBlock(tag: string) {
  exec("formatBlock", `<${tag}>`);
}

function insertHtml(html: string) {
  exec("insertHTML", html);
}

function promptForUrl() {
  const selection = window.getSelection();
  const suggestion =
    selection && /^(https?:\/\/|\/|mailto:|tel:)/i.test(selection.toString().trim())
      ? selection.toString().trim()
      : "https://";

  const url = window.prompt("Link destination (https://…, /contact, mailto:…)", suggestion);

  if (!url) {
    return null;
  }

  const trimmed = url.trim();

  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    window.alert("That link type is not allowed.");
    return null;
  }

  // A bare domain is almost always meant as an external link.
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

function buildTable(rows: number, columns: number) {
  const headerCells = Array.from({ length: columns }, (_, index) => `<th>Heading ${index + 1}</th>`).join("");
  const bodyRows = Array.from(
    { length: rows },
    () => `<tr>${Array.from({ length: columns }, () => "<td>&nbsp;</td>").join("")}</tr>`
  ).join("");

  return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table><p><br /></p>`;
}

const actions: ToolbarAction[][] = [
  [
    { label: "Paragraph", icon: Pilcrow, run: () => formatBlock("p") },
    { label: "Heading 1", icon: Heading1, run: () => formatBlock("h1") },
    { label: "Heading 2", icon: Heading2, run: () => formatBlock("h2") },
    { label: "Heading 3", icon: Heading3, run: () => formatBlock("h3") }
  ],
  [
    { label: "Bold", icon: Bold, run: () => exec("bold"), state: "bold" },
    { label: "Italic", icon: Italic, run: () => exec("italic"), state: "italic" },
    {
      label: "Underline",
      icon: Underline,
      run: () => exec("underline"),
      state: "underline"
    }
  ],
  [
    {
      label: "Bulleted list",
      icon: List,
      run: () => exec("insertUnorderedList"),
      state: "insertUnorderedList"
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      run: () => exec("insertOrderedList"),
      state: "insertOrderedList"
    },
    { label: "Quote", icon: Quote, run: () => formatBlock("blockquote") },
    { label: "Code", icon: Code2, run: () => formatBlock("pre") }
  ],
  [
    {
      label: "Add link",
      icon: Link2,
      run: () => {
        const selection = window.getSelection();

        if (!selection || selection.isCollapsed) {
          window.alert("Select the text you want to turn into a link first.");
          return;
        }

        const url = promptForUrl();

        if (url) {
          exec("createLink", url);
        }
      }
    },
    { label: "Remove link", icon: Link2Off, run: () => exec("unlink") }
  ],
  [
    {
      label: "Insert table",
      icon: Table,
      run: () => {
        const columns = Number(window.prompt("Number of columns", "3"));
        const rows = Number(window.prompt("Number of body rows", "3"));

        if (!Number.isFinite(columns) || !Number.isFinite(rows)) {
          return;
        }

        insertHtml(
          buildTable(
            Math.min(Math.max(Math.trunc(rows), 1), 30),
            Math.min(Math.max(Math.trunc(columns), 1), 8)
          )
        );
      }
    },
    { label: "Divider", icon: Minus, run: () => insertHtml("<hr /><p><br /></p>") }
  ],
  [
    { label: "Undo", icon: Undo2, run: () => exec("undo") },
    { label: "Redo", icon: Redo2, run: () => exec("redo") },
    {
      label: "Clear formatting",
      icon: Eraser,
      run: () => {
        exec("removeFormat");
        exec("unlink");
      }
    }
  ]
];

/**
 * Rich text field backing the blog and partner company editors.
 *
 * The visible surface is a contentEditable element; its HTML is mirrored into a
 * hidden textarea so the value posts with the surrounding server action form.
 * Whatever is produced here is re-sanitized on the server before it is stored,
 * so the "HTML" tab is safe to expose for hand editing.
 */
export function RichTextEditor({
  label,
  name,
  defaultValue = "",
  disabled = false,
  helpText,
  minHeight = 320
}: {
  label: string;
  name: string;
  defaultValue?: string;
  disabled?: boolean;
  helpText?: string;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [showSource, setShowSource] = useState(false);
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

  // Seed the editable surface once. React must not own its children afterwards,
  // or every keystroke would reset the caret to the start of the field.
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue || "<p><br /></p>";
    }
  }, [defaultValue]);

  // When the author edits raw HTML, push it back into the visual surface.
  useEffect(() => {
    if (!showSource && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "<p><br /></p>";
    }
    // Intentionally only re-syncs on the source/visual switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSource]);

  const syncFromEditor = () => {
    if (editorRef.current) {
      setValue(editorRef.current.innerHTML);
    }
  };

  const refreshStates = () => {
    const next: Record<string, boolean> = {};

    for (const group of actions) {
      for (const action of group) {
        if (action.state) {
          try {
            next[action.state] = document.queryCommandState(action.state);
          } catch {
            next[action.state] = false;
          }
        }
      }
    }

    setActiveStates(next);
  };

  const runAction = (action: ToolbarAction) => {
    const editor = editorRef.current;

    if (!editor || disabled) {
      return;
    }

    editor.focus();
    action.run(editor);
    syncFromEditor();
    refreshStates();
  };

  return (
    <div className="grid gap-2 text-sm font-semibold text-charcoal md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => {
            syncFromEditor();
            setShowSource((current) => !current);
          }}
          disabled={disabled}
          className="inline-flex min-h-8 items-center rounded-md border border-charcoal/10 bg-white px-3 text-xs font-bold text-charcoal transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showSource ? "Visual editor" : "Edit HTML"}
        </button>
      </div>

      {!showSource ? (
        <>
          <div className="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-charcoal/12 bg-light-gray p-2">
            {actions.map((group, groupIndex) => (
              <div key={groupIndex} className="flex gap-1 border-charcoal/10 pr-1 [&:not(:last-child)]:border-r [&:not(:last-child)]:mr-1">
                {group.map((action) => {
                  const Icon = action.icon;
                  const active = action.state ? activeStates[action.state] : false;

                  return (
                    <button
                      key={action.label}
                      type="button"
                      title={action.label}
                      aria-label={action.label}
                      aria-pressed={action.state ? Boolean(active) : undefined}
                      disabled={disabled}
                      // onMouseDown keeps the text selection alive through the click.
                      onMouseDown={(event) => {
                        event.preventDefault();
                        runAction(action);
                      }}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent bg-white text-charcoal hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      <Icon aria-hidden className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div
            ref={editorRef}
            contentEditable={!disabled}
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={label}
            onInput={syncFromEditor}
            onBlur={syncFromEditor}
            onKeyUp={refreshStates}
            onMouseUp={refreshStates}
            style={{ minHeight }}
            className="prose prose-sm max-w-none rounded-b-md border border-charcoal/12 bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-primary prose-headings:font-heading prose-headings:text-charcoal prose-a:text-primary prose-table:text-sm prose-th:bg-light-gray prose-td:border prose-td:border-charcoal/10 prose-td:px-3 prose-td:py-2 prose-th:border prose-th:border-charcoal/10 prose-th:px-3 prose-th:py-2"
          />
        </>
      ) : (
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled}
          spellCheck={false}
          style={{ minHeight }}
          className="w-full rounded-md border border-charcoal/12 bg-light-gray px-3 py-3 font-mono text-xs font-normal outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        />
      )}

      <input type="hidden" name={name} value={value} />

      <p className="text-xs font-normal leading-6 text-slate">
        {helpText ??
          "Use Heading 2 and Heading 3 to structure the article, bold for emphasis, and the link button to hyperlink selected text. Tables, lists, and dividers are supported."}
      </p>
    </div>
  );
}
