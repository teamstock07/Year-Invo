import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Laptop,
  CheckCircle2,
  Clock,
  Ban,
  RefreshCw,
  Copy,
  Check,
  Send,
  Lock,
} from 'lucide-react';

interface DeviceAuthorizationGuardProps {
  children: React.ReactNode;
  moduleName?: string;
}

export const DeviceAuthorizationGuard: React.FC<DeviceAuthorizationGuardProps> = ({
  children,
  moduleName = 'POS & Sales',
}) => {
  const {
    user,
    devices,
    currentDeviceId,
    currentDevice,
    isCurrentDeviceAuthorized,
    requestDeviceAuthorization,
    t,
  } = useApp();

  const [deviceNameInput, setDeviceNameInput] = useState(
    currentDevice?.deviceName || ''
  );
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [requestSentMessage, setRequestSentMessage] = useState(false);

  // Store owners always have full bypass access
  const isOwner = user?.role === 'Owner' || user?.role === 'owner';
  if (isOwner) {
    return <>{children}</>;
  }

  // If already approved, grant access
  if (isCurrentDeviceAuthorized || currentDevice?.status === 'Approved') {
    return <>{children}</>;
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentDeviceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestDeviceAuthorization({
        deviceName: deviceNameInput.trim() || undefined,
        notes: requestNotes.trim() || undefined,
      });
      setRequestSentMessage(true);
    } catch (err) {
      console.error('Error submitting device authorization request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRevoked = currentDevice?.status === 'Revoked';
  const isPending = currentDevice?.status === 'Pending';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden text-center">
        {/* Top Glow Accent */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isRevoked ? 'bg-rose-500' : 'bg-amber-500'
          }`}
        />

        {/* Status Icon */}
        <div className="relative mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center glass-panel border border-white/20 dark:border-white/10 shadow-lg">
          {isRevoked ? (
            <Ban className="w-9 h-9 sm:w-10 sm:h-10 text-rose-500 animate-pulse" />
          ) : isPending ? (
            <Clock className="w-9 h-9 sm:w-10 sm:h-10 text-amber-500 animate-pulse" />
          ) : (
            <ShieldAlert className="w-9 h-9 sm:w-10 sm:h-10 text-amber-500" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          {isRevoked
            ? 'Device Access Revoked'
            : isPending
            ? 'Device Authorization Pending'
            : 'Device Authorization Required'}
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
          {isRevoked ? (
            <>
              Access for this device has been revoked by the store owner.
              {currentDevice?.rejectionReason && (
                <span className="block mt-1 font-medium text-rose-500 dark:text-rose-400">
                  Reason: {currentDevice.rejectionReason}
                </span>
              )}
              Please contact your store administrator to restore POS access.
            </>
          ) : isPending ? (
            <>
              Your authorization request for this device is awaiting approval by the Store Owner.
              Once approved, {moduleName} will automatically unlock.
            </>
          ) : (
            <>
              To protect store operations and ensure financial security, team members can only access {moduleName} from authorized devices registered by the store owner.
            </>
          )}
        </p>

        {/* Device Information Panel */}
        <div className="glass-panel p-4 rounded-xl border border-white/20 dark:border-white/10 text-left mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400">Current Device ID:</span>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800/60 font-mono text-xs text-slate-800 dark:text-slate-200">
                {currentDeviceId.substring(0, 16)}...
              </code>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors"
                title="Copy Full Device ID"
              >
                {copiedId ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400">Registered Staff:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {user?.ownerName || user?.fullName || user?.email || 'Current User'} ({user?.role || 'Staff'})
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400">Device Status:</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isRevoked
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  : isPending
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
              }`}
            >
              {currentDevice?.status || 'Unregistered'}
            </span>
          </div>
        </div>

        {/* Request Form */}
        {!isRevoked && (
          <form onSubmit={handleSendRequest} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Device Name / Counter Label
              </label>
              <input
                type="text"
                value={deviceNameInput}
                onChange={(e) => setDeviceNameInput(e.target.value)}
                placeholder="e.g. Counter 1 Desktop, Cashier iPad, POS Mobile"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Note for Store Owner (Optional)
              </label>
              <input
                type="text"
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="e.g. Assigned to main billing register"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {isPending
                    ? 'Update Authorization Request'
                    : 'Request Device Authorization'}
                </span>
              </button>
            </div>
          </form>
        )}

        {requestSentMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Request sent to Store Owner. Once approved in Team & Device Management, access will unlock immediately.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
