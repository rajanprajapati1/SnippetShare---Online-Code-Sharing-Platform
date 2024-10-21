import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { themes } from "../config/Theme";

const languages = [
  { name: "JavaScript", value: "javascript" },
  { name: "TypeScript", value: "typescript" },
  { name: "Python", value: "python" },
  { name: "HTML", value: "html" },
  { name: "CSS", value: "css" },
];

export default function CodeEditor({ onChange, code }) {
  const [theme, setTheme] = useState("vs-dark");
  const [language, setLanguage] = useState("javascript");
  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="logo"> <strong>{`</>`}</strong> SnippetShare</div>
        <div className="editor-controls">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-selector"
          >
            {themes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Editor
        height="100vh"
        width={"100%"}
        defaultLanguage="javascript"
        value={code}
        onChange={onChange}
        theme={theme}
        language={language}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
