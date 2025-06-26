import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import axios from 'axios'
import Add from './Add'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('Add', () => {
  beforeEach(() => {
    mockedAxios.post.mockClear()
  })

  it('renders the add form with all required elements', () => {
    render(<Add />)
    
    
    expect(screen.getByLabelText(/State Name:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Person Name:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Expertise:/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add Person/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit Mapping/i })).toBeInTheDocument()
    expect(screen.getByText(/No people added yet./i)).toBeInTheDocument()
  })

  it('adds a person to the list successfully', () => {
    render(<Add />)
    
    fireEvent.change(screen.getByLabelText(/Person Name:/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/Expertise:/i), { 
      target: { value: 'Frontend Developer' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    expect(screen.getByText(/John Doe \(Frontend Developer\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Person Name:/i)).toHaveValue('')
    expect(screen.getByLabelText(/Expertise:/i)).toHaveValue('')
    expect(screen.queryByText(/No people added yet./i)).not.toBeInTheDocument()
  })

  it('shows error when trying to add person without name', () => {
    render(<Add />)
    
    fireEvent.change(screen.getByLabelText(/Expertise:/i), { 
      target: { value: 'Developer' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    expect(screen.getByText(/Person name and expertise cannot be empty./i)).toBeInTheDocument()
    expect(screen.getByText(/No people added yet./i)).toBeInTheDocument()
  })

  it('shows error when trying to add person without expertise', () => {
    render(<Add />)
    
    fireEvent.change(screen.getByLabelText(/Person Name:/i), { 
      target: { value: 'Jane Smith' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    expect(screen.getByText(/Person name and expertise cannot be empty./i)).toBeInTheDocument()
    expect(screen.getByText(/No people added yet./i)).toBeInTheDocument()
  })

  it('shows error when trying to add person with empty fields', () => {
    render(<Add />)
    
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    expect(screen.getByText(/Person name and expertise cannot be empty./i)).toBeInTheDocument()
    expect(screen.getByText(/No people added yet./i)).toBeInTheDocument()
  })

  it('shows error when trying to add person with whitespace-only fields', () => {
    render(<Add />)
    
    fireEvent.change(screen.getByLabelText(/Person Name:/i), { 
      target: { value: '   ' } 
    })
    fireEvent.change(screen.getByLabelText(/Expertise:/i), { 
      target: { value: '   ' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    expect(screen.getByText(/Person name and expertise cannot be empty./i)).toBeInTheDocument()
  })

  it('clears error when successfully adding person after error', () => {
    render(<Add />)
    
    // First trigger error
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))
    expect(screen.getByText(/Person name and expertise cannot be empty./i)).toBeInTheDocument()
    
    // Then add valid person
    fireEvent.change(screen.getByLabelText(/Person Name:/i), { 
      target: { value: 'Alice Johnson' } 
    })
    fireEvent.change(screen.getByLabelText(/Expertise:/i), { 
      target: { value: 'Backend Developer' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    expect(screen.queryByText(/Person name and expertise cannot be empty./i)).not.toBeInTheDocument()
    expect(screen.getByText(/Alice Johnson \(Backend Developer\)/i)).toBeInTheDocument()
  })

  it('adds multiple people to the list', () => {
    render(<Add />)
    
    // Add first person
    fireEvent.change(screen.getByLabelText(/Person Name:/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/Expertise:/i), { 
      target: { value: 'Frontend' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    // Add second person
    fireEvent.change(screen.getByLabelText(/Person Name:/i), { 
      target: { value: 'Jane Smith' } 
    })
    fireEvent.change(screen.getByLabelText(/Expertise:/i), { 
      target: { value: 'Backend' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    expect(screen.getByText(/John Doe \(Frontend\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Jane Smith \(Backend\)/i)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('submits form successfully with state and people', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} })
    render(<Add />)

    // Add state name
    fireEvent.change(screen.getByLabelText(/State Name:/i), { 
      target: { value: 'California' } 
    })
    
    // Add a person
    fireEvent.change(screen.getByLabelText(/Person Name:/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/Expertise:/i), { 
      target: { value: 'Frontend' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Person/i }))

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit Mapping/i }))

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8080/mappings', {
        name: 'California',
        people: [{ id: expect.any(Number), name: 'John Doe', expertise: 'Frontend' }]
      })
    })

    expect(screen.getByText(/Mapping added successfully!/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/State Name:/i)).toHaveValue('')
    expect(screen.getByText(/No people added yet./i)).toBeInTheDocument()
  })

  it('submits form successfully with only state name (no people)', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} })
    render(<Add />)

    fireEvent.change(screen.getByLabelText(/State Name:/i), { 
      target: { value: 'Texas' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Submit Mapping/i }))

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8080/mappings', {
        name: 'Texas',
        people: []
      })
    })

    expect(screen.getByText(/Mapping added successfully!/i)).toBeInTheDocument()
  })

  it('shows error when trying to submit without state name', () => {
    render(<Add />)
    
    fireEvent.click(screen.getByRole('button', { name: /Submit Mapping/i }))

    expect(screen.getByText(/State name cannot be empty./i)).toBeInTheDocument()
  })

  it('shows error when state name is whitespace only', () => {
    render(<Add />)
    
    fireEvent.change(screen.getByLabelText(/State Name:/i), { 
      target: { value: '   ' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Submit Mapping/i }))

    expect(screen.getByText(/State name cannot be empty./i)).toBeInTheDocument()
  })

  it('shows error when API call fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'))
    render(<Add />)

    fireEvent.change(screen.getByLabelText(/State Name:/i), { 
      target: { value: 'Nevada' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Submit Mapping/i }))

    await waitFor(() => {
      expect(screen.getByText(/Failed to add mapping/i)).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/State Name:/i)).toHaveValue('Nevada')
    expect(screen.queryByText(/Mapping added successfully!/i)).not.toBeInTheDocument()
  })

  it('shows loading state during form submission', async () => {
    let resolvePromise
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    mockedAxios.post.mockReturnValueOnce(promise)
    
    render(<Add />)

    fireEvent.change(screen.getByLabelText(/State Name:/i), { 
      target: { value: 'Florida' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /Submit Mapping/i }))

    expect(screen.getByRole('button', { name: /Adding.../i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Adding.../i })).toBeDisabled()

    resolvePromise({ data: {} })
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit Mapping/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Submit Mapping/i })).not.toBeDisabled()
    })
  })

  it('ensures form is properly structured', () => {
    render(<Add />)
    
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
    
    // All form controls should be within the form
    expect(form).toContainElement(screen.getByLabelText(/State Name:/i))
    expect(form).toContainElement(screen.getByLabelText(/Person Name:/i))
    expect(form).toContainElement(screen.getByLabelText(/Expertise:/i))
    expect(form).toContainElement(screen.getByRole('button', { name: /Add Person/i }))
    expect(form).toContainElement(screen.getByRole('button', { name: /Submit Mapping/i }))
  })
})
