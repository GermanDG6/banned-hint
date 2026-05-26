import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageLayout } from './PageLayout';
import styles from './PageLayout.module.css';

describe('PageLayout', () => {
  it('should render children within the container', () => {
    render(
      <PageLayout>
        <p>Test content</p>
      </PageLayout>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should apply additional className to the container', () => {
    const { container } = render(
      <PageLayout className="custom-class">
        <p>Test</p>
      </PageLayout>
    );
    const containerDiv = container.querySelector('main > div');
    expect(containerDiv).toHaveClass('custom-class');
  });

  it('should render a main element', () => {
    const { container } = render(
      <PageLayout>
        <p>Test</p>
      </PageLayout>
    );
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('should apply the page class to main element', () => {
    const { container } = render(
      <PageLayout>
        <p>Test</p>
      </PageLayout>
    );
    const main = container.querySelector('main');
    expect(main).toHaveClass(styles.page);
  });

  it('should apply the container class to the inner div', () => {
    const { container } = render(
      <PageLayout>
        <p>Test</p>
      </PageLayout>
    );
    const containerDiv = container.querySelector('main > div');
    expect(containerDiv).toHaveClass(styles.container);
  });
});


