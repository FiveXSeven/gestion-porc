import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/button';
import React from 'react';

// Mock the button component since we just want to test if tests are running
// or we can test the actual button.
// Let's test the Button component import and usage.

describe('Button', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });
});
