import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FpgaCell from '../components/FpgaCell';
import { SelectionProvider } from '../SelectionProvider';
import { SocTotalPowerProvider } from '../SOCTotalPowerProvider';

describe('FpgaCell', () => {
  it('init', () => {
    const component = render(
      <SocTotalPowerProvider>
        <SelectionProvider>
          <FpgaCell power={0} powerWarm={0} powerErr={0} title="test" />
        </SelectionProvider>
      </SocTotalPowerProvider>,
    );
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(component.container.getElementsByClassName('error').length).toBe(1);
    expect(component.container.getElementsByClassName('clickable').length).toBe(1);
  });
});
