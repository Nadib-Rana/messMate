import { useState, useEffect } from "react";
import { Modal, Input, Btn } from "./ui";
import { useApp } from "../context/AppContext";
import { User, KeyRound, CheckCircle2, AlertCircle, Phone, Mail, Shield } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: Props) {
  const { currentUser, updateUserProfile, changePassword } = useApp();

  const [activeTab, setActiveTab] = useState<"details" | "security">("details");

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setPhone(currentUser.phoneNumber || currentUser.phone || "");
      setAvatarUrl(currentUser.avatarUrl || "");
    }
  }, [currentUser, open]);

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setSuccessMsg("Profile details updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentPassword) {
      setErrorMsg("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccessMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to change password. Check your current password.");
    } finally {
      setLoading(false);
    }
  };

  const userInitials = (firstName ? firstName.slice(0, 2) : currentUser?.username?.slice(0, 2) || "MM").toUpperCase();

  return (
    <Modal open={open} onClose={onClose} title="My Profile Settings">
      <div className="space-y-4">
        {/* User Card Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md ring-4 ring-indigo-100 shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {firstName || currentUser?.username || "Mess Member"} {lastName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <Mail size={12} className="shrink-0 text-slate-400" />
              <span className="truncate">{currentUser?.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                <Shield size={10} />
                {currentUser?.role || "MEMBER"}
              </span>
              {currentUser?.phoneNumber && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Phone size={10} /> {currentUser.phoneNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            type="button"
            onClick={() => { setActiveTab("details"); setErrorMsg(""); setSuccessMsg(""); }}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "details"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <User size={14} /> Profile Information
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("security"); setErrorMsg(""); setSuccessMsg(""); }}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "security"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <KeyRound size={14} /> Change Password
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Profile Details */}
        {activeTab === "details" && (
          <form onSubmit={handleUpdateProfile} className="space-y-3.5 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="First Name"
                value={firstName}
                onChange={setFirstName}
              />
              <Input
                label="Last Name"
                placeholder="Last Name"
                value={lastName}
                onChange={setLastName}
              />
            </div>
            <Input
              label="Phone Number"
              placeholder="e.g. 01711-000001"
              value={phone}
              onChange={setPhone}
            />
            <Input
              label="Avatar Image URL (Optional)"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={setAvatarUrl}
            />
            <div className="pt-2 flex justify-end gap-2">
              <Btn variant="outline" onClick={onClose}>
                Cancel
              </Btn>
              <Btn onClick={() => handleUpdateProfile()} disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </Btn>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === "security" && (
          <form onSubmit={handleChangePassword} className="space-y-3.5 pt-1">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={setNewPassword}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            <div className="pt-2 flex justify-end gap-2">
              <Btn variant="outline" onClick={onClose}>
                Cancel
              </Btn>
              <Btn onClick={() => handleChangePassword()} disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Btn>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
