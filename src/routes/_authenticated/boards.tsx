import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/boards")({
  head: () => ({
    meta: [
      { title: "Boards — Your boards" },
      { name: "description", content: "A clean, simple board for your tasks: backlog, in progress, done." },
      { property: "og:title", content: "Boards — Your boards" },
      { property: "og:description", content: "A clean, simple board for your tasks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <BoardList />
    </>
  ),
});

type Board = { id: string; name: string };

function BoardList() {
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [name, setName] = useState("");

  async function load() {
    const { data } = await supabase.from("boards").select("id,name").order("created_at");
    setBoards(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("boards").insert({ name: name.trim() });
    if (error) { toast.error(error.message); return; }
    setName("");
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this board and all its cards?")) return;
    await supabase.from("boards").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Your Boards</h1>
      <form onSubmit={create} className="mt-8 flex max-w-md gap-2">
        <Input placeholder="New board name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-xl bg-card" />
        <Button type="submit" className="h-10 rounded-xl"><Plus className="size-4" />Create</Button>
      </form>
      {boards && boards.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">No boards yet. Create one to get started.</p>
      )}
      <div className="mt-10 grid grid-cols-3 gap-5">
        {boards?.map((b) => (
          <div key={b.id} className="group relative rounded-2xl bg-card shadow-card transition hover:-translate-y-0.5">
            <Link to="/board/$id" params={{ id: b.id }} className="block h-32 p-6">
              <span className="text-lg font-medium">{b.name}</span>
            </Link>
            <button aria-label="Delete board" onClick={() => remove(b.id)} className="absolute bottom-4 right-4 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
