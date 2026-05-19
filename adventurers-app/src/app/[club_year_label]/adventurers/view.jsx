"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useChildren from "@/hooks/useChildren";
import CollectionPage from "@/components/pages/CollectionPage";

const headers = [
  { key: "name", label: "Name", sortable: true },
  { key: "age", label: "Age", sortable: true },
  { key: "class", label: "Class", sortable: true },
];

export default function View() {
  const clubYearLabel = useParams()["club_year_label"];
  const router = useRouter();
  const [sort, setSort] = useState({ by: null, direction: "asc" });
  const { children, loading: loadingChildren } = useChildren(
    clubYearLabel,
    sort,
  );

  function handleSort(by) {
    setSort((prev) => ({
      by,
      direction: prev.by === by && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  const breadcrumbs = [
    { label: clubYearLabel, href: `/${clubYearLabel}/dashboard` },
    { label: "Adventurers" },
  ];

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      title="Adventurers"
      description={`Children enrolled in the ${clubYearLabel} club year`}
      headers={headers}
      data={children}
      loading={loadingChildren}
      badge={children?.length ?? 0}
      sortBy={sort.by}
      sortDirection={sort.direction}
      handleSort={handleSort}
      onRowClick={(item) =>
        router.push(`/${clubYearLabel}/adventurers/${item.id}`)
      }
    />
  );
}
