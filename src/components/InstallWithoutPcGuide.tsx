import React, { useState } from 'react';
import {
  Smartphone,
  Cloud,
  Terminal,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { downloadAndroidProjectZip } from '../utils/exportZip';

export const InstallWithoutPcGuide: React.FC = () => {
  const [activeMethod, setActiveMethod] = useState<'cloud' | 'ladb' | 'androidide'>('cloud');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // Quick inputs for customized on-device ADB command
  const [isMultiNumMode, setIsMultiNumMode] = useState<boolean>(false);
  const [targetNumber, setTargetNumber] = useState<string>('+15550192834');
  const [multiNumbersInput, setMultiNumbersInput] = useState<string>('+15550192834, +15558472910, +15553349921');
  const [durationSec, setDurationSec] = useState<number>(45);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {}
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setIsZipping(false);
    }
  };

  const directContentCommand = `content insert --uri content://call_log/calls --bind number:s:"${targetNumber}" --bind date:l:$(($(date +%s%N)/1000000 - 3600000)) --bind duration:i:${durationSec} --bind type:i:2 --bind is_read:i:1`;

  const parsedNumbersList = multiNumbersInput
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const bashArrayString = parsedNumbersList.map(n => `"${n}"`).join(' ');

  const multiNumberLadbCommand = `NUMBERS=(${bashArrayString})
for NUM in "\${NUMBERS[@]}"; do
  content insert --uri content://call_log/calls --bind number:s:"\$NUM" --bind date:l:$(($(date +%s%N)/1000000 - 1800000)) --bind duration:i:${durationSec} --bind type:i:2 --bind is_read:i:1
done`;

  const activeLadbCommand = isMultiNumMode ? multiNumberLadbCommand : directContentCommand;

  return (
    <div className="space-y-6">
      {/* Hero explanation card */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>100% Mobile Guide · No Computer Needed</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How to Install & Inject Calls Directly on Your Phone Without a PC
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Android doesn't restrict you to a computer. You have 3 proven methods to run this on your mobile device: compile the APK for free in the cloud with GitHub Actions, use on-phone Wireless Debugging (LADB/Shizuku), or compile on-device using AndroidIDE.
          </p>
        </div>
      </div>

      {/* Method Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveMethod('cloud')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeMethod === 'cloud'
              ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/50 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50">
              RECOMMENDED
            </span>
          </div>
          <h3 className="text-xs font-bold text-white">Method 1: Cloud APK Build</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Free GitHub Actions cloud server builds the APK in 90 seconds. You tap to download and install.
          </p>
        </button>

        <button
          onClick={() => setActiveMethod('ladb')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeMethod === 'ladb'
              ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/50 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/50">
              FASTEST (30s)
            </span>
          </div>
          <h3 className="text-xs font-bold text-white">Method 2: Wireless Debugging (LADB)</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            No APK needed! Use Android’s built-in Wireless Debugging to inject calls immediately from your phone screen.
          </p>
        </button>

        <button
          onClick={() => setActiveMethod('androidide')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeMethod === 'androidide'
              ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/50 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </span>
            <span className="text-[10px] text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/50">
              NATIVE ON-PHONE
            </span>
          </div>
          <h3 className="text-xs font-bold text-white">Method 3: AndroidIDE App</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Full Android Studio clone running inside your phone via F-Droid. Compiles Gradle and Kotlin offline.
          </p>
        </button>
      </div>

      {/* METHOD 1: CLOUD APK BUILD (GITHUB ACTIONS) */}
      {activeMethod === 'cloud' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cloud className="w-5 h-5 text-indigo-400" />
                Method 1: Build & Download APK via Free Cloud CI (GitHub Actions)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Takes ~2 minutes. Everything is done inside your phone’s web browser (Chrome, Samsung Internet, etc.).
              </p>
            </div>
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              {isZipping ? 'Packing...' : <><Download className="w-3.5 h-3.5" /> Download Project ZIP</>}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Download the Project ZIP to your phone</h4>
                <p className="text-xs text-slate-300">
                  Tap the <strong className="text-indigo-400">Download Android Project</strong> button above or in the top header. The file <code className="text-slate-200">CallLogInjector-Android-Studio-Project.zip</code> will download to your phone’s <strong>Downloads</strong> folder.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-xs font-bold text-white">Create a free repository on GitHub</h4>
                <p className="text-xs text-slate-300">
                  Open your phone browser and go to <a href="https://github.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-medium">github.com</a> (sign in or sign up free). Tap the <strong>+</strong> menu at the top right &rarr; <strong>New repository</strong>. Name it <code className="text-indigo-300">call-log-injector</code> and tap <strong>Create repository</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-xs font-bold text-white">Upload the files (The auto-builder is already included!)</h4>
                <p className="text-xs text-slate-300">
                  Tap <strong>uploading an existing file</strong> on GitHub, extract the downloaded zip on your phone using your phone’s Files app, and upload the files.
                </p>
                <div className="p-3 bg-slate-900 rounded-lg text-xs text-emerald-400 border border-emerald-900/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>The project includes <code className="text-white">.github/workflows/build-apk.yml</code>. GitHub will detect it automatically!</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                4
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Download the generated APK from GitHub</h4>
                <p className="text-xs text-slate-300">
                  On GitHub, tap the <strong>Actions</strong> tab. You will see a job titled <em>"Build Android APK (No PC Required)"</em> running. Once the green checkmark appears (~90 seconds), tap the run &rarr; scroll to <strong>Artifacts</strong> at the bottom &rarr; tap <strong>app-debug-apk</strong> to download!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                5
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Tap to Install on your phone</h4>
                <p className="text-xs text-slate-300">
                  Tap the downloaded file in your browser's download manager. If prompted, tap <em>"Allow installation from this source"</em> (standard security check for non-Play Store apps), then tap <strong>Install</strong>. Open <strong>Call Log Injector</strong> and tap <strong>Inject Fake Calls</strong>!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 2: LOCAL WIRELESS DEBUGGING (LADB / SHIZUKU) */}
      {activeMethod === 'ladb' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Method 2: Local Wireless Debugging (Direct Injection in 30 Seconds)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Works on <strong>Android 11, 12, 13, 14, and 15</strong>. Android allows phones to run ADB commands on themselves over local Wi-Fi without needing any computer or cable!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step instructions */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-amber-400 block">Step 1: Enable Wireless Debugging</span>
                <p className="text-xs text-slate-300">
                  Go to phone <strong>Settings &rarr; Developer Options</strong>. Turn on <strong>Wireless Debugging</strong>.
                  <span className="block text-[11px] text-slate-500 mt-1">
                    (If Developer Options is hidden, go to Settings &rarr; About Phone &rarr; tap "Build Number" 7 times).
                  </span>
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-amber-400 block">Step 2: Install LADB or Shizuku on your phone</span>
                <p className="text-xs text-slate-300">
                  Download <strong>LADB - Local ADB Shell</strong> (from Google Play) or <strong>Shizuku</strong> (free from Play Store or GitHub).
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-amber-400 block">Step 3: Pair Wireless Debugging in Split Screen</span>
                <p className="text-xs text-slate-300">
                  Open LADB in split-screen alongside Developer Options. Tap <em>"Pair device with pairing code"</em> in Wireless Debugging, enter the 6-digit code and port into LADB. LADB connects locally!
                </p>
              </div>
            </div>

            {/* Live Command Customizer & Copy */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Step 4: Paste this command in LADB</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setIsMultiNumMode(false)}
                      className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                        !isMultiNumMode
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Single
                    </button>
                    <button
                      onClick={() => setIsMultiNumMode(true)}
                      className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                        isMultiNumMode
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Multiple ({parsedNumbersList.length})
                    </button>
                  </div>
                </div>

                {!isMultiNumMode ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Target Phone Number</label>
                      <input
                        type="text"
                        value={targetNumber}
                        onChange={e => setTargetNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Duration (Sec)</label>
                      <input
                        type="number"
                        value={durationSec}
                        onChange={e => setDurationSec(parseInt(e.target.value) || 30)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Multiple Numbers (Comma or newline separated)</label>
                      <input
                        type="text"
                        value={multiNumbersInput}
                        onChange={e => setMultiNumbersInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Duration per call (Sec)</label>
                      <input
                        type="number"
                        value={durationSec}
                        onChange={e => setDurationSec(parseInt(e.target.value) || 30)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 whitespace-pre overflow-x-auto leading-relaxed">
                  {activeLadbCommand}
                </div>
              </div>

              <button
                onClick={() => handleCopy(activeLadbCommand, 'ladb_cmd')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedText === 'ladb_cmd' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Command Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy {isMultiNumMode ? 'Batch Loop' : 'Command'} for LADB</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 3: ANDROIDIDE */}
      {activeMethod === 'androidide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              Method 3: Build Offline on Your Phone with AndroidIDE
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              <strong>AndroidIDE</strong> is a complete Android Studio equivalent that runs directly on Android devices. It has an embedded Gradle runtime, OpenJDK, and AAPT2 to compile real Kotlin apps on your phone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-blue-400 block">1. Install AndroidIDE</span>
              <p className="text-xs text-slate-300">
                Download the free AndroidIDE app from <strong>F-Droid</strong> or its official website (<code className="text-slate-200">androidide.com</code>).
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-blue-400 block">2. Extract Project Zip</span>
              <p className="text-xs text-slate-300">
                Download the project zip file above, extract it to your phone's storage (e.g. <code className="text-slate-200">/sdcard/Projects/CallLogInjector</code>).
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-blue-400 block">3. Tap Build & Install</span>
              <p className="text-xs text-slate-300">
                Open the folder inside AndroidIDE and tap the green <strong>Play (Run)</strong> button. AndroidIDE compiles the APK and opens the Android installer package automatically!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick summary comparison */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Which method should you choose?</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span><strong>Fastest:</strong> Method 2 (LADB in 30s)</span>
          <span aria-hidden="true">·</span>
          <span><strong>Best for App UI:</strong> Method 1 (GitHub Cloud APK)</span>
        </div>
      </div>
    </div>
  );
};
