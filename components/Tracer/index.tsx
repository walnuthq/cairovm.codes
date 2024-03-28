import { useContext, useEffect, useState, useRef, useReducer } from 'react'

import cn from 'classnames'
import { Priority, useRegisterActions } from 'kbar'

import {
  CairoVMApiContext,
  BreakPoints,
  ProgramExecutionState,
} from 'context/cairoVMApiContext'

import Console from '../Editor/Console'

import ExecutionStatus from './ExecutionStatus'

export interface Instruction {
  ap_update: string
  dst_register: string
  fp_update: string
  off0: string
  off1: string
  off2: string
  op0_register: string
  op1_addr: string
  opcode: string
  pc_update: string
  res: string
}

export interface TraceEntry {
  pc: number
  ap: number
  fp: number
}

export interface CallstackEntry {
  fp: number
  call_pc: number | null
  ret_pc: number | null
  fn_name: string | null
}

export type SierraVariables = { [key: string]: Array<string> }

export interface TracerData {
  pcInstMap: { [key: string]: Instruction }
  trace: TraceEntry[]
  callstack: CallstackEntry[][]
  memory: { [key: string]: string }
  pcToInstIndexesMap: { [key: string]: number }
  entryToSierraVarsMap: { [key: string]: SierraVariables }
}

enum IConsoleTab {
  Console = 'debug-console',
  DebugInfo = 'output',
}

interface TracerProps {
  mainHeight: number
}

