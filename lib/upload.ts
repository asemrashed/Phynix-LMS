import type {
  ApiResponse,
  CourseVideoUploadResult,
  DigitalFileUploadResult,
  ProductImagesUploadResult,
  UploadResult,
} from "@fxprime/types"
import { ApiError, getAccessToken } from "./api"
import { resolveApiUrl } from "./api-url"

async function uploadForm<T>(path: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(resolveApiUrl(path), {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  })

  const json = (await res.json()) as ApiResponse<T>
  if (!json.success) {
    throw new ApiError(json.error, res.status)
  }

  return json.data
}

export async function uploadThumbnail(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  return uploadForm<UploadResult>("/admin/uploads/thumbnail", formData)
}

export async function uploadPaymentQr(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  return uploadForm<UploadResult>("/admin/uploads/payment-qr", formData)
}

export async function uploadManualPaymentProof(
  paymentId: string,
  file: File
): Promise<UploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  return uploadForm<UploadResult>(`/payments/manual/${paymentId}/proof-image`, formData)
}

export async function uploadDigitalFile(file: File): Promise<DigitalFileUploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  return uploadForm<DigitalFileUploadResult>("/admin/uploads/digital-file", formData)
}

export async function uploadProductImages(files: File[]): Promise<ProductImagesUploadResult> {
  const formData = new FormData()
  for (const file of files) {
    formData.append("files", file)
  }
  return uploadForm<ProductImagesUploadResult>("/admin/uploads/product-images", formData)
}

export async function uploadCourseVideo(
  courseId: string,
  sectionId: string,
  lessonId: string,
  file: File
): Promise<CourseVideoUploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  return uploadForm<CourseVideoUploadResult>(
    `/admin/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/upload-video`,
    formData
  )
}
