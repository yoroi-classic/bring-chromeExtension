import pJson from '../package.json'
import { ENV_VERSION } from './config'

const getVersion = (): string => {
    /*
     Local fork fixes are published with versions like N.N.N-fix.N, but the
     Bring backend expects the base version number to respond correctly.

     This means local fork versions MUST always match something like <LAST_OFFICIAL_VERSION>-fix.N
     */
    return (ENV_VERSION || pJson.version).split('-')[0] as string
}

export default getVersion
