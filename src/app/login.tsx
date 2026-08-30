import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/authStore";
import { roleLabel } from "@/lib/services/adminService";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LogoMark() {
  return (
    <span className="flex size-16 items-center justify-center rounded-xl bg-accent/15 text-accent">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <path
          d="M334.96 67.31C397.19 60.57 408.94 154.92 346.26 163.74C283.08 172.62 271.14 74.21 334.96 67.31ZM491.81 302.28C492.06 305.96 492.3 309.64 492.54 313.32C492.22 319.3 491.9 325.29 491.57 331.28C486.38 308.09 479.83 288.89 463.64 270.84C450.36 256.02 431.52 246.45 412.54 241.64C361.33 228.66 314.76 256.59 292.01 301.34C287.05 311.09 284.93 323.66 284.19 334.47C280.5 388.96 319.2 437.8 373.4 445.92C387.68 448.05 404.13 446.69 417.82 442.25C423.83 440.29 438.86 431.47 443.15 431.13C442.31 435.06 434.56 438.49 431.65 441.02C420.12 451.01 405.06 456.68 391.01 461.98C336.03 482.74 272.58 462.94 233.34 421.67C225.16 413.07 218.03 402.76 212.41 392.39C209.97 387.89 207.48 377.13 203.59 374.42C203.28 370.47 201.03 366.59 199.95 362.8C197.34 353.61 195.42 343.97 194.5 334.47C193.57 324.95 193.39 314.8 194.69 305.3C195.69 297.96 198.13 290.23 198.17 282.82C200.67 280.45 201.37 273.95 202.4 270.64C205.28 261.47 210.06 251.85 215.15 243.69C217.25 240.32 223.08 234.49 223.29 230.68C226.75 227.89 229.14 223.76 232.13 220.48C239.51 212.41 247.9 204.47 256.99 198.33C267.15 191.48 277.84 185.85 289.08 181.08C293.63 179.16 298.86 178.45 303.17 175.97C323.13 173.89 341.5 169.91 361.87 172.19C411.75 177.79 459.22 212.51 479.24 258.42C485.49 272.76 487.66 287.38 491.81 302.28Z"
          fill="#fd8a13"
          fillRule="evenodd"
          stroke="#fd8a13"
          strokeWidth="0.25"
          strokeLinejoin="round"
        />
        <path
          d="M303.17 175.97C298.86 178.45 293.63 179.16 289.08 181.08C277.84 185.85 267.15 191.48 256.99 198.33C247.9 204.47 239.51 212.41 232.13 220.48C229.14 223.76 226.75 227.89 223.29 230.68C163.19 202.03 141.81 132.99 167.9 73.17C172.88 61.76 193.63 31.59 205.81 28.08C204.9 32.55 199.49 38.04 197.06 42.02C190.46 52.78 184.94 67.18 183.79 79.87C182.92 89.39 182.95 99.63 185.02 108.88C193.06 144.87 227.96 165.81 261.61 173.74C275.33 176.97 289.26 176.07 303.17 175.97ZM198.17 282.82C198.13 290.23 195.69 297.96 194.69 305.3C193.39 314.8 193.57 324.95 194.5 334.47C195.42 343.97 197.34 353.61 199.95 362.8C201.03 366.59 203.28 370.47 203.59 374.42C187.07 366.01 171.27 356.63 152.64 353.14C107.53 344.69 58.87 361.24 32.3 400.09C25.53 409.98 18.14 420.29 14.05 431.68C12.4 436.26 9.96 447.2 6.16 450.08C1.18 434.37 11.3 399.71 16.99 384.31C44 311.28 122.13 270.63 198.17 282.82Z"
          fill="#1cadb3"
          fillRule="evenodd"
          stroke="#1cadb3"
          strokeWidth="0.25"
          strokeLinejoin="round"
        />
        <path
          d="M491.81 302.28C492.06 305.96 492.3 309.64 492.54 313.32C492.3 309.64 492.06 305.96 491.81 302.28Z"
          fill="#fffffe"
          fillRule="evenodd"
          stroke="#fffffe"
          strokeWidth="0.25"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const admins = useAuthStore((s) => s.admins);
  const loadAdmins = useAuthStore((s) => s.loadAdmins);
  const createFirstSuperAdmin = useAuthStore((s) => s.createFirstSuperAdmin);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  // redirect if already authenticated
  if (isAuthenticated) {
    void navigate({ to: "/" });
  }

  const isInitialSetup = admins.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      if (isInitialSetup) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setErrorMsg("Please fill in all fields to set up your Super Admin account.");
          setSubmitting(false);
          return;
        }

        const admin = await createFirstSuperAdmin(name, email, password);
        toast.success(`Super Admin account "${admin.name}" initialized.`);
        void navigate({ to: "/" });
      } else {
        const res = login(email, password);
        setSubmitting(false);

        if (res.success && res.admin) {
          toast.success(`Welcome back, ${res.admin.name} (${roleLabel(res.admin.role)})!`);
          void navigate({ to: "/" });
        } else {
          setErrorMsg(res.error || "Authentication failed. Check your email and password.");
          toast.error("Authentication failed.");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-150 rounded-full bg-accent/5 blur-[120px]" />

      <div className="relative w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <LogoMark />

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <ShieldCheck className="size-3.5" />
              TrainTrack Admin
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {isInitialSetup ? "Initial Admin Setup" : "Admin Sign In"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isInitialSetup
                ? "No administrator accounts found. Create the primary Super Admin account."
                : "Enter your real administrator credentials to log in to the console."}
            </p>
          </div>
        </div>

        {/* form card */}
        <Card className="p-6 sm:p-8 shadow-2xl border-border/80 bg-card/70 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-destructive shrink-0" />
                {errorMsg}
              </div>
            ) : null}

            {isInitialSetup ? (
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Super Admin Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="pl-9"
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Admin Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Password
                </Label>
                <span className="text-[11px] text-muted-foreground">Encrypted SSL</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-11 text-sm font-medium">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing…
                </span>
              ) : isInitialSetup ? (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="size-4" />
                  Initialize Super Admin
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In to Console
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>
        </Card>

        {/* footer */}
        <div className="flex flex-col items-center justify-center space-y-2 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} TrainTrack. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
