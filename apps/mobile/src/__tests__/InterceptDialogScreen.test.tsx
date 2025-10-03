import { render, fireEvent, screen, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { InterceptDialogScreen } from '../screens/InterceptDialogScreen';

describe('InterceptDialogScreen', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('disables submit button when reason is too short', () => {
    render(<InterceptDialogScreen />);
    fireEvent.changeText(screen.getByPlaceholderText(/例如：有紧急会议/), '太短');
    const submitButton = screen.getByTestId('submit-reason');
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('triggers verdict evaluation when reason is sufficient', () => {
    jest.useFakeTimers();
    render(<InterceptDialogScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText(/例如：有紧急会议/),
      '这是一个非常充分且详细的理由，解释当前使用的紧急必要性。'
    );
    const submitButton = screen.getByTestId('submit-reason');
    fireEvent.press(submitButton);
    act(() => {
      jest.runAllTimers();
    });
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(screen.getByText('给你15分钟缓冲，回来继续执行。')).toBeTruthy();
  });

  it('opens emergency sheet when emergency button pressed', () => {
    render(<InterceptDialogScreen />);
    fireEvent.press(screen.getByTestId('action-emergency'));
    expect(screen.getByText('紧急情况说明')).toBeTruthy();
  });
});
