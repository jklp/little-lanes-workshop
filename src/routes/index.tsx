import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PlanOptions } from "@/components/PlanOptions";
import { useSession } from "@/lib/auth";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/")({
  head: () => pageHead("Boards — A little space for your work", "Simple, private task boards. Start free with 10 cards, or choose unlimited cards from $5 USD per month."),
  component: Landing,
});
function Landing() {
  const { session } = useSession();
  return <div>
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
        <Link to="/" className="text-xl font-semibold">Boards</Link>
        <div className="flex items-center gap-4">
          {session ? <><Button variant="link" asChild><Link to="/account">Account</Link></Button><Button asChild><Link to="/boards">Open Boards</Link></Button></> : <><Button variant="link" asChild><Link to="/auth" search={{ mode: "signin" }}>Sign In</Link></Button><Button asChild><Link to="/auth" search={{ mode: "signup" }}>Create Account</Link></Button></>}
        </div>
      </nav>
    </header>
    <main>
      <section className="bg-card pt-20 text-center">
        <div className="mx-auto max-w-3xl px-8">
          <h1 className="text-7xl font-semibold">Boards</h1>
          <p className="mt-6 text-2xl text-muted-foreground">A little space for your work.</p>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground">From the first idea to the final task.<br />Keep it simple. Keep it yours.</p>
          <div className="mt-7 flex justify-center gap-4"><Button size="lg" asChild>{session ? <Link to="/boards">Open Boards</Link> : <Link to="/auth" search={{ mode: "signup" }}>Get Started Free</Link>}</Button></div>
        </div>
        <div className="mx-auto mt-14 max-w-5xl px-8">
          <img src="/boards-preview.png" width="1024" height="520" alt="A private board with Backlog, In Progress, and Done columns, and simple title-and-description cards" className="block w-full rounded-t-lg border border-b-0 border-border shadow-card" />
        </div>
      </section>
      <section className="border-y border-border py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-12 px-8">
          <div><h2 className="text-lg font-semibold">Just the essentials.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Backlog. In Progress. Done.<br />A title, a description, and room to focus.</p></div>
          <div><h2 className="text-lg font-semibold">Your own space.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Private boards for your projects.<br />No teams, invitations, or distractions.</p></div>
          <div><h2 className="text-lg font-semibold">Room to grow.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Start with 10 cards for free.<br />Choose unlimited when you need more.</p></div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-8 py-20">
        <div className="mb-10 text-center"><h2 className="text-3xl font-semibold">Simple plans.</h2><p className="mt-3 text-muted-foreground">A small start. As much room as you need.</p></div>
        <PlanOptions current={session ? "free" : undefined} />
        <p className="mt-6 text-center text-sm text-muted-foreground">Paid subscriptions are not yet available.</p>
      </section>
    </main>
    <footer className="border-t border-border"><div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-7 text-sm text-muted-foreground"><span>Boards</span><span>Less noise. More done.</span></div></footer>
  </div>;
}
