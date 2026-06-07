import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Settings() {
  const { user, login, logout } = useAuth();

  // Profile State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Danger Zone State
  const [confirmDelete, setConfirmDelete] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await client.patch('/api/user/profile', { displayName, email });
      login(res.data.token || '', { email: res.data.email, displayName: res.data.displayName });
      setProfileMessage('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      await client.patch('/api/user/password', { currentPassword, newPassword });
      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (confirmDelete !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm.');
      return;
    }

    if (!window.confirm('WARNING: Are you absolutely sure? This will permanently delete your account and all associated monitor targets!')) {
      return;
    }

    setDeleteLoading(true);

    try {
      await client.delete('/api/user/account');
      logout();
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto font-sans space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile, password, and security preferences</p>
      </div>

      {/* Profile Section */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">👤 Profile Settings</h2>
        
        {profileMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm rounded-lg p-3 mb-4 font-medium">
            ✅ {profileMessage}
          </div>
        )}
        {profileError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm rounded-lg p-3 mb-4 font-medium">
            ⚠️ {profileError}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
            <input
              type="text"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={profileLoading}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {profileLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>

      {/* Password Section */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">🔑 Update Password</h2>
        
        {passwordMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm rounded-lg p-3 mb-4 font-medium">
            ✅ {passwordMessage}
          </div>
        )}
        {passwordError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm rounded-lg p-3 mb-4 font-medium">
            ⚠️ {passwordError}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {passwordLoading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="bg-rose-50/50 border border-rose-100 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-rose-700 border-b border-rose-100 pb-3 mb-5">⚠️ Danger Zone</h2>
        <p className="text-slate-600 text-xs mb-4">
          Permanently delete your account. This action is irreversible and will purge all monitor logs.
        </p>

        {deleteError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm rounded-lg p-3 mb-4 font-medium">
            ⚠️ {deleteError}
          </div>
        )}

        <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-rose-700 uppercase tracking-wider mb-2">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              required
              placeholder="DELETE"
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={confirmDelete !== 'DELETE' || deleteLoading}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-colors shadow-sm"
          >
            {deleteLoading ? 'Deleting Account...' : 'Delete My Account'}
          </button>
        </form>
      </section>
    </div>
  );
}
