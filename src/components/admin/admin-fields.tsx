"use client";

import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImageOff,
  Link2,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  X
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const inputClass =
  "min-h-11 w-full rounded-md border border-charcoal/12 bg-light-gray px-3 text-sm outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";
const textareaClass =
  "w-full rounded-md border border-charcoal/12 bg-light-gray px-3 py-3 text-sm outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "grid gap-2 text-sm font-semibold text-charcoal";
const helpClass = "text-xs font-normal leading-6 text-slate";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Filters the server-rendered list that follows it.
 *
 * The items are rendered on the server, so instead of owning them in state this
 * toggles `hidden` on any descendant carrying `data-search`, matching against
 * that attribute's text. Keeps large product and article lists usable without
 * moving the list itself to the client.
 */
export function ListFilter({
  targetId,
  placeholder = "Search...",
  noun = "items"
}: {
  targetId: string;
  placeholder?: string;
  noun?: string;
}) {
  const [query, setQuery] = useState("");
  const [counts, setCounts] = useState({ shown: 0, total: 0 });

  useEffect(() => {
    const container = document.getElementById(targetId);

    if (!container) {
      return;
    }

    const items = Array.from(
      container.querySelectorAll<HTMLElement>("[data-search]")
    );
    const needle = query.trim().toLowerCase();
    let shown = 0;

    for (const item of items) {
      const haystack = (item.dataset.search || "").toLowerCase();
      const match = !needle || haystack.includes(needle);

      item.hidden = !match;

      if (match) {
        shown += 1;
      }
    }

    setCounts({ shown, total: items.length });
  }, [query, targetId]);

  if (counts.total === 0 && !query) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`${inputClass} pl-9`}
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate transition hover:bg-charcoal/5 hover:text-charcoal"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <p className="text-xs font-bold text-slate">
        {query
          ? `Showing ${counts.shown} of ${counts.total} ${noun}`
          : `${counts.total} ${noun}`}
      </p>
    </div>
  );
}

/**
 * Web address field. Mirrors the title/name field until an editor takes it over,
 * and always shows the full public URL the entry will live at.
 */
export function SlugField({
  name = "slug",
  label = "Web address",
  defaultValue = "",
  sourceName,
  basePath,
  disabled
}: {
  name?: string;
  label?: string;
  defaultValue?: string;
  /** Field whose value seeds the address for new entries. */
  sourceName: string;
  /** Public path the address sits under, e.g. "/blog". */
  basePath: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(Boolean(defaultValue));
  const inputRef = useRef<HTMLInputElement>(null);

  // Mirror the source field only until the editor edits the address directly.
  useEffect(() => {
    if (touched || disabled) {
      return;
    }

    const form = inputRef.current?.form;
    const source = form?.elements.namedItem(sourceName);

    if (!(source instanceof HTMLInputElement)) {
      return;
    }

    const sync = () => setValue(slugify(source.value));

    source.addEventListener("input", sync);
    return () => source.removeEventListener("input", sync);
  }, [sourceName, touched, disabled]);

  return (
    <label className={labelClass}>
      {label}
      <input
        ref={inputRef}
        name={name}
        type="text"
        value={value}
        onChange={(event) => {
          setTouched(true);
          setValue(event.target.value);
        }}
        onBlur={(event) => setValue(slugify(event.target.value))}
        disabled={disabled}
        placeholder="Created automatically from the title"
        className={inputClass}
      />
      <span className={`${helpClass} inline-flex items-center gap-1.5 break-all`}>
        <Link2 aria-hidden className="h-3.5 w-3.5 shrink-0 text-primary" />
        {`${basePath}/${value || "..."}`}
      </span>
    </label>
  );
}

/**
 * Image field combining an address box with an upload box, plus a thumbnail of
 * whatever is currently selected so editors can see what they are replacing.
 */
export function ImageField({
  label,
  urlName,
  fileName,
  defaultUrl = "",
  disabled,
  help
}: {
  label: string;
  urlName: string;
  fileName: string;
  defaultUrl?: string;
  disabled?: boolean;
  help?: string;
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [preview, setPreview] = useState<string | null>(null);
  const inputId = useId();

  // Object URLs must be released or the tab leaks the selected file.
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const shown = preview || url;

  return (
    <div className="grid gap-3 md:col-span-2">
      <span className="text-sm font-semibold text-charcoal">{label}</span>
      <div className="flex flex-col gap-4 rounded-md border border-charcoal/12 bg-light-gray p-4 sm:flex-row">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-charcoal/10 bg-white">
          {shown ? (
            // Previews can be blob: URLs, which next/image cannot optimise.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt=""
              className="h-full w-full object-contain"
            />
          ) : (
            <ImageOff aria-hidden className="h-7 w-7 text-slate" />
          )}
        </div>

        <div className="grid flex-1 gap-3">
          <label className="grid gap-1.5 text-xs font-bold text-charcoal">
            Upload a new image
            <input
              id={inputId}
              name={fileName}
              type="file"
              accept="image/*"
              disabled={disabled}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (preview) {
                  URL.revokeObjectURL(preview);
                }

                setPreview(file ? URL.createObjectURL(file) : null);
              }}
              className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-charcoal file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="grid gap-1.5 text-xs font-bold text-charcoal">
            Or use an image address
            <input
              name={urlName}
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={disabled}
              placeholder="Filled in automatically after an upload"
              className={inputClass}
            />
          </label>

          {preview ? (
            <p className="text-xs font-semibold text-primary">
              New image selected. It replaces the current one when you save.
            </p>
          ) : null}
          {help ? <p className={helpClass}>{help}</p> : null}
        </div>
      </div>
    </div>
  );
}