export const Tracer = ({ mainHeight }: TracerProps) => {
  const {
    executionState,
    tracerData,
    breakPoints,
    onExecutionStepChange,
    onContinueExecution,
    executionTraceStepNumber,
    addBreakPoint,
    removeBreakPoint,
  } = useContext(CairoVMApiContext)

  const trace = tracerData?.trace
  const currentTraceEntry = tracerData?.trace[executionTraceStepNumber]
  const errorTraceEntry =
    executionState === ProgramExecutionState.Error
      ? tracerData?.trace.at(-2)
      : null
  const currentCallstackEntry = tracerData?.callstack[executionTraceStepNumber]

  const [selectedConsoleTab, setSelectedConsoleTab] = useState<IConsoleTab>(
    IConsoleTab.Console,
  )

  const consoleHeight = 150

  const [currentFocus, setCurrentFocus] = useReducer(
    (state: any, newIdx: number) => {
      state = {
        idx: newIdx,
        incrementCounter: state.incrementCounter + 1,
      }

      return state
    },
    { idx: 0, incrementCounter: 0 },
  )

  const handleRegisterPointerClick = (num: number) => {
    setCurrentFocus(num)
  }

  useEffect(() => {
    const element = tableRef.current?.querySelector(
      '#focus_row',
    ) as HTMLElement | null
    if (tableRef.current && element?.offsetTop) {
      tableRef.current.scrollTo({
        top: element.offsetTop - 58,
        behavior: 'smooth',
      })
    }
  }, [currentTraceEntry, currentFocus])

  const tableRef = useRef<HTMLDivElement>(null)

  function stepIn() {
    if (
      !trace ||
      trace.length === 0 ||
      executionTraceStepNumber === trace.length - 1
    ) {
      return
    }
    onExecutionStepChange(executionTraceStepNumber + 1)
    setCurrentFocus(tracerData?.trace[executionTraceStepNumber + 1].pc || 0)
  }

  function stepOut() {
    if (!trace || trace.length === 0 || executionTraceStepNumber === 0) {
      return
    }
    onExecutionStepChange(executionTraceStepNumber - 1)
    setCurrentFocus(tracerData?.trace[executionTraceStepNumber - 1].pc || 0)
  }

  function continueExecution() {
    onContinueExecution()
  }

  function toogleBreakPoint(addr: string) {
    if (!breakPoints) {
      return
    }

    if (breakPoints[addr]) {
      removeBreakPoint(addr)
    } else {
      addBreakPoint(addr)
    }
  }

  const actions = [
    {
      id: 'debugInfo',
      name: 'Debug Info',
      shortcut: ['d'],
      keywords: 'Debug info',
      section: 'Execution',
      perform: () => {
        setSelectedConsoleTab(IConsoleTab.DebugInfo)
      },
      subtitle: 'Switch to Debug Info',
      priority: Priority.HIGH,
    },
    {
      id: 'console',
      name: 'Console',
      shortcut: ['e'],
      keywords: 'Console',
      section: 'Execution',
      perform: () => {
        setSelectedConsoleTab(IConsoleTab.Console)
      },
      subtitle: 'Switch to Console',
      priority: Priority.HIGH,
    },
  ]

  useRegisterActions(actions, [setSelectedConsoleTab])

  return (
    <>
      <div className="flex-grow">
        <div className="border-t md:border-t-0 border-b border-gray-200 dark:border-black-500 flex items-center pl-4 pr-6 h-14">
          <ExecutionStatus
            onStepIn={stepIn}
            onStepOut={stepOut}
            onContinueExecution={continueExecution}
          />
        </div>
        {tracerData && currentTraceEntry && trace && breakPoints && (
          <div
            ref={tableRef}
            className="overflow-auto pane grow pane-light relative bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-black-500"
            style={{ height: mainHeight }}
          >
            <InstructionsTable
              memory={tracerData.memory}
              pcInstMap={tracerData.pcInstMap}
              currentTraceEntry={currentTraceEntry}
              currentFocus={currentFocus.idx}
              breakpoints={breakPoints}
              toogleBreakPoint={toogleBreakPoint}
              errorTraceEntry={
                executionState === ProgramExecutionState.Error
                  ? errorTraceEntry
                  : null
              }
            />
          </div>
        )}
      </div>
      <div className="border-gray-200 border-t dark:border-black-500 flex-none overflow-hidden mb-[10px] h-[22vh]">
        <div className="px-4">
          <nav className="-mb-px uppercase flex space-x-8" aria-label="Tabs">
            <button
              className={`hover:text-gray-700 whitespace-nowrap border-b py-1 mt-2 mb-4 text-xs font-thin ${cn(
                {
                  'border-indigo-600 text-gray-700':
                    selectedConsoleTab === IConsoleTab.DebugInfo,
                  'border-transparent text-gray-500':
                    selectedConsoleTab !== IConsoleTab.DebugInfo,
                },
              )}`}
              onClick={() => setSelectedConsoleTab(IConsoleTab.DebugInfo)}
            >
              Debug Info [d]
            </button>
            <button
              onClick={() => setSelectedConsoleTab(IConsoleTab.Console)}
              className={`hover:text-gray-700 whitespace-nowrap border-b py-1 mt-2 mb-4 text-xs font-thin ${cn(
                {
                  'border-indigo-600 text-gray-700':
                    selectedConsoleTab === IConsoleTab.Console,
                  'border-transparent text-gray-500':
                    selectedConsoleTab !== IConsoleTab.Console,
                },
              )}`}
            >
              Console [e]
            </button>
          </nav>
        </div>
        <div
          className="pane pane-light overflow-auto"
          style={{ height: consoleHeight }}
        >
          {selectedConsoleTab === IConsoleTab.Console && <Console />}

          {selectedConsoleTab === IConsoleTab.DebugInfo && (
            <DebugInfoTab
              trace={trace}
              currentTraceEntry={currentTraceEntry}
              executionTraceStepNumber={executionTraceStepNumber}
              currentCallstackEntry={currentCallstackEntry}
              handleRegisterPointerClick={handleRegisterPointerClick}
            />
          )}
        </div>
      </div>
    </>
  )
}

