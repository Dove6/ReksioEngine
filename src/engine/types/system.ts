import { Type } from './index'
import { SystemDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'

export class System extends Type<SystemDefinition> {
    @method()
    GETDATE(): number {
        const date = new Date()
        return date.getDate() - 0xf41db + (date.getMonth() + (date.getFullYear() - 1900) * 100) * 100
    }

    @method()
    GETYEAR(): number {
        return new Date().getUTCFullYear()
    }

    @method()
    GETHOUR(): number {
        return new Date().getUTCHours()
    }

    @method()
    GETMINUTES(): number {
        return new Date().getUTCMinutes()
    }

    @method()
    GETSECONDS(): number {
        return new Date().getUTCSeconds()
    }

    @method()
    async GETUSERNAME(): Promise<string> {
        const hostname = location.hostname
        if (/(^|\.)itch\.io/i.test(hostname)) {
            return (await fetch('https://itch.io/api/1/me/me').then(r => r.json())).user.username
        }
        return 'Unknown'
    }

    @method()
    async CREATEDIR(dirPath: string): Promise<boolean> {
        await this.engine.filesystem.saveFile(dirPath.replace(/[^\/]+$/i, ''), new ArrayBuffer(0))
        return true
    }
}
