import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function AccountSettings({ open, onClose }) {
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

  const handleClose = (openState) => {
    if (!openState) {
      setConfirming(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Name</p>
            <p className="font-medium text-slate-900">{user?.full_name || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium text-slate-900">{user?.email || 'N/A'}</p>
          </div>
        </div>

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
      </DialogContent>
    </Dialog>
  );
}