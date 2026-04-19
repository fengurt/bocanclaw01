import type { ConsolidatedResult } from './model/calculations'
import type { ModelParams } from './model/types'

const REPORT_THEME = {
  ink: '#0A1626',
  gold: '#A88B52',
  white: '#FFFFFF',
  canvas: '#F7F6F3',
  muted: 'rgba(10, 22, 38, 0.58)',
}

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
  const { ink, gold, white, canvas, muted } = REPORT_THEME

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
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="light" />
  <meta name="theme-color" content="${ink}" />
  <title>财务测算报告</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --ink: ${ink};
      --gold: ${gold};
      --white: ${white};
      --canvas: ${canvas};
      --muted: ${muted};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      font-size: 15px;
      line-height: 1.55;
      color: var(--ink);
      background: var(--canvas);
      -webkit-font-smoothing: antialiased;
    }
    .wrap {
      max-width: 40rem;
      margin: 0 auto;
      padding: clamp(1rem, 4vw, 2rem) clamp(0.75rem, 4vw, 1.5rem) 3rem;
    }
    .hero {
      background: var(--ink);
      color: var(--white);
      padding: clamp(1.25rem, 5vw, 2rem) clamp(1rem, 4vw, 1.75rem);
      border-bottom: 3px solid var(--gold);
      margin: 0 calc(-1 * clamp(0.75rem, 4vw, 1.5rem));
      margin-bottom: 1.75rem;
    }
    @media (min-width: 480px) {
      .hero { margin: 0 0 2rem; border-radius: 0 0 0.5rem 0.5rem; }
    }
    .tag {
      font-size: 0.65rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--gold) 90%, white);
      margin: 0 0 0.5rem;
    }
    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(1.5rem, 6vw, 2rem);
      font-weight: 600;
      margin: 0 0 0.35rem;
      line-height: 1.15;
      letter-spacing: 0.02em;
    }
    .meta {
      font-size: 0.75rem;
      opacity: 0.78;
      margin: 0;
    }
    h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.15rem;
      font-weight: 600;
      margin: 2rem 0 0.75rem;
      padding-bottom: 0.35rem;
      border-bottom: 1px solid color-mix(in srgb, var(--gold) 55%, transparent);
      color: var(--ink);
    }
    .lede {
      font-size: 0.8125rem;
      color: var(--muted);
      margin: 0 0 1rem;
      line-height: 1.5;
    }
    .scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 0 -0.25rem;
      padding: 0 0.25rem 0.25rem;
    }
    table {
      width: 100%;
      min-width: 18rem;
      border-collapse: collapse;
      font-size: 0.8125rem;
      background: var(--white);
      border: 1px solid color-mix(in srgb, var(--ink) 10%, white);
      border-radius: 0.35rem;
    }
    th, td {
      padding: 0.55rem 0.6rem;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid color-mix(in srgb, var(--ink) 8%, white);
    }
    th {
      font-weight: 600;
      font-size: 0.7rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--muted);
      background: color-mix(in srgb, var(--canvas) 50%, white);
      white-space: nowrap;
    }
    tr:last-child td { border-bottom: none; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .summary th {
      background: var(--ink);
      color: var(--white);
      border-bottom-color: var(--gold);
    }
    .summary td {
      font-weight: 600;
      background: color-mix(in srgb, var(--gold) 14%, white);
    }
    pre {
      margin: 0;
      padding: 1rem;
      font-size: 0.7rem;
      line-height: 1.45;
      overflow: auto;
      background: var(--white);
      border: 1px solid color-mix(in srgb, var(--ink) 10%, white);
      border-left: 3px solid var(--gold);
      border-radius: 0.35rem;
      color: var(--ink);
    }
    footer {
      margin-top: 2.5rem;
      padding-top: 1rem;
      border-top: 1px solid color-mix(in srgb, var(--ink) 12%, white);
      font-size: 0.7rem;
      color: var(--muted);
      text-align: center;
      letter-spacing: 0.04em;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <p class="tag">Altruistic · Authentic · Artistic</p>
      <h1>三方主体培训业务<br />全链路财务测算报告</h1>
      <p class="meta">生成时间（UTC）：${escapeHtml(generatedAt)}</p>
    </header>

    <h2>一、综合汇总</h2>
    <p class="lede">全周期，不含税口径；白 · 深海蓝 · 金，极简版式。</p>
    <div class="scroll">
    <table>
      <tr class="summary"><th>项目</th><th class="num">金额（元）</th></tr>
      <tr><td>合并营业总收入（不含税）</td><td class="num">${formatMoney(result.mergedRevenueExclLifecycle)}</td></tr>
      <tr><td>中成伟业全周期总分成</td><td class="num">${formatMoney(result.mergedZhongchengLifecycle)}</td></tr>
      <tr><td>合并刚性及首期激励总扣除</td><td class="num">${formatMoney(result.mergedRigidLifecycle)}</td></tr>
      <tr><td>合并利润总额（税前）</td><td class="num">${formatMoney(result.mergedProfitBeforeSplit)}</td></tr>
      <tr><td>产品线利润加总（参考）</td><td class="num">${formatMoney(result.lifecycleLinesProfitSum)}</td></tr>
      <tr><td>博雅问渠书院（${(params.boyaFinalProfitShare * 100).toFixed(0)}%）</td><td class="num">${formatMoney(result.boyaShareOfProfit)}</td></tr>
      <tr><td>岁知社（${(params.suizhiFinalProfitShare * 100).toFixed(0)}%）</td><td class="num">${formatMoney(result.suizhiShareOfProfit)}</td></tr>
      <tr><td>全周期综合毛利率（测算）</td><td class="num">${formatMoney(result.grossMarginLifecycle)}%</td></tr>
      <tr><td>单客全周期平均贡献（按学员）</td><td class="num">${formatMoney(result.avgProfitPerStudent)}</td></tr>
      <tr><td>单店陪跑全周期平均利润</td><td class="num">${formatMoney(result.avgProfitPerCoachingStore)}</td></tr>
    </table>
    </div>

    <h2>二、课程当期与复开课</h2>
    <p class="lede">学员合计 ${result.totalCourseStudents} 人；陪跑 ${result.coachingClientCount} 家（1年付 ${result.coachingOneYearStores} / 3年付 ${result.coachingThreeYearStores}）。</p>
    <div class="scroll">
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
    </div>

    <h2>三、课程全周期结转</h2>
    <div class="scroll">
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
    </div>

    <h2>四、陪跑当期拆分</h2>
    <div class="scroll">
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
    </div>

    <h2>五、模型参数 JSON</h2>
    <pre>${paramsJson}</pre>

    <footer>Elegant composition · White, Deep Blue (${ink}), Gold (${gold})</footer>
  </div>
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
