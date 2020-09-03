import * as fs from 'fs'
import * as childProcess from 'child_process'
import {promisify} from 'util'
import * as path from 'path'

const exec = async (...cmd: string[]) => {
	const cmdFull = cmd.map(str => `"${str}"`).join(' ')
	console.log(`exec [${cmdFull}]`)
	const {stderr, stdout} = await promisify(childProcess.exec)(cmdFull)
	if (stdout) console.log(stdout)
	if (stderr) console.error(stderr)
}
const addPackages = async (packages: Record<string, string> | undefined, flags: string[]) => {
	const list = Object.keys(packages || {})
	if (list.length) await exec(
		'yarn',
		'add',
		...[flags.join(' ')].filter(Boolean),
		...list
	)
}
const main = async () => {
	const rawPackage = await promisify(fs.readFile.bind(fs))(
		path.resolve('./package.json'),
		'utf-8'
	)
	const meta = JSON.parse(rawPackage)
	console.log("Upgrade production packages...")
	await addPackages(meta.dependencies, [])
	console.log("Upgrade development packages...")
	await addPackages(meta.devDependencies, ['-D'])
	console.log("Upgrade peer packages...")
	await addPackages(meta.peerDependencies, ['-P'])
}
main().catch(console.error)
