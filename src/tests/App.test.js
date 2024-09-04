import React from 'react';
import renderer from 'react-test-renderer'; // For snapshot testing
import App from '../App';
import { SelectionProvider } from '../SelectionProvider';
import { SocTotalPowerProvider } from '../SOCTotalPowerProvider';
import { GlobalStateProvider } from '../GlobalStateProvider';

// Mock fetch or other potential asynchronous calls used within the App or its dependencies
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

// ErrorBoundary component for catching rendering errors
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
      return <div>{error}</div>;
    }
    return <>{this.props.children}</>;
  }
}

// Snapshot test to ensure the App renders correctly
it('renders App component correctly', () => {
  const component = renderer.create(
    <ErrorBoundary>
      <GlobalStateProvider>
        <SocTotalPowerProvider>
          <SelectionProvider>
            <App />
          </SelectionProvider>
        </SocTotalPowerProvider>
      </GlobalStateProvider>
    </ErrorBoundary>
  );

  // Convert component to JSON and take a snapshot
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
