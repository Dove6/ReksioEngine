import { ParentType, Type, ValueType } from './index'
import { TimerDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { method } from '../../common/types'
import { assert } from '../../common/errors'

export class Timer extends Type<TimerDefinition> {
    private currentTick: number = 0
    private collectedTime: number = 0

    private elapse: number = 0
    private enabled: boolean = false

    constructor(engine: Engine, parent: ParentType<any> | null, definition: TimerDefinition) {
        super(engine, parent, definition)
    }

    async applyDefaults() {
        if (typeof(this.definition.ELAPSE) === 'number') {
            this.elapse = this.definition.ELAPSE
        } else {
            const object: ValueType<any, any> | null = this.getObject(this.definition.ELAPSE)
            assert(object !== null, 'object referred by ELAPSE should exist')
            this.elapse = Number(await object.getValue())
        }
        this.enabled = this.definition.ENABLED ?? true
    }

    async ready() {
        if (this.enabled) {
            await this.callbacks.run('ONINIT')
        }
        this.RESET()
    }

    destroy() {
        this.DISABLE()
    }

    pause() {
        this.DISABLE()
    }

    resume() {
        this.ENABLE()
    }

    async tick(elapsedMS: number) {
        if (!this.enabled) {
            return
        }

        const ticksLimit = this.definition.TICKS ?? 0
        this.collectedTime += elapsedMS * this.engine.speed

        while (this.collectedTime >= this.elapse) {
            this.collectedTime -= this.elapse
            this.currentTick++

            if (ticksLimit > 0 && this.currentTick >= ticksLimit) {
                this.DISABLE()
                this.collectedTime = 0
            }

            await this.callbacks.run('ONTICK', this.currentTick)
        }
    }

    @method()
    GETTICKS(): number {
        return this.currentTick
    }

    @method()
    SETELAPSE(newElapse: number) {
        this.elapse = newElapse
    }

    @method()
    SET(value: number) {
        // TODO: I don't really see any other effect than reset
        this.RESET()
    }

    @method()
    RESET() {
        this.collectedTime = 0
        this.currentTick = 0
    }

    @method()
    DISABLE() {
        this.enabled = false
    }

    @method()
    ENABLE() {
        this.enabled = true
        this.collectedTime = 0
    }
}
