import { prisma } from "@/lib/prisma";
import AdminSettings from "./AdminSettings";

export default async function Page() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" },
  });

  if (!settings) {
    return <AdminSettings initialSettings={{} as any} />;
  }

  return <AdminSettings initialSettings={settings} />;
}
