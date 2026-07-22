"use client";

import { useState, useTransition } from "react";
import { Settings, Save, Check, Loader2 } from "lucide-react";
import { updateStore } from "@/actions/store.actions";

interface Store {
  id: string;
  name: string;
  description: string | null;
}

interface SellerSettingsClientProps {
  store: Store;
}

export function SellerSettingsClient({ store }: SellerSettingsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description || "");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    setIsSuccess(false);

    if (!name.trim()) {
      setStatusMessage("Store name cannot be empty.");
      return;
    }

    startTransition(async () => {
      const res = await updateStore(store.id, {
        name,
        description,
      });

      if (res.success) {
        setIsSuccess(true);
        setStatusMessage("Store settings updated successfully!");
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        setStatusMessage(res.error || "Failed to update store settings.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-neutral-500" /> Store Settings
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Customize your public store name and marketing description.
        </p>
      </div>

      {/* Settings Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        
        {statusMessage && (
          <div className={`p-4 text-xs font-semibold rounded-2xl border ${
            isSuccess 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50" 
              : "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50"
          }`}>
            {statusMessage}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Store Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Legacy Store"
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none text-neutral-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Store Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A premium curated fashion and technology selection..."
            rows={5}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none text-neutral-900 dark:text-white resize-none"
          />
        </div>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs uppercase tracking-wider hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4" /> Updated
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
