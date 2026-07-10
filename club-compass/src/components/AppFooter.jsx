"use client";
import { Box } from "@chakra-ui/react";

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <Box as="footer" textAlign="center" py={4} fontSize="sm" color="gray.500">
      &copy; Club Compass {year} &mdash; All rights reserved
    </Box>
  );
}
