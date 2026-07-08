/**
 * Test suite for the Skeleton components.
 * Verifies default rendering, style classes, inline styles, custom sizing, and variants.
 */
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonButton } from './Skeleton';

describe('Skeleton Components', () => {
  it('renders Skeleton with default props', () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass('animate-pulse');
    expect(div).toHaveStyle({ width: '100%', height: '1rem' });
  });

  it('renders with custom width, height, and className', () => {
    const { container } = render(
      <Skeleton width={100} height="2rem" className="custom-class" />
    );
    const div = container.firstChild as HTMLElement;
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass('custom-class');
    expect(div).toHaveStyle({ width: '100px', height: '2rem' });
  });

  it('renders different skeleton variants', () => {
    const { container: textContainer } = render(<SkeletonText />);
    expect(textContainer.firstChild).toHaveClass('rounded-sm');

    const { container: cardContainer } = render(<SkeletonCard />);
    expect(cardContainer.firstChild).toHaveStyle({ height: '200px' });

    const { container: avatarContainer } = render(<SkeletonAvatar />);
    expect(avatarContainer.firstChild).toHaveClass('rounded-full');

    const { container: btnContainer } = render(<SkeletonButton />);
    expect(btnContainer.firstChild).toHaveStyle({ height: '2.5rem' });
  });
});
