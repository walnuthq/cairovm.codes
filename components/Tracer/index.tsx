import { useEffect, useRef, useState } from 'react'
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

export interface TracerData {
  pcInstMap: { [key: string]: Instruction }
  trace: TraceEntry[]
  memory: { [key: string]: string }
}

interface Props {
  mainHeight: number
  barHeight: number
  tracerData?: TracerData
}

export const Tracer = ({ tracerData, mainHeight, barHeight }: Props) => {
  const [currentStep, setCurrentStep] = useState(0)
  const trace = tracerData?.trace
  const currentTraceEntry = tracerData?.trace[currentStep]

  useEffect(() => {
    const element = document.getElementById('focus_row')
    if (tableRef.current && element?.offsetTop) {
      tableRef.current.scrollTop = element.offsetTop - 58
    }
  }, [currentTraceEntry])

  const tableRef = useRef<HTMLDivElement>(null)

  function stepIn() {
    if (!trace || trace.length === 0 || currentStep === trace.length - 1) {
      return
    }
    setCurrentStep(currentStep + 1)
  }

  function stepOut() {
    if (!trace || trace.length === 0 || currentStep === 0) {
      return
    }
    setCurrentStep(currentStep - 1)
  }

  return (
    <>
      <div className="border-t md:border-t-0 border-b border-gray-200 dark:border-black-500 flex items-center pl-4 pr-6 h-14">
        <ExecutionStatus onStepIn={stepIn} onStepOut={stepOut} />
      </div>
      {tracerData && currentTraceEntry && trace && (
        <>
          <div
            ref={tableRef}
            className="overflow-auto pane pane-light relative bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-black-500"
            style={{ height: mainHeight }}
          >
            <MemoryTable
              memory={tracerData.memory}
              pcInstMap={tracerData.pcInstMap}
              currentTraceEntry={currentTraceEntry}
            />
          </div>
          <div style={{ height: barHeight }}>
            <InfoBar
              trace={trace}
              currentStep={currentStep}
              currentTraceEntry={currentTraceEntry}
            />
          </div>
        </>
      )}
    </>
  )
}

function InfoBar({
  currentStep,
  currentTraceEntry,
  trace,
}: {
  currentStep: number
  currentTraceEntry: TraceEntry
  trace: TraceEntry[]
}) {
  const info = [
    {
      name: 'Step',
      value: `${currentStep + 1}/${trace.length}`,
    },
    {
      name: 'Pc',
      value: currentTraceEntry.pc,
    },
    {
      name: 'Ap',
      value: currentTraceEntry.ap,
    },
    {
      name: 'Fp',
      value: currentTraceEntry.fp,
    },
  ]

  return (
    <div className="h-full px-4 flex flex-row items-center gap-4">
      {info.map((item) => (
        <div key={item.name}>
          <span className="inline-block mr-1 text-gray-500 select-none text-sm">
            {item.name}:
          </span>
          <span className="inline-block select-all font-mono min-w-5">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function MemoryTable({
  memory,
  pcInstMap,
  currentTraceEntry,
}: {
  memory: TracerData['memory']
  pcInstMap: TracerData['pcInstMap']
  currentTraceEntry: TraceEntry
}) {
  const { pc, ap, fp } = currentTraceEntry

  return (
    <table className="text-xs font-mono">
      <tr className="text-left sticky top-0 bg-gray-50 dark:bg-black-600 border-b">
        <th></th>
        <th className="px-2">memory</th>
        <th className="px-2">opcode</th>
        <th className="px-2">off0</th>
        <th className="px-2">off1</th>
        <th className="px-2">off2</th>
        <th className="px-2">dst</th>
        <th className="px-2">op0</th>
        <th className="px-2">op1</th>
        <th className="px-2">res</th>
        <th className="px-2">pc_update</th>
        <th className="px-2">ap_update</th>
        <th className="px-2">fp_update</th>
      </tr>
      {Object.keys(memory).map((addr) => {
        const isCurrent = pc.toString() === addr
        const isFocus = isCurrent
        const addrNum = Number(addr)
        return (
          <tr
            key={addr}
            id={isFocus ? 'focus_row' : undefined}
            className={`border-b ${isCurrent ? 'bg-gray-200' : ''}`}
          >
            <td
              className={`px-2 whitespace-nowrap ${
                isCurrent ? 'text-gray-400' : 'text-gray-300'
              }`}
            >
              {addr}
              {/* {addrNum === ap ? 'ap' : addrNum === fp ? 'fp' : ''} */}
            </td>
            <td className="px-2 max-w-40 break-words">{memory[addr]}</td>
            {pcInstMap[addr] && (
              <>
                <td className="px-2">{pcInstMap[addr].opcode}</td>
                <td className="px-2">{pcInstMap[addr].off0}</td>
                <td className="px-2">{pcInstMap[addr].off1}</td>
                <td className="px-2">{pcInstMap[addr].off2}</td>
                <td className="px-2">{pcInstMap[addr].dst_register}</td>
                <td className="px-2">{pcInstMap[addr].op0_register}</td>
                <td className="px-2">{pcInstMap[addr].op1_addr}</td>
                <td className="px-2">{pcInstMap[addr].res}</td>
                <td className="px-2">{pcInstMap[addr].pc_update}</td>
                <td className="px-2">{pcInstMap[addr].ap_update}</td>
                <td className="px-2">{pcInstMap[addr].fp_update}</td>
              </>
            )}
          </tr>
        )
      })}
    </table>
  )
}
