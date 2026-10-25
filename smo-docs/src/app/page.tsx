"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type DocumentItem = {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  status: string;
  created_at: string;
};

export default function Home() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      setUserEmail(user.email || null);

      // เช็กสิทธิ์ Role ของผู้ใช้ปัจจุบัน
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }

      // ดึงรายการเอกสารทั้งหมด
      const { data: docs, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && docs) {
        setDocuments(docs);
      }
      setLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">กำลังโหลดข้อมูลระบบ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ส่วนหัวข้อและโปรไฟล์ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">SMO Docs - ระบบจัดการเอกสารสโมสร</h1>
            <p className="text-sm text-gray-500">ยินดีต้อนรับเข้าสู่ระบบสารบรรณและเอกสารออนไลน์ ({userEmail})</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {userRole === "admin" && (
              <button
                onClick={() => router.push("/admin/users")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition"
              >
                จัดการสิทธิ์ผู้ใช้
              </button>
            )}
            <button
              onClick={() => router.push("/documents/upload")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
            >
              + อัปโหลดเอกสาร
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        {/* รายการเอกสารล่าสุด */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">รายการเอกสารล่าสุด</h2>

          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              ยังไม่มีเอกสารในระบบ ลองกดปุ่มอัปโหลดเอกสารด้านบนได้เลยครับ
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <div key={doc.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                    <p className="text-xs text-gray-500">{doc.description || "ไม่มีรายละเอียด"}</p>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline inline-block"
                    >
                      📄 ดูไฟล์แนบ: {doc.file_name}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : doc.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {doc.status === "approved" ? "อนุมัติแล้ว" : doc.status === "rejected" ? "ไม่อนุมัติ" : "รอตรวจสอบ"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}