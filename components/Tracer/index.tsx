import { memo, useContext, useEffect, useReducer, useRef } from 'react'

import ReactTooltip from 'react-tooltip'
import { TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso'

import { CodeType } from 'context/appUiContext'
import {
  BreakPoints,
  CairoVMApiContext,
  ProgramDebugMode,
  ProgramExecutionState,
} from 'context/cairoVMApiContext'

import { InstructionsTable as SierraInstructionTable } from 'components/Editor/InstructionsTable'

import { cn } from '../../util/styles'

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
  params: { type_name: string; value: number[] }[] | null
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

export const Tracer = () => {
  const {
    executionState,
    tracerData,
    breakPoints,
    onExecutionStepChange,
    onContinueExecution,
    executionTraceStepNumber,
    addBreakPoint,
    removeBreakPoint,
    debugMode,
    sierraStatements,
    casmToSierraProgramMap,
    errorCasmInstructionIndex,
    currentSierraVariables,
    activeSierraIndexes,
  } = useContext(CairoVMApiContext)

  const trace = tracerData?.trace
  const currentTraceEntry = tracerData?.trace[executionTraceStepNumber]
  const errorTraceEntry =
    executionState === ProgramExecutionState.Error
      ? tracerData?.trace.at(-2)
      : null
  const currentCallstackEntry = tracerData?.callstack[executionTraceStepNumber]

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
    setCurrentFocus(tracerData?.trace[executionTraceStepNumber]?.pc || 0)
  }, [executionTraceStepNumber, tracerData?.trace])

  function stepIn() {
    if (
      !trace ||
      trace.length === 0 ||
      executionTraceStepNumber === trace.length - 1
    ) {
      return
    }
    onExecutionStepChange('increase')
  }

  function stepOut() {
    if (!trace || trace.length === 0 || executionTraceStepNumber === 0) {
      return
    }
    onExecutionStepChange('decrease')
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

  return (
    <>
      <div className="border-t dark:bg-darkMode-secondary rounded-r-[inherit] md:border-t-0 border-b border-gray-200 dark:border-black-500 flex items-center pl-4 pr-4 h-14 flex-none">
        <ExecutionStatus
          onStepIn={stepIn}
          onStepOut={stepOut}
          onContinueExecution={continueExecution}
          trace={trace}
          executionTraceStepNumber={executionTraceStepNumber}
        />
      </div>

      {debugMode === ProgramDebugMode.Execution ? (
        tracerData &&
        currentTraceEntry &&
        trace &&
        breakPoints && (
          <div
            className={
              'h-full w-full bg-gray-50 dark:bg-darkMode-primary border-gray-200 dark:border-black-500'
            }
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
        )
      ) : (
        <SierraInstructionTable
          instructions={sierraStatements}
          codeType={CodeType.Sierra}
          activeIndexes={activeSierraIndexes}
          errorIndexes={casmToSierraProgramMap[errorCasmInstructionIndex] ?? []}
          variables={currentSierraVariables || {}}
        />
      )}

      <div className="border-gray-200 border-t dark:bg-darkMode-secondary dark:border-black-500 flex-none pane pane-light overflow-auto h-[22vh]">
        <DebugInfoTab
          debugMode={debugMode}
          trace={trace}
          currentTraceEntry={currentTraceEntry}
          executionTraceStepNumber={executionTraceStepNumber}
          currentCallstackEntry={currentCallstackEntry}
          handleRegisterPointerClick={handleRegisterPointerClick}
        />
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
  debugMode,
}: {
  trace: TraceEntry[] | undefined
  currentTraceEntry: TraceEntry | undefined
  currentCallstackEntry?: CallstackEntry[]
  executionTraceStepNumber: number
  handleRegisterPointerClick: (num: number) => void
  debugMode: ProgramDebugMode
}) {
  return (
    <div className="p-4">
      {trace === undefined ? (
        <p className="text-mono text-tiny text-gray-400 dark:text-gray-500">
          Run the app to get debug info
        </p>
      ) : (
        <dl className="text-2xs">
          {debugMode === ProgramDebugMode.Execution && (
            <div className="flex flex-col lg:flex-row justify-between">
              <div>
                <dt className="mb-1 text-gray-500 dark:text-[#BDBDBD] font-medium uppercase text-[13px] leading-6">
                  Registers
                </dt>
                <dd className="mb-2 flex gap-1">
                  <button
                    onClick={() => {
                      handleRegisterPointerClick(
                        currentTraceEntry?.pc as number,
                      )
                    }}
                    className=" inline-block border px-2 py-1 mb-1 cursor-pointer rounded-sm break-all text-tiny border-gray-300 dark:border-[#46373A] text-gray-500 dark:text-[#BDBDBD] hover:!text-fuchsia-700 hover:!border-fuchsia-700"
                  >
                    PC: {currentTraceEntry?.pc}
                  </button>
                  <button
                    onClick={() => {
                      handleRegisterPointerClick(
                        currentTraceEntry?.fp as number,
                      )
                    }}
                    className=" inline-block border px-2 py-1 mb-1 rounded-sm break-all cursor-pointer text-tiny border-gray-300 dark:border-[#46373A] text-gray-500 dark:text-[#BDBDBD] hover:!text-green-700 hover:!border-green-700"
                  >
                    FP: {currentTraceEntry?.fp}
                  </button>
                  <button
                    onClick={() => {
                      handleRegisterPointerClick(
                        currentTraceEntry?.ap as number,
                      )
                    }}
                    className="inline-block border px-2 py-1 mb-1 rounded-sm break-all cursor-pointer text-tiny border-gray-300 dark:border-[#46373A] text-gray-500 dark:text-[#BDBDBD] hover:!text-orange-700 hover:!border-orange-700"
                  >
                    AP: {currentTraceEntry?.ap}
                  </button>
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-gray-500 dark:text-[#BDBDBD] font-medium uppercase text-[13px] leading-6">
                  Execution steps
                </dt>
                <dd className="mb-2">
                  <div className="inline-block border px-2 py-1 mb-1 rounded-sm break-all text-tiny border-gray-300 dark:border-[#46373A] text-gray-500 dark:text-[#BDBDBD]">
                    Current: {executionTraceStepNumber + 1}, Total:{' '}
                    {trace?.length}
                  </div>
                </dd>
              </div>
            </div>
          )}
          <div>
            <dt className="mb-1 text-gray-500 dark:text-[#BDBDBD] font-medium uppercase text-[13px] leading-6">
              Callstack
            </dt>
            <dd className="font-mono mb-2">
              <table className="w-full font-mono text-tiny border border-gray-300 dark:border-black-500">
                <thead>
                  <tr className="text-left sticky z-[1] top-0 bg-gray-50 dark:bg-black-600 text-gray-400 dark:text-gray-600 border-b border-gray-300 dark:border-black-500">
                    {debugMode === ProgramDebugMode.Execution && (
                      <>
                        <th className="py-1 px-2 font-thin min-w-16">FP</th>
                        <th className="py-1 px-2 font-thin  whitespace-nowrap w-16">
                          CALL PC
                        </th>
                        <th className="py-1 px-2 font-thin whitespace-nowrap w-16">
                          RET PC
                        </th>
                      </>
                    )}
                    <th className="py-1 px-2 font-thin text-left min-w-64">
                      FN NAME
                    </th>
                    <th className="py-1 px-2 font-thin text-left min-w-full">
                      PARAMETERS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentCallstackEntry?.map((callstackEntry, index) => {
                    if (
                      callstackEntry.fn_name ||
                      debugMode === ProgramDebugMode.Execution
                    ) {
                      return (
                        <tr
                          key={index}
                          className="relative border-b border-gray-300 dark:border-black-500 text-gray-400 dark:text-gray-600"
                        >
                          {debugMode === ProgramDebugMode.Execution && (
                            <>
                              <td className="py-1 px-2 min-w-16">
                                {callstackEntry.fp}
                              </td>
                              <td className="py-1 px-2 w-16">
                                {callstackEntry.call_pc}
                              </td>
                              <td className="py-1 px-2 w-16">
                                {callstackEntry.ret_pc}
                              </td>
                            </>
                          )}
                          <td className="py-1 px-2 text-left w-64 break-all">
                            {callstackEntry.fn_name}
                          </td>
                          <td className="py-1 px-2 text-left w-full">
                            {callstackEntry?.params?.map(
                              (
                                param: { type_name: string; value: number[] },
                                index,
                                array,
                              ) => (
                                <div key={index} className="inline-block">
                                  <div
                                    data-tip={param.type_name}
                                    data-for={param.type_name}
                                    className="inline-block cursor-pointer hover:text-black-700 transition-colors ease-out delay-0 break-normal"
                                  >
                                    {param.value.length > 1
                                      ? `[${param.value.join(', ')}]`
                                      : param.value[0]}

                                    <ReactTooltip
                                      className="tooltip"
                                      id={param.type_name}
                                      effect="solid"
                                      uuid="buttonTooltip"
                                    />
                                  </div>
                                  <span>
                                    {index < array.length - 1 ? ',\u00A0' : ''}
                                  </span>
                                </div>
                              ),
                            )}
                          </td>
                        </tr>
                      )
                    }
                  })}
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
  // reference to the virtuoso instance
  const virtuosoRef = useRef<TableVirtuosoHandle>(null)
  // rederence to the range of items rendered in the dom by virtuoso
  // to determine when to do smooth scroll and when to not
  // Refer: https://virtuoso.dev/scroll-to-index/
  const virtuosoVisibleRange = useRef({
    startIndex: 0,
    endIndex: 0,
  })
  const { pc } = currentTraceEntry

  useEffect(() => {
    if (virtuosoRef.current) {
      const indexToScroll = currentFocus - 1
      if (indexToScroll !== undefined) {
        const { startIndex, endIndex } = virtuosoVisibleRange.current
        // check if the index is between our virtuoso range
        // if within the range we do smooth scroll or else jump scroll
        // Why? because of performance reasons.

        const behavior =
          indexToScroll >= startIndex && indexToScroll <= endIndex
            ? 'smooth'
            : 'auto'

        // scroll to the index
        virtuosoRef.current.scrollToIndex({
          index: indexToScroll,
          align: 'center',
          behavior: behavior,
        })
      }
    }
  }, [currentTraceEntry, currentFocus])

  const errorPc = errorTraceEntry?.pc || 0

  return (
    <>
      <TableVirtuoso
        ref={virtuosoRef}
        style={{ height: '100%' }}
        className="pane pane-light relative [&_thead]:!z-10"
        data={Object.keys(memory)}
        context={{ pc, errorPc }}
        fixedHeaderContent={FixedHeader}
        increaseViewportBy={{ top: 150, bottom: 150 }}
        components={{ Table, TableRow }}
        rangeChanged={(range) => (virtuosoVisibleRange.current = range)}
        itemContent={(index, addr) => {
          const hasBreakpoint = breakpoints[addr]
          // this should only return the content which should be inside <tr> tag of each row
          // for <table> and <tr> tag refer Table and TableRow components at bottom of this file
          return (
            <TableRowContent
              addr={addr}
              currentTraceEntry={currentTraceEntry}
              hasBreakpoint={hasBreakpoint}
              memory={memory}
              pcInstMap={pcInstMap}
              toogleBreakPoint={toogleBreakPoint}
            />
          )
        }}
      />
    </>
  )
}

const Table = (props: any) => {
  return <table className="w-full font-mono text-tiny table-fixed" {...props} />
}

const TableRow = (props: any) => {
  const { context, item: addr, ...rest } = props
  const { pc, errorPc } = context
  const isCurrent = pc.toString() == addr
  const isError = errorPc.toString() == addr
  return (
    <tr
      key={addr}
      className={cn(
        'group relative border-b border-gray-200 dark:border-black-500',
        {
          'text-gray-900 dark:text-gray-200': isCurrent,
          'text-gray-400 dark:text-gray-600': !isCurrent,
          'bg-red-100 dark:bg-red-500/10': isError,
        },
      )}
      {...rest}
    />
  )
}

const TableRowContent = memo(
  ({
    memory,
    pcInstMap,
    toogleBreakPoint,
    addr,
    hasBreakpoint,
    currentTraceEntry,
  }: {
    memory: TracerData['memory']
    pcInstMap: TracerData['pcInstMap']
    toogleBreakPoint: (addr: string) => void
    addr: string
    hasBreakpoint: boolean
    currentTraceEntry: TraceEntry
  }) => {
    const addrNum = Number(addr)
    const { pc, ap, fp } = currentTraceEntry
    return (
      <>
        <td className="pl-4 pr-2">
          <button
            onClick={() => toogleBreakPoint(addr)}
            className={cn(
              'absolute block top-2 left-2 w-2 h-2 z-10 rounded-full group-hover:bg-red-300',
              {
                'hover:bg-red-300': !hasBreakpoint,
                'bg-red-500': hasBreakpoint,
              },
            )}
          />
        </td>
        <td className="pr-2">
          {addrNum === pc && <span className="text-fuchsia-700">[pc]</span>}
          {addrNum === ap && <span className="text-orange-700">[ap]</span>}
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
      </>
    )
  },
)

const FixedHeader = () => {
  return (
    //
    // as default 'table-layout' property of our table element is set to default, it automatically
    // sets the column width based on the maximum width of the content inside that column
    // since we dont know what content will be inside the 'td' before hand
    // table column widths were glitching while scrolling down as suddenly a big width content might come
    // which used to change width of that whole column and resulting in a layout shift of the table
    //
    // Solution -
    // added fixed width in each column
    // set table-layout = 'fixed' css property in our table element check 'Table' component above
    //
    <tr className="text-left bg-gray-50 dark:bg-darkMode-primary text-gray-400 dark:text-gray-600 border-b border-gray-200 dark:border-black-500">
      <th className="py-1 w-12"></th>
      <th className="py-1 w-10"></th>
      <th className="py-1 w-14"></th>
      <th className="py-1 px-2 font-thin w-44">memory</th>
      <th className="py-1 px-2 font-thin w-20">opcode</th>
      <th className="py-1 px-2 font-thin w-12">off0</th>
      <th className="py-1 px-2 font-thin w-12">off1</th>
      <th className="py-1 px-2 font-thin w-12">off2</th>
      <th className="py-1 px-2 font-thin w-12">dst</th>
      <th className="py-1 px-2 font-thin w-12">op0</th>
      <th className="py-1 px-2 font-thin w-12">op1</th>
      <th className="py-1 px-2 font-thin w-32">res</th>
      <th className="py-1 px-2 font-thin w-24">pc_update</th>
      <th className="py-1 px-2 font-thin w-24">ap_update</th>
      <th className="py-1 px-2 font-thin w-24">fp_update</th>
    </tr>
  )
}
