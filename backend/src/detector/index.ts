import { config } from '../config/index.js';
import { Alert, NetworkEvent } from '../types/index.js';
import { rules } from './rules.js';

type AlertCallback = (alert: Alert) => void;

export class AnomalyDetector {
  private listeners: AlertCallback[] = [];

  /** Register a callback that fires whenever a rule produces an alert. */
  onAlert(cb: AlertCallback) {
    this.listeners.push(cb);
  }

  /**
   * Analyse a batch of new events against the detection window.
   * windowEvents should be the rolling buffer already including these events.
   */
  analyse(newEvents: NetworkEvent[], windowEvents: NetworkEvent[]) {
    const cutoff = Date.now() - config.detectionWindowMs;
    const window = windowEvents.filter((e) => e.timestamp >= cutoff);

    // Deduplicate alerts: one per rule per source IP per window
    const fired = new Set<string>();

    for (const event of newEvents) {
      for (const rule of rules) {
        if (!rule.enabled) continue;

        const dedupeKey = `${rule.id}:${event.srcIp}`;
        if (fired.has(dedupeKey)) continue;

        const alert = rule.check(event, window);
        if (alert) {
          fired.add(dedupeKey);
          this.listeners.forEach((cb) => cb(alert));
        }
      }
    }
  }
}
