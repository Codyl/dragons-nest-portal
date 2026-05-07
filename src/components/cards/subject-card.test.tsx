// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { afterEach, describe, expect, it } from 'vitest';
import type { Subject } from '@/api/services/subjects.services';
import SubjectCard from './subject-card';

afterEach(() => {
  cleanup();
});

const subjectFixture: Subject = {
  _id: 'subject-1',
  name: 'Language Arts',
  icon: '📖',
  color: '#12ABEF',
  slug: 'language-arts',
  isEnrichment: false,
};

function arbitrarySubject(): fc.Arbitrary<Subject> {
  return fc.record({
    _id: fc.uuid(),
    name: fc
      .string({ minLength: 1, maxLength: 40 })
      .filter((s) => s.trim().length > 0),
    icon: fc
      .string({ minLength: 1, maxLength: 6 })
      .filter((s) => s.trim().length > 0),
    color: fc
      .tuple(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
      )
      .map(([r, g, b]) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`),
    slug: fc
      .string({ minLength: 1, maxLength: 20 })
      .filter((s) => s.trim().length > 0),
    isEnrichment: fc.boolean(),
  });
}

describe('SubjectCard', () => {
  it('renders subject name', () => {
    render(<SubjectCard subject={subjectFixture} />);
    expect(screen.getByText('Language Arts')).toBeTruthy();
  });

  it('renders subject icon', () => {
    render(<SubjectCard subject={subjectFixture} />);
    expect(screen.getByTestId('subject-icon').textContent).toContain('📖');
  });

  it('applies subject color accent', () => {
    render(<SubjectCard subject={subjectFixture} />);
    const colorNode = screen.getByTestId('subject-color');
    expect(colorNode.textContent).toContain(subjectFixture.color);
  });

  it('does not render Add, Remove, or Edit controls', () => {
    render(<SubjectCard subject={subjectFixture} />);
    expect(screen.queryByRole('button', { name: /add/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /remove/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /edit/i })).toBeNull();
  });
});

describe('Property 2: Subject card displays name, icon, and color', () => {
  it('renders arbitrary subject name/icon/color content', () => {
    // Feature: curriculum-page, Property 2: Subject card displays name, icon, and color
    fc.assert(
      fc.property(arbitrarySubject(), (subject) => {
        const { unmount } = render(<SubjectCard subject={subject} />);
        const text = document.body.textContent ?? '';
        const iconText = screen.getByTestId('subject-icon').textContent ?? '';
        const colorText = screen.getByTestId('subject-color').textContent ?? '';
        const passed =
          text.includes(subject.name) &&
          iconText.includes(subject.icon) &&
          colorText.includes(subject.color);
        unmount();
        return passed;
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property 3: No interactive controls for any subject list', () => {
  it('renders zero add/remove/edit controls for arbitrary subject lists', () => {
    // Feature: curriculum-page, Property 3: No interactive controls rendered for any subject list
    fc.assert(
      fc.property(
        fc.array(arbitrarySubject(), { minLength: 0, maxLength: 20 }),
        (subjects) => {
          const { unmount, container } = render(
            <div>
              {subjects.map((subject) => (
                <SubjectCard key={subject._id} subject={subject} />
              ))}
            </div>,
          );

          const controls = Array.from(
            container.querySelectorAll('button, a'),
          ).filter((element) => /add|remove|edit/i.test(element.textContent ?? ''));

          unmount();
          return controls.length === 0;
        },
      ),
      { numRuns: 100 },
    );
  });
});
