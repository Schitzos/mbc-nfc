import { colors, signalColorTokens } from '@presentation/theme/colors';
import { componentTokens } from '@presentation/theme/components';
import { signalIconTokens } from '@presentation/theme/icons';
import { radius } from '@presentation/theme/radius';
import { shadows } from '@presentation/theme/shadows';
import { spacing } from '@presentation/theme/spacing';
import { typography } from '@presentation/theme/typography';

describe('theme tokens', () => {
  it('exposes signal color and semantic aliases', () => {
    expect(signalColorTokens.brand.primary).toBe('#FF0025');
    expect(colors.textPrimary).toBe(signalColorTokens.text.primary);
  });

  it('defines component tokens for button and text field', () => {
    expect(componentTokens.button.sizes.large.height).toBe(40);
    expect(componentTokens.textField.height).toBe(40);
  });

  it('defines icon, spacing, radius, typography, and shadows', () => {
    expect(signalIconTokens.mbcSuggested.station).toBe('ico_plus');
    expect(spacing.sheetHorizontal).toBe(24);
    expect(radius.card).toBe(20);
    expect(typography.h5.fontSize).toBe(18);
    expect(shadows.low?.shadowColor).toBe('#9E9E9E');
  });
});
