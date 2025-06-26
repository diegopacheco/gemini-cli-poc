import React, { useState } from 'react'
import axios from 'axios'

function Add() {
  const [stateName, setStateName] = useState('')
  const [personName, setPersonName] = useState('')
  const [expertise, setExpertise] = useState('')
  const [people, setPeople] = useState([])
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAddPerson = () => {
    if (!personName || !expertise) {
      setError('Person name and expertise cannot be empty.')
      return
    }
    setError(null)
    const newPerson = { id: Date.now(), name: personName, expertise }
    setPeople([...people, newPerson])
    setPersonName('')
    setExpertise('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null) // Clear previous errors at the start
    setMessage(null) // Clear previous messages at the start

    if (!stateName) {
      setError('State name cannot be empty.')
      return
    }
    setLoading(true)

    const payload = {
      name: stateName,
      people: people,
    }

    try {
      const response = await axios.post('http://localhost:8080/mappings', payload)
      setMessage('Mapping added successfully!')
      setStateName('')
      setPeople([])
    } catch (err) {
      setError('Failed to add mapping. Please ensure the backend is running on localhost:8080 and the data is valid.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Add State or People</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="stateName">State Name:</label>
          <input
            type="text"
            id="stateName"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            required
          />
        </div>
        
        <h2>Add People to this State</h2>
        <div>
          <label htmlFor="personName">Person Name:</label>
          <input
            type="text"
            id="personName"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="expertise">Expertise:</label>
          <input
            type="text"
            id="expertise"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleAddPerson}>Add Person</button>

        <h3>People to be added:</h3>
        {people.length === 0 ? (
          <p>No people added yet.</p>
        ) : (
          <ul>
            {people.map((person) => (
              <li key={person.id}>{person.name} ({person.expertise})</li>
            ))}
          </ul>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Submit Mapping'}
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default Add
