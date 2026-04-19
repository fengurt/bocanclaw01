import type { ConsolidatedResult } from '../model/calculations'
import type { ModelParams } from '../model/types'

function money(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function pct(part: number, whole: number) {
  if (!Number.isFinite(whole) || whole <= 0) {
    return 0
  }
  return Math.min(100, Math.max(0, (part / whole) * 100))
}

type InfographicProps = {
  result: ConsolidatedResult
  params: ModelParams
}

export function Infographic(props: InfographicProps) {
  const { result, params } = props
  const total = result.mergedRevenueExclLifecycle
  const zcw = result.mergedZhongchengLifecycle
  const rigid = result.mergedRigidLifecycle
  const profit = result.mergedProfitBeforeSplit

  const wZcw = pct(zcw, total)
  const wRigid = pct(rigid, total)
  const wProfit = Math.max(0, pct(profit, total))

  const courseRev = result.courseLifecycle.reduce((sum, row) => sum + row.revenueExclLifecycleTotal, 0)
  const coachRev = result.coachingRevenueExclLifecycleTotal
  const mix = courseRev + coachRev
  const wCourse = pct(courseRev, mix)
  const wCoach = pct(coachRev, mix)

  const boyaPct = params.boyaFinalProfitShare * 100
  const suizhiPct = params.suizhiFinalProfitShare * 100

  return (
    <section className="panel infographic-panel" aria-labelledby="infographic-heading">
      <div className="panel-header">
        <h2 id="infographic-heading">全链路信息图</h2>
        <p className="panel-sub">不含税全周期 · 结构占比与双主体分配</p>
      </div>

      <div className="infographic-flow" role="list">
        <div className="infographic-step" role="listitem">
          <span className="infographic-step-label">全周期营收</span>
          <strong className="infographic-step-value">{money(total)}</strong>
        </div>
        <div className="infographic-connector" aria-hidden="true">
          <span />
        </div>
        <div className="infographic-branch" role="list">
          <div className="infographic-pill pill-zcw" role="listitem">
            <span>中成前置</span>
            <strong>{money(zcw)}</strong>
            <small>{pct(zcw, total).toFixed(1)}%</small>
          </div>
          <div className="infographic-pill pill-rigid" role="listitem">
            <span>刚性+首期激励</span>
            <strong>{money(rigid)}</strong>
            <small>{pct(rigid, total).toFixed(1)}%</small>
          </div>
          <div className="infographic-pill pill-profit" role="listitem">
            <span>合并利润</span>
            <strong>{money(profit)}</strong>
            <small>{pct(profit, total).toFixed(1)}%</small>
          </div>
        </div>
      </div>

      <div className="infographic-bars" aria-hidden="true">
        <p className="infographic-bars-title">营收切分（相对全周期营收）</p>
        <div className="infographic-stacked" title="中成 / 刚性 / 利润">
          <span className="seg seg-zcw" style={{ width: `${wZcw}%` }} />
          <span className="seg seg-rigid" style={{ width: `${wRigid}%` }} />
          <span className="seg seg-profit" style={{ width: `${wProfit}%` }} />
        </div>
        <ul className="infographic-legend">
          <li>
            <span className="swatch swatch-zcw" /> 中成 {wZcw.toFixed(1)}%
          </li>
          <li>
            <span className="swatch swatch-rigid" /> 刚性+激励 {wRigid.toFixed(1)}%
          </li>
          <li>
            <span className="swatch swatch-profit" /> 合并利润 {wProfit.toFixed(1)}%
          </li>
        </ul>
      </div>

      <div className="infographic-split">
        <div>
          <p className="infographic-bars-title">营收构成：课程 vs 陪跑</p>
          <div className="infographic-stacked stacked-mix">
            <span className="seg seg-course" style={{ width: `${wCourse}%` }} />
            <span className="seg seg-coach" style={{ width: `${wCoach}%` }} />
          </div>
          <ul className="infographic-legend">
            <li>
              <span className="swatch swatch-course" /> 课程 {wCourse.toFixed(1)}%
            </li>
            <li>
              <span className="swatch swatch-coach" /> 陪跑 {wCoach.toFixed(1)}%
            </li>
          </ul>
        </div>
        <div className="infographic-partners">
          <p className="infographic-bars-title">净利润分配（博雅 / 岁知社）</p>
          <div className="infographic-stacked stacked-partners">
            <span className="seg seg-boya" style={{ width: `${boyaPct}%` }} />
            <span className="seg seg-suizhi" style={{ width: `${suizhiPct}%` }} />
          </div>
          <ul className="infographic-legend">
            <li>
              <span className="swatch swatch-boya" /> 博雅 {boyaPct.toFixed(0)}% · {money(result.boyaShareOfProfit)}
            </li>
            <li>
              <span className="swatch swatch-suizhi" /> 岁知社 {suizhiPct.toFixed(0)}% · {money(result.suizhiShareOfProfit)}
            </li>
          </ul>
        </div>
      </div>

      <svg
        className="infographic-spark"
        viewBox="0 0 400 48"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ig-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#A88B52" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#A88B52" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#A88B52" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M 8 32 C 80 8, 140 40, 200 24 S 320 4, 392 28"
          fill="none"
          stroke="url(#ig-line)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="200" cy="24" r="3" fill="#0A1626" opacity="0.85" />
      </svg>
    </section>
  )
}
