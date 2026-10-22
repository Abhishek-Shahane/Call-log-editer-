import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  FileCode,
  FileText,
  FolderGit2,
  Terminal,
  Layers,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { ALL_ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidProjectFiles';
import { downloadAndroidProjectZip } from '../utils/exportZip';

export const NativeCodeViewer: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<string>('MainActivity.kt');
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const activeFile =
    ALL_ANDROID_PROJECT_FILES.find(f => f.name === selectedFileName) ||
    ALL_ANDROID_PROJECT_FILES[0];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name.replace(/\s\(.+\)/, '');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyPrompt = async () => {
    const fullPrompt = `Build a native Android application using Kotlin and Jetpack Compose that injects random outgoing calls into the system's Call Log.

1. App Configuration & Permissions:
- Set minSdk to 24 (Android 7.0)
- Add permissions to AndroidManifest.xml:
  <uses-permission android:name="android.permission.READ_CALL_LOG" />
  <uses-permission android:name="android.permission.WRITE_CALL_LOG" />

2. UI Components (Jetpack Compose):
- Target Phone Number Input: text field with phone number keyboard type
- Time Window Input: numeric text field (hours)
- Call Count Input: numeric text field
- Action Button: "Inject Fake Calls"
- Status Text: displays success or error messages

3. Logic & Permissions Handling:
- Activity Result Launcher to request WRITE_CALL_LOG and READ_CALL_LOG at runtime
- Execute injection if granted, display error/toast if denied

4. Call Log Injection Function:
- injectFakeCalls(context: Context, targetNumber: String, hoursWindow: Int, callCount: Int)
- Calculate current time in ms
- Loop callCount times: random offset up to hoursWindow, random duration 10..120s
- ContentValues: NUMBER -> targetNumber, DATE -> random past timestamp, DURATION -> random duration, TYPE -> CallLog.Calls.OUTGOING_TYPE, IS_READ -> 1
- Insert into context.contentResolver.insert(CallLog.Calls.CONTENT_URI, values)
- Catch SecurityException and IllegalArgumentException`;

    await navigator.clipboard.writeText(fullPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top action header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Native Android Studio Source Files</h2>
            <p className="text-xs text-slate-400">
              Complete project ready for Android Studio (Giraffe, Iguana, Jellyfish, Koala, Ladybug)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Prompt for AI Assistant */}
          <button
            onClick={handleCopyPrompt}
            className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy prompt to generate in Android Studio Gemini or Cursor"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Prompt Copied</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy Gemini Prompt</span>
              </>
            )}
          </button>

          {/* Download Complete ZIP */}
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isZipping ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Project (.zip)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* File Tabs navigation */}
      <div className="flex items-center overflow-x-auto bg-slate-950 px-3 py-2 border-b border-slate-800 gap-1.5 scrollbar-thin">
        {ALL_ANDROID_PROJECT_FILES.map(file => (
          <button
            key={file.name}
            onClick={() => setSelectedFileName(file.name)}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
              selectedFileName === file.name
                ? 'bg-slate-800 text-indigo-300 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span className="text-[11px] font-mono opacity-70">
              {file.language === 'kotlin' ? 'KT' : file.language === 'xml' ? 'XML' : 'CFG'}
            </span>
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      {/* Current File Metadata Sub-bar */}
      <div className="px-4 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-mono text-slate-300 truncate">{activeFile.path}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 hidden sm:inline">{activeFile.description}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadSingleFile}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-800"
            title="Download this file"
          >
            <Download className="w-3 h-3" /> Save File
          </button>
          <button
            onClick={handleCopyCode}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            {copiedFile ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200 selection:bg-indigo-600/30">
        <pre className="whitespace-pre overflow-x-auto">
          <code>{activeFile.content}</code>
        </pre>
      </div>

      {/* Bottom info banner */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>API Target: Android 7.0 (API 24) to Android 15 (API 35)</span>
          <span className="text-slate-600">·</span>
          <span>Coroutines Dispatchers.IO</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Uses <code className="text-indigo-400">ContentResolver.insert(CallLog.Calls.CONTENT_URI, ...)</code>
        </div>
      </div>
    </div>
  );
};
