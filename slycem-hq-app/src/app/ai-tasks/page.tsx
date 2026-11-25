"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { preparePictures } from "./media.js";
import { useVoice } from "./voice";

const url = process.env.NEXT_PUBLIC_AI_TASKS_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_AI_TASKS_SUPABASE_KEY;
const db = url && key?.startsWith("sb_publishable_")
  ? createClient(url, key, { auth: { storageKey: "slycem-ai-tasks-auth" } })
  : null;

type Job = {
  id: string;
  parent_id: string | null;
  task: string;
  status: string;
  worker: string | null;
  result: string | null;
  ai_images?: { path: string } | { path: string }[] | null;
  ai_videos?: { path: string } | { path: string }[] | null;
};

const field = "w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white";
const button = "rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60";
const voicePreference = "slycem-hq-voice";
const autoplayPreference = "slycem-hq-autoplay";

export default function AiTasks() {
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [access, setAccess] = useState<{ user: string; allowed: boolean } | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [latestId, setLatestId] = useState<string | null | undefined>(undefined);
  const [voiceId, setVoiceId] = useState("");
  const [autoplay, setAutoplay] = useState(false);
  const submitted = useRef<string | null>(null);
  const composer = useRef<HTMLTextAreaElement | null>(null);
  const voice = useVoice(
    (text) => setTaskText((current) => (current.trim() ? current.trimEnd() + " " + text : text).slice(0, 12000)),
    setMessage,
  );
  const accessChecked = user !== null && access?.user === user;
  const member = accessChecked && access?.allowed === true;
  const latest = latestId === undefined ? jobs[0] : jobs.find((job) => job.id === latestId);
  const thread: Job[] = [];
  const visited = new Set<string>();
  for (let job = latest; job && !visited.has(job.id); job = jobs.find((item) => item.id === job?.parent_id)) {
    visited.add(job.id);
    thread.unshift(job);
  }
  const working = latest?.status === "queued" || latest?.status === "running";
  const replyTo = [...thread].reverse().find((job) => job.status === "completed" && job.result);
  const { speak, listening } = voice;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setVoiceId(localStorage.getItem(voicePreference) ?? "");
        setAutoplay(localStorage.getItem(autoplayPreference) === "true");
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!latest || submitted.current !== latest.id || working || listening) return;
    submitted.current = null;
    if (autoplay && latest.status === "completed" && latest.result) {
      speak(latest.id, latest.result, voiceId);
    }
  }, [latest, working, listening, autoplay, speak, voiceId]);

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
      const response = await client.from("ai_jobs").select("id,parent_id,task,status,worker,result,ai_images(path),ai_videos(path)")
        .order("created_at", { ascending: false }).limit(30);
      if (active) {
        if (!response.error) {
          const fresh = response.data ?? [];
          setJobs((current) => {
            const pending = current.find((job) => job.id === submitted.current);
            return pending && !fresh.some((job) => job.id === pending.id) ? [pending, ...fresh] : fresh;
          });
        }
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
    if (!db || !member || busy || voice.listening || working) return;
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
      const payload = {
        p_task: task, p_category: String(fields.get("category")), p_sources: { links, pictures, voice_chat: true },
      };
      const response = replyTo
        ? await db.rpc("ai_reply", { ...payload, p_parent: replyTo.id })
        : await db.rpc("ai_submit", payload);
      if (response.error) {
        setMessage(response.error.code === "22023" ? response.error.message : "Unable to queue the task.");
        return;
      }
      setJobs((current) => current.some((job) => job.id === response.data) ? current : [
        { id: response.data, parent_id: replyTo?.id ?? null, task, status: "queued", worker: null, result: null }, ...current,
      ]);
      submitted.current = response.data;
      setLatestId(response.data);
      form.reset();
      setTaskText("");
      setMessage("");
      window.requestAnimationFrame(() => composer.current?.scrollIntoView({ block: "center", behavior: "smooth" }));
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
            voice.cancelVoice();
            const response = await db?.auth.signOut();
            if (response?.error) { setMessage("Could not sign out. Please try again."); return; }
            submitted.current = null;
            setJobs([]); setAccess(null); setMessage(""); setTaskText(""); setLatestId(undefined);
          }}>Sign out</button>}
        </header>
        {!member && <p role="status" className="text-cyan-200">{message}</p>}
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
            <div className="flex flex-wrap justify-between gap-2">
              <button type="button" className="min-h-11 px-3 underline" disabled={busy} onClick={() => {
                voice.cancelVoice();
                submitted.current = null;
                setLatestId(null);
                setTaskText("");
                setMessage("");
              }}>New chat</button>
              <details className="max-w-full rounded-lg border border-slate-700 px-3">
                <summary className="min-h-11 cursor-pointer py-2">Voice settings</summary>
                <div className="space-y-3 pb-3">
                  <label className="block">Voice
                    <select className={field} value={voice.voices.some((v) => v.voiceURI === voiceId) ? voiceId : ""} onChange={(event) => {
                      const selected = event.target.value;
                      setVoiceId(selected);
                      try { localStorage.setItem(voicePreference, selected); } catch {}
                    }}>
                      <option value="">Device default</option>
                      {voice.voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                    </select>
                  </label>
                  <button type="button" className={button + " min-h-11"} disabled={listening} onClick={() => {
                    if (voice.speaking === "sample") voice.stopSpeaking();
                    else voice.speak("sample", "Hi! What would you like to work on today?", voiceId);
                  }}>{voice.speaking === "sample" ? "Stop sample" : "Play sample"}</button>
                  <label className="flex min-h-11 items-center gap-2">
                    <input type="checkbox" checked={autoplay} onChange={(event) => {
                      const enabled = event.target.checked;
                      setAutoplay(enabled);
                      try { localStorage.setItem(autoplayPreference, String(enabled)); } catch {}
                      if (enabled && !listening) voice.speak("sample", "I’ll read my replies out loud.", voiceId);
                    }} />
                    Speak replies automatically
                  </label>
                </div>
              </details>
            </div>
            <section className="space-y-4" aria-label="Conversation">
              {thread.map((job) => <article key={job.id} className="space-y-2">
                <p className="ml-8 rounded-2xl bg-cyan-950 p-4 whitespace-pre-wrap break-words"><strong>You</strong><br />{job.task}</p>
                <div className="mr-8 space-y-2 rounded-2xl border border-slate-700 bg-slate-900 p-4">
                  <p className="font-semibold">HQ</p>
                  {job.result && <p className="whitespace-pre-wrap break-words">{job.result}</p>}
                  {(job.status === "queued" || job.status === "running") && <p role="status">Working on it…</p>}
                  {job.status === "failed" && !job.result && <p>That task couldn’t finish.</p>}
                  {job.status === "completed" && job.result && <button type="button" className={button + " min-h-11"} disabled={listening} onClick={() => {
                    if (voice.speaking === job.id) voice.stopSpeaking();
                    else voice.speak(job.id, job.result!, voiceId);
                  }}>{voice.speaking === job.id ? "Stop reading" : "Read aloud"}</button>}
                  {job.ai_images && <MediaResult artifact={job.ai_images} kind="image" />}
                  {job.ai_videos && <MediaResult artifact={job.ai_videos} kind="video" />}
                </div>
              </article>)}
            </section>
            <form className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-6" onSubmit={submit}>
              <p role="status" className="text-cyan-200 empty:hidden">{message}</p>
              <button type="button" aria-pressed={voice.listening} aria-describedby="voice-note"
                className={button + " min-h-16 w-full text-xl"} onClick={voice.toggleTalk} disabled={busy}>
                {voice.listening ? "Done talking" : "Talk to HQ"}
              </button>
              <p id="voice-note" className="text-sm text-slate-300">Your device or browser turns speech into text. Tap Send when the message looks right.</p>
              {voice.preview && <p className="rounded-lg bg-slate-800 p-3">{voice.preview}</p>}
              <label className="block text-base">Your message
                <textarea ref={composer} className={field} name="task" rows={3} minLength={3} maxLength={12000}
                  value={taskText} onChange={(event) => setTaskText(event.target.value)} required />
              </label>
              <button className={button + " min-h-12 w-full"} disabled={busy || voice.listening || working}>Send</button>
              <details className="space-y-3">
                <summary className="min-h-11 cursor-pointer py-2 text-slate-200">Attachments and inbox</summary>
                <p className="text-sm text-slate-300">Start with “Create an image of…” or “Create a video of…” to generate media. Videos are short and silent.</p>
                <label className="block">Pictures or videos<input className={field} type="file" name="media" accept="image/*,video/*" multiple /></label>
                <p className="text-sm text-slate-300">HQ reads pictures and samples four frames per video. Video audio is unavailable.</p>
                <label className="block">Public links (up to three, one per line)<textarea className={field} name="links" rows={2} /></label>
                <label className="block">Inbox<select className={field} name="category" defaultValue="auto">
                  <option value="auto">Choose automatically</option>
                  <option value="content">Content</option><option value="business">Business</option>
                  <option value="education">Education</option><option value="personal">Personal</option>
                </select></label>
              </details>
            </form>
            <details className="space-y-3">
              <summary className="min-h-11 cursor-pointer py-2 text-lg">Task history</summary>
              {!jobs.length && <p>No tasks yet.</p>}
              {jobs.map((job) => <button type="button" key={job.id} disabled={busy}
                className="block min-h-12 w-full rounded-lg border border-slate-700 p-3 text-left"
                onClick={() => {
                  voice.cancelVoice();
                  setLatestId(job.id);
                  composer.current?.scrollIntoView({ block: "center", behavior: "smooth" });
                }}>
                <span className="block truncate">{job.task}</span>
                <span className="text-sm text-slate-300">{job.worker ? job.worker + " · " : ""}{job.status}</span>
              </button>)}
            </details>
          </>
        )}
      </div>
    </main>
  );
}

