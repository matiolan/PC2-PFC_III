"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { FileUp, Loader2, Lock, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerEvidenceAction } from "@/app/panel/formalizacion/actions";
import { Alert, Button, Field, Input } from "@/components/ui";
import { levelInfo } from "@/lib/domain";
import { EVIDENCE_TYPES, validateEvidenceFile, type FormState } from "@/lib/validation";

const PLACEHOLDER: Record<number, string> = { 1: "45871236", 2: "20123456789", 3: "LF-2026-0481", 4: "TR-2026-1177" };

/** HU06: carga de la evidencia del siguiente nivel a almacenamiento privado. */
export function EvidenceUploader({ userId, level }: { userId: string; level: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [docNumber, setDocNumber] = useState("");
  const [state, setState] = useState<FormState>({});
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const info = levelInfo(level);

  function pick(f: File | undefined) {
    if (!f) return;
    const problem = validateEvidenceFile(f);
    setState(problem ? { errors: { file: [problem] } } : {});
    setFile(problem ? null : f);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setState({ errors: { file: ["Adjunta el documento escaneado o una foto legible."] } });
    startTransition(async () => {
      const ext = EVIDENCE_TYPES[file.type as keyof typeof EVIDENCE_TYPES];
      const path = `${userId}/${level}-${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("evidencias").upload(path, file, { contentType: file.type, upsert: false });
      if (error) return setState({ message: "No se pudo subir el archivo. Revisa tu conexión e inténtalo de nuevo." });
      const result = await registerEvidenceAction({ level, doc_number: docNumber, file_path: path });
      setState(result);
      if (result.ok) {
        setFile(null);
        setDocNumber("");
        router.refresh();
      }
    });
  }

  if (state.ok) return <Alert tone="success">{state.message}</Alert>;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl bg-brand-50/50 p-4 ring-1 ring-brand-100" noValidate>
      <p className="text-sm font-semibold text-ink-900">Envía tu {info.docLabel.toLowerCase()}</p>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Field label="Número del documento" htmlFor="doc_number" error={state.errors?.doc_number?.[0]}>
        <Input
          id="doc_number"
          value={docNumber}
          onChange={(e) => setDocNumber(e.target.value)}
          placeholder={PLACEHOLDER[level]}
          aria-invalid={!!state.errors?.doc_number}
          autoComplete="off"
        />
      </Field>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files[0]);
          }}
          className={clsx(
            "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition",
            dragging ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white hover:border-brand-300",
          )}
        >
          {file ? <FileUp className="size-6 text-brand-600" aria-hidden /> : <UploadCloud className="size-6 text-ink-400" aria-hidden />}
          <span className="text-sm font-medium text-ink-800">{file ? file.name : "Arrastra el archivo o haz clic para elegirlo"}</span>
          <span className="text-xs text-ink-500">PDF, JPG o PNG · máximo 5 MB</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0])}
          aria-label="Archivo del documento"
        />
        {state.errors?.file && <p className="mt-1.5 text-xs font-medium text-red-600">{state.errors.file[0]}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <Lock className="size-3.5" aria-hidden /> Almacenamiento privado: solo tú y el gestor pueden verlo.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <FileUp className="size-4" aria-hidden />}
          {pending ? "Enviando…" : "Enviar para verificación"}
        </Button>
      </div>
    </form>
  );
}
