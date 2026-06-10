## Plan: Hybrid Image Uploads (Dev Volume + S3 Prod)

Add image upload support for children and awards without storing binaries in Postgres, using a storage adapter approach: local filesystem in development and S3-compatible object storage in production. Persist only image metadata/URL in DB, enforce strict size/type/dimension constraints, and include cleanup/replace behavior so storage remains predictable and low-cost.

**Steps**

1. Phase 1 - Storage design and guardrails
1. Define a storage abstraction with two backends: local disk backend for development and S3-compatible backend for production. This avoids runtime branching in handlers and keeps upload logic testable.
1. Define upload policy constants (max file size, allowed mime types, max dimensions, output format). Recommend converting all uploads to WebP and capping dimensions to keep objects small and predictable.
1. Define deterministic object naming (children/{id}/profile.webp and awards/{id}/patch.webp) to guarantee one active image per entity and avoid orphan growth.

1. Phase 2 - Database and service surface
1. Add DB column for child image reference in schema and migration (children.image_url or children.photo_path as URL/path string). Depends on Phase 1 naming decision.
1. Reuse existing awards.patch_image_url field for awards; no new awards migration required.
1. Extend service read queries and update maps so both children and awards list/detail payloads include image reference fields.

1. Phase 3 - API upload endpoints
1. Add authenticated upload endpoint for child image (POST replace, DELETE remove) and update child row with stored URL/key. Depends on Phase 2.
1. Add authenticated upload endpoint for award image (POST replace, DELETE remove) and update awards.patch_image_url.
1. Parse multipart FormData, validate file type/size, transform/compress image, write via selected storage adapter, and return normalized URL/key.
1. On replacement, delete old object after successful DB update (or use deterministic overwrite) to prevent storage bloat.
1. Add hard failure behavior when storage env vars are missing in production to avoid silently writing to ephemeral disk.

1. Phase 4 - Frontend integration
1. Add image picker + preview to child editing flow first (children detail edit route if added, or existing family enrollment flow if upload-on-create is required). Depends on Phase 3.
1. Add image picker + preview for awards management flow (new edit route may be required because awards currently only has list/detail).
1. Update children and awards detail pages to display images with fallback placeholders.
1. Optionally add thumbnail columns to list pages for quick visual confirmation, keeping table layout compact.

1. Phase 5 - Ops, cost control, and reliability
1. Configure development volume mount for uploads folder in docker compose so local uploads survive container restarts.
1. Configure production S3-compatible credentials and public/base URL env vars in hosting platform.
1. Add startup checks/logging for storage mode, bucket/container existence, and write permissions.
1. Document backup/restore expectations: DB holds URL/key only; objects are source of truth for media.

**Relevant files**

- /Users/payros/Documents/Websites/Adventurers App/db/schema.sql - add child image reference column in desired state schema
- /Users/payros/Documents/Websites/Adventurers App/db/migrations - add migration for children image column
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/services/childrenService.js - include child image field in list/get/update maps
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/services/awardsService.js - include patch_image_url in list/get and add update method for image field
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/app/api/children/[id]/route.js - keep JSON patch support for metadata updates
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/app/api/awards/[id]/route.js - add PATCH support if absent
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/app/api/children/[id]/photo/route.js - new upload/delete endpoint
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/app/api/awards/[id]/photo/route.js - new upload/delete endpoint
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/lib/storage - new adapter modules (local + S3-compatible)
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/hooks/useChild.js - pass through child image URL
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/hooks/useChildren.js - include optional thumbnail field in transformed rows
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/hooks/useAward.js - include patch image URL in transformed payload
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/hooks/useAwards.js - include patch thumbnail in list transform
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/app/children/[id]/view.jsx - render child image block
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/app/awards/[id]/view.jsx - render patch image block
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/src/app/[club_year_label]/families/enroll/view.jsx - optional upload-at-enrollment UI
- /Users/payros/Documents/Websites/Adventurers App/docker-compose.dev.yml - add uploads volume mount for local backend
- /Users/payros/Documents/Websites/Adventurers App/adventurers-app/.env.example (or env docs) - storage mode and S3-compatible env vars

**Verification**

1. Run DB migration and confirm children image column exists; validate reads from children list/detail still work.
2. Upload valid image for one child and one award; verify DB stores URL/key string only and no binary data is written to Postgres.
3. Upload oversized or invalid mime file and confirm API returns 400 with clear validation error.
4. Re-upload replacement image and verify previous object is not accumulating (deterministic key overwrite or explicit delete).
5. Restart dev containers and verify local images persist via mounted uploads volume.
6. In production-like mode, verify uploads fail fast when S3 env vars are absent and succeed when configured.
7. Manually check children/awards list + detail pages for image rendering, fallback behavior, and no layout regressions.

**Decisions**

- Confirmed: production storage target is S3-compatible object storage.
- Confirmed: avoid storing image binaries in Postgres to keep Koyeb DB usage minimal.
- Included: children and awards image upload, replace, display, and validation.
- Excluded for now: historical image versions, multi-image galleries, and background image processing queues.

**Further Considerations**

1. Recommended default constraints: max 300 KB input, convert to WebP quality 70, max dimension 512x512.
2. Recommended bucket visibility: private bucket + signed URL for stronger control, or public bucket + CDN URL for simpler frontend usage.
3. If cost predictability is critical, add monthly object count and total size monitoring alerts in storage provider dashboard.
