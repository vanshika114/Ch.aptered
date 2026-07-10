/**
 * Test suite for the compound Card component.
 * Verifies standard rendering, interactive variants (anchors, buttons), subcomponent layout, and image handlers.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Card } from './Card';

describe('Card Component System', () => {
  it('renders a simple card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders interactive anchor when href is provided', () => {
    render(<Card href="https://example.com">Interactive card</Card>);
    const linkElement = screen.getByRole('link', { name: 'Interactive card' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://example.com');
  });

  it('renders interactive button when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable card</Card>);
    const buttonElement = screen.getByRole('button', { name: 'Clickable card' });
    expect(buttonElement).toBeInTheDocument();
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders subcomponents (Header, Body, Footer) correctly', () => {
    render(
      <Card>
        <Card.Header title="Card Title" subtitle="Card Subtitle" />
        <Card.Body>Main Content</Card.Body>
        <Card.Footer>Footer Content</Card.Footer>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('renders Card.Image with fallback text when no src is provided', () => {
    render(<Card.Image fallbackText="Fallback Text" />);
    expect(screen.getByText('Fallback Text')).toBeInTheDocument();
  });

  it('renders Card.Image as an image when src is provided', () => {
    render(<Card.Image src="test.jpg" alt="Test Image" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test.jpg');
    expect(img).toHaveAttribute('alt', 'Test Image');
  });
});
