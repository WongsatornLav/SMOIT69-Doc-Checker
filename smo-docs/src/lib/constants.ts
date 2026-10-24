import type { Database } from "@/types/database";

export type DocStatus = Database["public"]["Enums"]["doc_status"];
export type DocType = Database["public"]["Enums"]["doc_type"];
export type UserRole = Database["public"]["Enums"]["user_role"];

export const DOC_STATUS: Record<DocStatus, { label: string; className: string }> = {
  submitted:         { label: "รอตรวจ",                className: "bg-slate-100 text-slate-700" },
  in_review:         { label: "กำลังตรวจ",              className: "bg-blue-100 text-blue-700" },
  needs_revision:    { label: "ส่งกลับให้แก้ไข",         className: "bg-amber-100 text-amber-800" },
  returned:          { label: "ตรวจผ่าน (ส่งคืนแล้ว)",   className: "bg-green-100 text-green-700" },
  pending_president: { label: "รอนายกเซ็น",             className: "bg-purple-100 text-purple-700" },
  signed:            { label: "นายกเซ็นแล้ว",           className: "bg-emerald-100 text-emerald-700" },
  sent_to_affairs:   { label: "ส่งกองกิจการแล้ว",        className: "bg-teal-100 text-teal-800" },
  cancelled:         { label: "ยกเลิก",                className: "bg-red-100 text-red-700" },
};

export const DOC_TYPE: Record<DocType, string> = {
  project: "เอกสารโครงการ",
  memo: "เอกสารบันทึกข้อความ",
  other: "เอกสารอื่นๆ",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  student: "นักศึกษา",
  reviewer: "ฝ่ายตรวจเอกสาร",
  president: "นายกสโมสร",
  admin: "แอดมิน",
};

export const ALLOWED_EMAIL_DOMAIN = "kmitl.ac.th";
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
export const MIME = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export const storagePath = (uid: string, docId: string, version: number, ext: "pdf" | "docx") =>
  `${uid}/${docId}/v${version}/document.${ext}`;