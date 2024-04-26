import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';
import { SelectionProvider } from '../SelectionProvider';
import { SocTotalPowerProvider } from '../SOCTotalPowerProvider';
import { GlobalStateProvider } from '../GlobalStateProvider';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: '' };
  }

  componentDidCatch(error) {
    this.setState({ error: `${error.name}: ${error.message}` });
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div>{error}</div>
      );
    }
    return <>{this.props.children}</>;
  }
}

it('Run main app', () => {
  const component = renderer.create(
    <ErrorBoundary>
      <GlobalStateProvider>
        <SocTotalPowerProvider>
          <SelectionProvider>
            <App />
          </SelectionProvider>
        </SocTotalPowerProvider>
      </GlobalStateProvider>
    </ErrorBoundary>,
  );
});
