// src/components/Captcha.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Captcha } from './Captcha';

describe('Captcha Component', () => {
  beforeEach(() => {
    render(<Captcha />);
  });

  test('renders the video stream and continue button', () => {
    // Check if the continue button is rendered
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();

    // Check for the presence of the webcam element, if applicable.
    // Since the Webcam component does not render an image with role "img",
    // we may need to identify it through its class or some other means.
    expect(screen.getByText(/select the sectors containing/i)).toBeInTheDocument(); // Adjust based on your default rendering
  });

  test('locks the position and shows sector selection after continue click', () => {
    // Click the continue button to capture the image
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Check if the sectors are displayed after capturing the image
    expect(screen.getByRole('button', { name: /validate/i })).toBeInTheDocument();
    expect(screen.getByText(/select the sectors containing/i)).toBeInTheDocument();
  });

  test('displays success message after passing the captcha', () => {
    // Click the continue button to capture the image
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Simulate selecting a correct sector (you may need to adjust based on how sectors are rendered)
    const sectors = screen.getAllByTestId('grid-sector');
    if (sectors.length > 0) {
      fireEvent.click(sectors[0]); // Click the first sector
    }

    // Click the validate button
    fireEvent.click(screen.getByRole('button', { name: /validate/i }));

    // Check if the success message appears
    expect(screen.getByText(/successfully passed the captcha/i)).toBeInTheDocument();
  });

  test('allows retry after incorrect selection', () => {
    // Click the continue button to capture the image
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Simulate selecting an incorrect sector (Assuming the first sector is incorrect)
    const sectors = screen.getAllByTestId('grid-sector');
    if (sectors.length > 0) {
      fireEvent.click(sectors[0]); // Click the first sector
    }

    // Click the validate button
    fireEvent.click(screen.getByRole('button', { name: /validate/i }));

    // Check if the failure message is displayed
    expect(screen.getByText(/captcha failed/i)).toBeInTheDocument();

    // Click the continue button again for another attempt
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/select the sectors containing/i)).toBeInTheDocument();
  });
});
