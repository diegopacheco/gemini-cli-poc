import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '../components/Header'
import brazilMapImage from '../assets/states-brazil-map.jpg'

function Map() {
  const [mappings, setMappings] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState(null)

  const brazilStates = {
    'AC': { x: 45, y: 195, name: 'Acre' },
    'AL': { x: 500, y: 210, name: 'Alagoas' },
    'AP': { x: 310, y: 90, name: 'Amapá' },
    'AM': { x: 105, y: 170, name: 'Amazonas' },
    'BA': { x: 405, y: 260, name: 'Bahia' },
    'CE': { x: 445, y: 180, name: 'Ceará' },
    'DF': { x: 345, y: 295, name: 'Distrito Federal' },
    'ES': { x: 425, y: 350, name: 'Espírito Santo' },
    'GO': { x: 325, y: 305, name: 'Goiás' },
    'MA': { x: 345, y: 175, name: 'Maranhão' },
    'MT': { x: 255, y: 265, name: 'Mato Grosso' },
    'MS': { x: 265, y: 355, name: 'Mato Grosso do Sul' },
    'MG': { x: 385, y: 335, name: 'Minas Gerais' },
    'PA': { x: 275, y: 155, name: 'Pará' },
    'PB': { x: 475, y: 190, name: 'Paraíba' },
    'PR': { x: 300, y: 415, name: 'Paraná' },
    'PE': { x: 455, y: 210, name: 'Pernambuco' },
    'PI': { x: 385, y: 205, name: 'Piauí' },
    'RJ': { x: 405, y: 375, name: 'Rio de Janeiro' },
    'RN': { x: 485, y: 170, name: 'Rio Grande do Norte' },
    'RS': { x: 295, y: 465, name: 'Rio Grande do Sul' },
    'RO': { x: 175, y: 265, name: 'Rondônia' },
    'RR': { x: 205, y: 75, name: 'Roraima' },
    'SC': { x: 325, y: 445, name: 'Santa Catarina' },
    'SP': { x: 355, y: 385, name: 'São Paulo' },
    'SE': { x: 455, y: 275, name: 'Sergipe' },
    'TO': { x: 345, y: 235, name: 'Tocantins' }
  }

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const response = await axios.get('http://localhost:8080/mappings')
        setMappings(response.data.states || [])
      } catch (err) {
        setError('Failed to fetch mappings. Please ensure the backend is running on localhost:8080.')
        setMappings([])
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMappings()
  }, [])

  const getStateData = (stateCode) => {
    return mappings?.find(state => state.name === stateCode)
  }

  const handleStateClick = (stateCode) => {
    const stateData = getStateData(stateCode)
    setSelectedState(stateData || { name: stateCode, people: [] })
  }

  if (loading) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading map data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Brazilian States Map</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '0 20px' }}>
        <div style={{ flex: 1, maxWidth: '700px' }}>
          <div
            style={{
              position: 'relative',
              width: '600px',
              height: '500px',
              border: '2px solid #333',
              borderRadius: '10px',
              backgroundImage: `url(${brazilMapImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              margin: '0 auto'
            }}
          >
            {Object.entries(brazilStates).map(([stateCode, stateInfo]) => {
              const stateData = getStateData(stateCode)
              const hasData = stateData && stateData.people && Array.isArray(stateData.people) && stateData.people.length > 0
              
              return (
                <div
                  key={stateCode}
                  style={{
                    position: 'absolute',
                    left: `${stateInfo.x - 15}px`,
                    top: `${stateInfo.y - 15}px`,
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: hasData ? '#FF0000' : '#FFFFFF',
                    border: '2px solid #000',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: hasData ? '#FFF' : '#000',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                  onClick={() => handleStateClick(stateCode)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.2)'
                    e.target.style.zIndex = '20'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)'
                    e.target.style.zIndex = '10'
                  }}
                  title={`${stateInfo.name} (${stateCode})`}
                >
                  {stateCode}
                  {hasData && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#FFD700',
                        border: '1px solid #FFA500',
                        fontSize: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000'
                      }}
                    >
                      ●
                    </div>
                  )}
                </div>
              )
            })}

            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF0000', marginRight: '5px' }}></div>
                <span>With registered people</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #000', marginRight: '5px' }}></div>
                <span>Without people</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFD700', marginRight: '7px' }}></div>
                <span>Data indicator</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: '400px' }}>
          <div style={{ 
            border: '2px solid #333', 
            borderRadius: '10px', 
            padding: '20px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            minHeight: '400px'
          }}>
            <h3 style={{ marginTop: 0, color: '#2F4F2F', borderBottom: '2px solid #4ECDC4', paddingBottom: '10px' }}>
              State Information
            </h3>
            
            {selectedState ? (
              <div>
                <h4 style={{ color: '#FF6B6B', margin: '10px 0' }}>
                  {brazilStates[selectedState.name]?.name || selectedState.name}
                  <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px' }}>
                    ({selectedState.name})
                  </span>
                </h4>
                
                {selectedState.people && Array.isArray(selectedState.people) && selectedState.people.length > 0 ? (
                  <div>
                    <p style={{ color: '#4ECDC4', fontWeight: 'bold' }}>
                      👥 {selectedState.people.length} registered person(s):
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {selectedState.people.map((person) => (
                        <li 
                          key={person.id} 
                          style={{ 
                            margin: '10px 0',
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '5px',
                            borderLeft: '4px solid #FF6B6B'
                          }}
                        >
                          <strong style={{ color: '#2F4F2F' }}>{person.name}</strong>
                          <br />
                          <span style={{ color: '#666', fontSize: '14px' }}>
                            💼 {person.expertise}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>
                    📝 No people registered in this state yet.
                    <br />
                    <a href="/add" style={{ color: '#4ECDC4', textDecoration: 'none' }}>
                      Click here to add people →
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                <p style={{ fontSize: '16px' }}>🗺️</p>
                <p>Click on a state on the map to see information</p>
                <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  <h4 style={{ color: '#2F4F2F', margin: '0 0 10px 0' }}>Summary:</h4>
                  <p style={{ margin: '5px 0' }}>
                    📊 Total states: {Object.keys(brazilStates).length}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    👥 States with data: {mappings ? mappings.length : 0}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    🔢 Total people: {mappings ? mappings.reduce((total, state) => total + (state.people?.length || 0), 0) : 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Map
