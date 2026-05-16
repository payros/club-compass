"use client";
import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import AppHeader from "./AppHeader";

/**
 * Root page layout — wraps every page with the header and content area.
 * @param {ReactNode} children
 * @param {Array} breadcrumbs - [{label, href}] for the header breadcrumbs
 * @param {Array} actions - [{label, href}] rendered as right-aligned buttons
 * @param {string} clubName
 */
export default function PageLayout({
  children,
  breadcrumbs = [],
  actions = [],
  clubName,
}) {
  return (
    <Box minH="100vh">
      <AppHeader breadcrumbs={breadcrumbs} clubName={clubName} />
      <Box className="page-content">
        {actions.length > 0 && (
          <Flex justify="flex-end" gap={2} className="action-bar">
            {actions.map(({ label, href }, index) => (
              <Button key={index} asChild colorPalette="accent" size="xl">
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </Flex>
        )}
        {children}
      </Box>
    </Box>
  );
}
