import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, ShieldAlert, Cpu } from 'lucide-react';

export const AdbTerminalHelper: React.FC = () => {
  const [targetNumber, setTargetNumber] = useState<string>('+15550192834');
  const [duration, setDuration] = useState<number>(45);
  const [minutesAgo, setMinutesAgo] = useState<number>(30);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const [multiNumbers, setMultiNumbers] = useState<string>('+15550192834, +15558472910, +15553349921');

  // Compute past timestamp formula for bash
  const pastMsFormula = minutesAgo * 60 * 1000;

  const generatedAdbInsertCmd = `adb shell content insert --uri content://call_log/calls \\
  --bind number:s:"${targetNumber}" \\
  --bind date:l:$(($(date +%s%N)/1000000 - ${pastMsFormula})) \\
  --bind duration:i:${duration} \\
  --bind type:i:2 \\
  --bind is_read:i:1`;

  const parsedNumbersArray = multiNumbers
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const formattedBashArray = parsedNumbersArray.map(n => `"${n}"`).join(' ');

  const generatedBatchMultiNumberCmd = `NUMBERS=(${formattedBashArray})
for NUM in "\${NUMBERS[@]}"; do
  echo "Injecting call to \$NUM..."
  adb shell content insert --uri content://call_log/calls \\
    --bind number:s:"\$NUM" \\
    --bind date:l:$(($(date +%s%N)/1000000 - $(($RANDOM % 86400000)))) \\
    --bind duration:i:$((15 + $RANDOM % 90)) \\
    --bind type:i:2 \\
    --bind is_read:i:1
done`;

  const grantPermissionsCmd = `adb shell pm grant com.example.callloginjector android.permission.WRITE_CALL_LOG
adb shell pm grant com.example.callloginjector android.permission.READ_CALL_LOG`;

  const queryCallLogCmd = `adb shell content query --uri content://call_log/calls --projection number:date:duration:type`;

  const clearCallLogCmd = `adb shell content delete --uri content://call_log/calls`;

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCmd(id);
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch {}
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">ADB Shell & Command Generator</h3>
            <p className="text-xs text-slate-400">Test ContentProvider injection directly via USB / Wi-Fi debugging</p>
          </div>
        </div>
      </div>

      {/* Command generator form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs">
        <div>
          <label className="block text-slate-400 mb-1">Target Number</label>
          <input
            type="text"
            value={targetNumber}
            onChange={e => setTargetNumber(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Duration (Seconds)</label>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(parseInt(e.target.value) || 10)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Time in Past (Minutes)</label>
          <input
            type="number"
            value={minutesAgo}
            onChange={e => setMinutesAgo(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Commands List */}
      <div className="space-y-3">
        {/* Command 1: Insert fake call */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">1. Inject Call via ADB Shell</span>
            <button
              onClick={() => copyToClipboard(generatedAdbInsertCmd, 'insert')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedCmd === 'insert' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre">
            {generatedAdbInsertCmd}
          </pre>
        </div>

        {/* Command 2: Batch Multi-Number Injection */}
        <div className="bg-slate-950 rounded-xl border border-indigo-900/40 overflow-hidden">
          <div className="px-3 py-2 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-300">
              2. Inject Multiple Numbers at the Same Time (Batch Loop)
            </span>
            <button
              onClick={() => copyToClipboard(generatedBatchMultiNumberCmd, 'batch')}
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedCmd === 'batch' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Batch Loop</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 text-xs flex items-center gap-2">
            <label className="text-slate-400 whitespace-nowrap">Numbers to include:</label>
            <input
              type="text"
              value={multiNumbers}
              onChange={e => setMultiNumbers(e.target.value)}
              placeholder="+15550192834, +15558472910, ..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono"
            />
          </div>
          <pre className="p-3 text-[11px] font-mono text-indigo-300 overflow-x-auto whitespace-pre">
            {generatedBatchMultiNumberCmd}
          </pre>
        </div>

        {/* Command 3: Grant runtime permissions */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">2. Grant App Permissions Silently via ADB (Bypasses UI)</span>
            <button
              onClick={() => copyToClipboard(grantPermissionsCmd, 'grant')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedCmd === 'grant' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
            {grantPermissionsCmd}
          </pre>
        </div>

        {/* Command 3: Query & Inspect */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Query CallLog Content</span>
              <button
                onClick={() => copyToClipboard(queryCallLogCmd, 'query')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedCmd === 'query' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <pre className="p-2.5 text-[10px] font-mono text-slate-300 overflow-x-auto">
              {queryCallLogCmd}
            </pre>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Clear All Call Records</span>
              <button
                onClick={() => copyToClipboard(clearCallLogCmd, 'clear')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedCmd === 'clear' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <pre className="p-2.5 text-[10px] font-mono text-rose-300 overflow-x-auto">
              {clearCallLogCmd}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
