import { render, screen } from '@testing-library/react-native';
import { ReasonInput } from '../components/ReasonInput';

describe('ReasonInput', () => {
  it('shows remaining characters when below minimum', () => {
    render(<ReasonInput value="你好" onChange={() => {}} />);
    expect(screen.getByText(/至少还需/)).toBeTruthy();
  });

  it('shows thank you message when sufficient length', () => {
    render(<ReasonInput value={'非常感谢提醒我保持专注的严父'} onChange={() => {}} />);
    expect(screen.getByText('感谢详细说明')).toBeTruthy();
  });
});
