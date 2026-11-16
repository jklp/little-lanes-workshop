import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/board/$id")({
  head: () => ({
    meta: [
      { title: "Board — Boards" },
      { name: "description", content: "Move your cards from backlog to done." },
      { property: "og:title", content: "Board — Boards" },
      { property: "og:description", content: "Move your cards from backlog to done." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <AppShell>
        <Board id={id} />
      </AppShell>
    );
  },
});

const COLUMNS = [
  { key: "backlog", label: "Backlog" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
] as const;
type Status = (typeof COLUMNS)[number]["key"];
type Card = { id: string; title: string; description: string; status: Status };
type Editing = { id?: string; title: string; description: string; status: Status };

function Board({ id }: { id: string }) {
  const [name, setName] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [dragOver, setDragOver] = useState<Status | null>(null);

  async function load() {
    const [{ data: b }, { data: c }] = await Promise.all([
      supabase.from("boards").select("name").eq("id", id).maybeSingle(),
      supabase.from("cards").select("id,title,description,status").eq("board_id", id).order("created_at"),
    ]);
    setName(b?.name ?? "");
    setCards((c ?? []) as Card[]);
  }
  useEffect(() => { load(); }, [id]);

  async function move(cardId: string, status: Status) {
    setCards((cs) => cs.map((c) => (c.id === cardId ? { ...c, status } : c)));
    await supabase.from("cards").update({ status }).eq("id", cardId);
  }

  async function save() {
    if (!editing || !editing.title.trim()) return;
    const payload = { title: editing.title.trim(), description: editing.description, status: editing.status };
    if (editing.id) await supabase.from("cards").update(payload).eq("id", editing.id);
    else await supabase.from("cards").insert({ ...payload, board_id: id });
    setEditing(null);
    load();
  }
  async function remove() {
    if (!editing?.id) return;
    await supabase.from("cards").delete().eq("id", editing.id);
    setEditing(null);
    load();
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center text-sm text-primary"><ChevronLeft className="size-4" />Boards</Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{name}</h1>
      <div className="mt-8 grid grid-cols-3 gap-5">
        {COLUMNS.map((col) => {
          const list = cards.filter((c) => c.status === col.key);
          return (
            <section
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => { e.preventDefault(); setDragOver(null); move(e.dataTransfer.getData("text/plain"), col.key); }}
              className={`min-h-[60vh] rounded-2xl bg-muted p-3 transition ${dragOver === col.key ? "ring-2 ring-ring" : ""}`}
            >
              <div className="flex items-center justify-between px-2 pb-3 pt-1">
                <h2 className="text-sm font-semibold">{col.label} <span className="ml-1 font-normal text-muted-foreground">{list.length}</span></h2>
                <button aria-label={`Add card to ${col.label}`} onClick={() => setEditing({ title: "", description: "", status: col.key })} className="text-muted-foreground hover:text-foreground">
                  <Plus className="size-4" />
                </button>
              </div>
              <div className="space-y-2">
                {list.map((c) => (
                  <button
                    key={c.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                    onClick={() => setEditing({ ...c })}
                    className="block w-full cursor-grab rounded-xl bg-card p-3.5 text-left shadow-card active:cursor-grabbing"
                  >
                    <div className="text-[14px] font-medium">{c.title}</div>
                    {c.description && <div className="mt-1 line-clamp-3 text-[13px] text-muted-foreground">{c.description}</div>}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Card" : "New Card"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Input autoFocus placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-xl" />
              <Textarea placeholder="Description" rows={5} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="rounded-xl" />
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            {editing?.id ? <Button variant="ghost" onClick={remove} className="text-destructive hover:text-destructive">Delete</Button> : <span />}
            <Button onClick={save} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
