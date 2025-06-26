import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import Map from './Map'

vi.mock('axios')

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Map', () => {
  it('renders loading state initially', () => {
    renderWithRouter(<Map />)
    expect(screen.getByText(/Loading map data.../i)).toBeInTheDocument()
  })

  it('renders error message on API failure', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'))
    renderWithRouter(<Map />)
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch mappings/i)).toBeInTheDocument()
    })
  })

  it('renders map data when API call is successful', async () => {
    const mockData = {
      states: [
        {
          name: 'SC',
          people: [
            { id: 1, name: 'Developer X', expertise: 'Backend' },
          ],
        },
      ],
    }
    axios.get.mockResolvedValueOnce({ data: mockData })

    renderWithRouter(<Map />)

    await waitFor(() => {
      expect(screen.getByText(/SC/i)).toBeInTheDocument()
      expect(screen.getByText(/States with data: 1/i)).toBeInTheDocument()
      expect(screen.getByText(/Total people: 1/i)).toBeInTheDocument()
    })
  })

  it('renders message when no states are available', async () => {
    axios.get.mockResolvedValueOnce({ data: { states: [] } })

    renderWithRouter(<Map />)

    await waitFor(() => {
      expect(screen.getByText(/Click on a state on the map to see information/i)).toBeInTheDocument()
    })
  })
})
