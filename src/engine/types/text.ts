import { Type } from './index'
import { TextDefinition } from '../../fileFormats/cnv/types'
import * as PIXI from 'pixi.js'
import { method } from '../../common/types'
import { BitmapText } from 'pixi.js'
import { Font } from './font'

export class Text extends Type<TextDefinition> {
    private text: PIXI.BitmapText | null = null

    async applyDefaults() {
        const font: Font | null = this.getObject(this.definition.FONT)
        if (font === null || font.bitmapFont === null) {
            return
        }

        this.text = new BitmapText(this.definition.TEXT ?? '', {
            fontName: font.bitmapFont.font,
        })

        const [x1, y1, x2, y2] = this.definition.RECT
        this.text.x = x1
        this.text.y = y1
        this.text.width = x2 - x1
        this.text.height = y2 - y1
        this.text.maxWidth = this.text.width
        this.text.anchor.set(0, 0)

        if (this.definition.HJUSTIFY === 'CENTER') {
            this.text.align = 'center'
        } else if (this.definition.HJUSTIFY === 'RIGHT') {
            this.text.align = 'right'
        }

        if (this.definition.HJUSTIFY === 'CENTER') {
            this.text.anchor.set(0, 0.5)
            this.text.y = Math.round((y1 + y2) / 2)
        } else if (this.definition.VJUSTIFY === 'BOTTOM') {
            this.text.anchor.set(0, 1)
            this.text.y = Math.round(y2)
        }

        this.text.visible = this.definition.VISIBLE
        this.text.zIndex = this.definition.PRIORITY ?? this.text.zIndex
        this.engine.rendering.addToStage(this.text)
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    destroy() {
        if (this.text) {
            this.engine.rendering.removeFromStage(this.text)
        }
    }

    @method()
    SETCOLOR(r: number, g: number, b: number) {
        if (this.text) {
            this.text.tint = { r, g, b }
        }
    }

    @method()
    SETTEXT(content: string) {
        if (this.text) {
            this.text.text = content
        }
    }

    @method()
    HIDE() {
        if (this.text) {
            this.text.visible = false
        }
    }

    @method()
    SHOW() {
        if (this.text) {
            this.text.visible = true
        }
    }
}
