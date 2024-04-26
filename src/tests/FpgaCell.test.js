import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FpgaCell from '../components/FpgaCell';
import { SelectionProvider } from '../SelectionProvider';
import { SocTotalPowerProvider } from '../SOCTotalPowerProvider';
import { GlobalStateProvider } from '../GlobalStateProvider';

describe('FpgaCell', () => {
  it('init', () => {
    const component = render(
      <GlobalStateProvider>
        <SocTotalPowerProvider>
          <SelectionProvider>
            <FpgaCell power={0} messages={[[{type: 'error', text: 'error text'}]]} title="test" />
          </SelectionProvider>
        </SocTotalPowerProvider>
      </GlobalStateProvider>,
    );
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(component.container.getElementsByClassName('error').length).toBe(1);
    expect(component.container.getElementsByClassName('clickable').length).toBe(1);
  });
});
