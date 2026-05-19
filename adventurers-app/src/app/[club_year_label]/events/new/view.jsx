"use client"
import {
  Button,
  Field,
  Fieldset,
  FieldRoot,
  Input,
  AbsoluteCenter,
  Card,
  Switch,
  NativeSelect,
  IconButton,
} from "@chakra-ui/react"
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { fromSnakeCaseToTitleCase } from "@/utils/stringUtils";

const View = () => {
  const router = useRouter()
  const clubYearLabel = useParams()['club_year_label']
  const [eventAwards, setEventAwards] = useState([])
  const [awardList, setAwardList] = useState([])
  const [classList, setClassList] = useState([])

  const fetchAwards = async () => {
    try {
      const response = await fetch(`/api/awards`);
      const data = await response.json();
      setAwardList(data);
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/club-years/${clubYearLabel}/classes`);
      const data = await response.json();
      setClassList(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }

  // get all awards 
  useMemo(() => fetchAwards(), [])

  // get all classes
  useMemo(() => fetchClasses(), [])

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.awards = eventAwards


    fetch(`/api/club-years/${clubYearLabel}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => { 
      console.log('Success:', data);
      // TO DO: redirect to event page
      router.push(`/${clubYearLabel}/dashboard`);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  return (
    <AbsoluteCenter>
          <Card.Root maxW="sm">
    <Card.Header>
      <Card.Title>Add a Event</Card.Title>
      <Card.Description>
        Fill the information below to create a new Event.
      </Card.Description>
    </Card.Header>
    <Card.Body>
    <form onSubmit={handleSubmit}>
    <Fieldset.Root size="lg" maxW="md">
      <Fieldset.Content>
        <Field.Root>
          <Field.Label>Event Name</Field.Label>
          <Input name="title" placeholder={"Enter the name of your event"}/>
        </Field.Root>
       
        <Field.Root>
          <Field.Label>Event Date</Field.Label>
          <Input name="event_date" type="date" />
        </Field.Root>

        <Field.Root >
          <Field.Label>Is Award Ceremony?</Field.Label>
          <Switch.Root  name="award_ceremony" defaultChecked={false}>
          <Switch.HiddenInput />
          <Switch.Control />
          </Switch.Root>
        </Field.Root>

        <Field.Root >
          <Field.Label>Awards</Field.Label>
          {eventAwards.map((eventAward, index) => (
            <div key={index} style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={eventAward.award_id || ''}  // Controlled value
                  onChange={(e) => {
                    const newAwards = [...eventAwards];
                    newAwards[index].award_id = e.target.value;
                    setEventAwards(newAwards);
                  }}
                >
                  <option value="">Select Award</option>  // Add a default option if needed
                  {awardList.map((awardOption) => (
                    <option key={awardOption.id} value={awardOption.id}>{awardOption.name}</option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={eventAward.class_id || ''}  // Controlled value
                  onChange={(e) => {
                    const newAwards = [...eventAwards];
                    newAwards[index].class_id = e.target.value;
                    setEventAwards(newAwards);
                  }}
                >
                  <option value="">Select Class</option>  // Add a default option if needed
                  {classList.map((classOption) => (
                    <option key={classOption.id} value={classOption.id}>{fromSnakeCaseToTitleCase(classOption.class)}</option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <IconButton variant="ghost" aria-label="Remove Award" onClick={() => {
                const newAwards = [...eventAwards];
                newAwards.splice(index, 1);
                setEventAwards(newAwards);
              }}>
                <FaRegTrashAlt />
              </IconButton>
            </div>
          ))}

          <Button colorPalette="green" alignSelf="flex-start" mt="4" onClick={() => setEventAwards([...eventAwards, {award_id:null, class_id:null}])}>
            Add Award
          </Button>

        </Field.Root>


      </Fieldset.Content>

      <Button type="submit" alignSelf="flex-start" mt="4">
        Submit
      </Button>
    </Fieldset.Root>
    </form>
    </Card.Body>
  </Card.Root>
  </AbsoluteCenter>
  )
}

export default View;