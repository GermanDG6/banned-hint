import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandHeader } from './BrandHeader';
import styles from './BrandHeader.module.css';

describe('BrandHeader', () => {
  it('should render the text "BANNED HINT"', () => {
    render(<BrandHeader />);
    expect(screen.getByText('BANNED HINT')).toBeInTheDocument();
  });

  it('should render an h1 element', () => {
    render(<BrandHeader />);
    expect(screen.getByRole('heading', { level: 1, name: 'BANNED HINT' })).toBeInTheDocument();
  });

  it('should apply the dark variant by default', () => {
    const { container } = render(<BrandHeader />);
    const heading = container.querySelector('h1');
    expect(heading).toHaveClass(styles.dark);
  });

  it('should apply the dark variant when variant="dark"', () => {
    const { container } = render(<BrandHeader variant="dark" />);
    const heading = container.querySelector('h1');
    expect(heading).toHaveClass(styles.dark);
  });

  it('should apply the light variant when variant="light"', () => {
    const { container } = render(<BrandHeader variant="light" />);
    const heading = container.querySelector('h1');
    expect(heading).toHaveClass(styles.light);
  });

  it('should always have the root class applied', () => {
    const { container } = render(<BrandHeader />);
    const heading = container.querySelector('h1');
    expect(heading).toHaveClass(styles.root);
  });
});


