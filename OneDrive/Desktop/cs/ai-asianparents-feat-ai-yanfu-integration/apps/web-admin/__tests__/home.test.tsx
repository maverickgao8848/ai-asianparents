import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home page', () => {
  it('renders hero copy', () => {
    render(<Home />);
    expect(screen.getByText('AI 严父 控制台')).toBeInTheDocument();
    expect(screen.getByText('进入仪表盘')).toBeInTheDocument();
  });
});
