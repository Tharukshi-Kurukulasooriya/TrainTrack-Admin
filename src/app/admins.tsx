import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  Image as ImageIcon,
  KeyRound,
  MoreVertical,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  UserCog,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/lib/authStore";
import { INBUILT_AVATARS, roleDescription, roleLabel } from "@/lib/services/adminService";
import type { AdminRecord, AdminRole } from "@/lib/types";
import { formatDate, formatRelative, initials } from "@/lib/utils";

export const Route = createFileRoute("/admins")({
  component: AdminsPage,
});

function AdminsPage() {
  const admins = useAuthStore((s) => s.admins);
  const currentAdmin = useAuthStore((s) => s.currentAdmin);
  const upsertAdmin = useAuthStore((s) => s.upsertAdmin);
  const removeAdmin = useAuthStore((s) => s.removeAdmin);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [role, setRole] = useState<AdminRole>("admin");
  const [avatarUrl, setAvatarUrl] = useState("/assets/avatars/default.png");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = currentAdmin?.role === "super_admin";

  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || a.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [admins, search, roleFilter]);

  const superAdminsCount = admins.filter((a) => a.role === "super_admin").length;
  const activeCount = admins.filter((a) => a.isActive).length;
  const recentlyActiveCount = admins.filter((a) => Boolean(a.lastLoginAt)).length;

  const openCreateDialog = () => {
    setEditingAdmin(null);
    setName("");
    setEmail("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangePassword(false);
    setRole("admin");
    setAvatarUrl("/assets/avatars/default.png");
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEditDialog = (admin: AdminRecord) => {
    setEditingAdmin(admin);
    setName(admin.name);
    setEmail(admin.email);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangePassword(false);
    setRole(admin.role);
    setAvatarUrl(admin.avatarUrl || "/assets/avatars/default.png");
    setIsActive(admin.isActive);
    setDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image file size must be less than 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        toast.success("Profile image loaded successfully.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    let finalPassword = editingAdmin ? editingAdmin.password || "" : password.trim();

    if (!editingAdmin) {
      if (!password.trim()) {
        toast.error("Please enter admin password.");
        return;
      }
      finalPassword = password.trim();
    } else if (changePassword || newPassword.trim() || confirmPassword.trim()) {
      if (!newPassword.trim()) {
        toast.error("Please enter a new password.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New password and confirm password do not match.");
        return;
      }
      finalPassword = newPassword.trim();
    }

    setSaving(true);
    try {
      const record: AdminRecord = {
        id: editingAdmin ? editingAdmin.id : `adm-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: finalPassword,
        role,
        avatarUrl: avatarUrl.trim(),
        createdAt: editingAdmin ? editingAdmin.createdAt : new Date().toISOString(),
        lastLoginAt: editingAdmin ? editingAdmin.lastLoginAt : null,
        isActive,
      };

      await upsertAdmin(record);
      toast.success(
        editingAdmin
          ? `Admin account "${record.name}" updated.`
          : `New admin account "${record.name}" created successfully.`,
      );
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save admin account.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (admin: AdminRecord) => {
    if (admin.id === currentAdmin?.id) {
      toast.error("You cannot deactivate your own logged-in account.");
      return;
    }
    const updated = { ...admin, isActive: !admin.isActive };
    await upsertAdmin(updated);
    toast.success(
      updated.isActive
        ? `Account "${admin.name}" activated.`
        : `Account "${admin.name}" deactivated.`,
    );
  };

  const handleDelete = async (admin: AdminRecord) => {
    if (admin.id === currentAdmin?.id) {
      toast.error("You cannot delete your own logged-in account.");
      return;
    }
    if (confirm(`Are you sure you want to delete admin account "${admin.name}"?`)) {
      await removeAdmin(admin.id);
      toast.success(`Admin account "${admin.name}" removed.`);
    }
  };

  if (!isSuperAdmin) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center my-8">
        <ShieldAlert className="size-12 text-destructive mb-3" />
        <h2 className="font-display text-2xl font-bold">Super Admin Access Required</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Only Super Administrators can manage admin accounts and configure security roles. You are
          logged in as <span className="font-semibold text-foreground">{currentAdmin?.name}</span> (
          {roleLabel(currentAdmin?.role || "admin")}).
        </p>
      </Card>
    );
  }

  return (
    <div className="hero-wash space-y-6 -m-6 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <PageHeader
        eyebrow="Access Control & Governance"
        title="Admin Accounts & Roles"
        description="Manage administrator accounts, granular role permissions, and security access."
        actions={
          <Button onClick={openCreateDialog} className="gap-2">
            <UserPlus className="size-4" />
            New Admin Account
          </Button>
        }
      />

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-accent/10 text-accent">
            <UserCog className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{admins.length}</p>
            <p className="text-xs text-muted-foreground">Total Admin Accounts</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-accent/10 text-accent">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{superAdminsCount}</p>
            <p className="text-xs text-muted-foreground">Super Administrators</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-accent/10 text-accent">
            <UserCheck className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active Accounts</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Activity className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{recentlyActiveCount}</p>
            <p className="text-xs text-muted-foreground">Recently Active Sessions</p>
          </div>
        </Card>
      </div>

      {/* filter and search bar */}
      <div className="flex flex-col my-10 gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground shrink-0">Filter Role:</Label>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles ({admins.length})</SelectItem>
              <SelectItem value="super_admin">Super Admins</SelectItem>
              <SelectItem value="admin">Administrators</SelectItem>
              <SelectItem value="moderator">Moderators</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* admins grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAdmins.map((admin) => {
          const isCurrent = admin.id === currentAdmin?.id;

          return (
            <Card
              key={admin.id}
              className="p-5 flex flex-col justify-between relative overflow-visible"
            >
              {isCurrent ? (
                <span className="absolute -top-2 -right-2 z-10 flex items-center justify-center rounded-md bg-card px-4 py-1 font-mono text-[12px] font-extrabold text-secondary-foreground ring-2 ring-background uppercase tracking-wider">
                  you
                </span>
              ) : null}

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-11 border border-border overflow-hidden shrink-0">
                      {admin.avatarUrl ? (
                        <AvatarImage
                          src={admin.avatarUrl}
                          alt={admin.name}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="font-mono text-sm font-bold bg-secondary text-foreground">
                        {initials(admin.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate flex items-center gap-1.5">
                        {admin.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 shrink-0">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(admin)}>
                        <UserCog className="size-4 mr-2" />
                        Edit Profile & Role
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(admin)}
                        disabled={isCurrent}
                      >
                        {admin.isActive ? (
                          <>
                            <XCircle className="size-4 mr-2 text-amber-500" />
                            Deactivate Account
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-4 mr-2 text-emerald-500" />
                            Activate Account
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(admin)}
                        disabled={isCurrent}
                        variant="destructive"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      admin.role === "super_admin"
                        ? "accent"
                        : admin.role === "admin"
                          ? "outline"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {roleLabel(admin.role)}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`text-[11px] ${
                      admin.isActive
                        ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                        : "border-destructive/30 text-destructive bg-destructive/10"
                    }`}
                  >
                    {admin.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                  {roleDescription(admin.role)}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Created {formatDate(admin.createdAt)}</span>
                <span>
                  Last login: {admin.lastLoginAt ? formatRelative(admin.lastLoginAt) : "Never"}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* create / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave} autoComplete="off">
            <DialogHeader>
              <DialogTitle>
                {editingAdmin ? "Edit Admin Account & Profile" : "Create New Admin Account"}
              </DialogTitle>
              <DialogDescription>
                Configure administrator credentials, avatar profile picture, and access role.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* profile avatar selection */}
              <div className="space-y-3 rounded-lg border border-border/80 bg-secondary/30 p-4">
                <Label className="text-xs font-semibold tracking-wider text-muted-foreground flex items-center gap-1.5">
                  Admin Profile Picture
                </Label>

                <div className="flex items-center gap-4">
                  <Avatar className="size-16 border-2 border-accent/40 shadow-sm overflow-hidden shrink-0">
                    <AvatarImage src={avatarUrl} alt="Preview" className="object-cover" />
                    <AvatarFallback className="font-bold text-xl bg-accent/20 text-accent">
                      {initials(name || "Admin")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 rounded-md bg-accent/80 px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm hover:bg-accent/90 cursor-pointer transition-all">
                        <Upload className="size-3.5" />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {avatarUrl ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAvatarUrl("")}
                          className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
                        >
                          <X className="size-3.5" />
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Upload an image file from your computer or pick an inbuilt avatar.
                    </p>
                  </div>
                </div>

                {/* avatar gallery */}
                <div className="pt-3 border-t border-border/60">
                  <p className="text-[11px] font-semibold text-muted-foreground tracking-wider mb-2.5">
                    Or choose an inbuilt avatar
                  </p>
                  <div className="flex flex-wrap gap-2.5 max-h-36 overflow-y-auto p-1">
                    {INBUILT_AVATARS.map((av) => {
                      const isSelected = avatarUrl === av.path;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setAvatarUrl(av.path)}
                          title={av.name}
                          className={`relative size-11 rounded-full border-2 overflow-hidden transition-all duration-150 ${
                            isSelected
                              ? "border-accent ring-2 ring-accent/50 scale-105"
                              : "border-border/60 hover:border-accent/60 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <img src={av.path} alt={av.name} className="size-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="Enter admin name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* password section */}
              {!editingAdmin ? (
                <div className="space-y-2">
                  <Label htmlFor="password">Account Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-md border border-border/60 bg-secondary/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-4 text-accent" />
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Password Settings
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNewPassword("");
                        setConfirmPassword("");
                        setChangePassword((prev) => !prev);
                      }}
                      className="h-7 text-xs text-accent hover:text-accent/80"
                    >
                      {changePassword ? "Cancel Change" : "Change Password"}
                    </Button>
                  </div>

                  {changePassword ? (
                    <div className="space-y-3 pt-1 border-t border-border/60">
                      <div className="space-y-1.5">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="newPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      You can change the password later by clicking the "Change Password" button.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">Admin Role & Permissions</Label>
                <Select value={role} onValueChange={(val) => setRole(val as AdminRole)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select Role">{roleLabel(role)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin" textValue="Super Admin">
                      <div className="flex flex-col py-0.5">
                        <span className="font-semibold text-foreground">Super Admin</span>
                        <span className="text-[11px] text-muted-foreground">
                          Full system access & admin account management
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" textValue="Administrator">
                      <div className="flex flex-col py-0.5">
                        <span className="font-semibold text-foreground">Administrator</span>
                        <span className="text-[11px] text-muted-foreground">
                          Manage catalog, learners, and achievements
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderator" textValue="Content Moderator">
                      <div className="flex flex-col py-0.5">
                        <span className="font-semibold text-foreground">Content Moderator</span>
                        <span className="text-[11px] text-muted-foreground">
                          Review feedbacks and view system records
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Account Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive admins cannot log in to the console.
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={editingAdmin?.id === currentAdmin?.id}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingAdmin ? "Update Account" : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
