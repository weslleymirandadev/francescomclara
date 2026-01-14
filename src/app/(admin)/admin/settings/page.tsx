import { prisma } from "@/lib/prisma";
import AdminSettings from "./AdminSettings";

export default async function Page() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  return <AdminSettings initialSettings={settings} />;
}