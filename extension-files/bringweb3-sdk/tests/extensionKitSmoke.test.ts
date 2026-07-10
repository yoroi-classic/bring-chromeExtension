import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as sourceExports from '../index'
import packageJson from '../package.json'
import manifestJson from '../../test-extension/public/manifest.json'

const packageRoot = process.cwd()
const testExtensionRoot = path.resolve(packageRoot, '../test-extension')
const packageSpecifier = '@bringweb3/chrome-extension-kit'
const expectedExports = [
    'bringInitBackground',
    'bringInitContentScript',
    'getTurnOff',
    'setTurnOff',
    'getPopupEnabled',
    'setPopupEnabled',
] as const

const expectExtensionKitExports = (sdk: Record<string, unknown>) => {
    expect(Object.keys(sdk).filter(exportName => exportName !== 'default').sort()).toEqual([...expectedExports].sort())

    for (const exportName of expectedExports) {
        expect(typeof sdk[exportName]).toBe('function')
    }
}

const readTestExtensionFile = (filePath: string) => {
    return readFileSync(path.join(testExtensionRoot, filePath), 'utf8')
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const expectEntrypointImports = (source: string, exportNames: readonly string[]) => {
    const importPattern = new RegExp(
        `import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${escapeRegExp(packageSpecifier)}['"]`
    )
    const match = source.match(importPattern)
    expect(match).not.toBeNull()

    const importedNames = (match?.[1] ?? '')
        .split(',')
        .map(name => name.trim())
        .filter(Boolean)

    expect(importedNames).toEqual(expect.arrayContaining([...exportNames]))
}

describe('extension kit package smoke', () => {
    it('keeps the source package exports stable', () => {
        expectExtensionKitExports(sourceExports)
    })

    it('points active package metadata at the owned repository', () => {
        expect(packageJson.name).toBe(packageSpecifier)
        expect(packageJson.repository).toEqual({
            type: 'git',
            url: 'https://github.com/yoroi-classic/bring-chromeExtension',
        })
        expect(JSON.stringify(packageJson)).not.toMatch(new RegExp(['em', 'urgo'].join(''), 'i'))
        expect(packageJson.main).toBe('dist/index.js')
        expect(packageJson.module).toBe('dist/index.mjs')
        expect(packageJson.types).toBe('dist/index.d.ts')
    })

    if (process.env.SMOKE_BUILT_PACKAGE === 'true') {
        it('loads the built CommonJS and ESM package entrypoints', async () => {
            const requireFromPackage = createRequire(path.join(packageRoot, 'package.json'))
            const cjsPath = path.resolve(packageRoot, packageJson.main)
            const esmPath = path.resolve(packageRoot, packageJson.module)
            const typesPath = path.resolve(packageRoot, packageJson.types)

            expect(existsSync(cjsPath)).toBe(true)
            expect(existsSync(esmPath)).toBe(true)
            expect(existsSync(typesPath)).toBe(true)

            expectExtensionKitExports(requireFromPackage(cjsPath))
            expectExtensionKitExports(await import(pathToFileURL(esmPath).href))

            const typeDefinitions = readFileSync(typesPath, 'utf8')
            for (const exportName of expectedExports) {
                expect(typeDefinitions).toContain(exportName)
            }
        })
    }
})

describe('mock extension fixture smoke', () => {
    it('keeps the generated manifest surfaces used by the SDK', () => {
        expect(manifestJson.manifest_version).toBe(3)
        expect(manifestJson.name).toBe('Bring Mock Extension')
        expect(manifestJson.background.service_worker).toBe('background.js')
        expect(manifestJson.action.default_popup).toBe('popup.html')
        expect(manifestJson.permissions).toEqual(expect.arrayContaining(['storage', 'tabs']))
        expect(manifestJson.host_permissions).toEqual(['https://*.bringweb3.io/*'])
        expect(manifestJson.content_scripts).toEqual([
            {
                run_at: 'document_start',
                matches: ['<all_urls>'],
                js: ['contentScript.js'],
                all_frames: true,
            },
        ])

        for (const iconPath of Object.values(manifestJson.icons)) {
            expect(existsSync(path.join(testExtensionRoot, 'public', iconPath))).toBe(true)
        }
    })

    it('keeps shared extension entrypoints wired to public SDK exports', () => {
        expectEntrypointImports(readTestExtensionFile('src/background.js'), ['bringInitBackground'])
        expectEntrypointImports(readTestExtensionFile('src/contentScript.js'), ['bringInitContentScript'])
        expectEntrypointImports(readTestExtensionFile('src/popup.js'), [
            'getTurnOff',
            'setTurnOff',
            'getPopupEnabled',
            'setPopupEnabled',
        ])

        expect(readTestExtensionFile('src/background.js')).toContain(
            "whitelistEndpoint: 'https://media.bringweb3.io/tests/redirects.json'"
        )
    })
})
