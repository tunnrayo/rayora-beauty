"use client";

import { useState } from "react";

export default function QuantityInput({ max, name = "quantity", initial = 1, min = 1 }: { max: number; name?: string; initial?: number; min?: number }) {
  const [value, setValue] = useState(Math.min(Math.max(initial, min), Math.max(max, min)));
  const clamp = (n: number) => Math.min(Math.max(n, min), Math.max(max, min));

  return (
    <div className="inline-flex items-center rounded-full border border-charcoal">
      <button type="button" aria-label="Decrease quantity" onClick={() => setValue((v) => clamp(v - 1))} className="h-11 w-11 text-lg">
        −
      </button>
      <input
        name={name}
        type="number"
        inputMode="numeric"
        aria-label="Quantity"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(clamp(Number(e.target.value) || min))}
        className="h-11 w-12 bg-transparent text-center text-sm [appearance:textfield]"
      />
      <button type="button" aria-label="Increase quantity" onClick={() => setValue((v) => clamp(v + 1))} className="h-11 w-11 text-lg">
        +
      </button>
    </div>
  );
}
