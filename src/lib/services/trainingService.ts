import { collection, deleteDoc, doc, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebase } from "@/lib/firebase";
import type { CertificateTemplate, ModuleRecord, ReviewRecord, TrainingRecord } from "@/lib/types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function mapCertificate(value: unknown): CertificateTemplate | undefined {
  if (!value || typeof value !== "object") return undefined;
  const data = value as Record<string, unknown>;
  const layout = data.layout;
  return {
    layout: layout === "modern" || layout === "minimal" ? layout : "classic",
    borderStyle:
      data.borderStyle === "frame" || data.borderStyle === "none" ? data.borderStyle : "double",
    motif:
      data.motif === "laurel" || data.motif === "geometric" || data.motif === "none"
        ? data.motif
        : "ribbon",
    title: asString(data.title, "Certificate of Completion"),
    subtitle: asString(data.subtitle, "This certificate is proudly presented to"),
    recipientName: asString(data.recipientName, "Learner Name"),
    completionText: asString(
      data.completionText,
      "for successfully completing this training program",
    ),
    issuerName: asString(data.issuerName, "TrainTrack Academy"),
    signatureName: asString(data.signatureName, "Training Director"),
    signatureType: data.signatureType === "text" ? "text" : "digital",
    issueDate: asString(data.issueDate, "September 03, 2026"),
    accentColor: asString(data.accentColor, "#1cadb3"),
    secondaryColor: asString(data.secondaryColor, "#fd8a13"),
    credentialLabel: asString(data.credentialLabel, "Professional credential"),
    footerText: asString(data.footerText, "TrainTrack Learning & Development"),
    showSeal: data.showSeal !== false,
    sealStyle:
      data.sealStyle === "rosette" || data.sealStyle === "shield" || data.sealStyle === "laurel"
        ? data.sealStyle
        : "classic",
    sealColor: asString(data.sealColor, "#c62828"),
    showLogo: data.showLogo !== false,
    showWatermark: data.showWatermark !== false,
    signatureUrl: asString(data.signatureUrl, "/signatures/sign.png"),
  };
}

function asIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return (value as Timestamp).toDate().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  return new Date().toISOString();
}

function mapTraining(
  id: string,
  data: Record<string, unknown>,
  modules: ModuleRecord[],
  reviews: ReviewRecord[],
): TrainingRecord {
  return {
    id,
    trainingName: asString(data.trainingName),
    trainingAbout: asString(data.trainingAbout),
    trainingDescription1: asString(data.trainingDescription1),
    trainingDescription2: asString(data.trainingDescription2),
    trainingDescription3: asString(data.trainingDescription3),
    trainingCategory: asString(data.trainingCategory),
    trainingImage: asString(data.trainingImage),
    trainingImagePath: asString(data.trainingImagePath),
    trainingKeyFeatures: asStringArray(data.trainingKeyFeatures),
    trainingIsPremium: asBool(data.trainingIsPremium),
    trainingFee: asNumber(data.trainingFee),
    trainingRating: asNumber(data.trainingRating),
    trainingRatingCount: asNumber(data.trainingRatingCount),
    trainingEnrolledStudents: asNumber(data.trainingEnrolledStudents),
    trainingAddedDate: asIso(data.trainingAddedDate),
    certificateTemplate: mapCertificate(data.certificateTemplate),
    modules,
    reviews,
  };
}

function mapModule(id: string, data: Record<string, unknown>): ModuleRecord {
  return {
    id,
    moduleName: asString(data.moduleName),
    moduleVideo: asString(data.moduleVideo),
    videoPath: asString(data.videoPath),
    moduleNote: asString(data.moduleNote),
  };
}

function mapReview(
  id: string,
  trainingId: string,
  data: Record<string, unknown>,
): ReviewRecord | null {
  if (data.placeholder === true) return null;
  return {
    id,
    trainingId,
    reviewerName: asString(data.reviewerName, "Anonymous"),
    reviewerId: asString(data.reviewerId),
    reviewDate: asIso(data.reviewDate),
    reviewRating: asNumber(data.reviewRating),
    reviewText: asString(data.reviewText),
    photoUrl: asString(data.photoUrl),
  };
}

