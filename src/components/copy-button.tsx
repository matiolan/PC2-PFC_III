"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui";

export function CopyButton({ text, label = "Copiar enlace" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text.startsWith("/") ? `${window.location.origin}${text}` : text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="size-4 text-mint-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? "¡Copiado!" : label}
    </Button>
  );
}
