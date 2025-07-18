import React, { useState } from "react";

const Settings = () => {
  // Account Preferences state
  const [email, setEmail] = useState("user@example.com");
  const [newEmail, setNewEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifInApp, setNotifInApp] = useState(true);

  // Privacy & Security state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [loginActivity] = useState([
    { device: "Chrome on Windows", time: "2024-07-01 10:00", location: "Manila, PH" },
    { device: "Mobile Safari", time: "2024-06-30 21:15", location: "Quezon City, PH" },
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  // App Preferences state
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("fontSize") || "medium");
  const [contrast, setContrast] = useState(() => localStorage.getItem("contrast") || "normal");

  // Handlers (mocked)
  const handleChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call backend to change email
    setEmailMessage("A verification link has been sent to your new email (mock)");
    setEmail(newEmail);
    setNewEmail("");
  };
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match");
      return;
    }
    // TODO: Call backend to change password
    setPasswordMessage("Password changed successfully (mock)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  const handleSaveNotifications = () => {
    // TODO: Call backend to save notification preferences
    alert("Notification preferences saved (mock)");
  };
  const handleToggle2FA = () => {
    setTwoFAEnabled((prev) => !prev);
    setShow2FAModal(false);
  };
  const handleDeleteAccount = () => {
    // TODO: Call backend to delete account
    setDeleteMessage("Account deleted (mock)");
    setShowDeleteModal(false);
  };
  const handleThemeChange = (val: string) => {
    setTheme(val);
    localStorage.setItem("theme", val);
  };
  const handleFontSizeChange = (val: string) => {
    setFontSize(val);
    localStorage.setItem("fontSize", val);
  };
  const handleContrastChange = (val: string) => {
    setContrast(val);
    localStorage.setItem("contrast", val);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">Settings</h1>
        <div className="space-y-8">
          {/* Account Preferences */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Account Preferences</h2>
            <div className="bg-blue-50 rounded-lg p-4 text-gray-700 space-y-6">
              {/* Change Email */}
              <form onSubmit={handleChangeEmail} className="space-y-2">
                <label className="block font-medium">Change Email</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder={email} className="w-full rounded border px-3 py-2 mb-2" required />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Change Email</button>
                {emailMessage && <div className="text-green-600 text-sm mt-1">{emailMessage}</div>}
              </form>
              {/* Change Password */}
              <form onSubmit={handleChangePassword} className="space-y-2">
                <label className="block font-medium">Change Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full rounded border px-3 py-2 mb-1" required />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded border px-3 py-2 mb-1" required />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full rounded border px-3 py-2 mb-1" required />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Change Password</button>
                {passwordMessage && <div className="text-green-600 text-sm mt-1">{passwordMessage}</div>}
              </form>
              {/* Notification Preferences */}
              <div>
                <label className="block font-medium mb-1">Notification Preferences</label>
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)} /> Email
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={notifSMS} onChange={e => setNotifSMS(e.target.checked)} /> SMS
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={notifInApp} onChange={e => setNotifInApp(e.target.checked)} /> In-app
                  </label>
                </div>
                <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleSaveNotifications}>Save Preferences</button>
              </div>
            </div>
          </section>

          {/* Privacy & Security */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-purple-600">Privacy & Security</h2>
            <div className="bg-purple-50 rounded-lg p-4 text-gray-700 space-y-6">
              {/* Two-Factor Authentication */}
              <div>
                <label className="block font-medium mb-1">Two-Factor Authentication</label>
                <div className="flex items-center gap-4">
                  <span className={twoFAEnabled ? "text-green-600" : "text-gray-500"}>{twoFAEnabled ? "Enabled" : "Disabled"}</span>
                  <button className="bg-purple-600 text-white px-3 py-1 rounded" onClick={() => setShow2FAModal(true)}>
                    {twoFAEnabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
              {/* Login Activity */}
              <div>
                <label className="block font-medium mb-1">Login Activity</label>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {loginActivity.map((a, i) => (
                    <li key={i}>{a.device} - {a.time} ({a.location})</li>
                  ))}
                </ul>
              </div>
              {/* Delete Account */}
              <div>
                <label className="block font-medium mb-1">Delete Account</label>
                <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => setShowDeleteModal(true)}>Delete Account</button>
                {deleteMessage && <div className="text-green-600 text-sm mt-1">{deleteMessage}</div>}
              </div>
            </div>
          </section>

          {/* App Preferences */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-indigo-600">App Preferences</h2>
            <div className="bg-indigo-50 rounded-lg p-4 text-gray-700 space-y-6">
              {/* Theme */}
              <div>
                <label className="block font-medium mb-1">Theme</label>
                <select value={theme} onChange={e => handleThemeChange(e.target.value)} className="rounded border px-3 py-2">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              {/* Accessibility */}
              <div>
                <label className="block font-medium mb-1">Font Size</label>
                <select value={fontSize} onChange={e => handleFontSizeChange(e.target.value)} className="rounded border px-3 py-2">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Contrast</label>
                <select value={contrast} onChange={e => handleContrastChange(e.target.value)} className="rounded border px-3 py-2">
                  <option value="normal">Normal</option>
                  <option value="high">High Contrast</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
              <button className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setShow2FAModal(false)}>&times;</button>
              <h3 className="text-lg font-bold mb-4">Two-Factor Authentication</h3>
              <p className="mb-4">{twoFAEnabled ? "Are you sure you want to disable 2FA?" : "Enable 2FA for extra security. (Mock)"}</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={handleToggle2FA}>{twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}</button>
            </div>
          </div>
        )}
        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
              <button className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setShowDeleteModal(false)}>&times;</button>
              <h3 className="text-lg font-bold mb-4 text-red-600">Delete Account</h3>
              <p className="mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDeleteAccount}>Delete Account</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 