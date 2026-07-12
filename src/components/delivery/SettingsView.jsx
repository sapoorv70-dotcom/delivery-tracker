import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function SettingsView() {
  const { user, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.functions.invoke('deleteAccount', {});
      logout();
    } catch (e) {
      console.error('Account deletion failed:', e);
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md px-4 pt-safe pb-3 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 no-overscroll">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="font-semibold text-slate-900">Account</h2>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Name</p>
            <p className="font-medium text-slate-900">{user?.full_name || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium text-slate-900">{user?.email || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-4">
          {!confirming ? (
            <Button variant="destructive" onClick={() => setConfirming(true)} className="w-full">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">
                  This permanently deletes all your delivery data, templates, and history. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="flex-1">
                  {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
                <Button variant="outline" onClick={() => setConfirming(false)} disabled={deleting}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}