function DebugInfoTab({
  trace,
  currentTraceEntry,
  currentCallstackEntry,
  executionTraceStepNumber,
  handleRegisterPointerClick,
}: {
  trace: TraceEntry[] | undefined
  currentTraceEntry: TraceEntry | undefined
  currentCallstackEntry?: CallstackEntry[]
  executionTraceStepNumber: number
  handleRegisterPointerClick: (num: number) => void
}) {
  return (
    <div className="px-4 pb-4">
      {trace === undefined ? (
        <p className="text-mono text-tiny text-gray-400 dark:text-gray-500">
          Run the app to get debug info
        </p>
      ) : (
        <dl className="text-2xs">
          <div className="flex flex-col lg:flex-row justify-between">
            <div>
              <dt className="mb-1 text-gray-500 dark:text-gray-400 font-medium uppercase">
                Registers
              </dt>
              <dd className="font-mono mb-2 flex gap-1">
                <button
                  onClick={() => {
                    handleRegisterPointerClick(currentTraceEntry?.pc as number)
                  }}
                  className="font-mono inline-block border px-2 py-1 mb-1 cursor-pointer rounded-sm break-all text-tiny border-gray-300 dark:border-gray-700 text-gray-500 hover:text-fuchsia-700 hover:border-fuchsia-700"
                >
                  PC: {currentTraceEntry?.pc}
                </button>
                <button
                  onClick={() => {
                    handleRegisterPointerClick(currentTraceEntry?.fp as number)
                  }}
                  className="font-mono inline-block border px-2 py-1 mb-1 rounded-sm break-all cursor-pointer text-tiny border-gray-300 dark:border-gray-700 text-gray-500 hover:text-green-700 hover:border-green-700"
                >
                  FP: {currentTraceEntry?.fp}
                </button>
                <button
                  onClick={() => {
                    handleRegisterPointerClick(currentTraceEntry?.ap as number)
                  }}
                  className="font-mono inline-block border px-2 py-1 mb-1 rounded-sm break-all cursor-pointer text-tiny border-gray-300 dark:border-gray-700 text-gray-500 hover:text-orange-700 hover:border-orange-700"
                >
                  AP: {currentTraceEntry?.ap}
                </button>
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-gray-500 dark:text-gray-400 font-medium uppercase">
                Execution steps
              </dt>
              <dd className="font-mono mb-2">
                <div className="font-mono inline-block border px-2 py-1 mb-1 rounded-sm break-all text-tiny border-gray-300 dark:border-gray-700 text-gray-500">
                  Current: {executionTraceStepNumber + 1}, Total:{' '}
                  {trace?.length}
                </div>
              </dd>
            </div>
          </div>
          <div>
            <dt className="mb-1 text-gray-500 dark:text-gray-400 font-medium uppercase">
              Callstack
            </dt>
            <dd className="font-mono mb-2">
              <table className="w-full font-mono text-tiny border border-gray-300 dark:border-black-500">
                <thead>
                  <tr className="text-left sticky top-0 bg-gray-50 dark:bg-black-600 text-gray-400 dark:text-gray-600 border-b border-gray-300 dark:border-black-500">
                    <th className="py-1 px-2 font-thin">FP</th>
                    <th className="py-1 px-2 font-thin">CALL PC</th>
                    <th className="py-1 px-2 font-thin">RET PC</th>
                    <th className="py-1 px-2 font-thin">FN NAME</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCallstackEntry?.map((callstackEntry, index) => (
                    <tr
                      key={index}
                      className="relative border-b border-gray-300 dark:border-black-500 text-gray-400 dark:text-gray-600"
                    >
                      <td className="py-1 px-2">{callstackEntry.fp}</td>
                      <td className="py-1 px-2">{callstackEntry.call_pc}</td>
                      <td className="py-1 px-2">{callstackEntry.ret_pc}</td>
                      <td className="py-1 px-2">{callstackEntry.fn_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </dd>
          </div>
        </dl>
      )}
    </div>
  )
}

function InstructionsTable({
  memory,
  pcInstMap,
  currentTraceEntry,
  currentFocus,
  breakpoints,
  toogleBreakPoint,
  errorTraceEntry,
}: {
  memory: TracerData['memory']
  pcInstMap: TracerData['pcInstMap']
  currentTraceEntry: TraceEntry
  currentFocus: number
  breakpoints: BreakPoints
  toogleBreakPoint: (addr: string) => void
  errorTraceEntry?: TraceEntry | null
}) {
  const { pc, ap, fp } = currentTraceEntry
  const errorPc = errorTraceEntry?.pc || 0

  const [hoveredAddr, setHoveredAddr] = useState<string>('')

  return (
    <table className="w-full font-mono text-tiny">
      <thead>
        <tr className="sticky top-0 z-10 text-left bg-gray-50 dark:bg-black-600 text-gray-400 dark:text-gray-600 border-b border-gray-200 dark:border-black-500">
          <th className="py-1"></th>
          <th className="py-1"></th>
          <th className="py-1"></th>
          <th className="py-1 px-2 font-thin">memory</th>
          <th className="py-1 px-2 font-thin">opcode</th>
          <th className="py-1 px-2 font-thin">off0</th>
          <th className="py-1 px-2 font-thin">off1</th>
          <th className="py-1 px-2 font-thin">off2</th>
          <th className="py-1 px-2 font-thin">dst</th>
          <th className="py-1 px-2 font-thin">op0</th>
          <th className="py-1 px-2 font-thin">op1</th>
          <th className="py-1 px-2 font-thin">res</th>
          <th className="py-1 px-2 font-thin">pc_update</th>
          <th className="py-1 px-2 font-thin">ap_update</th>
          <th className="py-1 px-2 font-thin">fp_update</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(memory).map((addr) => {
          const isCurrent = pc.toString() == addr
          const isError = errorPc.toString() == addr
          const addrNum = Number(addr)
          const isFocus = currentFocus == addrNum
          const hasBreakpoint = breakpoints[addr]
          return (
            <tr
              key={addr}
              id={isFocus ? 'focus_row' : undefined}
              className={cn(
                'relative border-b border-gray-200 dark:border-black-500',
                {
                  'text-gray-900 dark:text-gray-200': isCurrent,
                  'text-gray-400 dark:text-gray-600': !isCurrent,
                  'bg-red-100 dark:bg-red-500/10': isError,
                },
              )}
              onMouseEnter={() => setHoveredAddr(addr)}
              onMouseLeave={() => setHoveredAddr('')}
            >
              <td className="pl-4 pr-2">
                <button
                  onClick={() => toogleBreakPoint(addr)}
                  className={cn(
                    'absolute block top-2 left-2 w-2 h-2 z-10 rounded-full',
                    {
                      'bg-red-300': hoveredAddr === addr,
                      'hover:bg-red-300': !hasBreakpoint,
                      'bg-red-500': hasBreakpoint,
                    },
                  )}
                />
              </td>
              <td className="pr-2">
                {addrNum === pc && (
                  <span className="text-fuchsia-700">[pc]</span>
                )}
                {addrNum === ap && (
                  <span className="text-orange-700">[ap]</span>
                )}
                {addrNum === fp && <span className="text-green-700">[fp]</span>}
              </td>
              <td className="py-1 px-2 whitespace-nowrap">{addr}</td>
              <td className="py-1 px-2 max-w-40 break-words">{memory[addr]}</td>
              {pcInstMap[addr] && (
                <>
                  <td className="py-1 px-2">{pcInstMap[addr].opcode}</td>
                  <td className="py-1 px-2">{pcInstMap[addr].off0}</td>
                  <td className="py-1 px-2">{pcInstMap[addr].off1}</td>
                  <td className="py-1 px-2">{pcInstMap[addr].off2}</td>
                  <td className="py-1 px-2">{pcInstMap[addr].dst_register}</td>
                  <td className="py-1 px-2">{pcInstMap[addr].op0_register}</td>
                  <td className="py-1 px-2">{pcInstMap[addr].op1_addr}</td>
                  <td className="py-1 px-2">{pcInstMap[addr].res}</td>
                  <td className="py-1 px-2">{pcInstMap[addr].pc_update}</td>
                  <td className="py-1 px-2">{pcInstMap[addr].ap_update}</td>
                  <td className="py-1 px-2">{pcInstMap[addr].fp_update}</td>
                </>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