export async function fetchTrainings(): Promise<TrainingRecord[]> {
  const fb = getFirebase();
  if (!fb) return [];
  const snap = await getDocs(collection(fb.db, "trainings"));
  const trainings = await Promise.all(
    snap.docs.map(async (trainingDoc) => {
      const data = trainingDoc.data() as Record<string, unknown>;
      const [modulesSnap, reviewsSnap] = await Promise.all([
        getDocs(collection(fb.db, "trainings", trainingDoc.id, "trainingModules")),
        getDocs(collection(fb.db, "trainings", trainingDoc.id, "trainingReviews")),
      ]);
      const modules = modulesSnap.docs.map((d) =>
        mapModule(d.id, d.data() as Record<string, unknown>),
      );
      const reviews = reviewsSnap.docs
        .map((d) => mapReview(d.id, trainingDoc.id, d.data() as Record<string, unknown>))
        .filter((r): r is ReviewRecord => r !== null);
      return mapTraining(trainingDoc.id, data, modules, reviews);
    }),
  );
  return trainings.sort(
    (a, b) => new Date(b.trainingAddedDate).getTime() - new Date(a.trainingAddedDate).getTime(),
  );
}

export async function saveTraining(training: TrainingRecord): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  const payload = {
    trainingName: training.trainingName,
    trainingAbout: training.trainingAbout,
    trainingDescription1: training.trainingDescription1,
    trainingDescription2: training.trainingDescription2,
    trainingDescription3: training.trainingDescription3,
    trainingCategory: training.trainingCategory,
    trainingIsPremium: training.trainingIsPremium,
    trainingFee: training.trainingIsPremium ? training.trainingFee : 0,
    trainingImage: training.trainingImage,
    trainingImagePath: training.trainingImagePath,
    trainingKeyFeatures: training.trainingKeyFeatures,
    trainingAddedDate: Timestamp.fromDate(new Date(training.trainingAddedDate)),
    trainingRating: training.trainingRating,
    trainingRatingCount: training.trainingRatingCount,
    trainingEnrolledStudents: training.trainingEnrolledStudents,
    certificateTemplate: training.certificateTemplate ?? null,
  };
  await setDoc(doc(fb.db, "trainings", training.id), payload, { merge: true });
}

export async function deleteTraining(training: TrainingRecord): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  for (const module of training.modules) {
    await deleteDoc(doc(fb.db, "trainings", training.id, "trainingModules", module.id));
    if (module.videoPath) {
      try {
        await deleteObject(ref(fb.storage, module.videoPath));
      } catch {
        /* missing storage ref */
      }
    }
  }
  for (const review of training.reviews) {
    await deleteDoc(doc(fb.db, "trainings", training.id, "trainingReviews", review.id));
  }
  if (training.trainingImagePath) {
    try {
      await deleteObject(ref(fb.storage, training.trainingImagePath));
    } catch {
      /* missing storage ref */
    }
  }
  await deleteDoc(doc(fb.db, "trainings", training.id));
}

export async function saveModule(trainingId: string, module: ModuleRecord): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  await setDoc(doc(fb.db, "trainings", trainingId, "trainingModules", module.id), {
    moduleName: module.moduleName,
    moduleVideo: module.moduleVideo,
    videoPath: module.videoPath,
    moduleNote: module.moduleNote,
  });
}

export async function deleteModule(trainingId: string, module: ModuleRecord): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  await deleteDoc(doc(fb.db, "trainings", trainingId, "trainingModules", module.id));
  if (module.videoPath) {
    try {
      await deleteObject(ref(fb.storage, module.videoPath));
    } catch {
      /* missing storage ref */
    }
  }
}

export async function deleteReview(trainingId: string, reviewId: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  await deleteDoc(doc(fb.db, "trainings", trainingId, "trainingReviews", reviewId));
}

export async function uploadTrainingImage(
  trainingId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  const imagePath = `trainings/${trainingId}/training_images/${file.name}`;
  const storageRef = ref(fb.storage, imagePath);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return { url: downloadURL, path: imagePath };
}

export async function uploadModuleVideo(
  trainingId: string,
  moduleId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  const videoPath = `trainings/${trainingId}/training_modules/${moduleId}/${file.name}`;
  const storageRef = ref(fb.storage, videoPath);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return { url: downloadURL, path: videoPath };
}
