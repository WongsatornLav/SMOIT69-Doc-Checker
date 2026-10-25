import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // ตรวจสอบอีเมลหลังบ้านซ้ำเพื่อความปลอดภัย
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && !user.email.endsWith("@kmitl.ac.th")) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("อนุญาตเฉพาะอีเมล @kmitl.ac.th เท่านั้น")}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง")}`);
}