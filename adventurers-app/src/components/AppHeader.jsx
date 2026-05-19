"use client";
import {
  Box,
  Flex,
  Text,
  HStack,
  Avatar,
  MenuRoot,
  MenuTrigger,
  MenuPositioner,
  MenuContent,
  MenuItem,
} from "@chakra-ui/react";
import { FiLogOut, FiSettings } from "react-icons/fi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Breadcrumbs from "./Breadcrumbs";
import { authClient } from "@/lib/auth-client";
import useClubYear from "@/hooks/useClubYear";

const FALLBACK_CLUB_NAME =
  process.env.NEXT_PUBLIC_CLUB_NAME ?? "Adventurers Club";
console.log("FALLBACK_CLUB_NAME", process.env.NEXT_PUBLIC_CLUB_NAME);
/**
 * Global app header
 * @param {Array} breadcrumbs - [{label, href}]
 */
export default function AppHeader({ breadcrumbs = [] }) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const userName = session?.user?.name ?? "User";
  const userImage = session?.user?.image ?? null;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const { clubYear, loading } = useClubYear();
  // Use the most recent name if available, otherwise fallback to env variable or default
  const clubName = (!loading && clubYear?.clubName) || FALLBACK_CLUB_NAME;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

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
              {clubName}
            </Text>
            <Breadcrumbs items={breadcrumbs} />
          </Box>
        </Box>

        {/* Right: User info */}
        <MenuRoot positioning={{ placement: "bottom-end" }}>
          <MenuTrigger asChild>
            <HStack gap={2} flexShrink={0} cursor="pointer">
              <Text
                color="rgba(255,255,255,1)"
                fontSize="lg"
                fontWeight={500}
                display={{ base: "none", md: "block" }}
              >
                {userName}
              </Text>
              <Avatar.Root
                size="xl"
                style={{
                  background: userImage ? "none" : "rgba(255,174,23,0.8)",
                  border: "2px solid rgba(255,255,255,0.4)",
                }}
              >
                {userImage && <Avatar.Image src={userImage} alt={userName} />}
                <Avatar.Fallback color="white" fontWeight={700}>
                  {userInitials}
                </Avatar.Fallback>
              </Avatar.Root>
            </HStack>
          </MenuTrigger>
          <MenuPositioner>
            <MenuContent minW="160px">
              <MenuItem value="settings" disabled>
                <FiSettings />
                Settings
              </MenuItem>
              <MenuItem value="logout" color="red.500" onClick={handleLogout}>
                <FiLogOut />
                Logout
              </MenuItem>
            </MenuContent>
          </MenuPositioner>
        </MenuRoot>
      </Flex>
    </Box>
  );
}
