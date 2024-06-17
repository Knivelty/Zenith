export function getEmittedEvents() {
  const eventSystem = globalThis.Simulator.eventSystem;
  return eventSystem.emitted();
}
