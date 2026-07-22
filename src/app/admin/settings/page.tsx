import { Settings, Save, Check, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-8">
        
        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-neutral-500" /> Platform Configuration
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage marketplace settings, tax groups, and upload margins.
          </p>
        </div>

        {/* Settings form layout */}
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white uppercase tracking-wider">Commission Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Default Platform Commission (%)</label>
                <input
                  type="number"
                  defaultValue="10"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none text-neutral-900 dark:text-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Minimum payout threshold ($)</label>
                <input
                  type="number"
                  defaultValue="50"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none text-neutral-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-850 pt-6">
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white uppercase tracking-wider">System Toggles</h3>
            
            <div className="space-y-3 text-xs font-bold">
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-850">
                <div>
                  <p className="text-neutral-900 dark:text-white">Vendor Registration Open</p>
                  <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Allow users to apply for a seller role and list stores.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-neutral-900" />
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-850">
                <div>
                  <p className="text-neutral-900 dark:text-white">Auto-Approve Products</p>
                  <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Auto-approve items uploaded by vendors without manual audit.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-neutral-900" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-850 flex justify-end">
            <button className="px-6 py-3.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs uppercase tracking-wider hover:scale-[1.02] transition-all flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
