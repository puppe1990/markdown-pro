import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsModal from './SettingsModal';
import type { ThemePreference } from '@/src/features/preferences/theme';
import type { AccentColorId } from '@/src/features/preferences/accent';

describe('SettingsModal', () => {
    const defaultProps = {
        isOpen: true,
        themePreference: 'system' as ThemePreference,
        onThemePreferenceChange: vi.fn(),
        accentColor: 'teal' as AccentColorId,
        onAccentColorChange: vi.fn(),
        onClose: vi.fn(),
    };

    it('renders nothing when isOpen is false', () => {
        render(<SettingsModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders settings dialog with theme options when open', () => {
        render(<SettingsModal {...defaultProps} />);

        expect(
            screen.getByRole('dialog', { name: 'Settings' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('radiogroup', { name: 'Theme' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('radio', { name: 'System' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('radio', { name: 'Light' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Dark' })).toBeInTheDocument();
    });

    it('marks the current theme preference as checked', () => {
        render(<SettingsModal {...defaultProps} themePreference="dark" />);

        expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Light' })).not.toBeChecked();
        expect(screen.getByRole('radio', { name: 'System' })).not.toBeChecked();
    });

    it('calls onThemePreferenceChange when selecting a different theme', async () => {
        const onThemePreferenceChange = vi.fn();
        render(
            <SettingsModal
                {...defaultProps}
                onThemePreferenceChange={onThemePreferenceChange}
            />,
        );

        await userEvent.click(screen.getByRole('radio', { name: 'Light' }));
        expect(onThemePreferenceChange).toHaveBeenCalledWith('light');
    });

    it('calls onClose when Escape is pressed', async () => {
        const onClose = vi.fn();
        render(<SettingsModal {...defaultProps} onClose={onClose} />);

        await userEvent.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
        const onClose = vi.fn();
        render(<SettingsModal {...defaultProps} onClose={onClose} />);

        await userEvent.click(screen.getByTestId('modal-backdrop'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders accent color options', () => {
        render(<SettingsModal {...defaultProps} />);

        expect(
            screen.getByRole('radiogroup', { name: 'Accent color' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Teal' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Blue' })).toBeInTheDocument();
    });

    it('marks the current accent color as checked', () => {
        render(<SettingsModal {...defaultProps} accentColor="blue" />);

        expect(screen.getByRole('radio', { name: 'Blue' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Teal' })).not.toBeChecked();
    });

    it('calls onAccentColorChange when selecting a different accent', async () => {
        const onAccentColorChange = vi.fn();
        render(
            <SettingsModal
                {...defaultProps}
                onAccentColorChange={onAccentColorChange}
            />,
        );

        await userEvent.click(screen.getByRole('radio', { name: 'Violet' }));
        expect(onAccentColorChange).toHaveBeenCalledWith('violet');
    });
});
