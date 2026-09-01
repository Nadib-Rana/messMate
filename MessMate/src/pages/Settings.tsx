import { useState, useEffect } from "react";
import { PageHeader, Card, Btn, Input, Tabs } from "../components/ui";
import { useApp } from "../context/AppContext";
import { SettingsMealTab } from "./components/SettingsMealTab";
import { SettingsDutyAndFines } from "./components/SettingsOtherTabs";
import { User, KeyRound, CheckCircle2, AlertCircle, Phone, Mail, Shield } from "lucide-react";

const TABS = ["My Profile", "House", "Meals", "Market Duty", "Fines", "Notifications"];

export default function Settings() {
  const { currentHouse, updateSettings, currentUser, updateUserProfile, changePassword } = useApp();
  const [activeTab, setActiveTab] = useState("My Profile");

  // Profile states
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [phone, setPhone] = useState(currentUser?.phoneNumber || currentUser?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || "");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setPhone(currentUser.phoneNumber || currentUser.phone || "");
      setAvatarUrl(currentUser.avatarUrl || "");
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);
    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSavePassword = async () => {
    setPassError("");
    setPassSuccess("");
    if (!currentPassword) {
      setPassError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match.");
      return;
    }
    setPassLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPassSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassSuccess(""), 3000);
    } catch (err: any) {
      setPassError(err.message || "Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  const [mealWeights, setMealWeights] = useState({
    breakfast: currentHouse.setting.mealWeights.breakfast.toString(),
    lunch: currentHouse.setting.mealWeights.lunch.toString(),
    dinner: currentHouse.setting.mealWeights.dinner.toString(),
  });
  const [walletThreshold, setWalletThreshold] = useState(currentHouse.setting.lowWalletThreshold.toString());
  const [guestMealRule, setGuestMealRule] = useState<any>(currentHouse.setting.guestMealRule);
  const [dutyDuration, setDutyDuration] = useState(currentHouse.setting.dutyDurationDays.toString());
  const [savedMsg, setSavedMsg] = useState(false);

  const triggerSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleSaveWeights = () => {
    updateSettings({
      mealWeights: {
        breakfast: parseFloat(mealWeights.breakfast) || 0.5,
        lunch: parseFloat(mealWeights.lunch) || 1.0,
        dinner: parseFloat(mealWeights.dinner) || 1.0,
      },
    });
    triggerSaved();
  };

  const handleSaveThreshold = () => {
    updateSettings({ lowWalletThreshold: parseFloat(walletThreshold) || 500 });
    triggerSaved();
  };

  const handleSaveGuestRule = () => {
    updateSettings({ guestMealRule });
    triggerSaved();
  };

  const handleSaveDutyDuration = () => {
    updateSettings({ dutyDurationDays: parseInt(dutyDuration) || 3 });
    triggerSaved();
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle={`Manage your personal profile and house preferences for ${currentHouse.name}`} />

      {savedMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
          Settings saved successfully!
        </div>
      )}

      <div className="mb-6">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "My Profile" && (
        <div className="space-y-4 max-w-2xl">
          {/* Profile Card */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <User size={16} className="text-indigo-600" /> Personal Information
            </h3>

            {profileError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={15} /> <span>{profileError}</span>
              </div>
            )}
            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 size={15} /> <span>{profileSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" value={firstName} onChange={setFirstName} />
                <Input label="Last Name" value={lastName} onChange={setLastName} />
              </div>
              <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="e.g. 01711-000001" />
              <Input label="Avatar Image URL (Optional)" value={avatarUrl} onChange={setAvatarUrl} placeholder="https://example.com/avatar.jpg" />
              
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400" />
                  <span>Email: <strong>{currentUser?.email || "N/A"}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-slate-400" />
                  <span>Role: <strong className="capitalize">{currentUser?.role || "Member"}</strong></span>
                </div>
              </div>

              <div className="flex justify-end">
                <Btn onClick={handleSaveProfile} disabled={profileLoading}>
                  {profileLoading ? "Saving..." : "Save Profile Details"}
                </Btn>
              </div>
            </div>
          </Card>

          {/* Security Card */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <KeyRound size={16} className="text-indigo-600" /> Security & Password
            </h3>

            {passError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={15} /> <span>{passError}</span>
              </div>
            )}
            {passSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 size={15} /> <span>{passSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              <Input label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="New Password" type="password" value={newPassword} onChange={setNewPassword} placeholder="Min 6 characters" />
                <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat new password" />
              </div>
              <div className="flex justify-end">
                <Btn onClick={handleSavePassword} disabled={passLoading}>
                  {passLoading ? "Updating..." : "Update Password"}
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "House" && (
        <div className="space-y-4 max-w-xl">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">House Information</h3>
            <div className="space-y-4">
              <Input label="House / Mess Name" value={currentHouse.name} />
              <Input label="Address" value={currentHouse.address} />
              <Input label="Invite Code" value={currentHouse.inviteCode} />
              <div className="flex justify-end">
                <Btn onClick={triggerSaved}>Save Changes</Btn>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Wallet Alert Threshold</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Minimum balance before alert</label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">৳</span>
                  <input
                    type="number"
                    value={walletThreshold}
                    onChange={e => setWalletThreshold(e.target.value)}
                    className="w-32 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Members with balance below ৳{walletThreshold} will show as "Low Balance"</p>
              </div>
              <div className="flex justify-end">
                <Btn onClick={handleSaveThreshold}>Save Threshold</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Meals" && (
        <SettingsMealTab
          mealWeights={mealWeights}
          setMealWeights={setMealWeights}
          guestMealRule={guestMealRule}
          setGuestMealRule={setGuestMealRule}
          onSaveWeights={handleSaveWeights}
          onSaveGuestRule={handleSaveGuestRule}
        />
      )}

      <SettingsDutyAndFines
        activeTab={activeTab}
        dutyDuration={dutyDuration}
        setDutyDuration={setDutyDuration}
        onSaveDutyDuration={handleSaveDutyDuration}
        triggerSaved={triggerSaved}
      />
    </div>
  );
}
