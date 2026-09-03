import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ImagePlus, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CertificateEditor, CERTIFICATE_DEFAULTS } from "@/components/trainings/certificate-editor";
import { Stars } from "@/components/shared/stars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TRAINING_CATEGORIES, suggestTrainingId } from "@/lib/categories";
import { LottieAnimations } from "@/lib/data/const";
import { useAppStore } from "@/lib/data/store";
import { formatRelative, initials } from "@/lib/utils";
import type { ModuleRecord, TrainingRecord } from "@/lib/types";
import { LottiePlayer } from "../ui/lottie-player";

type ModuleDraft = ModuleRecord & { file?: File; preview?: string };

function emptyTraining(id: string): TrainingRecord {
  return {
    id,
    trainingName: "",
    trainingAbout: "",
    trainingDescription1: "",
    trainingDescription2: "",
    trainingDescription3: "",
    trainingCategory: "Onboarding & Orientation",
    trainingImage: "",
    trainingImagePath: "",
    trainingKeyFeatures: [],
    trainingIsPremium: false,
    trainingFee: 0,
    trainingRating: 0,
    trainingRatingCount: 0,
    trainingEnrolledStudents: 0,
    trainingAddedDate: new Date().toISOString(),
    certificateTemplate: { ...CERTIFICATE_DEFAULTS },
    modules: [],
    reviews: [],
  };
}

