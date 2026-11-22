import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Braces,
  Command,
  FileCode2,
  FolderKanban,
  FolderTree,
  Layers3,
  Sparkles,
  Terminal,
} from "lucide-react";
import Reveal from "./Reveal";

const features = [
  {
    icon: Bot,
    title: "AI coding assistant",
    description: "Ask questions with your project files in context, right beside the code you’re working on.",
    accent: "border-violet-300/10 bg-violet-400/[0.06] text-violet-200",
  },
  {
    icon: Terminal,
    title: "Browser-based code editor",
    description: "Open and edit project files in a familiar coding workspace without leaving your browser.",
    accent: "border-cyan-300/10 bg-cyan-400/[0.05] text-cyan-200",
  },
  {
    icon: FolderKanban,
    title: "Project management",
    description: "Keep project names and descriptions organized, and return to your work in a click.",
    accent: "border-teal-300/10 bg-teal-400/[0.05] text-teal-200",
  },
  {
    icon: FolderTree,
    title: "File and folder management",
    description: "Create, rename, move, and organize files with a workspace built around your project.",
    accent: "border-violet-300/10 bg-violet-400/[0.06] text-violet-200",
  },
  {
    icon: Sparkles,
    title: "Intelligent code assistance",
    description: "Get a helping hand from the AI panel while keeping your active file close at hand.",
    accent: "border-cyan-300/10 bg-cyan-400/[0.05] text-cyan-200",
  },
  {
    icon: Layers3,
    title: "Unified development workspace",
    description: "Bring project organization, file editing, and AI assistance together in one place.",
    accent: "border-teal-300/10 bg-teal-400/[0.05] text-teal-200",
  },
];

