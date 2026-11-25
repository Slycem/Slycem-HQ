"use client";

import { useEffect, useRef, useState } from "react";

type SpeechResult = {
  [index: number]: { transcript: string };
};
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type VoiceWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

export function useVoice(
  onTranscript: (text: string) => void,
  onStatus: (text: string) => void,
) {
  const active = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [preview, setPreview] = useState("");

  useEffect(() => () => {
    const recognition = active.current;
    active.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    }
    window.speechSynthesis?.cancel();
  }, []);

  function cancelVoice() {
    const recognition = active.current;
    active.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    }
    setListening(false);
    setPreview("");
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function toggleTalk() {
    if (active.current) {
      active.current.stop();
      return;
    }
    const browser = window as VoiceWindow;
    const Engine = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Engine) {
      onStatus("Use the microphone on your keyboard to dictate in the message box.");
      return;
    }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    const recognition = new Engine();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    let transcript = "";
    let failed = false;
    recognition.onresult = (event) => {
      transcript = Array.from(event.results, (result) => result[0].transcript).join(" ").trim();
      setPreview(transcript);
    };
    recognition.onerror = (event) => {
      failed = true;
      onStatus(event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Microphone access is off. Allow it for this site, or use keyboard dictation."
        : "I couldn’t hear that. Try again, type, or use keyboard dictation.");
    };
    recognition.onend = () => {
      if (active.current !== recognition) return;
      active.current = null;
      setListening(false);
      setPreview("");
      if (transcript && !failed) {
        onTranscript(transcript);
        onStatus("Check what I heard, then tap Send.");
      } else if (!failed) {
        onStatus("I didn’t catch anything. Tap Talk to try again.");
      }
    };
    active.current = recognition;
    try {
      recognition.start();
      setListening(true);
      onStatus("Listening…");
    } catch {
      active.current = null;
      onStatus("Voice input couldn’t start. Try keyboard dictation.");
    }
  }

  function toggleSpeak(text: string) {
    if (!("speechSynthesis" in window)) {
      onStatus("This browser cannot read replies aloud.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const plain = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[\x60*_#]/g, "");
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 0.95;
    utterance.onend = utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return { listening, speaking, preview, toggleTalk, toggleSpeak, cancelVoice };
}
