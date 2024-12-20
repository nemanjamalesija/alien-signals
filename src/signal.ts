import { ISignal } from './computed.js';
import { Dependency, drainQueuedEffects, link, Link, propagate, System } from './system.js';

export interface IWritableSignal<T = any> extends ISignal<T> {
	set(value: T): void;
}

export function signal<T>(): Signal<T | undefined>;
export function signal<T>(oldValue: T): Signal<T>;
export function signal<T>(oldValue?: T): Signal<T | undefined> {
	return new Signal(oldValue);
}

export class Signal<T = any> implements Dependency {
	// Dependency
	subs: Link | undefined = undefined;
	subsTail: Link | undefined = undefined;

	constructor(
		public currentValue: T
	) { }

	get(): NonNullable<T> {
		const activeTrackId = System.activeTrackId;
		if (activeTrackId > 0) {
			const subsTail = this.subsTail;
			if (subsTail === undefined || subsTail.trackId !== activeTrackId) {
				link(this, System.activeSub!, activeTrackId);
			}
		}
		return this.currentValue!;
	}

	set(value: T): void {
		if (this.currentValue !== (this.currentValue = value)) {
			const subs = this.subs;
			if (subs !== undefined) {
				propagate(subs);
				drainQueuedEffects();
			}
		}
	}
}
