import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Settings() {
  const { user, login, logout } = useAuth();

  // Modal Visibility States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Profile States
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Danger Zone States
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
      setIsEditModalOpen(false);
      setTimeout(() => setProfileMessage(''), 4000);
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
      setIsPasswordModalOpen(false);
      setTimeout(() => setPasswordMessage(''), 4000);
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

    setDeleteLoading(true);

    try {
      await client.delete('/api/user/account');
      setIsDeleteModalOpen(false);
      logout();
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto font-sans space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Account & Security</h1>
        <p className="text-slate-500 text-sm mt-1">Review details and secure your platform preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary Card */}
        <div className="md:col-span-1 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-500 text-white flex items-center justify-center text-3xl font-black shadow-inner mb-4 animate-scale-up">
            {(user?.displayName || user?.email || 'U').substring(0, 1).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-900 truncate max-w-full">
            {user?.displayName || 'User'}
          </h2>
          <p className="text-slate-500 text-sm truncate max-w-full mt-1">{user?.email}</p>
          <span className="mt-4 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider">
            Active Account
          </span>
        </div>

        {/* Right Column - Proper Options & Actions List */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-2">⚙️ Settings Options</h3>

          {(profileMessage || passwordMessage) && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm rounded-lg p-3 font-medium animate-slide-up">
              ✅ {profileMessage || passwordMessage}
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {/* Option 1: Edit Profile */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 first:pt-0">
              <div>
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Profile Details</h4>
                <p className="text-slate-500 text-xs mt-0.5">Modify display name and login email address</p>
              </div>
              <button
                onClick={() => {
                  setProfileError('');
                  setProfileMessage('');
                  setDisplayName(user?.displayName || '');
                  setEmail(user?.email || '');
                  setIsEditModalOpen(true);
                }}
                className="bg-sky-50 text-sky-600 hover:bg-sky-100 hover:scale-[1.01] active:scale-[0.99] border border-sky-100 font-semibold py-2 px-4 rounded-lg text-xs sm:text-sm transition-all self-start sm:self-auto"
              >
                ✏️ Edit Profile
              </button>
            </div>

            {/* Option 2: Reset Password */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Security Password</h4>
                <p className="text-slate-500 text-xs mt-0.5">Update credentials to secure your account</p>
              </div>
              <button
                onClick={() => {
                  setPasswordError('');
                  setPasswordMessage('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setIsPasswordModalOpen(true);
                }}
                className="bg-sky-50 text-sky-600 hover:bg-sky-100 hover:scale-[1.01] active:scale-[0.99] border border-sky-100 font-semibold py-2 px-4 rounded-lg text-xs sm:text-sm transition-all self-start sm:self-auto"
              >
                🔑 Reset Password
              </button>
            </div>

            {/* Option 3: Log Out */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Terminate Session</h4>
                <p className="text-slate-500 text-xs mt-0.5">Logout and end your active browser session</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out?')) {
                    logout();
                  }
                }}
                className="bg-slate-50 hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.99] text-slate-700 border border-slate-200 font-semibold py-2 px-4 rounded-lg text-xs sm:text-sm transition-all self-start sm:self-auto"
              >
                🚪 Log Out
              </button>
            </div>

            {/* Option 4: Delete Account */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 last:pb-0">
              <div>
                <h4 className="font-bold text-rose-600 text-sm sm:text-base">Danger Zone</h4>
                <p className="text-slate-500 text-xs mt-0.5">Permanently delete your profile and purge monitor logs</p>
              </div>
              <button
                onClick={() => {
                  setDeleteError('');
                  setConfirmDelete('');
                  setIsDeleteModalOpen(true);
                }}
                className="bg-rose-50 hover:bg-rose-100 hover:scale-[1.01] active:scale-[0.99] text-rose-600 border border-rose-100 font-semibold py-2 px-4 rounded-lg text-xs sm:text-sm transition-all self-start sm:self-auto"
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center px-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-100 p-6 relative animate-scale-up">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg focus:outline-none"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-950 mb-1">Edit Profile</h3>
            <p className="text-slate-500 text-xs mb-6">Modify display name and login email address</p>

            {profileError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm rounded-lg p-3 mb-4 font-medium">
                ⚠️ {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center px-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-100 p-6 relative animate-scale-up">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg focus:outline-none"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-950 mb-1">Reset Password</h3>
            <p className="text-slate-500 text-xs mb-6">Modify credentials for your account security</p>

            {passwordError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm rounded-lg p-3 mb-4 font-medium">
                ⚠️ {passwordError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center px-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-rose-100 p-6 relative animate-scale-up">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 text-lg focus:outline-none"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-rose-700 mb-1">Permanently Delete Account</h3>
            <p className="text-slate-500 text-xs mb-4">
              This action is irreversible. All targets and performance history will be permanently purged.
            </p>

            {deleteError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm rounded-lg p-3 mb-4 font-medium">
                ⚠️ {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-700 uppercase tracking-wider mb-2">
                  Type <span className="font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  placeholder="DELETE"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmDelete !== 'DELETE' || deleteLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting Account...' : 'Delete Permanently'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
