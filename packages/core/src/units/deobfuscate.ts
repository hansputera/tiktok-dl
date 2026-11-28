// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { runObfuscatedScript = __rustAnything_core_rs.runObfuscatedScript; runObfuscatedReplaceEvalScript = __rustAnything_core_rs.runObfuscatedReplaceEvalScript; deObfuscate = __rustAnything_core_rs.deObfuscate; exports.runObfuscatedScript = runObfuscatedScript; exports.runObfuscatedReplaceEvalScript = runObfuscatedReplaceEvalScript; exports.deObfuscate = deObfuscate }
// <<< rust-anything: core-rs
import {NodeVM} from 'vm2';

export function runObfuscatedScript(jsCode: string): string {
    const transformed = jsCode
        .trim()
        .replace('eval', '')
        .replace(/\(function(.)?\(h/gi, 'module.exports = (function (h');
    const deObfuscated = new NodeVM({
        compiler: 'javascript',
        console: 'inherit',
        require: {
            external: true,
            root: './',
        },
    }).run(transformed, 'deobfuscate.js');

    return deObfuscated;
}

export function runObfuscatedReplaceEvalScript(jsCode: string): string {
    return runObfuscatedScript(jsCode.replace('eval', 'module.exports = '));
}

export function deObfuscate(html: string): string {
    if (/error/gi.test(html)) {
        throw new Error(
            html.split("'").find((x) => /(((url)? error)|could)/gi.test(x)),
        );
    } else {
        const obfuscatedScripts = html.match(
            /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        );
        if (!obfuscatedScripts?.length) {
            throw new Error('Cannot download the video!');
        } else {
            return runObfuscatedScript(
                obfuscatedScripts
                    .find((x) => x.length)!
                    .replace(/<(\/)?script( type=".+")?>/g, '')
                    .trim(),
            );
        }
    }
}

export function deObfuscateSaveFromScript(scriptContent: string): string {
    const safeScript =
        'let result = ' + scriptContent.replace(/\/\*js\-response\*\//gi, '');

    const vm = new NodeVM({
        compiler: 'javascript',
        console: 'inherit',
        require: {
            external: true,
            root: './',
        },
    });
    const result = vm.run(safeScript, 'savefrom.js');
    return result;
}
