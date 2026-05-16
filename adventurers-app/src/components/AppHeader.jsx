"use client";
import { Box, Flex, Text, HStack, Avatar, IconButton } from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import Image from "next/image";
import Breadcrumbs from "./Breadcrumbs";

/**
 * Global app header
 * @param {Array} breadcrumbs - [{label, href}]
 * @param {string} clubName - Name of the club/app
 */
export default function AppHeader({
  breadcrumbs = [],
  clubName = "Adventurers Club",
}) {
  return (
    <Box px={{ base: 4, md: 8 }} py={3} mb={3}>
      <Flex align="center" justify="space-between" gap={4}>
        {/* Left: Logo + Club name */}
        <Box flex={1} display="flex" alignItems="center" gap={4}>
          <Image
            src="/img/logo.png"
            alt="Club logo"
            width={0}
            height={0}
            sizes="100vw"
            style={{ height: "118px", width: "auto", paddingTop: "20px" }}
          />
          <Box display="flex" flexDirection="column">
            <Text
              fontWeight={800}
              fontSize={{ base: "6xl" }}
              color="white"
              whiteSpace="nowrap"
              flexShrink={0}
            >
              {/* TO DO: replace with logo + name dynamically from club year information */}
              Little Eagles
            </Text>
            <Breadcrumbs items={breadcrumbs} />
          </Box>
        </Box>

        {/* Right: User placeholder */}
        <HStack gap={2} flexShrink={0}>
          <Text
            color="rgba(255,255,255,0.8)"
            fontSize="sm"
            fontWeight={500}
            display={{ base: "none", md: "block" }}
          >
            Username
          </Text>
          <Avatar.Root
            size="sm"
            style={{
              background: "rgba(255,174,23,0.8)",
              border: "2px solid rgba(255,255,255,0.4)",
            }}
          >
            <Avatar.Fallback color="white" fontWeight={700}>
              U
            </Avatar.Fallback>
          </Avatar.Root>
        </HStack>
      </Flex>
    </Box>
  );
}
