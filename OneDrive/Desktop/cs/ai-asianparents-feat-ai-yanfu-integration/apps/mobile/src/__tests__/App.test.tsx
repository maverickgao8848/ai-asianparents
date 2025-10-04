import { render } from '@testing-library/react-native';
import App from '../App';

test('renders welcome copy', () => {
  const { getByText } = render(<App />);
  expect(getByText('AI 严父')).toBeTruthy();
  expect(getByText('Welcome to the strict-but-fair focus companion.')).toBeTruthy();
});