function WorkspacePreview() {
  return (
    <div className="relative mx-auto mt-12 w-full max-w-5xl animate-rise-in [animation-delay:180ms]">
      <div className="overflow-hidden rounded-2xl border border-[#1b2732] bg-[#080d12]">
        <div className="flex h-12 items-center justify-between border-b border-white/[0.07] bg-white/[0.025] px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-rose-400/80" />
            <span className="size-2.5 rounded-full bg-amber-300/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-3 hidden items-center gap-2 text-xs text-slate-400 sm:inline-flex">
              <FolderKanban className="size-3.5 text-violet-300" /> devmate-starter
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400">
            <span className="size-1.5 rounded-full bg-emerald-400" /> Workspace
          </div>
        </div>

        <div className="grid min-h-[310px] grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)]">
          <aside className="hidden border-r border-[#1b2732] bg-[#080d12] p-4 md:block">
            <div className="mb-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Explorer <FolderTree className="size-3.5" />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 rounded-md bg-violet-500/10 px-2 py-2 text-violet-200">
                <FolderTree className="size-3.5" /> src
              </div>
              <div className="ml-4 flex items-center gap-2 rounded-md bg-white/[0.04] px-2 py-2 text-slate-200">
                <FileCode2 className="size-3.5 text-sky-300" /> page.tsx
              </div>
              <div className="ml-4 flex items-center gap-2 px-2 py-2 text-slate-500">
                <FileCode2 className="size-3.5" /> layout.tsx
              </div>
              <div className="flex items-center gap-2 px-2 py-2 text-slate-500">
                <FolderTree className="size-3.5" /> components
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex h-10 items-center gap-2 border-b border-white/[0.07] px-4 text-xs text-slate-300">
              <FileCode2 className="size-3.5 text-sky-300" /> page.tsx
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="size-1.5 rounded-full bg-emerald-400" /> All changes saved
              </span>
            </div>
            <div className="grid grid-cols-[30px_minmax(0,1fr)] gap-x-3 overflow-hidden px-4 py-5 font-mono text-[11px] leading-7 sm:px-7 sm:text-xs">
              <div className="select-none text-right text-slate-700">1<br />2<br />3<br />4<br />5<br />6<br />7</div>
              <div className="overflow-hidden whitespace-nowrap text-slate-300">
                <span className="text-violet-300">export default</span> <span className="text-sky-300">function</span> <span className="text-amber-200">Workspace</span>() {"{"}<br />
                {"  "}<span className="text-violet-300">return</span> (<br />
                {"    "}&lt;<span className="text-cyan-300">main</span> <span className="text-sky-200">className</span>=<span className="text-emerald-300">&quot;workspace&quot;</span>&gt;<br />
                {"      "}&lt;<span className="text-cyan-300">ProjectFiles</span> /&gt;<br />
                {"      "}&lt;<span className="text-cyan-300">AIAssistant</span> <span className="text-sky-200">context</span>={"{project}"} /&gt;<br />
                {"    "}&lt;/<span className="text-cyan-300">main</span>&gt;<br />
                {"  "});<br />
                {"}"}
              </div>
            </div>
            <div className="mx-4 mb-4 flex items-start gap-3 rounded-xl border border-[#1b2732] bg-[#101820] p-3.5 sm:mx-6">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-400/15 text-violet-200">
                <Sparkles className="size-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-200">AI Assistant</p>
                <p className="mt-1 text-[10px] leading-5 text-slate-400">Ask about your project and get help without losing focus.</p>
              </div>
              <Braces className="ml-auto mt-1 size-4 shrink-0 text-violet-300/60" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 right-4 hidden items-center gap-2 rounded-lg border border-[#1b2732] bg-[#101820] px-3 py-2 text-[11px] text-slate-300 sm:flex">
        <Sparkles className="size-3.5 text-violet-300" /> Ideas to working code
      </div>
    </div>
  );
}

export default function LandingExperience() {
  return (
    <main>
      <section className="relative overflow-hidden px-5 pb-16 pt-20 sm:px-8 sm:pt-24 lg:px-12 lg:pb-20 lg:pt-28">
        <div className="mx-auto max-w-7xl text-center">
          <div className="animate-rise-in inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[0.045] px-3.5 py-1.5 text-xs font-medium text-violet-100">
            <Sparkles className="size-3.5 text-violet-300" />
            AI-powered development workspace
            <span className="ml-1 size-1.5 rounded-full bg-teal-300" />
          </div>

          <h1 className="animate-rise-in mx-auto mt-7 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white [animation-delay:80ms] sm:text-6xl lg:text-[4.5rem]">
            Build smarter.
            <br className="hidden sm:block" /> <span className="bg-gradient-to-r from-violet-300 via-blue-300 to-teal-200 bg-clip-text text-transparent">Code faster.</span>
          </h1>
          <p className="animate-rise-in mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 [animation-delay:140ms] sm:text-lg sm:leading-8">
            Your projects, code editor, and AI assistant — together in one focused development workspace.
          </p>
          <div className="animate-rise-in mt-8 flex flex-col items-center justify-center gap-3 [animation-delay:200ms] sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#000102]"
            >
              Get Started <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#workspace-preview"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-teal-300/20 bg-teal-300/[0.045] px-5 text-sm font-medium text-teal-100 transition hover:border-teal-300/40 hover:bg-teal-300/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              Explore Workspace <ArrowDown className="size-4 text-teal-200 transition-transform group-hover:translate-y-0.5" />
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">A considered workspace for the way you build.</p>

          <div
            id="workspace-preview"
            className="scroll-mt-24"
            role="img"
            aria-label="Illustrative workspace preview showing a project file explorer, code editor, and AI assistant panel"
          >
            <WorkspacePreview />
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-slate-600">Illustrative workspace preview</p>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 border-y border-[#1b2732] bg-[#080d12] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <Reveal className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">Built to stay in flow</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your development space, thoughtfully connected.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">The essentials for turning a good idea into a project you can keep building.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, accent }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-[#1b2732] bg-[#101820] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-500/50 hover:bg-[#141d27] sm:p-6"
              >
                <div className={`mb-6 flex size-10 items-center justify-center rounded-xl border ${accent}`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-100">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                <ArrowRight className="absolute bottom-6 right-6 size-4 translate-x-1 text-violet-300 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="about" className="scroll-mt-20 relative overflow-hidden px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <Reveal className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">Why DevMate AI</p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">Less context switching.<br /><span className="text-slate-400">More making.</span></h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Your ideas, project files, and AI support live side by side. Keep the important context close and spend more of your time building.
            </p>
            <Link href="/dashboard" className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-teal-200 transition hover:text-teal-100">
              See your workspace <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[#1b2732] bg-[#101820] p-6 sm:p-8">
            <div className="flex items-center gap-4 border-b border-[#1b2732] pb-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200"><Layers3 className="size-5" /></span>
              <div>
                <p className="text-sm font-semibold text-white">One connected workflow</p>
                <p className="mt-1 text-xs text-slate-500">Keep your attention on the idea.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg border border-violet-300/15 bg-violet-400/[0.07] px-3 py-2 text-violet-100">Projects</span>
              <ArrowRight className="size-3.5 text-slate-600" />
              <span className="rounded-lg border border-blue-300/15 bg-blue-400/[0.06] px-3 py-2 text-blue-100">Your code</span>
              <ArrowRight className="size-3.5 text-slate-600" />
              <span className="rounded-lg border border-teal-300/15 bg-teal-400/[0.06] px-3 py-2 text-teal-100">AI assistance</span>
            </div>
            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400">A single focused space helps you move from organizing work to editing and getting help in context.</p>
          </div>
        </Reveal>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-12 lg:pb-20">
        <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-[#1b2732] bg-[#080d12] px-6 py-11 text-center sm:px-12 sm:py-14">
          <span className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/40 to-transparent" />
          <div className="relative">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">Ready when you are</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Start building your next idea.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">Bring your project into a workspace designed to keep your thinking and making connected.</p>
            <Link href="/register" className="group mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
              Get Started <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[#1b2732] bg-[#080d12] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-slate-100">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-indigo-600 text-white"><Command className="size-4" /></span>
                DevMate <span className="-ml-2 text-violet-300">AI</span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-slate-500">A focused developer workspace for your projects, code, and AI-assisted ideas.</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Product</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                <Link href="#workspace-preview" className="transition hover:text-teal-200">Workspace</Link>
                <Link href="/dashboard" className="transition hover:text-teal-200">Dashboard</Link>
                <Link href="#about" className="transition hover:text-teal-200">Why DevMate</Link>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Explore</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                <Link href="#features" className="transition hover:text-teal-200">Features</Link>
                <Link href="#workspace-preview" className="transition hover:text-teal-200">AI assistant</Link>
                <Link href="#workspace-preview" className="transition hover:text-teal-200">Code editor</Link>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Account</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                <Link href="/login" className="transition hover:text-teal-200">Sign in</Link>
                <Link href="/register" className="transition hover:text-teal-200">Create account</Link>
              </div>
            </div>
          </div>
          <div className="mt-9 flex flex-col gap-2 border-t border-white/[0.06] pt-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} DevMate AI. Built for the work ahead.</p>
            <p>Thoughtful tools for what you&apos;re building.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
