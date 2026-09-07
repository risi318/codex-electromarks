import type { ReactNode } from 'react'
type PanelProps = { children: ReactNode; className?: string }
export function Panel({ children, className = '' }: PanelProps) { return <section className={`panel ${className}`.trim()}>{children}</section> }
type PanelHeadingProps = { eyebrow: string; title: string; actions?: ReactNode }
export function PanelHeading({ eyebrow, title, actions }: PanelHeadingProps) { return <div className="panel-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{actions}</div> }
