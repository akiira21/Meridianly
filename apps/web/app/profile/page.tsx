"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import {
  useNotifications,
  requestNotificationPermission,
  sendNotification,
} from "@/lib/notifications";
import { api } from "@/lib/api";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  Sparkles,
  Shuffle,
  Save,
  Check,
  AlertCircle,
  Droplets,
  Utensils,
} from "lucide-react";
import { getDicebearUrl } from "@/lib/avatar";
import UserAvatar from "@/components/user-avatar";

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const rehydrated = useAuthStore((state) => state.rehydrated);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const {
    getSettings: getNotificationSettings,
    updateSettings: updateNotificationSettings,
  } = useNotifications();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [notifEnabled, setNotifEnabled] = useState(() => getNotificationSettings().enabled);
  const [waterReminders, setWaterReminders] = useState(() => getNotificationSettings().waterReminders);
  const [mealReminders, setMealReminders] = useState(() => getNotificationSettings().mealReminders);

  useEffect(() => {
    if (!rehydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [isAuthenticated, rehydrated, router, fetchProfile]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarUrl(user.avatar_url || getDicebearUrl(user.username));
    }
  }, [user]);

  async function handleSaveProfile() {
    setProfileError(null);
    setProfileSuccess(false);
    setSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim() || null,
        avatar_url: avatarUrl,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleToggleNotifications(enabled: boolean) {
    if (enabled) {
      const permission = await requestNotificationPermission();
      if (permission === "granted") {
        setNotifEnabled(true);
        updateNotificationSettings({ enabled: true });
        sendNotification("Meridianly Notifications Enabled", {
          body: "You'll now receive reminders for water and meals!",
        });
      } else {
        setNotifEnabled(false);
        updateNotificationSettings({ enabled: false });
      }
    } else {
      setNotifEnabled(false);
      updateNotificationSettings({ enabled: false });
    }
  }

  function handleToggleWater(enabled: boolean) {
    setWaterReminders(enabled);
    updateNotificationSettings({ waterReminders: enabled });
  }

  function handleToggleMeals(enabled: boolean) {
    setMealReminders(enabled);
    updateNotificationSettings({ mealReminders: enabled });
  }

  function randomizeAvatar() {
    const seed = Math.random().toString(36).substring(2, 10);
    setAvatarUrl(getDicebearUrl(seed));
  }

  if (!rehydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-gentle-pulse text-sm text-muted-foreground font-body">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Profile" icon={<User size={18} />} />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1 w-full">
        {/* Profile Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <UserAvatar src={avatarUrl} name={user?.name || user?.username || "User"} size="lg" />
              <button
                onClick={randomizeAvatar}
                className="absolute -bottom-1 -right-1 p-1.5 bg-foreground text-background rounded-full hover:opacity-80 transition-opacity shadow-sm"
                title="Randomize avatar"
              >
                <Shuffle size={12} />
              </button>
            </div>
            <div>
              <h2 className="font-heading text-lg font-medium tracking-tight">
                {user?.name || user?.username || "User"}
              </h2>
              <p className="text-sm text-muted-foreground font-body">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-[10px] font-body font-medium text-muted-foreground capitalize">
                  <Sparkles size={10} />
                  {user?.plan || "free"} plan
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-[10px] font-body font-medium text-muted-foreground capitalize">
                  {user?.role || "user"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <AnimatePresence>
              {profileError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm text-destructive font-body"
                >
                  <AlertCircle size={14} />
                  {profileError}
                </motion.div>
              )}
              {profileSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm text-green-600 font-body"
                >
                  <Check size={14} />
                  Profile updated successfully
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {savingProfile ? (
                <span className="animate-gentle-pulse">Saving...</span>
              ) : (
                <>
                  <Save size={14} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-muted-foreground" />
            <h2 className="font-heading text-base font-medium tracking-tight">
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-sm font-medium">Browser Notifications</p>
                <p className="text-xs text-muted-foreground font-body">
                  Get reminded about water and meals
                </p>
              </div>
              <button
                onClick={() => handleToggleNotifications(!notifEnabled)}
                className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${
                  notifEnabled ? "bg-foreground" : "bg-muted"
                }`}
              >
                <motion.div
                  className="absolute top-1 left-1 w-4 h-4 bg-background rounded-full shadow-sm"
                  animate={{ x: notifEnabled ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <AnimatePresence>
              {notifEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Droplets size={14} className="text-blue-500" />
                      <p className="font-body text-sm">Water Reminders</p>
                    </div>
                    <button
                      onClick={() => handleToggleWater(!waterReminders)}
                      className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors ${
                        waterReminders ? "bg-foreground" : "bg-muted"
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full shadow-sm"
                        animate={{ x: waterReminders ? 16 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Utensils size={14} className="text-amber-500" />
                      <p className="font-body text-sm">Meal Reminders</p>
                    </div>
                    <button
                      onClick={() => handleToggleMeals(!mealReminders)}
                      className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors ${
                        mealReminders ? "bg-foreground" : "bg-muted"
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full shadow-sm"
                        animate={{ x: mealReminders ? 16 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Change Password */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-muted-foreground" />
            <h2 className="font-heading text-base font-medium tracking-tight">
              Change Password
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <AnimatePresence>
              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm text-destructive font-body"
                >
                  <AlertCircle size={14} />
                  {passwordError}
                </motion.div>
              )}
              {passwordSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm text-green-600 font-body"
                >
                  <Check size={14} />
                  Password changed successfully
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleChangePassword}
              disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center cursor-pointer gap-2 px-5 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {changingPassword ? (
                <span className="animate-gentle-pulse">Changing...</span>
              ) : (
                <>
                  <Lock size={14} />
                  Change Password
                </>
              )}
            </button>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
