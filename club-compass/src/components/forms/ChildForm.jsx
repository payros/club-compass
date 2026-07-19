'use client'
import { Field, HStack, Input, NativeSelect } from '@chakra-ui/react'
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

  if (controlled) {
    return (
      <>
        <HStack gap={3}>
          <Field.Root flex={1} required>
            <Field.Label>
              First Name <Field.RequiredIndicator />
            </Field.Label>
            <Input
              placeholder="First name"
              value={entry.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
            />
          </Field.Root>
          <Field.Root flex={1} required>
            <Field.Label>
              Last Name <Field.RequiredIndicator />
            </Field.Label>
            <Input
              placeholder="Last name"
              value={entry.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
            />
          </Field.Root>
        </HStack>
        <HStack gap={3}>
          <Field.Root flex={1}>
            <Field.Label>Sex</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field value={entry.sex} onChange={(e) => onChange('sex', e.target.value)}>
                <option value="">Select a sex</option>
                {SEX_OPTIONS.map((sex) => (
                  <option key={sex} value={sex}>
                    {fromSnakeCaseToTitleCase(sex)}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root flex={1}>
            <Field.Label>Date of Birth</Field.Label>
            <Input type="date" value={entry.dateOfBirth} onChange={(e) => onChange('dateOfBirth', e.target.value)} />
          </Field.Root>
        </HStack>
        <HStack gap={3}>
          <Field.Root flex={1}>
            <Field.Label>Allergies</Field.Label>
            <Input
              placeholder="Allergies"
              value={entry.allergies}
              onChange={(e) => onChange('allergies', e.target.value)}
            />
          </Field.Root>
          <Field.Root flex={1}>
            <Field.Label>Medical Conditions</Field.Label>
            <Input
              placeholder="Medical conditions"
              value={entry.medicalConditions}
              onChange={(e) => onChange('medicalConditions', e.target.value)}
            />
          </Field.Root>
        </HStack>
        <HStack gap={3}>
          <Field.Root flex={1}>
            <Field.Label>Grade</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field value={entry.grade} onChange={(e) => onChange('grade', e.target.value)}>
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
            <Input
              placeholder="Physical restrictions"
              value={entry.physicalRestrictions}
              onChange={(e) => onChange('physicalRestrictions', e.target.value)}
            />
          </Field.Root>
        </HStack>
      </>
    )
  }

  // Uncontrolled mode
  const dobValue = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ''

  return (
    <>
      <HStack gap={3}>
        <Field.Root flex={1} required>
          <Field.Label>First Name</Field.Label>
          <Input name="firstName" placeholder="First name" defaultValue={data.firstName ?? ''} />
        </Field.Root>
        <Field.Root flex={1} required>
          <Field.Label>Last Name</Field.Label>
          <Input name="lastName" placeholder="Last name" defaultValue={data.lastName ?? ''} />
        </Field.Root>
      </HStack>
      <HStack gap={3}>
        <Field.Root flex={1}>
          <Field.Label>Sex</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field name="sex" defaultValue={data.sex ?? ''}>
              <option value="">Not specified</option>
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
          <Input name="dateOfBirth" type="date" defaultValue={dobValue} />
        </Field.Root>
      </HStack>
      <HStack gap={3}>
        <Field.Root flex={1}>
          <Field.Label>Allergies</Field.Label>
          <Input name="allergies" placeholder="Allergies" defaultValue={data.allergies ?? ''} />
        </Field.Root>
        <Field.Root flex={1}>
          <Field.Label>Medical Conditions</Field.Label>
          <Input
            name="medicalConditions"
            placeholder="Medical conditions"
            defaultValue={data.medicalConditions ?? ''}
          />
        </Field.Root>
      </HStack>
      <HStack gap={3}>
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
        <Field.Root flex={1}>
          <Field.Label>Physical Restrictions</Field.Label>
          <Input
            name="physicalRestrictions"
            placeholder="Physical restrictions"
            defaultValue={data.physicalRestrictions ?? ''}
          />
        </Field.Root>
      </HStack>
    </>
  )
}

export default ChildForm
