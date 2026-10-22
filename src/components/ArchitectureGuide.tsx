import React from 'react';
import {
  ShieldAlert,
  Layers,
  ArrowRight,
  Database,
  Smartphone,
  Cpu,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Code2
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Architecture Flow Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Android Telephony ContentProvider Pipeline</h3>
            <p className="text-xs text-slate-400">How call records traverse from Jetpack Compose into the native phone database</p>
          </div>
        </div>

        {/* Pipeline steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-indigo-400">
              <Code2 className="w-4 h-4" />
              <span className="text-[10px] font-mono text-slate-500">Step 1</span>
            </div>
            <h4 className="text-xs font-semibold text-white">Compose UI</h4>
            <p className="text-[11px] text-slate-400">
              User enters phone number, time window, and count. Validated via <code className="text-indigo-300">rememberSaveable</code>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-amber-400">
              <Cpu className="w-4 h-4" />
              <span className="text-[10px] font-mono text-slate-500">Step 2</span>
            </div>
            <h4 className="text-xs font-semibold text-white">Permission Launcher</h4>
            <p className="text-[11px] text-slate-400">
              <code className="text-amber-300">ActivityResultContracts.RequestMultiplePermissions</code> requests <code className="text-slate-300">WRITE_CALL_LOG</code>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <Database className="w-4 h-4" />
              <span className="text-[10px] font-mono text-slate-500">Step 3</span>
            </div>
            <h4 className="text-xs font-semibold text-white">ContentResolver.insert</h4>
            <p className="text-[11px] text-slate-400">
              Dispatched on <code className="text-emerald-300">Dispatchers.IO</code> to <code className="text-slate-300">content://call_log/calls</code>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-blue-400">
              <Smartphone className="w-4 h-4" />
              <span className="text-[10px] font-mono text-slate-500">Step 4</span>
            </div>
            <h4 className="text-xs font-semibold text-white">System Dialer</h4>
            <p className="text-[11px] text-slate-400">
              Google Phone / Samsung Dialer queries the updated SQLite records and immediately renders in Recents.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Key Developer Insights: Deprecation & API Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold text-white">CallLog.Calls Fields & Deprecations</h4>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>
              <code className="text-indigo-300">CallLog.Calls.NUMBER</code>: Standard telephone string (E.164 formatted or local).
            </li>
            <li>
              <code className="text-indigo-300">CallLog.Calls.DATE</code>: Millisecond timestamp since Unix epoch (<code className="text-slate-400">System.currentTimeMillis() - offset</code>).
            </li>
            <li>
              <code className="text-indigo-300">CallLog.Calls.DURATION</code>: Long/Integer duration in seconds (10s to 120s).
            </li>
            <li>
              <code className="text-indigo-300">CallLog.Calls.TYPE</code>: Set to <code className="text-slate-200">OUTGOING_TYPE</code> (constant value = 2).
            </li>
            <li>
              <code className="text-indigo-300">CallLog.Calls.IS_READ</code>: Set to 1 so the system does not trigger missed call alerts.
            </li>
            <li>
              <strong className="text-white">API Level Notice:</strong> On Android 10+ (API 29+) and 14+, certain columns like <code className="text-slate-400">CACHED_NAME</code> are auto-resolved by the telephony provider from Contacts, so injecting just <code className="text-indigo-300">NUMBER</code> is the robust standard.
            </li>
          </ul>
        </div>

        {/* 3. Google Play Sensitive Permissions Policy */}
        <div className="bg-slate-900 border border-amber-900/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-xs font-semibold text-white">Google Play Sensitive Permissions Policy</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Google Play strictly restricts <code className="text-amber-300">READ_CALL_LOG</code> and <code className="text-amber-300">WRITE_CALL_LOG</code> under its <strong>Permissions Policy for SMS & Call Log</strong>:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>
              <strong>Play Store Rule:</strong> Only apps configured as the user’s <em>Default Phone Handler</em> (Dialer) or <em>Default Assistant</em> qualify for store approval.
            </li>
            <li>
              <strong>Testing & Sideloading:</strong> Debug APKs, adb installations, enterprise internal distribution, and QA sideloaded builds work without restrictions on all Android devices (API 24 to API 35).
            </li>
            <li>
              <strong>Bypass for QA:</strong> Use <code className="text-slate-300">adb shell pm grant com.example.callloginjector android.permission.WRITE_CALL_LOG</code> to automate automated test rigs.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
