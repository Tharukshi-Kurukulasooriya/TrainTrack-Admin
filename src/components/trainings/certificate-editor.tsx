import { useRef } from "react";
import {
  Award,
  Check,
  Eye,
  ImagePlus,
  Leaf,
  Palette,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import type { CertificateTemplate } from "@/lib/types";

const COLOR_PALETTES = [
  { name: "Ocean", accent: "#1cadb3", secondary: "#fd8a13" },
  { name: "Royal", accent: "#3155a6", secondary: "#d7a62b" },
  { name: "Forest", accent: "#19745b", secondary: "#c48632" },
  { name: "Rose", accent: "#b84b69", secondary: "#4b315e" },
];

export const CERTIFICATE_DEFAULTS: CertificateTemplate = {
  layout: "classic",
  borderStyle: "double",
  motif: "ribbon",
  title: "Certificate of Completion",
  subtitle: "This certificate is proudly presented to",
  recipientName: "Learner Name",
  completionText: "for successfully completing this training program",
  issuerName: "TrainTrack Academy",
  signatureName: "Training Director",
  issueDate: "September 03, 2026",
  accentColor: "#1cadb3",
  secondaryColor: "#fd8a13",
  credentialLabel: "Professional credential",
  footerText: "TrainTrack Learning & Development",
  showSeal: true,
  sealStyle: "classic",
  sealColor: "#c62828",
  showLogo: true,
  showWatermark: true,
};

function CertificateSeal({
  color,
  style,
}: {
  color: string;
  style: CertificateTemplate["sealStyle"];
}) {
  return (
    <svg viewBox="0 0 100 112" aria-label="Certificate seal" role="img" className="size-[68%]">
      <defs>
        <radialGradient id="sealShine" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="55%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ROSETTE — double-pleated medallion with a proper knotted ribbon tail */}
      {style === "rosette" && (
        <>
          <path
            d="m50 6 8 5.5 9-4 6 8 9.5-1 2.5 9.3 9 4-2 9.5 6.5 7.7-6.5 7.7 2 9.5-9 4-2.5 9.3-9.5-1-6 8-9-4-8 5.5-8-5.5-9 4-6-8-9.5 1-2.5-9.3-9-4 2-9.5-6.5-7.7 6.5-7.7-2-9.5 9-4 2.5-9.3 9.5 1 6-8 9 4Z"
            fill={color}
          />
          <path
            d="m50 12 6.5 4.5 7.5-3.3 5 6.6 7.8-.9 2 7.6 7.4 3.3-1.6 7.8 5.3 6.3-5.3 6.3 1.6 7.8-7.4 3.3-2 7.6-7.8-.9-5 6.6-7.5-3.3L50 100l-6.5 4.5-7.5-3.3-5 6.6-7.8-.9-2-7.6-7.4-3.3 1.6-7.8-5.3-6.3 5.3-6.3-1.6-7.8 7.4-3.3 2-7.6 7.8.9 5-6.6 7.5 3.3Z"
            fill="black"
            opacity="0.08"
          />
          <circle cx="50" cy="44" r="26" fill="url(#sealShine)" />
          <path d="M40 84 33 106l17-9 17 9-7-22" fill={color} />
          <path d="M40 84 33 106l17-9V84Z" fill="black" opacity="0.12" />
        </>
      )}

      {/* SHIELD — crest with a subtle center fold and pointed base */}
      {style === "shield" && (
        <>
          <path d="M50 6 86 19v28c0 27-17 42-36 55-19-13-36-28-36-55V19Z" fill={color} />
          <path d="M50 6v96c19-13 36-28 36-55V19Z" fill="black" opacity="0.1" />
          <path
            d="M50 12 80 23v24c0 23-14 36-30 47-16-11-30-24-30-47V23Z"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <ellipse cx="50" cy="30" rx="24" ry="12" fill="url(#sealShine)" />
        </>
      )}

      {/* LAUREL — layered branches with individual leaves instead of a bare stroke */}
      {style === "laurel" && (
        <>
          <g fill={color}>
            <path d="M31 22c-17 12-21 35-8 51l4-3c-11-14-8-33 7-44Z" />
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={`l-${i}`}
                cx={30 - i * 3.6}
                cy={30 + i * 9.5}
                rx="5"
                ry="2.6"
                transform={`rotate(${-40 + i * 12} ${30 - i * 3.6} ${30 + i * 9.5})`}
              />
            ))}
            <path d="M69 22c17 12 21 35 8 51l-4-3c11-14 8-33-7-44Z" />
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={`r-${i}`}
                cx={70 + i * 3.6}
                cy={30 + i * 9.5}
                rx="5"
                ry="2.6"
                transform={`rotate(${40 - i * 12} ${70 + i * 3.6} ${30 + i * 9.5})`}
              />
            ))}
          </g>
          <circle cx="50" cy="47" r="27" fill={color} />
          <circle cx="50" cy="47" r="27" fill="url(#sealShine)" />
        </>
      )}

      {/* CLASSIC — fuller ribbon tails with a fold crease, and a domed medallion */}
      {style === "classic" && (
        <>
          <path d="M24 68 15 106l35-19 35 19-9-38" fill={color} opacity="0.9" />
          <path d="M50 87 15 106l35-19Z" fill="black" opacity="0.1" />
          <path d="M50 87 85 106l-9-38Z" fill="black" opacity="0.05" />
          <circle cx="50" cy="46" r="39" fill={color} />
          <circle cx="50" cy="46" r="39" fill="url(#sealShine)" />
        </>
      )}

      {/* inner ring — skipped for classic, which already reads as a dome */}
      {style !== "classic" && (
        <circle
          cx="50"
          cy="44"
          r="24"
          fill="none"
          stroke="white"
          strokeWidth="1.75"
          opacity="0.85"
        />
      )}

      {/* center star */}
      {style === "shield" ? (
        <path
          d="m50 26 5.5 10.8 12-1.8-8.7 8.6 2 11.9-10.8-5.7-10.8 5.7 2-11.9-8.7-8.6 12-1.8Z"
          fill="white"
        />
      ) : (
        <path
          d="m50 25 6 12 13.3 1.9-9.6 9.4 2.3 13.2L50 55l-11.9 6.5 2.3-13.2-9.6-9.4L44.1 37Z"
          fill="white"
        />
      )}

      <path
        d={style === "classic" ? "M37 68h26" : "M38 70h24"}
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CertificatePreview({
  template,
  trainingName,
}: {
  template: CertificateTemplate;
  trainingName: string;
}) {
  const isModern = template.layout === "modern";
  const isMinimal = template.layout === "minimal";
  const borderClass =
    template.borderStyle === "double"
      ? "border-4 border-double border-(--certificate-accent)"
      : template.borderStyle === "frame"
        ? "border border-(--certificate-accent)"
        : "border border-transparent";
  const previewStyle = {
    "--certificate-accent": template.accentColor,
    "--certificate-secondary": template.secondaryColor,
  } as React.CSSProperties;

  return (
    <div className="rounded-xl border border-border/70 bg-secondary/35 p-2.5 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-medium">Certificate canvas</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1 text-[11px] tracking-wider">
          <Eye className="size-3.5" /> {template.layout} layout
        </span>
      </div>
      <div
        style={previewStyle}
        className={`relative aspect-[1.414/1] w-full overflow-hidden rounded-md bg-[#fffdf8] p-[5%] text-center text-[#17212b] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)] ${
          isModern ? `border-l-14 border-(--certificate-accent) ${borderClass}` : borderClass
        }`}
      >
        {!isMinimal && template.borderStyle !== "none" && (
          <div className="pointer-events-none absolute inset-[3%] border border-(--certificate-accent)/35" />
        )}
        {isModern && (
          <div className="absolute -right-16 -top-20 size-48 rounded-full bg-(--certificate-accent)/10" />
        )}
        {template.motif === "ribbon" && (
          <div className="absolute right-[2%] top-[2%] rounded-sm bg-(--certificate-secondary) px-3 py-1 text-[clamp(5px,1vw,10px)] font-bold uppercase tracking-widest text-white shadow-sm">
            {template.credentialLabel}
          </div>
        )}
        {template.motif === "geometric" && (
          <div className="absolute bottom-[-18%] left-[-6%] size-[35%] rotate-45 border-[clamp(8px,2vw,20px)] border-(--certificate-secondary)/25" />
        )}
        {template.motif === "laurel" && (
          <div className="absolute left-[7%] top-1/2 flex -translate-y-1/2 -rotate-12 text-(--certificate-secondary)/60">
            <Leaf className="size-[clamp(22px,5vw,52px)]" />
            <Leaf className="-ml-3 mt-4 size-[clamp(16px,4vw,38px)] rotate-[-55deg]" />
          </div>
        )}
        {template.showWatermark && (
          <img
            src="/favicon.svg"
            alt=""
            className="pointer-events-none absolute left-1/2 top-1/2 size-[50%] -translate-x-1/2 -translate-y-1/2 opacity-[0.25]"
          />
        )}
        <div className="relative flex h-full flex-col items-center justify-between py-[3%]">
          <div className="flex items-center gap-2 text-[clamp(7px,1.3vw,14px)] font-semibold uppercase tracking-[0.22em] text-(--certificate-accent)">
            <img src="/favicon.svg" alt="TrainTrack" className="size-8 object-contain" />
            {template.issuerName}
          </div>
          <div className="space-y-[1.5%]">
            <p
              className={`font-serif text-[clamp(16px,4vw,44px)] leading-none ${isModern ? "font-bold" : "italic"}`}
            >
              {template.title}
            </p>
            <p className="text-[clamp(7px,1.3vw,14px)] text-[#6a7178]">{template.subtitle}</p>
            <p className="font-serif text-[clamp(17px,4vw,46px)] leading-tight text-(--certificate-accent)">
              {template.recipientName}
            </p>
            <div className="mx-auto h-px w-1/2 bg-(--certificate-accent)/50" />
            <p className="mx-auto max-w-[75%] text-[clamp(7px,1.3vw,14px)] leading-relaxed text-[#4e5861]">
              {template.completionText}
              <br />
              <strong className="text-[#17212b]">{trainingName || "Your Training Program"}</strong>
            </p>
            <p className="pt-[2%] text-[clamp(5px,0.9vw,10px)] font-semibold uppercase tracking-[0.2em] text-(--certificate-secondary)">
              {template.credentialLabel}
            </p>
          </div>
          <div className="flex w-full items-end justify-between gap-3 px-[4%] text-left text-[clamp(6px,1.1vw,12px)] text-[#59636c]">
            <div className="min-w-0">
              <div className="border-t border-[#9aa1a6] pt-1">
                {template.signatureUrl ? (
                  <img
                    src={template.signatureUrl}
                    alt="Digital signature"
                    className="h-[clamp(14px,3vw,30px)] max-w-30 object-contain object-left"
                  />
                ) : (
                  <p className="font-serif text-[clamp(8px,1.4vw,15px)] italic text-[#17212b]">
                    {template.signatureName}
                  </p>
                )}
              </div>
              <p>Authorized signature</p>
            </div>
            {template.showSeal && (
              <div className="flex size-[clamp(30px,7vw,72px)] shrink-0 items-center justify-center">
                <CertificateSeal color={template.sealColor} style={template.sealStyle} />
              </div>
            )}
            <div className="text-right">
              <p className="border-t border-[#9aa1a6] pt-1 font-medium text-[#17212b]">
                {template.issueDate}
              </p>
              <p>Issue date</p>
            </div>
          </div>
          <p className="absolute bottom-[-1%] text-[clamp(5px,0.8vw,9px)] tracking-wide text-[#8a9196]">
            {template.footerText}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CertificateEditor({
  value,
  trainingName,
  onChange,
}: {
  value: CertificateTemplate;
  trainingName: string;
  onChange: (value: CertificateTemplate) => void;
}) {
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const setField = <K extends keyof CertificateTemplate>(
    field: K,
    nextValue: CertificateTemplate[K],
  ) => {
    onChange({ ...value, [field]: nextValue });
  };

  const reset = () => onChange({ ...CERTIFICATE_DEFAULTS });

  const uploadSignature = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setField("signatureUrl", reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card className="order-2 space-y-6 border-border/70 p-5 sm:p-6 xl:order-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg">Certificate studio</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Build a polished completion certificate for this program.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={reset}
            title="Reset template"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-border/70 bg-secondary/25 p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-accent/12 text-accent">
              <Palette className="size-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Composition</p>
              <p className="text-xs text-muted-foreground">
                Choose the visual language for your award.
              </p>
            </div>
          </div>
          <Label>Sample template</Label>
          <Select
            value={value.layout}
            onValueChange={(next) => setField("layout", next as CertificateTemplate["layout"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic Award</SelectItem>
              <SelectItem value="modern">Modern Edge</SelectItem>
              <SelectItem value="minimal">Minimal Signature</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 rounded-lg border border-border/70 bg-secondary/25 p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Border treatment</Label>
            <Select
              value={value.borderStyle}
              onValueChange={(next) =>
                setField("borderStyle", next as CertificateTemplate["borderStyle"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="double">Double line</SelectItem>
                <SelectItem value="frame">Single frame</SelectItem>
                <SelectItem value="none">Open edge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatureUpload">Digital signature</Label>
            <input
              ref={signatureInputRef}
              id="signatureUpload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => uploadSignature(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signatureInputRef.current?.click()}
            >
              <Upload className="size-4" />
              {value.signatureUrl ? "Replace signature" : "Upload signature"}
            </Button>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border/70 bg-secondary/25 p-4">
          <div>
            <p className="text-sm font-semibold">Brand direction</p>
            <p className="text-xs text-muted-foreground">
              Set the colors and supporting visual details.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {COLOR_PALETTES.map((palette) => {
              const selected =
                value.accentColor === palette.accent && value.secondaryColor === palette.secondary;
              return (
                <button
                  key={palette.name}
                  type="button"
                  title={`${palette.name} palette`}
                  aria-label={`Use ${palette.name} palette`}
                  onClick={() =>
                    onChange({
                      ...value,
                      accentColor: palette.accent,
                      secondaryColor: palette.secondary,
                    })
                  }
                  className={`group flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs transition-colors ${selected ? "border-accent bg-accent/10 text-foreground" : "border-border bg-card hover:border-accent/50"}`}
                >
                  <span className="flex -space-x-1">
                    <span
                      className="size-4 rounded-full border-2 border-card"
                      style={{ backgroundColor: palette.accent }}
                    />
                    <span
                      className="size-4 rounded-full border-2 border-card"
                      style={{ backgroundColor: palette.secondary }}
                    />
                  </span>
                  {palette.name}
                  {selected ? <Check className="size-3.5 text-accent" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border/70 bg-secondary/25 p-4">
          <div>
            <p className="text-sm font-semibold">Certificate copy</p>
            <p className="text-xs text-muted-foreground">
              Personalize the message shown to every learner.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Decorative motif</Label>
              <Select
                value={value.motif}
                onValueChange={(next) => setField("motif", next as CertificateTemplate["motif"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ribbon">Credential ribbon</SelectItem>
                  <SelectItem value="laurel">Laurel accent</SelectItem>
                  <SelectItem value="geometric">Geometric corner</SelectItem>
                  <SelectItem value="none">No motif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credentialLabel">Credential label</Label>
              <Input
                id="credentialLabel"
                value={value.credentialLabel}
                onChange={(e) => setField("credentialLabel", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="certificateTitle">Certificate title</Label>
              <Input
                id="certificateTitle"
                value={value.title}
                onChange={(e) => setField("title", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="certificateSubtitle">Introductory line</Label>
              <Input
                id="certificateSubtitle"
                value={value.subtitle}
                onChange={(e) => setField("subtitle", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="recipientName">Recipient placeholder</Label>
              <Input
                id="recipientName"
                value={value.recipientName}
                onChange={(e) => setField("recipientName", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="completionText">Completion statement</Label>
              <Input
                id="completionText"
                value={value.completionText}
                onChange={(e) => setField("completionText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuerName">Issuing organization</Label>
              <Input
                id="issuerName"
                value={value.issuerName}
                onChange={(e) => setField("issuerName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signatureName">Signature name</Label>
              <Input
                id="signatureName"
                value={value.signatureName}
                onChange={(e) => setField("signatureName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue date label</Label>
              <Input
                id="issueDate"
                value={value.issueDate}
                onChange={(e) => setField("issueDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={value.accentColor}
                  onChange={(e) => setField("accentColor", e.target.value)}
                  className="w-14 p-1"
                />
                <Input
                  aria-label="Accent color hex value"
                  value={value.accentColor}
                  onChange={(e) => setField("accentColor", e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Motif color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={value.secondaryColor}
                  onChange={(e) => setField("secondaryColor", e.target.value)}
                  className="w-14 p-1"
                />
                <Input
                  aria-label="Motif color hex value"
                  value={value.secondaryColor}
                  onChange={(e) => setField("secondaryColor", e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="footerText">Footer line</Label>
              <Input
                id="footerText"
                value={value.footerText}
                onChange={(e) => setField("footerText", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-lg border border-border/70 bg-secondary/25 p-4">
          <div>
            <p className="text-sm font-semibold">Trust signals</p>
            <p className="text-xs text-muted-foreground">
              Give the certificate an official finish.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-md border border-accent/20 bg-accent/5 p-3">
            <div>
              <Label htmlFor="showSeal">Official seal</Label>
              <p className="text-xs text-muted-foreground">
                Add a verification mark to the certificate.
              </p>
            </div>
            <Switch
              id="showSeal"
              checked={value.showSeal}
              onCheckedChange={(checked) => setField("showSeal", checked)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border border-accent/20 bg-accent/5 p-3">
              <div>
                <Label htmlFor="showLogo">TrainTrack logo</Label>
                <p className="text-xs text-muted-foreground">Use the official public mark.</p>
              </div>
              <Switch
                id="showLogo"
                checked={value.showLogo}
                onCheckedChange={(checked) => setField("showLogo", checked)}
              />
            </div>
            {value.signatureUrl ? (
              <Button
                type="button"
                variant="ghost"
                className="justify-start text-destructive"
                onClick={() => setField("signatureUrl", "")}
              >
                <ImagePlus className="size-4" />
                Remove digital signature
              </Button>
            ) : null}
            <div className="flex items-center justify-between rounded-md border border-accent/20 bg-accent/5 p-3">
              <div>
                <Label htmlFor="showWatermark">Watermark</Label>
                <p className="text-xs text-muted-foreground">Add a subtle brand mark.</p>
              </div>
              <Switch
                id="showWatermark"
                checked={value.showWatermark}
                onCheckedChange={(checked) => setField("showWatermark", checked)}
              />
            </div>
            <div className="space-y-2 rounded-md border border-accent/20 bg-accent/5 p-3">
              <Label>Seal design</Label>
              <div className="grid grid-cols-4 gap-2">
                {(["classic", "rosette", "shield", "laurel"] as const).map((sealStyle) => (
                  <button
                    type="button"
                    key={sealStyle}
                    title={`${sealStyle} seal`}
                    aria-label={`Use ${sealStyle} seal`}
                    onClick={() => setField("sealStyle", sealStyle)}
                    className={`flex aspect-square items-center justify-center rounded-md border bg-card transition-colors ${value.sealStyle === sealStyle ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/50"}`}
                  >
                    <CertificateSeal color={value.sealColor} style={sealStyle} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 rounded-md border border-accent/20 bg-accent/5 p-3">
              <Label htmlFor="sealColor">Seal color</Label>
              <div className="flex gap-2">
                <Input
                  id="sealColor"
                  type="color"
                  value={value.sealColor}
                  onChange={(e) => setField("sealColor", e.target.value)}
                  className="w-14 p-0 "
                />
                <Input
                  aria-label="Seal color hex value"
                  value={value.sealColor}
                  onChange={(e) => setField("sealColor", e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
      <div className="order-1 self-start xl:sticky xl:top-28 xl:order-2">
        <CertificatePreview template={value} trainingName={trainingName} />
      </div>
    </div>
  );
}
