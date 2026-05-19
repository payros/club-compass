"use client";
import React from "react";
import { Breadcrumb } from "@chakra-ui/react";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";

/**
 * Breadcrumbs component
 * @param {Array} items - [{label, href}] — last item is current (no href needed)
 */
export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <Breadcrumb.Root className="breadcrumb-nav" size="lg" mt={1}>
      <Breadcrumb.List>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <React.Fragment key={i}>
              <Breadcrumb.Item>
                {isLast ? (
                  <Breadcrumb.CurrentLink
                    style={{ color: "#fff", fontWeight: 600, fontSize: "2rem" }}
                  >
                    {item.label}
                  </Breadcrumb.CurrentLink>
                ) : (
                  <Breadcrumb.Link asChild>
                    <Link
                      href={item.href ?? "#"}
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        fontSize: "2rem",
                      }}
                    >
                      {item.label}
                    </Link>
                  </Breadcrumb.Link>
                )}
              </Breadcrumb.Item>
              {!isLast && (
                <Breadcrumb.Separator
                  style={{ color: "rgba(255,255,255,0.75)" }}
                  ml={2}
                  mr={1}
                >
                  <FaChevronRight />
                </Breadcrumb.Separator>
              )}
            </React.Fragment>
          );
        })}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
