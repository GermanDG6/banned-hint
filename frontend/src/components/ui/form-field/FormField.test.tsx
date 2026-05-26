import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';
import { TextInput } from '../text-input/TextInput';

describe('FormField', () => {
  it('should render the label with the correct text', () => {
    render(
      <FormField label="Email" htmlFor="email-input">
        <TextInput id="email-input" type="email" />
      </FormField>
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should have the correct htmlFor attribute on the label', () => {
    render(
      <FormField label="Password" htmlFor="password-input">
        <TextInput id="password-input" type="password" />
      </FormField>
    );

    const label = screen.getByText('Password');
    expect(label).toHaveAttribute('for', 'password-input');
  });

  it('should not render error message when error is not provided', () => {
    render(
      <FormField label="Username" htmlFor="username-input">
        <TextInput id="username-input" />
      </FormField>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render error message when error is provided', () => {
    render(
      <FormField label="Username" htmlFor="username-input" error="Username is required">
        <TextInput id="username-input" />
      </FormField>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Username is required');
  });

  it('should have role="alert" on error message', () => {
    render(
      <FormField label="Email" htmlFor="email-input" error="Invalid email">
        <TextInput id="email-input" type="email" />
      </FormField>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

