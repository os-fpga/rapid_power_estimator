import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Preferences from '../preferences';
import '@testing-library/jest-dom';

const mockHandleOk = jest.fn();
const mockHandleCancel = jest.fn();
const mockHandleConfigChange = jest.fn();

const defaultConfig = {
  port: 3000,
  useDefaultFile: false,
  device_xml: '',
};

describe('Preferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the modal with default config and closes it', () => {
    render(
      <Preferences
        isModalOpen={true}
        config={defaultConfig}
        handleOk={mockHandleOk}
        handleCancel={mockHandleCancel}
        handleConfigChange={mockHandleConfigChange}
      />
    );

    const portInput = screen.getByDisplayValue('3000');
    expect(portInput).toBeInTheDocument();

    const deviceInput = screen.getByPlaceholderText('Enter absolute path to device.xml');
    expect(deviceInput).toBeInTheDocument();

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    expect(mockHandleCancel).toHaveBeenCalled();
  });

  test('changing port input triggers config change and warning appears', () => {
    render(
      <Preferences
        isModalOpen={true}
        config={defaultConfig}
        handleOk={mockHandleOk}
        handleCancel={mockHandleCancel}
        handleConfigChange={mockHandleConfigChange}
      />
    );

    const portInput = screen.getByDisplayValue('3000');
    fireEvent.change(portInput, { target: { value: '4000' } });

    expect(mockHandleConfigChange).toHaveBeenCalledWith('port', 4000);

    expect(screen.getByText('Application will be reloaded')).toBeInTheDocument();
  });

  test('renders the OK button', () => {
    render(
      <Preferences
        isModalOpen={true}
        config={defaultConfig}
        handleOk={mockHandleOk}
        handleCancel={mockHandleCancel}
        handleConfigChange={mockHandleConfigChange}
      />
    );

    const okButton = screen.getByText(/OK/i);
    expect(okButton).toBeInTheDocument();
  });
});
