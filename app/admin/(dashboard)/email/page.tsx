import HardRedirect from "@/components/HardRedirect";

export const dynamic = "force-dynamic";

/**
 * SMTP lead email was removed — contact forms only save leads in the CMS.
 * Keep this route so old bookmarks do not 404.
 */
export default function AdminEmailPage() {
  return <HardRedirect href="/admin/inquiries" />;
}
