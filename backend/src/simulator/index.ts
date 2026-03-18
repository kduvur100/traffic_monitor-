import { config } from '../config/index.js';
import { NetworkEvent } from '../types/index.js';
import {
  generateNormalEvent,
  generatePortScanBurst,
  generateBruteForceBurst,
  generateDDoSBurst,
  generateDataExfilBurst,
} from './scenarios.js';

type EventCallback = (events: NetworkEvent[]) => void;

export class TrafficSimulator {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: EventCallback[] = [];

  /** Register a callback that fires every tick with the new batch of events. */
  onEvents(cb: EventCallback) {
    this.listeners.push(cb);
  }

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const events = this.generateTick();
      this.listeners.forEach((cb) => cb(events));
    }, config.simulatorIntervalMs);

    console.log(`[Simulator] started — interval ${config.simulatorIntervalMs}ms`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private generateTick(): NetworkEvent[] {
    // Always produce 3-8 normal events
    const count = Math.floor(Math.random() * 6) + 3;
    const events: NetworkEvent[] = Array.from({ length: count }, generateNormalEvent);

    // Occasionally inject an attack scenario
    if (Math.random() < config.attackScenarioChance) {
      const scenario = Math.random();
      if (scenario < 0.25) events.push(...generatePortScanBurst());
      else if (scenario < 0.5) events.push(...generateBruteForceBurst());
      else if (scenario < 0.75) events.push(...generateDDoSBurst());
      else events.push(...generateDataExfilBurst());
    }

    return events;
  }
}
