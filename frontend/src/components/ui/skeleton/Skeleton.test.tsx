import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('should render an element with aria-hidden="true"', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('should apply custom className if provided', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should apply style property if provided', () => {
    const { container } = render(<Skeleton style={{ width: '100px', height: '20px' }} />);
    const skeleton = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(skeleton.style.width).toBe('100px');
    expect(skeleton.style.height).toBe('20px');
  });
});

