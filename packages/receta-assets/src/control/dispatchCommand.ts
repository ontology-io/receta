import * as R from 'remeda'
import { by, eq } from '@ontologyio/receta/predicate'
import { fromNullable, map, type Result } from '@ontologyio/receta/result'

export type DispatchCommandInput<A> = {
  readonly name: string
  readonly args: A
}

export type DispatchCommandError = {
  readonly code: 'UNKNOWN_COMMAND'
  readonly input: string
  /** The command names the table does handle, for a "did you mean" or a help line. */
  readonly known: readonly string[]
  readonly message: string
}

/**
 * Runs the handler registered under a command's name, or says the command is unknown.
 *
 * Use when: a CLI, a chat bot's slash commands, a job queue or an RPC endpoint maps a name that
 * arrives as text to a function. Only the table's own keys count, so a name such as
 * `constructor` or `toString` is unknown instead of reaching `Object.prototype`. Names match
 * exactly, case included. The handler's return value comes back in `Ok`.
 *
 * @example
 * ```ts
 * const commands = {
 *   deploy: (args: readonly string[]) => `deploying ${R.join(args, ' ')}`,
 *   status: () => 'all green',
 * }
 *
 * dispatchCommand({ name: 'deploy', args: ['web', 'staging'] }, commands)
 * // => Ok('deploying web staging')
 *
 * dispatchCommand({ name: 'toString', args: [] }, commands)
 * // => Err({ code: 'UNKNOWN_COMMAND', input: 'toString', known: ['deploy', 'status'], message: 'Unknown command "toString". Known commands: deploy, status' })
 *
 * R.pipe({ name: 'status', args: [] }, dispatchCommand(commands))
 * // => Ok('all green')
 * ```
 *
 * @tags dispatch, command, cli, slash command, handler, router, rpc, lookup table
 * @see routeEvent - the same lookup keyed by an event's `type`, `None` when unhandled
 * @see fromNullable - @ontologyio/receta/result, turns a missing handler into the error
 */
export function dispatchCommand<A, U>(
  command: DispatchCommandInput<A>,
  handlers: Readonly<Record<string, (args: A) => U>>,
): Result<U, DispatchCommandError>
export function dispatchCommand<A, U>(
  handlers: Readonly<Record<string, (args: A) => U>>,
): (command: DispatchCommandInput<A>) => Result<U, DispatchCommandError>
export function dispatchCommand(...args: unknown[]): unknown {
  return R.purry(dispatchCommandImplementation, args)
}

const dispatchCommandImplementation = <A, U>(
  command: DispatchCommandInput<A>,
  handlers: Readonly<Record<string, (args: A) => U>>,
): Result<U, DispatchCommandError> => {
  const known = R.keys(handlers)
  const unknownCommand: DispatchCommandError = {
    code: 'UNKNOWN_COMMAND',
    input: command.name,
    known,
    message: `Unknown command "${command.name}". Known commands: ${R.join(known, ', ')}`,
  }
  return R.pipe(
    R.find(R.entries(handlers), by(([name]) => name, eq(command.name))),
    fromNullable(unknownCommand),
    map(([, handler]) => handler(command.args)),
  )
}
