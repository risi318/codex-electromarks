type ModuleCellProps = { number: number; column: number }
export function ModuleCell({ number, column }: ModuleCellProps) { return <span className="module" style={{ gridColumn: column, gridRow: 1 }}><small>{number}</small></span> }
