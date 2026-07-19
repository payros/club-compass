'use client'
import { useEffect, useRef, useState } from 'react'
import { Box, Field, HStack, Image, Input, NativeSelect, Text } from '@chakra-ui/react'
import { SEX_OPTIONS, GRADE_OPTIONS } from '@/utils/consts'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

/**
 * ChildForm — reusable child fields (without class).
 *
 * Uncontrolled mode (edit page): pass `data` with the existing child record.
 *   Fields use `name` attributes so FormData can be read on submit.
 *
 * Controlled mode (enroll page): pass `entry` (camelCase keys) and `onChange(field, value)`.
 *   Fields are controlled inputs; no `name` attributes are needed.
 */
const ChildForm = ({ data = {}, entry = null, onChange = null }) => {
  const controlled = entry !== null && onChange !== null
  const defaultProfileImageUrl =
    (controlled ? entry.profileImageUrl : data.profileImageUrl) ?? '/img/profile_placeholder.png'
  const [previewUrl, setPreviewUrl] = useState(defaultProfileImageUrl)
  const objectUrlRef = useRef(null)

  useEffect(() => {
    setPreviewUrl(defaultProfileImageUrl)
  }, [defaultProfileImageUrl])

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
      setPreviewUrl(defaultProfileImageUrl)
      if (controlled) onChange('profileImageFile', null)
      return
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = URL.createObjectURL(file)
    setPreviewUrl(objectUrlRef.current)
    if (controlled) onChange('profileImageFile', file)
  }

  const dobValue = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ''
  const valueSource = controlled ? entry : data

  const bindField = (field, name = field) => {
    if (controlled) {
      return {
        value: valueSource[field] ?? '',
        onChange: (e) => onChange(field, e.target.value),
      }
    }
    return {
      name,
      defaultValue: valueSource[field] ?? '',
    }
  }

  const bindDateField = (field, name = field) => {
    if (controlled) {
      return {
        value: valueSource[field] ?? '',
        onChange: (e) => onChange(field, e.target.value),
      }
    }
    return {
      name,
      defaultValue: dobValue,
    }
  }

  return (
    <>
      <HStack gap={3}>
        <Field.Root flex={1} required>
          <Field.Label>First Name {controlled && <Field.RequiredIndicator />}</Field.Label>
          <Input placeholder="First name" {...bindField('firstName')} />
        </Field.Root>
        <Field.Root flex={1} required>
          <Field.Label>Last Name {controlled && <Field.RequiredIndicator />}</Field.Label>
          <Input placeholder="Last name" {...bindField('lastName')} />
        </Field.Root>
      </HStack>
      <HStack gap={3}>
        <Field.Root flex={1}>
          <Field.Label>Sex</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field {...bindField('sex')}>
              <option value="">{controlled ? 'Select a sex' : 'Not specified'}</option>
              {SEX_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {fromSnakeCaseToTitleCase(option)}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root flex={1}>
          <Field.Label>Date of Birth</Field.Label>
          <Input type="date" {...bindDateField('dateOfBirth')} />
        </Field.Root>
      </HStack>
      <HStack gap={3}>
        <Field.Root flex={1}>
          <Field.Label>Allergies</Field.Label>
          <Input placeholder="Allergies" {...bindField('allergies')} />
        </Field.Root>
        <Field.Root flex={1}>
          <Field.Label>Medical Conditions</Field.Label>
          <Input placeholder="Medical conditions" {...bindField('medicalConditions')} />
        </Field.Root>
      </HStack>
      <HStack gap={3}>
        <Field.Root flex={1}>
          <Field.Label>Grade</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field {...bindField('grade')}>
              <option value="">Select a grade</option>
              {GRADE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root flex={1}>
          <Field.Label>Physical Restrictions</Field.Label>
          <Input placeholder="Physical restrictions" {...bindField('physicalRestrictions')} />
        </Field.Root>
      </HStack>
      <Field.Root>
        <Field.Label>
          Profile Picture{' '}
          <Text as="span" color="fg.muted" fontSize="sm">
            (optional)
          </Text>
        </Field.Label>
        <HStack w="full" align="center" gap={3}>
          <Box flexShrink={0} boxSize="48px" borderRadius="full" overflow="hidden" bg="bg.subtle">
            <Image src={previewUrl} alt="Profile preview" objectFit="cover" boxSize="48px" />
          </Box>
          <Input
            name={controlled ? undefined : 'profile_image'}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
          />
        </HStack>
        <Field.HelperText>JPEG, PNG, WebP, or GIF - max 1 MB. Will be converted to WebP.</Field.HelperText>
      </Field.Root>
    </>
  )
}

export default ChildForm
