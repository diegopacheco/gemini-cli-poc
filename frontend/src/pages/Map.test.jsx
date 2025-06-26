import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import Map from './Map'

vi.mock('axios')

describe('Map', () => {
  it('renders loading state initially', () => {
    render(<Map />)
    expect(screen.getByText(/Loading map data.../i)).toBeInTheDocument()
  })

  it('renders error message on API failure', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'))
    render(<Map />)
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

    render(<Map />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Brazil Map/i })).toBeInTheDocument()
      expect(screen.getByText(/SC/i)).toBeInTheDocument()
      expect(screen.getByText(/Developer X/i)).toBeInTheDocument()
    })
  })

  it('renders message when no states are available', async () => {
    axios.get.mockResolvedValueOnce({ data: { states: [] } })

    render(<Map />)

    await waitFor(() => {
      expect(screen.getByText(/No states or people data available/i)).toBeInTheDocument()
    })
  })
})
