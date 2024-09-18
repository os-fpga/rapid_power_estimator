import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CPUComponent, CPUComponentDisabled } from '../components/CPUComponent'; 
import { fixed } from '../utils/common'; 

describe('CPUComponent', () => {
    const defaultProps = {
      title: 'CPU 1',
      power: 123.456,
      percent: 75,
      name: 'CPU Name',
      ep0: 10,
      ep1: 20,
      ep2: 30,
      ep3: 40,
    };
  
    it('renders CPUComponent with correct values', () => {
      render(<CPUComponent {...defaultProps} />);
      
      expect(screen.getByText('CPU 1')).toBeInTheDocument();
      expect(screen.getByText(`${fixed(123.456, 3)} W`)).toBeInTheDocument();
      expect(screen.getByText(`${fixed(75, 0)} %`)).toBeInTheDocument();
      expect(screen.getByText('CPU Name')).toBeInTheDocument();
      expect(screen.getByText('Endpoint 1')).toBeInTheDocument();
      expect(screen.getByText(`${fixed(10, 3)} W`)).toBeInTheDocument();
      expect(screen.getByText('Endpoint 2')).toBeInTheDocument();
      expect(screen.getByText(`${fixed(20, 3)} W`)).toBeInTheDocument();
      expect(screen.getByText('Endpoint 3')).toBeInTheDocument();
      expect(screen.getByText(`${fixed(30, 3)} W`)).toBeInTheDocument();
      expect(screen.getByText('Endpoint 4')).toBeInTheDocument();
      expect(screen.getByText(`${fixed(40, 3)} W`)).toBeInTheDocument();
    });
  
    it('renders CPUComponentDisabled with title', () => {
      render(<CPUComponentDisabled title="Disabled CPU" />);
      
      expect(screen.getByText('Disabled CPU')).toBeInTheDocument();
      expect(screen.getByText('Not available')).toBeInTheDocument();
    });
  });