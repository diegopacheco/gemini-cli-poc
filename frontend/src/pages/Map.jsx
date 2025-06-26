import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Map() {
  const [mappings, setMappings] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const response = await axios.get('http://localhost:8080/mappings')
        setMappings(response.data.states)
      } catch (err) {
        setError('Failed to fetch mappings. Please ensure the backend is running on localhost:8080.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMappings()
  }, [])

  if (loading) {
    return <div>Loading map data...</div>
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>
  }

  return (
    <div>
      
      <p>This is a placeholder for the Brazil map. A real implementation would use an SVG map library.</p>
      <div style={{ border: '1px solid black', width: '80%', height: '400px', margin: '20px auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {mappings.length === 0 ? (
          <p>No states or people data available. Add some from the "Add" page!</p>
        ) : (
          mappings.map((state) => (
            <div key={state.name} style={{ margin: '10px', padding: '10px', border: '1px solid gray', borderRadius: '5px' }}>
              <h2>{state.name}</h2>
              {state.people && state.people.length > 0 ? (
                <ul>
                  {state.people.map((person) => (
                    <li key={person.id}>{person.name} ({person.expertise})</li>
                  ))}
                </ul>
              ) : (
                <p>No people in this state.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Map
