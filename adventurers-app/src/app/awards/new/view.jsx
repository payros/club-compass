'use client'
import { Field, Input, NativeSelect, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import { ADVENTURER_CLASSES, AWARD_TYPES } from '@/utils/consts'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

const View = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)
  const [patchFile, setPatchFile] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setGlobalError(null)
    setLoading(true)

    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())

    // Remove the file entry — we handle it separately after creation
    delete data.patch_image

    let newId
    try {
      const response = await fetch('/api/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        setGlobalError(result?.error ?? 'The award could not be created. Please try again.')
        setLoading(false)
        return
      }
      newId = result.id
    } catch (err) {
      console.error(err)
      setGlobalError('The award could not be created. Please try again.')
      setLoading(false)
      return
    }

    if (patchFile && newId) {
      try {
        const uploadData = new FormData()
        uploadData.append('file', patchFile)
        const uploadRes = await fetch(`/api/awards/${newId}/photo`, {
          method: 'POST',
          body: uploadData,
        })
        if (!uploadRes.ok) {
          const uploadResult = await uploadRes.json()
          // Award was created — redirect anyway, but surface the upload error
          setGlobalError(uploadResult?.error ?? 'Award created, but patch image upload failed.')
          setLoading(false)
          router.push(`/awards/${newId}`)
          return
        }
      } catch (err) {
        console.error(err)
        // Non-fatal: award exists, image just didn't upload
      }
    }

    router.push(`/awards/${newId}`)
  }

  const breadcrumbs = [{ label: 'Awards', href: '/awards' }, { label: 'New Award' }]

  return (
    <FormPage
      title="New Award"
      description="Fill in the information below to add a new award."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Create Award"
      submitLoadingLabel="Creating Award…"
      loading={loading}
    >
      <Field.Root required>
        <Field.Label>Name</Field.Label>
        <Input name="name" placeholder="Enter the award name" />
      </Field.Root>

      <Field.Root required>
        <Field.Label>Award Type</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field name="type" defaultValue="">
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
          <NativeSelect.Field name="level" defaultValue="">
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
        <Input name="link" type="url" placeholder="https://..." />
      </Field.Root>

      <Field.Root>
        <Field.Label>
          Patch Image{' '}
          <Text as="span" color="fg.muted" fontSize="sm">
            (optional)
          </Text>
        </Field.Label>
        <Input
          name="patch_image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setPatchFile(e.target.files?.[0] ?? null)}
        />
        <Field.HelperText>JPEG, PNG, WebP, or GIF — max 1 MB. Will be converted to WebP.</Field.HelperText>
      </Field.Root>
    </FormPage>
  )
}

export default View
