import { redirect } from "next/navigation";

export default function LegacyCallCentrePage() {
  redirect("/admin/referrals/");
}