function CharacterMeter({
  length,
  ideal,
  max
}: {
  length: number;
  ideal: number;
  max: number;
}) {
  const state =
    length === 0 ? "empty" : length > max ? "over" : length < ideal ? "short" : "good";

  const tone = {
    empty: "text-slate",
    short: "text-amber-600",
    good: "text-emerald-600",
    over: "text-red-600"
  }[state];

  const note = {
    empty: "Using the automatic value",
    short: "A little short",
    good: "Good length",
    over: "Too long, Google will cut it off"
  }[state];

  return (
    <span className={`text-xs font-bold ${tone}`}>
      {length}/{max} - {note}
    </span>
  );
}

/**
 * Search settings with live character meters and a preview of how the entry is
 * likely to appear in Google results.
 */
export function SearchAppearanceFields({
  metaTitle = "",
  metaDescription = "",
  fallbackTitle,
  fallbackDescription,
  path,
  siteUrl,
  disabled
}: {
  metaTitle?: string;
  metaDescription?: string;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  siteUrl: string;
  disabled?: boolean;
}) {
  const [title, setTitle] = useState(metaTitle);
  const [description, setDescription] = useState(metaDescription);

  const previewTitle = title.trim() || fallbackTitle;
  const previewDescription = description.trim() || fallbackDescription;
  const previewUrl = `${siteUrl.replace(/^https?:\/\//, "")}${path}`;

  return (
    <div className="grid gap-5 rounded-md border border-charcoal/10 bg-light-gray/60 p-4 md:col-span-2 md:grid-cols-2">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary md:col-span-2">
        How this appears in Google
      </p>

      <label className={labelClass}>
        <span className="flex flex-wrap items-center justify-between gap-2">
          Google headline
          <CharacterMeter length={title.trim().length} ideal={30} max={60} />
        </span>
        <input
          name="metaTitle"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={disabled}
          placeholder={fallbackTitle}
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        <span className="flex flex-wrap items-center justify-between gap-2">
          Google summary
          <CharacterMeter length={description.trim().length} ideal={80} max={158} />
        </span>
        <input
          name="metaDescription"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={disabled}
          placeholder={fallbackDescription}
          className={inputClass}
        />
      </label>

      <div className="rounded-md border border-charcoal/10 bg-white p-4 md:col-span-2">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate">
          Preview
        </p>
        <p className="truncate text-xs text-emerald-700">{previewUrl}</p>
        <p className="mt-1 truncate text-lg font-medium text-[#1a0dab]">
          {previewTitle}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate">
          {previewDescription}
        </p>
      </div>

      <p className={`${helpClass} md:col-span-2`}>
        Leave either box empty to keep the automatic wording shown in grey.
      </p>
    </div>
  );
}

