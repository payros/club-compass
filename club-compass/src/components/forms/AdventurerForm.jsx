'use client'
import { Field, HStack, NativeSelect, Stack } from '@chakra-ui/react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import { GRADE_OPTIONS } from '@/utils/consts'
import ChildForm from '@/components/forms/ChildForm'

/**
 * AdventurerForm — ChildForm + class dropdown.
 *
 * Uncontrolled mode (edit page): pass `data` (child record with optional `data.class.id`)
 *   and `classes` array. The class field uses `name="classId"` for FormData.
 *
 * Controlled mode (enroll page): pass `entry` (camelCase keys with `classId`),
 *   `onChange(field, value)`, and `classes` array.
 */
const AdventurerForm = ({ data = {}, entry = null, onChange = null, classes = [] }) => {
  const controlled = entry !== null && onChange !== null

  if (controlled) {
    return (
      <Stack gap={3}>
        <ChildForm entry={entry} onChange={onChange} />
        <HStack gap={3}>
          <Field.Root flex={1} required>
            <Field.Label>
              Class <Field.RequiredIndicator />
            </Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field value={entry.classId} onChange={(e) => onChange('classId', e.target.value)}>
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {fromSnakeCaseToTitleCase(c.class)}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root flex={1}>
            <Field.Label>Grade</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field value={entry.grade ?? ''} onChange={(e) => onChange('grade', e.target.value)}>
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
        </HStack>
      </Stack>
    )
  }

  // Uncontrolled mode
  return (
    <Stack gap={3}>
      <ChildForm data={data} />
      <HStack gap={3}>
        <Field.Root flex={1}>
          <Field.Label>Class</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field name="classId" defaultValue={data.class?.id ?? ''}>
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {fromSnakeCaseToTitleCase(c.class)}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root flex={1}>
          <Field.Label>Grade</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field name="grade" defaultValue={data.grade ?? ''}>
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
      </HStack>
    </Stack>
  )
}

export default AdventurerForm
