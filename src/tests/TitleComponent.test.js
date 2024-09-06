    import React from 'react';
    import { render, screen } from '@testing-library/react';
    import '@testing-library/jest-dom';
    import TitleComponent from '../components/TitleComponent';
    import { fixed } from '../utils/common';

    // Mock the `fixed` function used inside the component
    jest.mock('../utils/common', () => ({
    fixed: jest.fn((value, decimal = 2) => value.toFixed(decimal)),
    }));

    describe('TitleComponent', () => {
    const mockProps = {
        title: 'Power Usage',
        staticText: 'Static Power',
        dynamicPower: { power: 50.1234, percentage: 40.5678 },
        staticPower: { power: 30.9876, percentage: 20.3456 },
        total: { power: 100.9876, percentage: 60.1234 },
    };

    beforeEach(() => {
        render(<TitleComponent {...mockProps} />);
    });

    test('renders the component with correct title', () => {
        expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    });

    test('displays the total power and percentage correctly', () => {
        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText(`${mockProps.total.power.toFixed(2)} W`)).toBeInTheDocument();
        expect(screen.getByText(`${mockProps.total.percentage.toFixed(0)} %`)).toBeInTheDocument();
    });

    test('displays the dynamic power and percentage correctly', () => {
        expect(screen.getByText('Dynamic')).toBeInTheDocument();
        expect(screen.getByText(`${mockProps.dynamicPower.power.toFixed(2)} W`)).toBeInTheDocument();
        expect(screen.getByText(`${mockProps.dynamicPower.percentage.toFixed(0)} %`)).toBeInTheDocument();
    });

    test('displays the static power and percentage correctly', () => {
        expect(screen.getByText(mockProps.staticText)).toBeInTheDocument();
        expect(screen.getByText(`${mockProps.staticPower.power.toFixed(2)} W`)).toBeInTheDocument();
        expect(screen.getByText(`${mockProps.staticPower.percentage.toFixed(0)} %`)).toBeInTheDocument();
    });
    });
