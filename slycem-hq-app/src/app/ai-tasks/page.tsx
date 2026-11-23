"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState, type FormEvent } from "react";
import { preparePictures } from "./media.js";

const url = process.env.NEXT_PUBLIC_AI_TASKS_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_AI_TASKS_SUPABASE_KEY;
const db = url && key?.startsWith("sb_publishable_")
  ? createClient(url, key, { auth: { storageKey: "slycem-ai-tasks-auth" } })
  : null;

type Job = {
  id: string;
  task: string;
  status: string;
  worker: string | null;
  result: string | null;
  ai_images?: { path: string } | { path: string }[] | null;
};

const field = "w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white";
const button = "rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60";

export default function AiTasks() {
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [access, setAccess] = useState<{ user: string; allowed: boolean } | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const accessChecked = user !== null && access?.user === user;
  const member = accessChecked && access?.allowed === true;

  useEffect(() => {
    if (!db) return;
    const { data: { subscription } } = db.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      setUser(session?.user.id ?? null);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!db || !user) return;
    const client = db;
    const userId = user;
    let active = true;
    async function refresh() {
      const membership = await client.from("ai_members").select("user_id").eq("user_id", userId).maybeSingle();
      if (!active) return;
      if (!membership.data) {
        setAccess({ user: userId, allowed: false });
        setJobs([]);
        if (membership.error) setMessage("Could not check your invitation. Please try again.");
        return;
      }
      const response = await client.from("ai_jobs").select("id,task,status,worker,result,ai_images(path)")
        .order("created_at", { ascending: false }).limit(30);
      if (active) {
        setJobs(response.data ?? []);
        setAccess({ user: userId, allowed: true });
      }
    }
    void refresh();
    const timer = window.setInterval(refresh, 7000);
    return () => { active = false; window.clearInterval(timer); };
  }, [user]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db) return;
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email")).trim();
    const password = String(fields.get("password"));
    setBusy(true);
    const response = await db.auth.signInWithPassword({ email, password });
    setBusy(false);
    setMessage(response.error ? "Sign-in failed. Check your email and password." : "");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !member || busy) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const task = String(fields.get("task")).trim();
    const links = String(fields.get("links")).split(/\r?\n/).map((link) => link.trim()).filter(Boolean);
    const files = fields.getAll("media").filter((file): file is File => file instanceof File && file.size > 0);
    if (task.length < 3 || links.length > 3) {
      setMessage("Enter a task and up to three links.");
      return;
    }
    setBusy(true);
    setMessage(files.length ? "Preparing media…" : "Submitting task…");
    try {
      const pictures = await preparePictures(files);
      const response = await db.rpc("ai_submit", {
        p_task: task, p_category: String(fields.get("category")), p_sources: { links, pictures },
      });
      if (response.error) {
        setMessage(response.error.code === "22023" ? response.error.message : "Unable to queue the task.");
        return;
      }
      setJobs((current) => current.some((job) => job.id === response.data) ? current : [
        { id: response.data, task, status: "queued", worker: null, result: null }, ...current,
      ]);
      form.reset();
      setMessage("Task queued.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to read the attachments.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">SLYCEM HQ · AI Tasks</h1>
          {user && <button className="underline" onClick={async () => {
            const response = await db?.auth.signOut();
            if (response?.error) { setMessage("Could not sign out. Please try again."); return; }
            setJobs([]); setAccess(null); setMessage("");
          }}>Sign out</button>}
        </header>
        {!db && <p>AI Tasks is being set up.</p>}
        {db && !ready && <p>Checking sign-in…</p>}
        {db && ready && !user && (
          <form className="space-y-3" onSubmit={signIn}>
            <p>Sign in with the email address on your invitation.</p>
            <label className="block">Email<input className={field} name="email" type="email" autoComplete="email" required /></label>
            <label className="block">Password<input className={field} name="password" type="password" autoComplete="current-password" required /></label>
            <button className={button} disabled={busy}>Sign in</button>
          </form>
        )}
        {user && (!accessChecked ? <p>Checking your invitation…</p> : !member && <p>An AI Tasks invitation is required.</p>)}
        {user && member && (
          <>
            <form className="space-y-4" onSubmit={submit}>
              <label className="block">What should HQ work on?<textarea className={field} name="task" rows={4} minLength={3} maxLength={12000} required /></label>
              <p className="text-sm text-slate-300">For a new image, start with “Create an image of…” and describe what you want.</p>
              <label className="block">Pictures or videos<input className={field} type="file" name="media" accept="image/*,video/*" multiple /></label>
              <p className="text-sm text-slate-300">HQ reads pictures and samples four frames per video. Video audio is unavailable.</p>
              <label className="block">Public links (up to three, one per line)<textarea className={field} name="links" rows={2} /></label>
              <label className="block">Inbox<select className={field} name="category">
                <option value="auto">Choose automatically</option>
                <option value="content">Content</option><option value="business">Business</option>
                <option value="education">Education</option><option value="personal">Personal</option>
              </select></label>
              <button className={button} disabled={busy}>Submit task</button>
            </form>
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Your jobs</h2>
              {!jobs.length && <p>No tasks yet.</p>}
              {jobs.map((job) => <article key={job.id} className="space-y-2 rounded-lg border border-slate-700 p-4">
                <p className="break-words font-semibold">{job.task}</p>
                <p className="text-sm text-slate-300">{job.worker ? job.worker + " · " : ""}{job.status}</p>
                {job.result && <p className="whitespace-pre-wrap break-words">{job.result}</p>}
                {job.ai_images && <ImageResult image={job.ai_images} />}
              </article>)}
            </section>
          </>
        )}
        <p role="status" className="text-cyan-200">{message}</p>
      </div>
    </main>
  );
}

function ImageResult({ image }: { image: NonNullable<Job["ai_images"]> }) {
  const path = Array.isArray(image) ? image[0]?.path : image.path;
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  if (!path || !db) return null;
  if (imageUrl) return (
    <figure className="space-y-2">
      {/* The browser owns this private blob URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="rounded-lg" src={imageUrl} alt="AI-generated result" />
      <a className="underline" href={imageUrl} download="slycem-hq-image.png">Download image</a>
    </figure>
  );
  return (
    <>
      <button className={button} disabled={loading} onClick={async () => {
        if (!db || loading) return;
        setLoading(true);
        setError("");
        try {
          const response = await db.storage.from("ai-task-images").download(path);
          if (response.error) throw response.error;
          setImageUrl(URL.createObjectURL(response.data));
        } catch {
          setError("Could not open this image. Try again.");
        } finally {
          setLoading(false);
        }
      }}>{loading ? "Loading image…" : "View generated image"}</button>
      {error && <p role="status">{error}</p>}
    </>
  );
}
