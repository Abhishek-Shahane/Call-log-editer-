import React, { useState } from 'react';
import {
  Download,
  Terminal,
  Smartphone,
  Layers,
  Sparkles,
  ExternalLink,
  Github,
  BookOpen,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Zap,
  Info,
  ArrowRight
} from 'lucide-react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { NativeCodeViewer } from './components/NativeCodeViewer';
import { AdbTerminalHelper } from './components/AdbTerminalHelper';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { InstallWithoutPcGuide } from './components/InstallWithoutPcGuide';
import { CallRecord } from './types/callLog';
import { downloadAndroidProjectZip } from './utils/exportZip';

// Initial realistic call log entries in simulated system database
const INITIAL_CALL_RECORDS: CallRecord[] = [
  {
    id: 101,
    number: '+1 (555) 234-5678',
    name: 'Home Office',
    date: Date.now() - 1000 * 60 * 42, // 42 mins ago
    duration: 114,
    type: 1, // Incoming
    isRead: 1
  },
  {
    id: 102,
    number: '+1 (555) 987-6543',
    name: 'Courier Delivery',
    date: Date.now() - 1000 * 60 * 180, // 3 hours ago
    duration: 38,
    type: 2, // Outgoing
    isRead: 1
  },
  {
    id: 103,
    number: '+1 (555) 345-6789',
    name: 'Dentist Clinic',
    date: Date.now() - 1000 * 60 * 60 * 7, // 7 hours ago
    duration: 0,
    type: 3, // Missed
    isRead: 1
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'no-pc' | 'code' | 'adb' | 'architecture'>('simulator');
  const [records, setRecords] = useState<CallRecord[]>(INITIAL_CALL_RECORDS);
  const [nextId, setNextId] = useState<number>(104);
  const [totalInjectedCount, setTotalInjectedCount] = useState<number>(0);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // Injects fake calls matching prompt specifications:
  // - targetNumbers (list of one or multiple phone numbers)
  // - hoursWindow (hours back in past)
  // - callCount (number of entries)
  // - isPerNumber (whether count applies to each number or distributed across all)
  // - duration between 10 and 120 seconds
  // - type = OUTGOING_TYPE (2)
  // - is_read = 1
  const handleInjectCalls = (
    numbers: string[],
    hours: number,
    count: number,
    isPerNumber: boolean = false
  ): { success: boolean; message: string; count: number; numbersCount: number } => {
    const now = Date.now();
    const maxOffsetMs = hours * 60 * 60 * 1000;
    const newRecords: CallRecord[] = [];
    let currentId = nextId;

    if (isPerNumber) {
      for (const num of numbers) {
        for (let i = 0; i < count; i++) {
          const offsetMs = Math.floor(Math.random() * maxOffsetMs);
          const callTimestamp = now - offsetMs;
          const callDuration = Math.floor(Math.random() * (120 - 10 + 1)) + 10;

          newRecords.push({
            id: currentId++,
            number: num,
            date: callTimestamp,
            duration: callDuration,
            type: 2, // OUTGOING_TYPE
            isRead: 1,
            newCall: 0
          });
        }
      }
    } else {
      for (let i = 0; i < count; i++) {
        const targetNum = numbers[Math.floor(Math.random() * numbers.length)];
        const offsetMs = Math.floor(Math.random() * maxOffsetMs);
        const callTimestamp = now - offsetMs;
        const callDuration = Math.floor(Math.random() * (120 - 10 + 1)) + 10;

        newRecords.push({
          id: currentId++,
          number: targetNum,
          date: callTimestamp,
          duration: callDuration,
          type: 2, // OUTGOING_TYPE
          isRead: 1,
          newCall: 0
        });
      }
    }

    const insertedCount = newRecords.length;
    setNextId(currentId);
    setTotalInjectedCount(prev => prev + insertedCount);

    // Merge and sort newest calls first
    setRecords(prev => {
      const combined = [...newRecords, ...prev];
      return combined.sort((a, b) => b.date - a.date);
    });

    return {
      success: true,
      message: `Successfully added ${insertedCount} calls across ${numbers.length} phone number(s)!`,
      count: insertedCount,
      numbersCount: numbers.length
    };
  };

  const handleClearRecords = () => {
    setRecords([]);
  };

  const handleSeedSampleRecords = () => {
    const now = Date.now();
    const seeded: CallRecord[] = [
      {
        id: nextId,
        number: '+1 (555) 765-4321',
        name: 'Alex Rivera',
        date: now - 1000 * 60 * 15,
        duration: 95,
        type: 1, // Incoming
        isRead: 1
      },
      {
        id: nextId + 1,
        number: '+1 (555) 888-1212',
        name: 'Technical Support',
        date: now - 1000 * 60 * 140,
        duration: 210,
        type: 2, // Outgoing
        isRead: 1
      },
      {
        id: nextId + 2,
        number: '+1 (555) 000-1122',
        date: now - 1000 * 60 * 60 * 5,
        duration: 0,
        type: 3, // Missed
        isRead: 1
      }
    ];

    setNextId(prev => prev + 3);
    setRecords(prev => [...seeded, ...prev].sort((a, b) => b.date - a.date));
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar following Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-6 px-4 sm:px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            AI
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Android Call Log Studio
          </span>
        </div>

        {/* Zone 2: clean single-line navigation tabs (App Preview first) */}
        <nav className="flex items-center overflow-x-auto gap-1 text-xs font-medium text-slate-300 scrollbar-none py-1">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-200" />
            <span>App Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('no-pc')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'no-pc'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800'
            }`}
          >
            <span>Install on Phone (No PC)</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kotlin Source
          </button>
          <button
            onClick={() => setActiveTab('adb')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'adb'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ADB Scripts
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            {isZipping ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Packing ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Android Project</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Metric Bar with Zero-Pill Typography & Tabular Numerals */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="font-semibold text-slate-200">System Telephony Provider</span>
            <span aria-hidden="true">·</span>
            <span>Min SDK 24 (Android 7.0)</span>
            <span aria-hidden="true">·</span>
            <span>Target SDK 35 (Android 15)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-indigo-400">content://call_log/calls</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div>
              <span className="text-slate-400">Stored Calls: </span>
              <span className="font-bold text-white tabular-nums">{records.length}</span>
            </div>
            <div>
              <span className="text-slate-400">Injected Outgoing: </span>
              <span className="font-bold text-emerald-400 tabular-nums">{totalInjectedCount}</span>
            </div>
          </div>
        </section>

        {/* Dynamic View Sections */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Android 15 Simulator */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <PhoneSimulator
                records={records}
                onInjectCalls={handleInjectCalls}
                onClearRecords={handleClearRecords}
                onSeedSampleRecords={handleSeedSampleRecords}
              />
            </div>

            {/* Right Column: Code Snippet & Live Verification */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white">How This Native App Operates</h2>
                    <p className="text-xs text-slate-400">
                      Matches every specification from your Kotlin and Jetpack Compose requirement
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('code')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    View All Project Files &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Runtime Permission</span>
                    <span className="font-mono text-slate-200 text-[11px]">WRITE_CALL_LOG</span>
                    <p className="text-[10px] text-slate-400 pt-0.5">
                      Requested via <code className="text-indigo-300">rememberLauncherForActivityResult</code> before DB write.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Duration Distribution</span>
                    <span className="font-mono text-slate-200 text-[11px]">10s to 120s</span>
                    <p className="text-[10px] text-slate-400 pt-0.5">
                      Random duration mapped directly to <code className="text-indigo-300">CallLog.Calls.DURATION</code>.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Time Window Calculation</span>
                    <span className="font-mono text-slate-200 text-[11px]">now - random(window)</span>
                    <p className="text-[10px] text-slate-400 pt-0.5">
                      Calculates epoch timestamp in ms within requested past hour window.
                    </p>
                  </div>
                </div>

                {/* Core Function Snippet preview */}
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-indigo-300">injectFakeCalls(...) in MainActivity.kt</span>
                    <span className="text-[10px] text-slate-500">Android ContentResolver API</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`fun injectFakeCalls(context: Context, targetNumber: String, hoursWindow: Int, callCount: Int): InjectionResult {
    val currentTimeMs = System.currentTimeMillis()
    val maxOffsetMs = hoursWindow.toLong() * 60 * 60 * 1000

    for (i in 1..callCount) {
        val randomOffset = (Random().nextDouble() * maxOffsetMs).toLong()
        val callTimestamp = currentTimeMs - randomOffset
        val callDuration = 10 + Random().nextInt(111) // 10..120 sec

        val values = ContentValues().apply {
            put(CallLog.Calls.NUMBER, targetNumber)
            put(CallLog.Calls.DATE, callTimestamp)
            put(CallLog.Calls.DURATION, callDuration.toLong())
            put(CallLog.Calls.TYPE, CallLog.Calls.OUTGOING_TYPE) // 2
            put(CallLog.Calls.IS_READ, 1)
        }
        context.contentResolver.insert(CallLog.Calls.CONTENT_URI, values)
    }
    return InjectionResult(true, "Successfully added $callCount calls!")
}`}
                  </pre>
                </div>
              </div>

              {/* Instructions on how to use in Android Studio */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white">How to import and run on your physical phone</h3>
                </div>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Click <strong className="text-white">Download Android Project</strong> in the top right to download the complete zipped project.
                  </li>
                  <li>
                    Open <strong className="text-white">Android Studio</strong>, choose <strong className="text-white">Open</strong>, and select the extracted folder.
                  </li>
                  <li>
                    Enable <strong className="text-white">Developer Options & USB Debugging</strong> on your Android phone, then connect it with a USB cable.
                  </li>
                  <li>
                    Click <strong className="text-white">Run 'app'</strong> (green play icon). Grant the Call Log permission when prompted on your screen!
                  </li>
                  <li>
                    Open your device's built-in <strong className="text-white">Phone / Contacts</strong> app to verify the injected calls appear in your Recents list.
                  </li>
                </ol>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Don't have a computer?</span>
                  <button
                    onClick={() => setActiveTab('no-pc')}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Install on Mobile Without PC Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'no-pc' && (
          <div className="space-y-6">
            <InstallWithoutPcGuide />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="h-[750px]">
            <NativeCodeViewer />
          </div>
        )}

        {activeTab === 'adb' && (
          <div className="space-y-6">
            <AdbTerminalHelper />
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <ArchitectureGuide />
          </div>
        )}
      </main>

      {/* Footer following anti-slop guidelines */}
      <footer className="mt-auto border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Native Android Telephony Provider & Jetpack Compose Development Suite</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Kotlin 2.0</span>
            <span aria-hidden="true">·</span>
            <span>Jetpack Compose BOM 2024.10</span>
            <span aria-hidden="true">·</span>
            <span>ContentResolver API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
