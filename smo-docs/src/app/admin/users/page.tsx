"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = {
    id: string;
    email: string;
    full_name: string | null;
    role: "admin" | "student";
    created_at: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAdminAndFetchUsers = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.log("Auth error or no user:", authError);
                router.replace("/login");
                return;
            }

            console.log("Current Auth User ID:", user.id);

            // ดึงโปรไฟล์โดยใช้ ID ของ user ที่กำลังล็อกอินอยู่
            const { data: currentProfile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            console.log("Fetched Profile:", currentProfile);
            console.log("Profile Error:", profileError);

            if (!currentProfile || currentProfile.role !== "admin") {
                alert(`ไม่มีสิทธิ์เข้าถึง! (Role ของคุณคือ: ${currentProfile?.role || "ไม่มีข้อมูลในตาราง profiles"})`);
                router.replace("/");
                return;
            }

            setIsAdmin(true);

            // ดึงรายชื่อผู้ใช้ทั้งหมด
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data) {
                setUsers(data);
            }
            setLoading(false);
        };

        checkAdminAndFetchUsers();
    }, [router, supabase]);

    const handleRoleChange = async (userId: string, newRole: "admin" | "student") => {
        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);

        if (error) {
            alert("เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์: " + error.message);
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert("อัปเดตสิทธิ์สำเร็จ!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="max-w-5xl mx-auto p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">จัดการสิทธิ์ผู้ใช้งาน</h1>
                            <p className="text-sm text-gray-500">กำหนดสิทธิ์การเข้าใช้งานระบบสำหรับสมาชิกสโมสร</p>
                        </div>
                        <button
                            onClick={() => router.push("/")}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
                        >
                            กลับหน้าหลัก
                        </button>
                    </div>

                    <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                                    <th className="p-4">อีเมล</th>
                                    <th className="p-4">ชื่อ-นามสกุล</th>
                                    <th className="p-4">สิทธิ์ปัจจุบัน</th>
                                    <th className="p-4 text-center">เปลี่ยนสิทธิ์</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50">
                                        <td className="p-4 font-medium text-gray-800">{user.email}</td>
                                        <td className="p-4 text-gray-600">{user.full_name || "-"}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as "admin" | "student")}
                                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="student">Student</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}