import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import Add from './Add'

vi.mock('axios')

describe('Add', () => {
  beforeEach(() => {
    axios.post.mockClear()
  })

  it('renders the add form', () => {
    render(<Add />)
    expect(screen.getByLabelText(/State Name:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Person Name:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Expertise:/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add Person/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit Mapping/i })).toBeInTheDocument()
  })

  it('adds a person to the list', () => {
    render(<Add />)
    fireEvent.change(screen.getByLabelText(/Person Name:/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/Expertise:/i), { target: { value: 'Frontend' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    expect(screen.getByText(/John Doe \(Frontend\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Person Name:/i)).toHaveValue('')
    expect(screen.getByLabelText(/Expertise:/i)).toHaveValue('')
  })

  it('shows error if person name or expertise is empty when adding person', () => {
    render(<Add />)
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))
    expect(screen.getByText(/Person name and expertise cannot be empty./i)).toBeInTheDocument()
  })

  it('submits the form successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: {} })
    render(<Add />)

    fireEvent.change(screen.getByLabelText(/State Name:/i), { target: { value: 'TX' } })
    fireEvent.change(screen.getByLabelText(/Person Name:/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/Expertise:/i), { target: { value: 'Frontend' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    fireEvent.click(screen.getByRole('button', { name: /Submit Mapping/i }))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:8080/mappings', {
        name: 'TX',
        people: [{ id: expect.any(Number), name: 'John Doe', expertise: 'Frontend' }],
      })
      expect(screen.getByText(/Mapping added successfully!/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/State Name:/i)).toHaveValue('')
      expect(screen.queryByText(/John Doe \(Frontend\)/i)).not.toBeInTheDocument()
    })
  })

  it('shows error if state name is empty on submit', async () => {
    render(<Add />)
    fireEvent.click(screen.getByRole('button', { name: /Submit Mapping/i }))
    await waitFor(async () => {
      expect(await screen.findByText(/State name cannot be empty./i)).toBeInTheDocument()
    })
  })

  it('shows error on API submission failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'))
    render(<Add />)

    fireEvent.change(screen.getByLabelText(/State Name:/i), { target: { value: 'TX' } })
    fireEvent.click(screen.getByRole('button', { name: /Submit Mapping/i }))

    await waitFor(() => {
      expect(screen.getByText(/Failed to add mapping./i)).toBeInTheDocument()
    })
  })
})
