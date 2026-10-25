"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UploadDocumentPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      alert("กรุณากรอกชื่อเอกสารและเลือกไฟล์");
      return;
    }

    setLoading(true);

    try {
      // 1. ดึงข้อมูล User ปัจจุบัน
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("กรุณาลูกอินใหม่อีกครั้ง");

      // 2. อัปโหลดไฟล์ไปที่ Supabase Storage (Bucket: documents)
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. ดึง Public URL ของไฟล์ที่อัปโหลด
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // 4. บันทึกข้อมูลลงตาราง documents
      const { error: dbError } = await supabase.from("documents").insert({
        title,
        description,
        file_url: publicUrl,
        file_name: file.name,
        user_id: user.id,
        status: "pending",
      });

      if (dbError) throw dbError;

      alert("อัปโหลดคำขอตรวจเอกสารสำเร็จ!");
      router.push("/");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      alert("เกิดข้อผิดพลาด: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">สร้างคำขอตรวจเอกสาร</h1>
            <p className="text-sm text-gray-500">อัปโหลดไฟล์เอกสารเพื่อส่งให้แอดมินตรวจสอบ</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
          >
            กลับ
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเอกสาร / โครงการ *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="เช่น ขออนุมัติจัดโครงการค่ายอาสา..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="รายละเอียดหรือหมายเหตุถึงผู้ตรวจสอบ..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">แนบไฟล์เอกสาร (PDF / Word) *</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "กำลังอัปโหลด..." : "ส่งคำขอตรวจเอกสาร"}
          </button>
        </form>
      </div>
    </div>
  );
}