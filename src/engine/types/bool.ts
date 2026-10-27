import { ParentType, ValueType } from './index'
import { Engine } from '../index'
import { BoolDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'

export class Bool extends ValueType<BoolDefinition, boolean> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: BoolDefinition) {
        super(engine, parent, definition, false)
    }

    @method()
    // The arguments don't seem to matter
    async SWITCH(arg1: boolean, arg2: boolean) {
        await this.setValue(!this.value)
    }

    @method()
    async GET(): Promise<boolean> {
        return this.value
    }

    @method()
    async SET(newValue: boolean) {
        await this.setValue(newValue)
    }
}
