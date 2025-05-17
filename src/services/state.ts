// Simple state management for app-wide state

type Listener<T> = (value: T) => void;

class StateManager<T> {
  private value: T;
  private listeners: Set<Listener<T>> = new Set();
  
  constructor(initialValue: T) {
    this.value = initialValue;
  }
  
  getValue(): T {
    return this.value;
  }
  
  setValue(newValue: T): void {
    this.value = newValue;
    this.notifyListeners();
  }
  
  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.value));
  }
}

// App mode state
class AppModeState {
  private state: StateManager<'admin' | 'reader'>;
  
  constructor(initialMode: 'admin' | 'reader') {
    this.state = new StateManager<'admin' | 'reader'>(initialMode);
  }
  
  getMode(): 'admin' | 'reader' {
    return this.state.getValue();
  }
  
  setMode(mode: 'admin' | 'reader'): void {
    this.state.setValue(mode);
  }
  
  subscribe(listener: Listener<'admin' | 'reader'>): () => void {
    return this.state.subscribe(listener);
  }
}

export const appModeState = new AppModeState('admin');