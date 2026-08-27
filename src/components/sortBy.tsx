// SortDropdown.tsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowUpNarrowWide, ArrowDownWideNarrow } from "lucide-react";

type SortOrder = "asc" | "desc";

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortOrder;
  onChange: (order: SortOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { label: string; value: SortOrder }[] = [
    { label: "Ascending", value: "asc" },
    { label: "Descending", value: "desc" },
  ];

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        Sort By
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-gray-200 bg-black text-gray-50 py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white hover:text-gray-800 hover:bg-gray-50 ${
                value === opt.value
                  ? "font-medium text-gray-900"
                  : "text-gray-600"
              }`}
            >
              {opt.value === "asc" ? (
                <ArrowUpNarrowWide className="h-4 w-4" />
              ) : (
                <ArrowDownWideNarrow className="h-4 w-4" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}