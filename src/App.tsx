import { useMemo, useRef, useState } from 'react'
import { Infographic } from './components/Infographic'
import { computeModel } from './model/calculations'
import { defaultModelParams, type ModelParams } from './model/types'
import { exportReportPdf } from './exportPdf'
import { downloadParamsJson, downloadReportHtml } from './exportReport'
import './App.css'

function NumberField(props: {
  label: string
  hint?: string
  value: number
  step?: number
  min?: number
  onChange: (next: number) => void
}) {
  return (
    <label className="field">
      <span className="field-label">{props.label}</span>
      {props.hint ? <span className="field-hint">{props.hint}</span> : null}
      <input
        className="field-input"
        type="number"
        step={props.step ?? 1}
        min={props.min}
        value={Number.isFinite(props.value) ? props.value : 0}
        onChange={(event) => {
          const next = Number(event.target.value)
          props.onChange(Number.isFinite(next) ? next : 0)
        }}
      />
    </label>
  )
}

function PercentField(props: {
  label: string
  hint?: string
  valuePercent: number
  onChange: (ratio: number) => void
}) {
  return (
    <label className="field">
      <span className="field-label">{props.label}</span>
      {props.hint ? <span className="field-hint">{props.hint}</span> : null}
      <input
        className="field-input"
        type="number"
        step={0.1}
        value={roundDisplayPercent(props.valuePercent)}
        onChange={(event) => {
          const next = Number(event.target.value)
          props.onChange(Number.isFinite(next) ? next / 100 : 0)
        }}
      />
    </label>
  )
}

function roundDisplayPercent(ratio: number) {
  return Math.round(ratio * 1000) / 10
}

