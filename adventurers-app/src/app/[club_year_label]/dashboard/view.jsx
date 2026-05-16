"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useChildren from "@/hooks/useChildren";
import useEvents from "@/hooks/useEvents";
import useStaff from "@/hooks/useStaff";
import useClasses from "@/hooks/useClasses";
import DashboardPage from "@/components/pages/DashboardPage";

const View = () => {
  const clubYearLabel = useParams()["club_year_label"];
  const router = useRouter();

  const [sortBy, setSortBy] = useState({
    children: { by: null, direction: "asc" },
    events: { by: null, direction: "asc" },
  });

  const { children, loadingChildren } = useChildren(
    clubYearLabel,
    sortBy.children,
  );
  const { events, loadingEvents } = useEvents(clubYearLabel, sortBy.events);
  const { staff, loading: loadingStaff } = useStaff(clubYearLabel);
  const { classes, loading: loadingClasses } = useClasses(clubYearLabel);

  function handleSorting(by, tableKey) {
    setSortBy((prev) => {
      const newDirection =
        prev[tableKey]?.by === by && prev[tableKey]?.direction === "asc"
          ? "desc"
          : "asc";
      return { ...prev, [tableKey]: { by, direction: newDirection } };
    });
  }

  const breadcrumbs = [
    { label: clubYearLabel, href: `/${clubYearLabel}/dashboard` },
    { label: "Dashboard" },
  ];

  const cards = [
    {
      title: "Adventurers",
      href: `/${clubYearLabel}/adventurers`,
      badge: children?.length ?? 0,
      headers: [
        { key: "name", label: "Name", sortable: true },
        { key: "age", label: "Age", sortable: true },
        { key: "class", label: "Class", sortable: true },
      ],
      data: children,
      loading: loadingChildren,
      sortBy: sortBy.children.by,
      sortDirection: sortBy.children.direction,
      handleSort: (by) => handleSorting(by, "children"),
      onRowClick: (item) =>
        router.push(`/${clubYearLabel}/adventurers/${item.id}`),
    },
    {
      title: "Events",
      href: `/${clubYearLabel}/events`,
      badge: events?.length ?? 0,
      headers: [
        { key: "title", label: "Title", sortable: true },
        { key: "eventDate", label: "Date", sortable: true },
      ],
      data: events,
      loading: loadingEvents,
      sortBy: sortBy.events.by,
      sortDirection: sortBy.events.direction,
      handleSort: (by) => handleSorting(by, "events"),
      onRowClick: (item) => router.push(`/${clubYearLabel}/events/${item.id}`),
    },
    {
      title: "Classes",
      href: `/${clubYearLabel}/classes`,
      badge: classes?.length ?? 0,
      headers: [
        { key: "class", label: "Class", sortable: false },
        { key: "instructor", label: "Instructor", sortable: false },
      ],
      data: classes,
      loading: loadingClasses,
      onRowClick: (item) => router.push(`/${clubYearLabel}/classes/${item.id}`),
    },
    {
      title: "Staff",
      href: `/${clubYearLabel}/staff`,
      badge: staff?.length ?? 0,
      headers: [
        { key: "name", label: "Name", sortable: false },
        { key: "role", label: "Role", sortable: false },
      ],
      data: staff,
      loading: loadingStaff,
      onRowClick: (item) => router.push(`/staff/${item.id}`),
    },
  ];

  const actions = [
    {
      label: "Add Event",
      href: `/${clubYearLabel}/events/new`,
    },
    {
      label: "Enroll Family",
      href: `/${clubYearLabel}/families/new`,
    },
  ];

  return (
    <DashboardPage
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      actions={actions}
      cards={cards}
    />
  );
};

export default View;
