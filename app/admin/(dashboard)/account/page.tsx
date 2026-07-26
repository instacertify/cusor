import Link from "next/link";
import { getAdminUsername } from "@/lib/auth";
import { changeAdminLoginCredentials } from "../../actions";
import ChangeCredentialsForm from "@/components/admin/ChangeCredentialsForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminAccountPage({ searchParams }: Props) {
  const sp = await searchParams;
  const username = getAdminUsername();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">
        Login &amp; password
      </h1>
      <p className="text-ink-600 text-sm mb-6 max-w-2xl">
        Change the CMS login ID and password. You must enter your current password and confirm the
        change twice. Site branding settings stay under{" "}
        <Link href="/admin/settings" className="font-semibold text-butter-700 hover:underline">
          Site Settings
        </Link>
        .
      </p>

      <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 max-w-2xl">
        <h2 className="font-display font-bold text-ink-950 mb-1">Update credentials</h2>
        <p className="text-sm text-ink-600 mb-5">
          Fill only the fields you want to change. Blank “new” fields keep the current value.
        </p>
        <ChangeCredentialsForm
          action={changeAdminLoginCredentials}
          currentUsername={username}
          error={sp.error}
          saved={sp.saved}
        />
      </section>
    </div>
  );
}
