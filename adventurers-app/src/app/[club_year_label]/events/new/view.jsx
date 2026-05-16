"use client"
import {
  Button,
  Field,
  Fieldset,
  Input,
  Card,
  Switch,
} from "@chakra-ui/react"
import { useParams, useRouter } from "next/navigation"
import PageLayout from "@/components/PageLayout"
import PageTransition from "@/components/PageTransition"

const View = () => {
  const clubYearLabel = useParams()['club_year_label']
  const router = useRouter()

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())
    data.club_year_label = clubYearLabel

    fetch(`/api/club-years/${clubYearLabel}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data)
        router.push(`/${clubYearLabel}/events`)
      })
      .catch(console.error)
  }

  const breadcrumbs = [
    { label: clubYearLabel, href: `/${clubYearLabel}/dashboard` },
    { label: "Events", href: `/${clubYearLabel}/events` },
    { label: "New Event" },
  ]

  const inputStyle = { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 10 }

  return (
    <PageLayout breadcrumbs={breadcrumbs} clubName={`${clubYearLabel} Club`}>
      <PageTransition>
        <div style={{ maxWidth: 480, margin: "2rem auto" }}>
          <Card.Root className="glass-card">
            <Card.Header>
              <Card.Title className="card-title">New Event</Card.Title>
              <Card.Description className="card-description">
                Fill in the information below to add a new event.
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <form onSubmit={handleSubmit}>
                <Fieldset.Root size="lg">
                  <Fieldset.Content>
                    <Field.Root>
                      <Field.Label color="rgba(255,255,255,0.85)">Event Name</Field.Label>
                      <Input name="title" placeholder="Enter the name of your event" style={inputStyle} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label color="rgba(255,255,255,0.85)">Event Date</Field.Label>
                      <Input name="event_date" type="date" style={inputStyle} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label color="rgba(255,255,255,0.85)">Is Award Ceremony?</Field.Label>
                      <Switch.Root name="award_ceremony" defaultChecked={false}>
                        <Switch.HiddenInput />
                        <Switch.Control />
                      </Switch.Root>
                    </Field.Root>
                  </Fieldset.Content>
                  <Button type="submit" mt={4} className="accent-btn">
                    Create Event
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