export function TrainingForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: TrainingRecord;
}) {
  const navigate = useNavigate();
  const trainings = useAppStore((s) => s.trainings);
  const upsertTraining = useAppStore((s) => s.upsertTraining);
  const upsertModule = useAppStore((s) => s.upsertModule);
  const removeModule = useAppStore((s) => s.removeModule);
  const removeReview = useAppStore((s) => s.removeReview);
  const uploadImage = useAppStore((s) => s.uploadImage);
  const uploadVideo = useAppStore((s) => s.uploadVideo);

  const existingIds = trainings.map((t) => t.id);
  const [form, setForm] = useState<TrainingRecord>(
    initial ?? emptyTraining(suggestTrainingId("Onboarding & Orientation", existingIds)),
  );
  const [idTouched, setIdTouched] = useState(mode === "edit");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initial?.trainingImage ?? "");
  const [featureDraft, setFeatureDraft] = useState("");
  const [modules, setModules] = useState<ModuleDraft[]>(initial?.modules ?? []);
  const [moduleId, setModuleId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [moduleNote, setModuleNote] = useState("");
  const [moduleFile, setModuleFile] = useState<File | null>(null);
  const [modulePreview, setModulePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingModule, setPendingModule] = useState<string | null>(null);
  const [pendingReview, setPendingReview] = useState<string | null>(null);

  const nextModuleId = useMemo(() => {
    const nums = modules.map((m) => Number.parseInt(m.id, 10)).filter((n) => Number.isFinite(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return String(next).padStart(4, "0");
  }, [modules]);

  const setField = <K extends keyof TrainingRecord>(key: K, value: TrainingRecord[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onCategory = (category: string) => {
    setForm((prev) => ({
      ...prev,
      trainingCategory: category,
      id: mode === "create" && !idTouched ? suggestTrainingId(category, existingIds) : prev.id,
    }));
  };

  const addFeature = () => {
    const value = featureDraft.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      trainingKeyFeatures: [...prev.trainingKeyFeatures, value],
    }));
    setFeatureDraft("");
  };

  const addModuleDraft = () => {
    const id = (moduleId || nextModuleId).trim();
    if (!id || !moduleName.trim()) {
      toast.error("Module ID and name are required.");
      return;
    }
    if (modules.some((m) => m.id === id)) {
      toast.error("That module ID is already in this program.");
      return;
    }
    setModules((prev) => [
      ...prev,
      {
        id,
        moduleName: moduleName.trim(),
        moduleNote: moduleNote.trim(),
        moduleVideo: modulePreview,
        videoPath: "",
        file: moduleFile ?? undefined,
        preview: modulePreview,
      },
    ]);
    setModuleId("");
    setModuleName("");
    setModuleNote("");
    setModuleFile(null);
    setModulePreview("");
  };

  const save = async () => {
    if (!form.id.trim()) {
      toast.error("Give the training a stable ID.");
      return;
    }
    if (!form.trainingName.trim()) {
      toast.error("Name the training.");
      return;
    }
    if (!form.trainingCategory) {
      toast.error("Pick a category.");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = form.trainingImage;
      let imagePath = form.trainingImagePath;
      if (imageFile) {
        const uploaded = await uploadImage(form.id.trim(), imageFile);
        imageUrl = uploaded.url;
        imagePath = uploaded.path;
      }

      const payload: TrainingRecord = {
        ...form,
        id: form.id.trim(),
        trainingName: form.trainingName.trim(),
        trainingAbout: form.trainingAbout.trim(),
        trainingImage: imageUrl,
        trainingImagePath: imagePath,
        trainingFee: form.trainingIsPremium ? Number(form.trainingFee) || 0 : 0,
        modules: [],
        reviews: initial?.reviews ?? form.reviews,
        trainingAddedDate: initial?.trainingAddedDate ?? form.trainingAddedDate,
      };

      await upsertTraining(payload);

      const originalIds = new Set((initial?.modules ?? []).map((m) => m.id));
      const nextIds = new Set(modules.map((m) => m.id));
      for (const existing of initial?.modules ?? []) {
        if (!nextIds.has(existing.id)) {
          await removeModule(payload.id, existing.id);
        }
      }

      for (const module of modules) {
        let videoURL = module.moduleVideo;
        let videoPath = module.videoPath;
        if (module.file) {
          const uploaded = await uploadVideo(payload.id, module.id, module.file);
          videoURL = uploaded.url;
          videoPath = uploaded.path;
        }
        await upsertModule(payload.id, {
          id: module.id,
          moduleName: module.moduleName,
          moduleNote: module.moduleNote,
          moduleVideo: videoURL.startsWith("blob:") ? "" : videoURL,
          videoPath,
        });
        originalIds.delete(module.id);
      }

      toast.success(mode === "create" ? "Training published." : "Training saved.");
      if (mode === "create") {
        void navigate({ to: "/trainings/$id", params: { id: payload.id } });
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not save this training.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="program">
        <TabsList>
          <TabsTrigger value="program">Program</TabsTrigger>
          <TabsTrigger value="modules">
            Modules
            <Badge variant="secondary" className="ml-2">
              {modules.length}
            </Badge>
          </TabsTrigger>
          {mode === "edit" ? (
            <TabsTrigger value="reviews">
              Reviews
              <Badge variant="secondary" className="ml-2">
                {form.reviews.length}
              </Badge>
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="program">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Card className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trainingId">Training ID</Label>
                  <Input
                    id="trainingId"
                    value={form.id}
                    disabled={mode === "edit"}
                    onChange={(e) => {
                      setIdTouched(true);
                      setField("id", e.target.value);
                    }}
                    placeholder="ONB-2026-001"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainingName">Name</Label>
                  <Input
                    id="trainingName"
                    value={form.trainingName}
                    onChange={(e) => setField("trainingName", e.target.value)}
                    placeholder="Company Foundations"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover image</Label>
                <label className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-dashed border-border bg-accent/4 transition-[border-color] duration-150 hover:border-ring/50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="flex aspect-video flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                      <ImagePlus className="size-6" />
                      Upload a still from the program
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                <Input
                  id="about"
                  value={form.trainingAbout}
                  onChange={(e) => setField("trainingAbout", e.target.value)}
                  placeholder="One sentence the catalog can lead with"
                />
              </div>

              {(
                ["trainingDescription1", "trainingDescription2", "trainingDescription3"] as const
              ).map((key, index) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>Narrative {index + 1}</Label>
                  <Textarea
                    id={key}
                    rows={3}
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder={`Section ${index + 1}`}
                  />
                </div>
              ))}
            </Card>

            <div className="space-y-6">
              <Card className="space-y-5 p-5 sm:p-6">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.trainingCategory} onValueChange={onCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAINING_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Static list, matched to the mobile app.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-md bg-accent/8 px-4 py-3">
                  <div>
                    <Label htmlFor="premium">Premium program</Label>
                    <p className="text-xs text-muted-foreground">
                      Paid seats unlock after purchase.
                    </p>
                  </div>
                  <Switch
                    id="premium"
                    checked={form.trainingIsPremium}
                    onCheckedChange={(checked) => setField("trainingIsPremium", checked)}
                  />
                </div>

                {form.trainingIsPremium ? (
                  <div className="space-y-2">
                    <Label htmlFor="fee">Fee (LKR)</Label>
                    <Input
                      id="fee"
                      type="number"
                      min={0}
                      value={form.trainingFee}
                      onChange={(e) => setField("trainingFee", Number(e.target.value) || 0)}
                    />
                  </div>
                ) : null}
              </Card>

              <Card className="space-y-4 p-5 sm:p-6">
                <Label>Key features</Label>
                <div className="flex gap-2">
                  <Input
                    value={featureDraft}
                    onChange={(e) => setFeatureDraft(e.target.value)}
                    placeholder="Hands-on studio"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={addFeature}>
                    Add
                  </Button>
                </div>
                <ul className="space-y-2">
                  {form.trainingKeyFeatures.map((feature, index) => (
                    <li
                      key={`${feature}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-md bg-accent/8 px-4 py-2 text-sm"
                    >
                      <span>{feature}</span>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remove ${feature}`}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            trainingKeyFeatures: prev.trainingKeyFeatures.filter(
                              (_, i) => i !== index,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="modules">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card className="space-y-4 p-5 sm:p-6">
              <div>
                <h2 className="font-display text-2xl">Add a module</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Video lessons live under this training. Save the program to publish them.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="moduleId">Module ID</Label>
                <Input
                  id="moduleId"
                  className="font-mono"
                  placeholder={nextModuleId}
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moduleName">Name</Label>
                <Input
                  id="moduleName"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="The weekly operating system"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moduleNote">Lesson note</Label>
                <Textarea
                  id="moduleNote"
                  rows={3}
                  value={moduleNote}
                  onChange={(e) => setModuleNote(e.target.value)}
                  placeholder="What the learner should walk away with"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moduleVideo">Video</Label>
                <Input
                  id="moduleVideo"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setModuleFile(file);
                    setModulePreview(URL.createObjectURL(file));
                  }}
                />
                {modulePreview ? (
                  <video controls className="mt-2 w-full rounded-md" src={modulePreview} />
                ) : null}
              </div>
              <Button type="button" onClick={addModuleDraft} className="w-full">
                <Plus className="size-4" />
                Add module
              </Button>
            </Card>

            <div className="space-y-3">
              {modules.length === 0 ? (
                <Card className="flex flex-col items-center px-6 py-16 text-center">
                  <Upload className="size-7 text-muted-foreground" />
                  <p className="mt-3 font-display text-xl">No modules yet</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Sequence the lessons before you publish. IDs stay stable for the mobile player.
                  </p>
                </Card>
              ) : (
                modules.map((module, index) => (
                  <Card key={module.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                          Lesson {index + 1} · {module.id}
                        </p>
                        <h3 className="mt-1 font-medium">{module.moduleName}</h3>
                        {module.moduleNote ? (
                          <p className="mt-2 text-sm text-muted-foreground">{module.moduleNote}</p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setPendingModule(module.id)}
                      >
                        Remove
                      </Button>
                    </div>
                    {module.preview || module.moduleVideo ? (
                      <video
                        controls
                        className="mt-4 w-full rounded-md"
                        src={module.preview || module.moduleVideo}
                      />
                    ) : null}
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {mode === "edit" ? (
          <TabsContent value="reviews">
            <div className="space-y-3">
              {form.reviews.length === 0 ? (
                <Card className="px-6 py-16 text-center text-sm text-muted-foreground">
                  <LottiePlayer animationData={LottieAnimations.empty} className="mx-auto w-40" />
                  No employee reviews on this program yet.
                </Card>
              ) : (
                form.reviews.map((review) => (
                  <Card key={review.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <Avatar className="size-10 shrink-0 border border-accent/20">
                          {review.photoUrl ? (
                            <AvatarImage src={review.photoUrl} alt={review.reviewerName} />
                          ) : null}
                          <AvatarFallback>{initials(review.reviewerName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{review.reviewerName}</p>
                            <Stars value={review.reviewRating} />
                            <span className="text-xs text-muted-foreground">
                              {formatRelative(review.reviewDate)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed">{review.reviewText}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        className="text-destructive"
                        onClick={() => setPendingReview(review.id)}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ) : null}

        <TabsContent value="certificates">
          <CertificateEditor
            value={form.certificateTemplate ?? { ...CERTIFICATE_DEFAULTS }}
            trainingName={form.trainingName}
            onChange={(certificateTemplate) => setField("certificateTemplate", certificateTemplate)}
          />
        </TabsContent>
      </Tabs>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => void navigate({ to: "/trainings" })}>
          Cancel
        </Button>
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Publish training" : "Save changes"}
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingModule)}
        onOpenChange={(open) => {
          if (!open) setPendingModule(null);
        }}
        title="Remove this module?"
        description="The lesson will drop from the program sequence."
        onConfirm={() => {
          if (!pendingModule) return;
          setModules((prev) => prev.filter((m) => m.id !== pendingModule));
          setPendingModule(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingReview)}
        onOpenChange={(open) => {
          if (!open) setPendingReview(null);
        }}
        title="Delete this review?"
        description="The rating will leave the public record for this training."
        onConfirm={() => {
          if (!pendingReview) return;
          void removeReview(form.id, pendingReview).then(() => {
            setForm((prev) => ({
              ...prev,
              reviews: prev.reviews.filter((r) => r.id !== pendingReview),
            }));
            toast.success("Review removed.");
          });
          setPendingReview(null);
        }}
      />
    </div>
  );
}
