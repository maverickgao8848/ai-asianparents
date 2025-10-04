import { render, screen } from '@testing-library/react-native';
import { VerdictCard } from '../components/VerdictCard';

describe('VerdictCard', () => {
  it('renders pending state', () => {
    render(<VerdictCard state="pending" />);
    expect(screen.getByText('严父正在评估你的理由…')).toBeTruthy();
  });

  it('renders delay message with minutes', () => {
    render(<VerdictCard state="delay" personaResponse="稍后再来" delayMinutes={10} />);
    expect(screen.getByText('稍后再来')).toBeTruthy();
    expect(screen.getByText('建议延后 10 分钟后再尝试。')).toBeTruthy();
  });
});
