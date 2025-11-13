import { AppState } from './AppState';
import { AppUI } from './AppUI';

function App() {
  return (
    <AppState>
      {(state) => <AppUI {...state} />}
    </AppState>
  );
}

export default App;