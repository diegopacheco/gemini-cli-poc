import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Welcome from './Welcome'

describe('Welcome', () => {
  it('renders the welcome message', () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
    expect(screen.getByText(/Welcome to the Brazil Map App!/i)).toBeInTheDocument()
  })
})