/**
 * Repeatable single-line list (key points, features, keywords). Serialises to a
 * newline separated hidden field so the existing save handlers are unchanged.
 */
export function LineListField({
  label,
  name,
  defaultValue = [],
  disabled,
  placeholder,
  help,
  addLabel = "Add another"
}: {
  label: string;
  name: string;
  defaultValue?: string[];
  disabled?: boolean;
  placeholder?: string;
  help?: string;
  addLabel?: string;
}) {
  const [items, setItems] = useState<string[]>(
    defaultValue.length > 0 ? defaultValue : [""]
  );

  const update = (index: number, value: string) =>
    setItems((current) => current.map((item, i) => (i === index ? value : item)));

  const remove = (index: number) =>
    setItems((current) => {
      const next = current.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });

  const move = (index: number, delta: number) =>
    setItems((current) => {
      const target = index + delta;

      if (target < 0 || target >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const serialized = useMemo(
    () => items.map((item) => item.trim()).filter(Boolean).join("\n"),
    [items]
  );

  return (
    <div className="grid gap-2 md:col-span-2">
      <span className="text-sm font-semibold text-charcoal">{label}</span>

      <div className="grid gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <GripVertical aria-hidden className="h-4 w-4 shrink-0 text-slate/50" />
            <input
              type="text"
              value={item}
              onChange={(event) => update(index, event.target.value)}
              disabled={disabled}
              placeholder={placeholder}
              className={inputClass}
            />
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={disabled || index === 0}
                aria-label={`Move ${label} item ${index + 1} up`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-charcoal/10 bg-white text-charcoal transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowUp aria-hidden className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={disabled || index === items.length - 1}
                aria-label={`Move ${label} item ${index + 1} down`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-charcoal/10 bg-white text-charcoal transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowDown aria-hidden className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                aria-label={`Remove ${label} item ${index + 1}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setItems((current) => [...current, ""])}
        disabled={disabled}
        className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 text-sm font-bold text-primary transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus aria-hidden className="h-4 w-4" />
        {addLabel}
      </button>

      {help ? <p className={helpClass}>{help}</p> : null}
      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}

/** Repeatable key/value list, used for product specifications. */
export function PairListField({
  label,
  name,
  defaultValue = [],
  disabled,
  keyPlaceholder = "Label",
  valuePlaceholder = "Value",
  help
}: {
  label: string;
  name: string;
  defaultValue?: { key: string; value: string }[];
  disabled?: boolean;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  help?: string;
}) {
  const [rows, setRows] = useState(
    defaultValue.length > 0 ? defaultValue : [{ key: "", value: "" }]
  );

  const update = (index: number, patch: Partial<{ key: string; value: string }>) =>
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );

  const remove = (index: number) =>
    setRows((current) => {
      const next = current.filter((_, i) => i !== index);
      return next.length > 0 ? next : [{ key: "", value: "" }];
    });

  const serialized = useMemo(
    () =>
      rows
        // The save handler splits on the first colon, so a colon in the label
        // would silently move part of it into the value.
        .map((row) => ({
          key: row.key.replace(/:/g, " ").replace(/\s+/g, " ").trim(),
          value: row.value.trim()
        }))
        .filter((row) => row.key && row.value)
        .map((row) => `${row.key}: ${row.value}`)
        .join("\n"),
    [rows]
  );

  return (
    <div className="grid gap-2 md:col-span-2">
      <span className="text-sm font-semibold text-charcoal">{label}</span>

      <div className="grid gap-2">
        {rows.map((row, index) => (
          <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={row.key}
              onChange={(event) => update(index, { key: event.target.value })}
              disabled={disabled}
              placeholder={keyPlaceholder}
              className={`${inputClass} sm:max-w-[38%]`}
            />
            <input
              type="text"
              value={row.value}
              onChange={(event) => update(index, { value: event.target.value })}
              disabled={disabled}
              placeholder={valuePlaceholder}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={disabled}
              aria-label={`Remove row ${index + 1}`}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 aria-hidden className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((current) => [...current, { key: "", value: "" }])}
        disabled={disabled}
        className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 text-sm font-bold text-primary transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus aria-hidden className="h-4 w-4" />
        Add row
      </button>

      {help ? <p className={helpClass}>{help}</p> : null}
      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}

/**
 * Question and answer editor. Serialises to the "Q: / A:" line format the save
 * handler already understands, so editors never type the prefixes themselves.
 */
export function FaqField({
  label,
  name,
  defaultValue = [],
  disabled,
  help
}: {
  label: string;
  name: string;
  defaultValue?: { question: string; answer: string }[];
  disabled?: boolean;
  help?: string;
}) {
  const [rows, setRows] = useState(
    defaultValue.length > 0 ? defaultValue : [{ question: "", answer: "" }]
  );

  const update = (
    index: number,
    patch: Partial<{ question: string; answer: string }>
  ) =>
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );

  const remove = (index: number) =>
    setRows((current) => {
      const next = current.filter((_, i) => i !== index);
      return next.length > 0 ? next : [{ question: "", answer: "" }];
    });

  const serialized = useMemo(
    () =>
      rows
        .map((row) => ({
          // Newlines would break the one-question-per-line format.
          question: row.question.replace(/\s+/g, " ").trim(),
          answer: row.answer.replace(/\s+/g, " ").trim()
        }))
        .filter((row) => row.question && row.answer)
        .map((row) => `Q: ${row.question}\nA: ${row.answer}`)
        .join("\n\n"),
    [rows]
  );

  return (
    <div className="grid gap-3 md:col-span-2">
      <span className="text-sm font-semibold text-charcoal">{label}</span>

      <div className="grid gap-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-md border border-charcoal/12 bg-light-gray p-3"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <input
                type="text"
                value={row.question}
                onChange={(event) => update(index, { question: event.target.value })}
                disabled={disabled}
                placeholder="Question a customer would search for"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                aria-label={`Remove question ${index + 1}`}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={row.answer}
              onChange={(event) => update(index, { answer: event.target.value })}
              disabled={disabled}
              rows={2}
              placeholder="Short, direct answer"
              className={textareaClass}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setRows((current) => [...current, { question: "", answer: "" }])
        }
        disabled={disabled}
        className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 text-sm font-bold text-primary transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus aria-hidden className="h-4 w-4" />
        Add question
      </button>

      {help ? <p className={helpClass}>{help}</p> : null}
      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}

/** Wraps a destructive submit in a confirmation step. */
export function ConfirmSubmit({
  label,
  confirmLabel,
  question,
  disabled
}: {
  label: string;
  confirmLabel: string;
  question: string;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) {
      return;
    }

    const timer = window.setTimeout(() => setArmed(false), 6000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        disabled={disabled}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-charcoal/12 bg-white px-3 text-xs font-bold text-charcoal transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <TriangleAlert aria-hidden className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2">
      <span className="text-xs font-bold text-red-800">{question}</span>
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex min-h-9 items-center gap-2 rounded-md bg-red-700 px-3 text-xs font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="inline-flex min-h-9 items-center rounded-md border border-charcoal/12 bg-white px-3 text-xs font-bold text-charcoal transition hover:border-charcoal/30"
      >
        Cancel
      </button>
    </div>
  );
}
