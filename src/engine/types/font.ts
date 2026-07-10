import { Type } from './index'
import { FontDefinition, FontDefinitionDef } from '../../fileFormats/cnv/types'
import { BitmapFont } from 'pixi.js'
import { FileNotFoundError } from '../../filesystem/fileLoader'
import { logger } from '../logging'

export class Font extends Type<FontDefinition> {
    static readonly fontDefinitionRegex = /^DEF_([a-z0-9]+)_([a-z0-9]+)_(\d+)$/i

    public bitmapFont: BitmapFont | null = null
    public fontFamily: string | null = null
    public fontStyle: string | null = null
    public fontSize: number | null = null

    async init() {
        const fontDefinition = Object.keys(this.definition)
            .map(key => Font.fontDefinitionRegex.exec(key))
            .find(def => def)
        if (!fontDefinition) {
            logger.error('FNT file missing font definition', {
                font: this,
            })
            return
        }
        this.fontFamily = fontDefinition[1]
        this.fontStyle = fontDefinition[2]
        this.fontSize = parseInt(fontDefinition[3])

        const filename: string = this.definition[fontDefinition[0] as FontDefinitionDef]
        try {
            const relativePath =
                this.engine.currentScene !== null
                    ? await this.engine.currentScene.getRelativePath(filename)
                    : await this.engine.resolvePath(filename)
            this.bitmapFont = await this.engine.filesystem.getFNTFile(relativePath, { family: this.fontFamily, style: this.fontStyle, size: this.fontSize })
        } catch (err) {
            if (err instanceof FileNotFoundError) {
                logger.warn(`FNT file not found at "${filename}"`, {
                    font: this,
                })
            }
        }
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }
}
