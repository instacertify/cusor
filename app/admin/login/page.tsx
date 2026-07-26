import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { isAdmin, setAdminSession, checkPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin Login", robots: { index: false } };

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  if (checkPassword(password)) {
    await setAdminSession();
    redirect("/admin");
  }
  redirect("/admin/login?error=1");
}

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await isAdmin()) redirect("/admin");
  const sp = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-cream-300 shadow-card-hover p-8">
        <div className="flex justify-center mb-6">
          <Logo width={220} withTagline />
        </div>
        <h1 className="font-display text-xl font-bold text-ink-950 text-center">Content Admin</h1>
        <p className="text-sm text-ink-600 text-center mt-1 mb-6">
          Sign in to edit site content, products and FAQs.
        </p>
        {sp.error && (
          <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            Incorrect password. Try again.
          </p>
        )}
        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30"
            />
          </div>
          <button className="w-full bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-xl px-6 py-3 transition">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
