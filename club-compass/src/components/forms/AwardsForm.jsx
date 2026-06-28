'use client'
import { useEffect, useRef, useState } from 'react'
import { Box, Field, HStack, Image, Input, NativeSelect, Text } from '@chakra-ui/react'
import { ADVENTURER_CLASSES, AWARD_TYPES } from '@/utils/consts'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

const AwardsForm = ({ data = {} }) => {
  const [previewUrl, setPreviewUrl] = useState(data.patchImageUrl ?? null)
  const objectUrlRef = useRef(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      setPreviewUrl(data.patchImageUrl ?? null)
      return
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = URL.createObjectURL(file)
    setPreviewUrl(objectUrlRef.current)
  }

  return (
    <>
      <Field.Root required>
        <Field.Label>Name</Field.Label>
        <Input name="name" placeholder="Enter the award name" defaultValue={data.name ?? ''} />
      </Field.Root>

      <Field.Root required>
        <Field.Label>Award Type</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field name="type" defaultValue={data.type ?? ''}>
            <option value="" disabled>
              Select a type
            </option>
            {AWARD_TYPES.map((awardType) => (
              <option key={awardType} value={awardType}>
                {fromSnakeCaseToTitleCase(awardType)}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>

      <Field.Root>
        <Field.Label>Level</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field name="level" defaultValue={data.level ?? ''}>
            <option value="">No level (multi-level award)</option>
            {Object.keys(ADVENTURER_CLASSES).map((cls) => (
              <option key={cls} value={cls}>
                {fromSnakeCaseToTitleCase(cls)}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>

      <Field.Root>
        <Field.Label>
          Award Requirements Link{' '}
          <Text as="span" color="fg.muted" fontSize="sm">
            (optional)
          </Text>
        </Field.Label>
        <Input name="link" type="url" placeholder="https://..." defaultValue={data.link ?? ''} />
      </Field.Root>

      <Field.Root>
        <Field.Label>
          Patch Image{' '}
          <Text as="span" color="fg.muted" fontSize="sm">
            (optional)
          </Text>
        </Field.Label>
        <HStack w="full" align="center" gap={3}>
          {previewUrl && (
            <Box flexShrink={0} boxSize="48px" borderRadius="md" overflow="hidden" bg="bg.subtle">
              <Image src={previewUrl} alt="Patch preview" objectFit="contain" boxSize="48px" />
            </Box>
          )}
          <Input
            name="patch_image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
          />
        </HStack>
        <Field.HelperText>JPEG, PNG, WebP, or GIF — max 1 MB. Will be converted to WebP.</Field.HelperText>
      </Field.Root>
    </>
  )
}

export default AwardsForm
