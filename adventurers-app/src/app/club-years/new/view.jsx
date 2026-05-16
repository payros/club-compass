"use client"
import {
  Button,
  Field,
  Fieldset,
  Input,
  Card,
} from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import PageLayout from "@/components/PageLayout"
import PageTransition from "@/components/PageTransition"

const View = () => {
  const router = useRouter()

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())

    fetch('/api/club-years', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data)
        if (data?.[0]?.label) router.push(`/${data[0].label}/dashboard`)
      })
      .catch(console.error)
  }

  const breadcrumbs = [
    { label: "Club Years", href: "/club-years" },
    { label: "New Club Year" },
  ]

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <PageTransition>
        <div style={{ maxWidth: 480, margin: "2rem auto" }}>
          <Card.Root className="glass-card">
            <Card.Header>
              <Card.Title className="card-title">New Club Year</Card.Title>
              <Card.Description className="card-description">
                Fill in the information below to create a new club year.
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <form onSubmit={handleSubmit}>
                <Fieldset.Root size="lg">
                  <Fieldset.Content>
                    <Field.Root>
                      <Field.Label color="rgba(255,255,255,0.85)">Club Name</Field.Label>
                      <Input name="clubName" placeholder="Enter the official name of your club" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 10 }} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label color="rgba(255,255,255,0.85)">Year Label</Field.Label>
                      <Input name="label" placeholder="e.g. 2025-2026" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 10 }} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label color="rgba(255,255,255,0.85)">Start Date</Field.Label>
                      <Input name="startDate" type="date" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 10 }} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label color="rgba(255,255,255,0.85)">End Date</Field.Label>
                      <Input name="endDate" type="date" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 10 }} />
                    </Field.Root>
                  </Fieldset.Content>
                  <Button type="submit" mt={4} className="accent-btn">
                    Create Club Year
                  </Button>
                </Fieldset.Root>
              </form>
            </Card.Body>
          </Card.Root>
        </div>
      </PageTransition>
    </PageLayout>
  )
}

export default View
