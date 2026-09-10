import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GlobalErrorView } from '../../components/global-error-view';

describe("écran global d'erreur", () => {
  it("explique l'erreur de rendu et permet une reprise", () => {
    const retry = vi.fn();
    render(<GlobalErrorView retry={retry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Une erreur inattendue est survenue');
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
