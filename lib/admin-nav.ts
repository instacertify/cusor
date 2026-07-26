export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  description?: string;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

/** Grouped admin navigation — single source for sidebar + dashboard hub */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: "chart",
        description: "Counts, recent leads and shortcuts",
      },
      {
        href: "/admin/inquiries",
        label: "Inquiries",
        icon: "inbox",
        description: "Contact and quote form leads",
      },
    ],
  },
  {
    id: "site",
    label: "Site & brand",
    items: [
      {
        href: "/admin/settings",
        label: "Site Settings",
        icon: "settings",
        description: "Brand, color scheme, contact, analytics",
      },
      {
        href: "/admin/pages",
        label: "Pages",
        icon: "file",
        description: "Create pages; place in menu, submenu or footer",
      },
      {
        href: "/admin/media",
        label: "Front Images",
        icon: "image",
        description: "Hero and page cover images",
      },
      {
        href: "/admin/testimonials",
        label: "Testimonials",
        icon: "star",
        description: "Homepage trust quotes",
      },
      {
        href: "/admin/faqs",
        label: "FAQs",
        icon: "help",
        description: "Scoped FAQs for pages and products",
      },
    ],
  },
  {
    id: "catalogue",
    label: "Catalogue",
    items: [
      {
        href: "/admin/certifications",
        label: "Certifications",
        icon: "award",
        description: "BIS, BEE, GMARK and more",
      },
      {
        href: "/admin/testing",
        label: "Product Testing",
        icon: "microscope",
        description: "Test categories and services",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: "folder",
        description: "BIS product categories",
      },
      {
        href: "/admin/products",
        label: "BIS Products",
        icon: "box",
        description: "Product pages, fees and labs",
      },
      {
        href: "/admin/qcos",
        label: "QCO Alerts",
        icon: "bell",
        description: "Upcoming mandatory product deadlines",
      },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    items: [
      {
        href: "/admin/blog",
        label: "Posts",
        icon: "file",
        description: "Draft and publish articles",
      },
      {
        href: "/admin/authors",
        label: "Authors",
        icon: "users",
        description: "Author profiles linked to posts",
      },
    ],
  },
  {
    id: "growth",
    label: "Growth & delivery",
    items: [
      {
        href: "/admin/seo",
        label: "SEO Tools",
        icon: "sparkles",
        description: "Meta, schema and sitemap controls",
      },
      {
        href: "/admin/email",
        label: "Email / SMTP",
        icon: "mail",
        description: "Lead notification mailer settings",
      },
    ],
  },
];

export function flattenAdminNav(): AdminNavItem[] {
  return ADMIN_NAV_GROUPS.flatMap((g) => g.items);
}

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