function money(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function App() {
  const [params, setParams] = useState<ModelParams>(defaultModelParams)
  const [pdfBusy, setPdfBusy] = useState(false)
  const pdfExportRef = useRef<HTMLDivElement>(null)
  const result = useMemo(() => computeModel(params), [params])

  function patchParams(partial: Partial<ModelParams>) {
    setParams((current) => ({ ...current, ...partial }))
  }

  async function handleExportPdf() {
    const root = pdfExportRef.current
    if (!root) {
      return
    }
    setPdfBusy(true)
    try {
      await exportReportPdf(root, '财务测算报告')
    } catch (error) {
      console.error(error)
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="eyebrow">Authentic · Minimal · Inspiring</div>
          <h1 className="title">三方培训业务全链路财务测算</h1>
          <p className="subtitle">
            白与深海蓝与金 · 移动端优先 · 信息图概览 · 可导出 HTML / PDF
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn secondary" onClick={() => setParams(defaultModelParams)}>
            恢复默认
          </button>
          <button type="button" className="btn secondary" onClick={() => downloadParamsJson(params)}>
            导出 JSON
          </button>
          <button type="button" className="btn secondary" onClick={() => downloadReportHtml(params, result)}>
            导出 HTML
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={pdfBusy}
            onClick={() => void handleExportPdf()}
          >
            {pdfBusy ? '生成 PDF…' : '导出 PDF'}
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="panel params-panel">
          <div className="panel-header">
            <h2>核心参数</h2>
            <p className="panel-sub">与模型总开关表一致，修改后即时重算</p>
          </div>

          <section className="param-section">
            <h3>课程报名</h3>
            <div className="field-grid">
              <NumberField
                label="团购课人数"
                value={params.groupBuyHeadcount}
                min={0}
                onChange={(value) => patchParams({ groupBuyHeadcount: value })}
              />
              <NumberField
                label="团购课含税单价（元/人）"
                value={params.groupBuyPriceTaxIncl}
                min={0}
                step={100}
                onChange={(value) => patchParams({ groupBuyPriceTaxIncl: value })}
              />
              <NumberField
                label="团购课天数"
                value={params.groupBuyCourseDays}
                min={1}
                onChange={(value) => patchParams({ groupBuyCourseDays: value })}
              />
              <PercentField
                label="团购课当期确认比例（%）"
                hint="余下递延至后续课程"
                valuePercent={params.groupBuyCurrentRevenueRatio}
                onChange={(value) => patchParams({ groupBuyCurrentRevenueRatio: value })}
              />

              <NumberField
                label="散客课人数"
                value={params.retailHeadcount}
                min={0}
                onChange={(value) => patchParams({ retailHeadcount: value })}
              />
              <NumberField
                label="散客课含税单价（元/人）"
                value={params.retailPriceTaxIncl}
                min={0}
                step={100}
                onChange={(value) => patchParams({ retailPriceTaxIncl: value })}
              />
              <NumberField
                label="散客课天数"
                value={params.retailCourseDays}
                min={1}
                onChange={(value) => patchParams({ retailCourseDays: value })}
              />

              <NumberField
                label="智库定制人数"
                value={params.thinkTankHeadcount}
                min={0}
                onChange={(value) => patchParams({ thinkTankHeadcount: value })}
              />
              <NumberField
                label="智库含税单价（元/人）"
                value={params.thinkTankPriceTaxIncl}
                min={0}
                step={10}
                onChange={(value) => patchParams({ thinkTankPriceTaxIncl: value })}
              />
              <NumberField
                label="智库课天数"
                value={params.thinkTankCourseDays}
                min={1}
                onChange={(value) => patchParams({ thinkTankCourseDays: value })}
              />
            </div>
          </section>

          <section className="param-section">
            <h3>陪跑服务</h3>
            <div className="field-grid">
              <PercentField
                label="陪跑转化率（%）"
                hint="按课程总报名人数"
                valuePercent={params.coachingConversionRate}
                onChange={(value) => patchParams({ coachingConversionRate: value })}
              />
              <PercentField
                label="1年付客户占比（%）"
                valuePercent={params.coachingOneYearShare}
                onChange={(value) => patchParams({ coachingOneYearShare: value })}
              />
              <NumberField
                label="1年付含税单价（元/店）"
                value={params.coachingOneYearPriceTaxIncl}
                min={0}
                step={1000}
                onChange={(value) => patchParams({ coachingOneYearPriceTaxIncl: value })}
              />
              <NumberField
                label="3年付含税实收（元/店）"
                value={params.coachingThreeYearPriceTaxIncl}
                min={0}
                step={1000}
                onChange={(value) => patchParams({ coachingThreeYearPriceTaxIncl: value })}
              />
              <PercentField
                label="3年付首年营收分摊比例（%）"
                valuePercent={params.coachingThreeYearFirstYearRevenueRatio}
                onChange={(value) => patchParams({ coachingThreeYearFirstYearRevenueRatio: value })}
              />
              <NumberField
                label="单店硬件成本（元）"
                value={params.hardwareCostPerStoreTaxIncl}
                min={0}
                step={500}
                onChange={(value) => patchParams({ hardwareCostPerStoreTaxIncl: value })}
              />
              <PercentField
                label="转介绍激励计提（%）"
                hint="按陪跑不含税营收"
                valuePercent={params.referralAccrualRate}
                onChange={(value) => patchParams({ referralAccrualRate: value })}
              />
            </div>
          </section>

          <section className="param-section">
            <h3>分成与成本</h3>
            <div className="field-grid">
              <PercentField
                label="中成：课程前置分成（%）"
                hint="按单人全额不含税营收"
                valuePercent={params.zhongchengCourseShareRate}
                onChange={(value) => patchParams({ zhongchengCourseShareRate: value })}
              />
              <PercentField
                label="中成：陪跑前置分成（%）"
                hint="按当期确认不含税营收"
                valuePercent={params.zhongchengCoachingShareRate}
                onChange={(value) => patchParams({ zhongchengCoachingShareRate: value })}
              />
              <PercentField
                label="陪跑销售内部分成（%）"
                valuePercent={params.coachingInternalSalesShare}
                onChange={(value) => patchParams({ coachingInternalSalesShare: value })}
              />
              <PercentField
                label="课程获客销售（%）"
                valuePercent={params.coachingInternalAcquisitionShare}
                onChange={(value) => patchParams({ coachingInternalAcquisitionShare: value })}
              />
              <PercentField
                label="交付服务方（%）"
                valuePercent={params.coachingInternalDeliveryShare}
                onChange={(value) => patchParams({ coachingInternalDeliveryShare: value })}
              />
              <PercentField
                label="博雅最终净利润（%）"
                valuePercent={params.boyaFinalProfitShare}
                onChange={(value) => patchParams({ boyaFinalProfitShare: value })}
              />
              <PercentField
                label="岁知社最终净利润（%）"
                valuePercent={params.suizhiFinalProfitShare}
                onChange={(value) => patchParams({ suizhiFinalProfitShare: value })}
              />
              <NumberField
                label="讲师保底（元/天）"
                value={params.lecturerDailyRate}
                min={0}
                step={500}
                onChange={(value) => patchParams({ lecturerDailyRate: value })}
              />
              <PercentField
                label="首次开课研发 / 讲师费（%）"
                valuePercent={params.firstOpenRdRateOfLecturer}
                onChange={(value) => patchParams({ firstOpenRdRateOfLecturer: value })}
              />
              <PercentField
                label="复开课研发 / 讲师费（%）"
                valuePercent={params.repeatRdRateOfLecturer}
                onChange={(value) => patchParams({ repeatRdRateOfLecturer: value })}
              />
              <NumberField
                label="散客证书成本（元/人）"
                value={params.certificateCostRetailPerHead}
                min={0}
                onChange={(value) => patchParams({ certificateCostRetailPerHead: value })}
              />
              <NumberField
                label="智库证书成本（元/人）"
                value={params.certificateCostThinkTankPerHead}
                min={0}
                onChange={(value) => patchParams({ certificateCostThinkTankPerHead: value })}
              />
            </div>
          </section>

          <section className="param-section">
            <h3>税费</h3>
            <div className="field-grid">
              <PercentField
                label="增值税税率（%）"
                valuePercent={params.vatRate}
                onChange={(value) => patchParams({ vatRate: value })}
              />
              <PercentField
                label="附加税占增值税（%）"
                valuePercent={params.surchargeOnVatRate}
                onChange={(value) => patchParams({ surchargeOnVatRate: value })}
              />
              <PercentField
                label="企业所得税（展示）（%）"
                valuePercent={params.corporateIncomeTaxRate}
                onChange={(value) => patchParams({ corporateIncomeTaxRate: value })}
              />
            </div>
          </section>
        </aside>

        <main className="main">
          <div ref={pdfExportRef} className="pdf-export-zone">
            <div className="pdf-export-meta">
              <span className="pdf-export-meta-label">测算快照</span>
              <span className="pdf-export-meta-time">{new Date().toLocaleString('zh-CN')}</span>
            </div>
          <section className="panel">
            <div className="panel-header">
              <h2>综合汇总（全周期）</h2>
              <p className="panel-sub">
                学员 {result.totalCourseStudents} 人 · 陪跑 {result.coachingClientCount} 家（1年付{' '}
                {result.coachingOneYearStores} / 3年付 {result.coachingThreeYearStores}）
              </p>
            </div>
            <div className="kpi-grid">
              <div className="kpi">
                <div className="kpi-label">合并营收（不含税）</div>
                <div className="kpi-value">{money(result.mergedRevenueExclLifecycle)}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">中成全周期分成</div>
                <div className="kpi-value">{money(result.mergedZhongchengLifecycle)}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">刚性及首期激励总扣除</div>
                <div className="kpi-value">{money(result.mergedRigidLifecycle)}</div>
              </div>
              <div className="kpi accent">
                <div className="kpi-label">合并利润总额（税前）</div>
                <div className="kpi-value">{money(result.mergedProfitBeforeSplit)}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">产品线利润加总（参考）</div>
                <div className="kpi-value">{money(result.lifecycleLinesProfitSum)}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">博雅分成</div>
                <div className="kpi-value">{money(result.boyaShareOfProfit)}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">岁知社分成</div>
                <div className="kpi-value">{money(result.suizhiShareOfProfit)}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">综合毛利率（测算）</div>
                <div className="kpi-value">{money(result.grossMarginLifecycle)}%</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">单客平均贡献</div>
                <div className="kpi-value">{money(result.avgProfitPerStudent)}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">单店陪跑平均利润</div>
                <div className="kpi-value">{money(result.avgProfitPerCoachingStore)}</div>
              </div>
            </div>
            <div className="callout">
              合并利润采用「全周期营收 − 中成全周期分成 −（课程全周期刚性 + 陪跑首期刚性 + 陪跑首期团队激励池）」。
              「产品线利润加总」= 课程全周期利润 + 陪跑全周期利润；其中陪跑全周期利润已按文档口径扣减首期硬件/转介绍/附加税及 15%
              中成前置分成，但不扣减首期 40/30/30 激励池，因此通常高于合并利润总额。
              企业所得税（{roundDisplayPercent(params.corporateIncomeTaxRate)}%）若按合并利润总额计提，约为{' '}
              {money(result.mergedProfitBeforeSplit * params.corporateIncomeTaxRate)} 元（仅展示）。
            </div>
          </section>

          <Infographic result={result} params={params} />

          <section className="panel">
            <div className="panel-header">
              <h2>课程测算</h2>
              <p className="panel-sub">首次开课 / 复开课 / 全周期（含团购递延结转）</p>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>产品线</th>
                    <th className="num">当期不含税营收</th>
                    <th className="num">中成前置分成</th>
                    <th className="num">当期可分配额</th>
                    <th className="num">首次开课利润</th>
                    <th className="num">复开课利润</th>
                    <th className="num">全周期营收</th>
                    <th className="num">全周期利润</th>
                  </tr>
                </thead>
                <tbody>
                  {result.coursePeriod.map((row, index) => {
                    const life = result.courseLifecycle[index]!
                    return (
                      <tr key={row.line.key}>
                        <td>{row.line.label}</td>
                        <td className="num">{money(row.revenueExclCurrentTotal)}</td>
                        <td className="num">{money(row.zhongchengPrefShareTotal)}</td>
                        <td className="num">{money(row.boyaSuizhiAssignableCurrent)}</td>
                        <td className="num">{money(row.profitFirstOpen)}</td>
                        <td className="num">{money(row.profitRepeatOpen)}</td>
                        <td className="num">{money(life.revenueExclLifecycleTotal)}</td>
                        <td className="num">{money(life.profitLifecycle)}</td>
                      </tr>
                    )
                  })}
                  <tr className="total-row">
                    <td>合计</td>
                    <td className="num">
                      {money(result.coursePeriod.reduce((s, r) => s + r.revenueExclCurrentTotal, 0))}
                    </td>
                    <td className="num">
                      {money(result.coursePeriod.reduce((s, r) => s + r.zhongchengPrefShareTotal, 0))}
                    </td>
                    <td className="num">
                      {money(result.coursePeriod.reduce((s, r) => s + r.boyaSuizhiAssignableCurrent, 0))}
                    </td>
                    <td className="num">{money(result.courseMergedProfitFirstOpen)}</td>
                    <td className="num">{money(result.courseMergedProfitRepeatOpen)}</td>
                    <td className="num">
                      {money(result.courseLifecycle.reduce((s, r) => s + r.revenueExclLifecycleTotal, 0))}
                    </td>
                    <td className="num">{money(result.courseMergedProfitLifecycle)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>陪跑测算</h2>
              <p className="panel-sub">中成前置 → 刚性成本 → 内部分配基数</p>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>套餐</th>
                    <th className="num">当期不含税营收</th>
                    <th className="num">中成前置分成</th>
                    <th className="num">硬件</th>
                    <th className="num">转介绍计提</th>
                    <th className="num">附加税</th>
                    <th className="num">内部分配基数</th>
                    <th className="num">销售 {roundDisplayPercent(params.coachingInternalSalesShare)}%</th>
                    <th className="num">获客 {roundDisplayPercent(params.coachingInternalAcquisitionShare)}%</th>
                    <th className="num">交付 {roundDisplayPercent(params.coachingInternalDeliveryShare)}%</th>
                  </tr>
                </thead>
                <tbody>
                  {result.coachingPeriod.map((row) => (
                    <tr key={row.slice.key}>
                      <td>
                        {row.slice.label}（{row.slice.storeCount} 家）
                      </td>
                      <td className="num">{money(row.revenueExclCurrentTotal)}</td>
                      <td className="num">{money(row.zhongchengPrefShareTotal)}</td>
                      <td className="num">{money(row.hardwareTotal)}</td>
                      <td className="num">{money(row.referralAccrualTotal)}</td>
                      <td className="num">{money(row.surchargeTotal)}</td>
                      <td className="num">{money(row.internalPool)}</td>
                      <td className="num">{money(row.internalSales)}</td>
                      <td className="num">{money(row.internalAcquisition)}</td>
                      <td className="num">{money(row.internalDelivery)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="panel-header tight">
              <h2>陪跑全周期（含递延结转）</h2>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>套餐</th>
                    <th className="num">全周期不含税营收</th>
                    <th className="num">中成全周期分成</th>
                    <th className="num">全周期刚性</th>
                    <th className="num">全周期利润（激励后）</th>
                  </tr>
                </thead>
                <tbody>
                  {result.coachingLifecycle.map((row) => (
                    <tr key={row.slice.key}>
                      <td>
                        {row.slice.label}（{row.slice.storeCount} 家）
                      </td>
                      <td className="num">{money(row.revenueExclLifecycleTotal)}</td>
                      <td className="num">{money(row.zhongchengPrefShareLifecycle)}</td>
                      <td className="num">{money(row.rigidLifecycle)}</td>
                      <td className="num">{money(row.profitLifecycle)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td>陪跑合计</td>
                    <td className="num">{money(result.coachingRevenueExclLifecycleTotal)}</td>
                    <td className="num">{money(result.coachingZhongchengLifecycle)}</td>
                    <td className="num">{money(result.coachingRigidLifecycle)}</td>
                    <td className="num">{money(result.coachingProfitLifecycle)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          </div>

          <footer className="footer">
            本地：<code>npm install</code> → <code>npm run dev</code>
            ；配色 White / Deep Blue (#0A1626) / Gold (#A88B52)。灵感参考{' '}
            <a href="https://www.designprompts.dev/" target="_blank" rel="noreferrer">
              designprompts.dev
            </a>
            。
          </footer>
        </main>
      </div>
    </div>
  )
}
