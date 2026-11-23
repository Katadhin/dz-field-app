import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminEnabled, verifyAdminToken, ADMIN_COOKIE } from "../../../lib/adminAuth";
import { sorterReady } from "../../../lib/sorter";
import SortTester from "../../../components/SortTester";

export const dynamic = "force-dynamic";

export default function SortTestPage() {
  if (!adminEnabled()) redirect("/admin/login");
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) redirect("/admin/login");

  return <SortTester hasKey={sorterReady()} />;
}
