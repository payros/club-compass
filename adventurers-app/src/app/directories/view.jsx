"use client"
import Link from "next/link"
import { Card, Text, SimpleGrid } from "@chakra-ui/react"
import PageLayout from "@/components/PageLayout"
import PageTransition from "@/components/PageTransition"
import { FiUsers, FiUser, FiAward, FiCalendar, FiUserCheck } from "react-icons/fi"

const DIRECTORIES = [
  { label: "Children", href: "/children", icon: FiUsers, description: "All children on record" },
  { label: "Parents", href: "/parents", icon: FiUser, description: "Parents and guardians" },
  { label: "Staff", href: "/staff", icon: FiUserCheck, description: "All staff members" },
  { label: "Awards", href: "/awards", icon: FiAward, description: "Award catalog" },
  { label: "Club Years", href: "/club-years", icon: FiCalendar, description: "All club years" },
  { label: "Users", href: "/users", icon: FiUsers, description: "App user accounts" },
]

export default function View() {
  const breadcrumbs = [{ label: "Directories" }]

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <PageTransition>
        <div className="cards-grid">
          {DIRECTORIES.map(dir => {
            const Icon = dir.icon
            return (
              <Link key={dir.href} href={dir.href} style={{ textDecoration: "none" }}>
                <Card.Root className="glass-card" style={{ cursor: "pointer", transition: "transform 0.15s", userSelect: "none" }}
                  _hover={{ transform: "translateY(-2px)" }}>
                  <Card.Body>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ background: "rgba(255,174,23,0.25)", borderRadius: 12, padding: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={22} color="#FFAE17" />
                      </div>
                      <div>
                        <Text color="white" fontWeight={700} fontSize="1rem">{dir.label}</Text>
                        <Text color="rgba(255,255,255,0.6)" fontSize="0.82rem">{dir.description}</Text>
                      </div>
                    </div>
                  </Card.Body>
                </Card.Root>
              </Link>
            )
          })}
        </div>
      </PageTransition>
    </PageLayout>
  )
}
