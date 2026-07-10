import { ParentType, Type } from './index'
import { KeyboardDefinition, MusicDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { method } from '../../common/types'
import { logger } from '../logging'

const keysMapping = {
    F1: 'F1',
    F2: 'F2',
    F3: 'F3',
    F4: 'F4',
    F5: 'F5',
    F6: 'F6',
    F7: 'F7',
    F8: 'F8',
    F9: 'F9',
    F10: 'F10',
    F11: 'F11',
    F12: 'F12',
    Escape: 'ESC',
    Insert: 'INSERT',
    Delete: 'DELETE',
    PageUp: 'PGUP',
    PageDown: 'PGDN',
    Home: 'HOME',
    End: 'END',
    ArrowLeft: 'LEFT',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowRight: 'RIGHT',
    CapsLock: 'CAPSLOCK',
    ShiftLeft: 'LSHIFT',
    ShiftRight: 'RSHIFT',
    ControlLeft: 'LCTRL',
    ControlRight: 'RCTRL',
    AltLeft: 'LALT',
    AltRight: 'RALT',
    Enter: 'ENTER',
    Space: 'SPACE',
    Tab: 'TAB',
	KeyQ: 'Q',
    KeyW: 'W',
    KeyE: 'E',
    KeyR: 'R',
    KeyT: 'T',
    KeyY: 'Y',
    KeyU: 'U',
    KeyI: 'I',
    KeyO: 'O',
    KeyP: 'P',
    KeyA: 'A',
    KeyS: 'S',
    KeyD: 'D',
    KeyF: 'F',
    KeyG: 'G',
    KeyH: 'H',
    KeyJ: 'J',
    KeyK: 'K',
    KeyL: 'L',
    KeyZ: 'Z',
    KeyX: 'X',
    KeyC: 'C',
    KeyV: 'V',
    KeyB: 'B',
    KeyN: 'N',
    KeyM: 'M',
    Digit1: '1',
    Digit2: '2',
    Digit3: '3',
    Digit4: '4',
    Digit5: '5',
    Digit6: '6',
    Digit7: '7',
    Digit8: '8',
    Digit9: '9',
    Digit0: '0',
    Numpad1: '1',
    Numpad2: '2',
    Numpad3: '3',
    Numpad4: '4',
    Numpad5: '5',
    Numpad6: '6',
    Numpad7: '7',
    Numpad8: '8',
    Numpad9: '9',
    Numpad0: '0'
} as any

type KeyState = { name: string; state: boolean }

export class Keyboard extends Type<KeyboardDefinition> {
    private keysState = new Map<string, boolean>()
    private changeQueue: KeyState[] = []
    private enabled: boolean = true
    private autoRepeat: boolean = false
    private latestKey: string = ''

    private readonly onKeyDownCallback: (event: KeyboardEvent) => void
    private readonly onKeyUpCallback: (event: KeyboardEvent) => void

    constructor(engine: Engine, parent: ParentType<any> | null, definition: KeyboardDefinition) {
        super(engine, parent, definition)
        this.onKeyDownCallback = this.onKeyDown.bind(this)
        this.onKeyUpCallback = this.onKeyUp.bind(this)
    }

    async ready() {
        window.addEventListener('keydown', this.onKeyDownCallback)
        window.addEventListener('keyup', this.onKeyUpCallback)
    }

    destroy() {
        window.removeEventListener('keydown', this.onKeyDownCallback)
        window.removeEventListener('keyup', this.onKeyUpCallback)
    }

    async tick() {
        for (const change of this.changeQueue) {
            if (change.state) {
                await this.callbacks.run('ONKEYDOWN', change.name)
            } else {
                await this.callbacks.run('ONKEYUP', change.name)
            }
        }
        this.changeQueue = []
    }

    @method()
    DISABLE() {
        this.enabled = false
    }

    @method()
    ISKEYDOWN(keyName: string) {
        if (this.keysState.has(keyName)) {
            return this.keysState.get(keyName)!
        }
        return false
    }

    @method()
    ISENABLED() {
        return this.enabled
    }

    @method()
    GETLATESTKEY(): string {
        return this.latestKey
    }

    @method()
    SETAUTOREPEAT(state: boolean) {
        this.autoRepeat = state
    }

    private onKeyDown(event: KeyboardEvent) {
        if (!this.autoRepeat && this.keysState.get(keysMapping[event.code])) {
            return
        }

        if (this.enabled) {
            this.setKeyState(event.code, true)
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (this.enabled) {
            this.setKeyState(event.code, false)
        }
    }

    private setKeyState(keyCode: string, value: boolean) {
        const mapped = keysMapping[keyCode]
        if (!mapped) {
            logger.warn(`Unsupported keyboard key code ${keyCode}`, {
                supportedKeys: Object.keys(keysMapping),
            })
            return
        }
        if (value)
            this.latestKey = mapped
        this.keysState.set(mapped, value)
        this.changeQueue.push({ name: mapped, state: value })
    }
}
