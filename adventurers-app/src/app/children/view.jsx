"use client";
import { useRouter } from "next/navigation";
import useChildren from "@/hooks/useChildren";
import CollectionPage from "@/components/pages/CollectionPage";

const headers = [
  { key: "name", label: "Name", sortable: false },
  { key: "age", label: "Age", sortable: false },
  { key: "sex", label: "Sex", sortable: false },
];

export default function View() {
  const { children, loading } = useChildren();
  const router = useRouter();

  const breadcrumbs = [{ label: "Children" }];

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      title="Children"
      description="All children on record"
      headers={headers}
      data={children}
      loading={loading}
      badge={children?.length ?? 0}
      onRowClick={(item) => router.push(`/children/${item.id}`)}
    />
  );
}
