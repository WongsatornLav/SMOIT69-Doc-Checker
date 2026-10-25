import { createClient } from "@/lib/supabase/server";

import { logout } from "./login/actions";


export default async function Home() {

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();


  const { data: documents, error } = await supabase

    .from("documents")

    .select("*")

    .order("created_at", { ascending: false }) // ถ้าไม่มีคอลัมน์ created_at ให้ลบบรรทัดนี้

    .limit(10);

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">SMO Docs - ระบบจัดการเอกสารสโมสร</h1>
          <p className="text-gray-600 mt-2">ยินดีต้อนรับเข้าสู่ระบบสารบรรณและเอกสารออนไลน์</p>
        </header>

        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">รายการเอกสารล่าสุด</h2>
          
          {error && (
            <p className="text-red-500 text-sm">เกิดข้อผิดพลาดในการดึงข้อมูล: {error.message}</p>
          )}

          {!error && (!documents || documents.length === 0) && (
            <p className="text-gray-500">ยังไม่มีเอกสารในระบบ</p>
          )}

          {documents && documents.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {documents.map((doc: { id: string | number; title?: string; status?: string }) => (
                <li key={doc.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{doc.title || "เอกสารไม่มีชื่อ"}</p>
                    <p className="text-xs text-gray-400">สถานะ: {doc.status || "ทั่วไป"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}