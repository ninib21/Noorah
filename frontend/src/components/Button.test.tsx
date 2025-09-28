import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
import Button from './Button';

describe('Button Component', () => {
  const defaultProps = {
    title: 'Test Button',
    onPress: jest.fn(),
  };

  it('renders correctly with default props', () => {
    const { getByText } = render(<Button {...defaultProps} />);
    
    const button = getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button {...defaultProps} onPress={onPressMock} />
    );
    
    const button = getByText('Test Button');
    fireEvent.press(button);
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    const { getByText, rerender } = render(<Button {...defaultProps} />);
    
    // Test primary variant (default)
    let button = getByText('Test Button');
    expect(button).toBeTruthy();
    
    // Test secondary variant
    rerender(<Button {...defaultProps} variant="secondary" />);
    button = getByText('Test Button');
    expect(button).toBeTruthy();
    
    // Test outline variant
    rerender(<Button {...defaultProps} variant="outline" />);
    button = getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { getByText, rerender } = render(<Button {...defaultProps} />);
    
    // Test default size
    let button = getByText('Test Button');
    expect(button).toBeTruthy();
    
    // Test small size
    rerender(<Button {...defaultProps} size="small" />);
    button = getByText('Test Button');
    expect(button).toBeTruthy();
    
    // Test large size
    rerender(<Button {...defaultProps} size="large" />);
    button = getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('disables button when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button {...defaultProps} onPress={onPressMock} disabled={true} />
    );
    
    const button = getByText('Test Button');
    fireEvent.press(button);
    
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows loading state when loading prop is true', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button {...defaultProps} loading={true} />
    );
    
    // Should not show title text when loading
    expect(queryByText('Test Button')).toBeFalsy();
    
    // Should show ActivityIndicator when loading
    const activityIndicator = UNSAFE_getByType(ActivityIndicator);
    expect(activityIndicator).toBeTruthy();
  });

  it('renders with custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <Button {...defaultProps} style={customStyle} />
    );
    
    const button = getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('renders with icon when provided', () => {
    const { getByText } = render(
      <Button {...defaultProps} icon="star" />
    );
    
    const button = getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('handles long titles correctly', () => {
    const longTitle = 'This is a very long button title that should be handled properly';
    const { getByText } = render(
      <Button {...defaultProps} title={longTitle} />
    );
    
    const button = getByText(longTitle);
    expect(button).toBeTruthy();
  });

  it('renders with accessibility props', () => {
    const { getByText } = render(
      <Button 
        {...defaultProps} 
        accessibilityLabel="Custom accessibility label"
        accessibilityHint="Custom accessibility hint"
      />
    );
    
    const button = getByText('Test Button');
    expect(button).toBeTruthy();
  });
}); 