function MediaResult({ artifact, kind }: { artifact: NonNullable<Job["ai_images"]>; kind: "image" | "video" }) {
  const path = Array.isArray(artifact) ? artifact[0]?.path : artifact.path;
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  if (!path || !db) return null;
  if (imageUrl) return (
    <figure className="space-y-2">
      {kind === "video" ? (
        <video className="w-full rounded-lg" src={imageUrl} controls playsInline muted aria-label="AI-generated silent video" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="rounded-lg" src={imageUrl} alt="AI-generated result" />
      )}
      <a className="underline" href={imageUrl} download={kind === "video" ? "slycem-hq-video.mp4" : "slycem-hq-image.png"}>Download {kind}</a>
    </figure>
  );
  return (
    <>
      <button className={button} disabled={loading} onClick={async () => {
        if (!db || loading) return;
        setLoading(true);
        setError("");
        try {
          const response = await db.storage.from(kind === "video" ? "ai-task-videos" : "ai-task-images").download(path);
          if (response.error) throw response.error;
          setImageUrl(URL.createObjectURL(response.data));
        } catch {
          setError("Could not open this " + kind + ". Try again.");
        } finally {
          setLoading(false);
        }
      }}>{loading ? "Loading " + kind + "…" : "View generated " + kind}</button>
      {error && <p role="status">{error}</p>}
    </>
  );
}
