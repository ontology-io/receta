// Publishes the static export: uploads out/ to R2, then deploys the Worker that serves
// it. Fingerprinted files go first and pages last, so a page never points at a file that
// isn't there yet. Old fingerprinted files stay, so a tab that's already open keeps
// working. Run `bun run deploy`. Start at deploy.
import { mapAsync } from '@ontologyio/receta/async'
import { match as matchOption } from '@ontologyio/receta/option'
import {
  collect,
  err,
  flatMap,
  isErr,
  mapErr,
  match,
  ok,
  type Result,
} from '@ontologyio/receta/result'
import { $, Glob } from 'bun'
import * as R from 'remeda'
import { cacheControl, contentType, isFingerprinted } from '../src/lib/hosting/objects'

const BUCKET = 'receta-website'
const OUT_DIR = 'out'

// Each upload starts its own wrangler process, so more than a few just queue for CPU.
const UPLOADS_AT_ONCE = 6

type DeployError = {
  readonly code: 'UNKNOWN_FILE_TYPE' | 'UPLOAD_FAILED' | 'WORKER_DEPLOY_FAILED'
  readonly message: string
}

type Upload = { readonly key: string; readonly type: string; readonly cache: string }

/**
 * Uploads the export and deploys the Worker.
 *
 * Fails with UNKNOWN_FILE_TYPE before anything is uploaded, UPLOAD_FAILED when a file
 * doesn't reach R2, or WORKER_DEPLOY_FAILED. Running it again is always safe.
 */
const deploy = async (): Promise<Result<string, DeployError>> => {
  const planned = planUploads(await listExport())
  if (isErr(planned)) return planned
  const [assets, pages] = R.partition(planned.value, ({ key }) => isFingerprinted(key))
  const uploadedAssets = await uploadAll(assets)
  if (isErr(uploadedAssets)) return uploadedAssets
  const uploadedPages = await uploadAll(pages)
  if (isErr(uploadedPages)) return uploadedPages
  return deployWorker()
}

const listExport = (): Promise<string[]> =>
  Array.fromAsync(new Glob('**/*').scan({ cwd: OUT_DIR, onlyFiles: true }))

const planUploads = (keys: readonly string[]): Result<Upload[], DeployError> =>
  collect(R.map(keys, planUpload))

const planUpload = (key: string): Result<Upload, DeployError> =>
  matchOption(contentType(key), {
    onSome: (type): Result<Upload, DeployError> => ok({ key, type, cache: cacheControl(key) }),
    onNone: () => err({ code: 'UNKNOWN_FILE_TYPE', message: `No content type for ${key}` }),
  })

const uploadAll = async (uploads: readonly Upload[]): Promise<Result<string[], DeployError>> =>
  R.pipe(
    await mapAsync(uploads, uploadFile, { concurrency: UPLOADS_AT_ONCE }),
    mapErr(toUploadError),
    flatMap((outcomes) => collect(outcomes)),
  )

const toUploadError = ({ item }: { readonly item: unknown }): DeployError => ({
  code: 'UPLOAD_FAILED',
  message: `Could not start the upload of ${JSON.stringify(item)}`,
})

const uploadFile = async ({ key, type, cache }: Upload): Promise<Result<string, DeployError>> => {
  const { exitCode, stderr } =
    await $`bunx wrangler r2 object put ${`${BUCKET}/${key}`} --file ${`${OUT_DIR}/${key}`} --content-type ${type} --cache-control ${cache} --remote`
      .nothrow()
      .quiet()
  return exitCode === 0
    ? ok(key)
    : err({ code: 'UPLOAD_FAILED', message: `${key}: ${stderr.toString()}` })
}

const deployWorker = async (): Promise<Result<string, DeployError>> => {
  const { exitCode, stdout, stderr } = await $`bunx wrangler deploy`.nothrow().quiet()
  return exitCode === 0
    ? ok(stdout.toString())
    : err({ code: 'WORKER_DEPLOY_FAILED', message: stderr.toString() })
}

match(await deploy(), {
  onOk: (workerOutput) => console.log(workerOutput),
  onErr: ({ code, message }) => {
    console.error(`${code}: ${message}`)
    process.exitCode = 1
  },
})
