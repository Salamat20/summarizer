"use client";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSummarize() {
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setSummary(data.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 16, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Text Summarizer</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text here..."
        rows={10}
        style={{
          width: "100%",
          padding: 10,
          border: "1px solid #666",
          borderRadius: 6,
          background: "transparent",
          color: "inherit",
        }}
      />
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{text.length.toLocaleString()} / 20,000 characters</p>

      <button
        onClick={handleSummarize}
        disabled={loading || !text.trim()}
        style={{
          marginTop: 8,
          padding: "8px 16px",
          border: "1px solid #666",
          borderRadius: 6,
          cursor: loading || !text.trim() ? "not-allowed" : "pointer",
          opacity: loading || !text.trim() ? 0.5 : 1,
        }}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      {summary && (
        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Summary</h2>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{summary}</p>
        </section>
      )}
    </main>
  );
}