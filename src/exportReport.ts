import type { ConsolidatedResult } from './model/calculations'
import type { ModelParams } from './model/types'

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatMoney(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function buildReportHtml(params: ModelParams, result: ConsolidatedResult) {
  const generatedAt = new Date().toISOString()
  const paramsJson = escapeHtml(JSON.stringify(params, null, 2))

  const courseRows = result.coursePeriod
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.line.label)}</td>
        <td class="num">${formatMoney(row.revenueExclCurrentTotal)}</td>
        <td class="num">${formatMoney(row.zhongchengPrefShareTotal)}</td>
        <td class="num">${formatMoney(row.boyaSuizhiAssignableCurrent)}</td>
        <td class="num">${formatMoney(row.profitFirstOpen)}</td>
        <td class="num">${formatMoney(row.profitRepeatOpen)}</td>
      </tr>`,
    )
    .join('')

  const courseLifeRows = result.courseLifecycle
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.line.label)}</td>
        <td class="num">${formatMoney(row.revenueExclLifecycleTotal)}</td>
        <td class="num">${formatMoney(row.zhongchengPrefShareLifecycle)}</td>
        <td class="num">${formatMoney(row.rigidCostLifecycle)}</td>
        <td class="num">${formatMoney(row.profitLifecycle)}</td>
      </tr>`,
    )
    .join('')

  const coachingRows = result.coachingPeriod
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.slice.label)}（${row.slice.storeCount} 家）</td>
        <td class="num">${formatMoney(row.revenueExclCurrentTotal)}</td>
        <td class="num">${formatMoney(row.zhongchengPrefShareTotal)}</td>
        <td class="num">${formatMoney(row.rigidTotal)}</td>
        <td class="num">${formatMoney(row.internalPool)}</td>
      </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>三方培训业务财务测算报告</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 32px; color: #0f172a; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    h2 { font-size: 16px; margin: 28px 0 10px; color: #334155; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; font-weight: 600; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .summary { background: #eef2ff; }
    pre { background: #f1f5f9; padding: 12px; overflow: auto; font-size: 12px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>三方主体培训业务全链路财务测算报告</h1>
  <div class="meta">生成时间（UTC）：${escapeHtml(generatedAt)}</div>

  <h2>一、综合汇总（全周期，不含税口径）</h2>
  <table>
    <tr class="summary"><th>项目</th><th class="num">金额（元）</th></tr>
    <tr><td>合并营业总收入（不含税）</td><td class="num">${formatMoney(result.mergedRevenueExclLifecycle)}</td></tr>
    <tr><td>中成伟业全周期总分成</td><td class="num">${formatMoney(result.mergedZhongchengLifecycle)}</td></tr>
    <tr><td>合并刚性及执行激励总扣除</td><td class="num">${formatMoney(result.mergedRigidLifecycle)}</td></tr>
    <tr><td>合并利润总额（税前）</td><td class="num">${formatMoney(result.mergedProfitBeforeSplit)}</td></tr>
    <tr><td>博雅问渠书院（${(params.boyaFinalProfitShare * 100).toFixed(0)}%）</td><td class="num">${formatMoney(result.boyaShareOfProfit)}</td></tr>
    <tr><td>岁知社（${(params.suizhiFinalProfitShare * 100).toFixed(0)}%）</td><td class="num">${formatMoney(result.suizhiShareOfProfit)}</td></tr>
    <tr><td>全周期综合毛利率（测算）</td><td class="num">${formatMoney(result.grossMarginLifecycle)}%</td></tr>
    <tr><td>单客全周期平均贡献（按学员）</td><td class="num">${formatMoney(result.avgProfitPerStudent)}</td></tr>
    <tr><td>单店陪跑全周期平均利润</td><td class="num">${formatMoney(result.avgProfitPerCoachingStore)}</td></tr>
  </table>

  <h2>二、课程当期 / 复开课 / 全周期</h2>
  <p>学员合计：${result.totalCourseStudents} 人；陪跑转化客户：${result.coachingClientCount} 家（1年付 ${result.coachingOneYearStores} / 3年付 ${result.coachingThreeYearStores}）。</p>
  <table>
    <thead>
      <tr>
        <th>产品线</th>
        <th class="num">当期不含税营收</th>
        <th class="num">中成前置分成</th>
        <th class="num">当期可分配额</th>
        <th class="num">首次开课利润</th>
        <th class="num">复开课利润</th>
      </tr>
    </thead>
    <tbody>${courseRows}</tbody>
  </table>

  <h2>三、课程全周期结转</h2>
  <table>
    <thead>
      <tr>
        <th>产品线</th>
        <th class="num">全周期不含税营收</th>
        <th class="num">中成全周期分成</th>
        <th class="num">刚性成本合计</th>
        <th class="num">全周期利润</th>
      </tr>
    </thead>
    <tbody>${courseLifeRows}</tbody>
  </table>

  <h2>四、陪跑当期拆分</h2>
  <table>
    <thead>
      <tr>
        <th>套餐</th>
        <th class="num">当期不含税营收</th>
        <th class="num">中成前置分成</th>
        <th class="num">刚性成本</th>
        <th class="num">内部分配基数</th>
      </tr>
    </thead>
    <tbody>${coachingRows}</tbody>
  </table>

  <h2>五、模型参数 JSON</h2>
  <pre>${paramsJson}</pre>
</body>
</html>`
}

export function downloadReportHtml(params: ModelParams, result: ConsolidatedResult) {
  const html = buildReportHtml(params, result)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `财务测算报告-${new Date().toISOString().slice(0, 19).replaceAll(':', '')}.html`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadParamsJson(params: ModelParams) {
  const blob = new Blob([JSON.stringify(params, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `测算参数-${new Date().toISOString().slice(0, 19).replaceAll(':', '')}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
