import type { ModelParams } from './types'

const round2 = (value: number) => Math.round(value * 100) / 100

function revenueExclFromTaxIncl(taxIncl: number, vatRate: number) {
  return round2(taxIncl / (1 + vatRate))
}

function vatAmountFromExcl(revenueExcl: number, vatRate: number) {
  return round2(revenueExcl * vatRate)
}

function surchargeFromRevenueExcl(revenueExcl: number, vatRate: number, surchargeOnVatRate: number) {
  const vat = vatAmountFromExcl(revenueExcl, vatRate)
  return round2(vat * surchargeOnVatRate)
}

export type CourseLine = {
  key: 'groupBuy' | 'retail' | 'thinkTank'
  label: string
  headcount: number
  priceTaxIncl: number
  courseDays: number
  /** 当期确认不含税营收占「单人全额不含税营收」比例；团购 0.2，其余 1 */
  currentRecognitionRatio: number
  certificatePerHead: number
}

export type CoursePeriodResult = {
  line: CourseLine
  revenueExclFullPerHead: number
  revenueExclCurrentTotal: number
  revenueTaxInclCurrentTotal: number
  revenueExclDeferredPerHead: number
  zhongchengPrefShareTotal: number
  boyaSuizhiAssignableCurrent: number
  lecturerCost: number
  firstOpenRdCost: number
  certificateTotal: number
  surchargeTotal: number
  profitFirstOpen: number
  repeatRdCost: number
  profitRepeatOpen: number
}

export type CourseLifecycleResult = {
  line: CourseLine
  revenueExclLifecycleTotal: number
  zhongchengPrefShareLifecycle: number
  rigidCostLifecycle: number
  profitLifecycle: number
}

export type CoachingPackageSlice = {
  key: 'oneYear' | 'threeYear'
  label: string
  storeCount: number
  priceTaxInclPerStore: number
  /** 当期确认不含税营收占单店全额不含税营收比例 */
  currentRecognitionRatio: number
}

export type CoachingPeriodResult = {
  slice: CoachingPackageSlice
  revenueExclCurrentPerStore: number
  revenueExclCurrentTotal: number
  revenueTaxInclCurrentTotal: number
  revenueExclDeferredPerStore: number
  zhongchengPrefShareTotal: number
  boyaSuizhiAssignable: number
  hardwareTotal: number
  referralAccrualTotal: number
  surchargeTotal: number
  rigidTotal: number
  internalPool: number
  internalSales: number
  internalAcquisition: number
  internalDelivery: number
  /** 文档口径：当期激励池全额拆分，业务线账面利润为 0 */
  profitCurrent: number
}

export type CoachingLifecycleResult = {
  slice: CoachingPackageSlice
  revenueExclLifecyclePerStore: number
  revenueExclLifecycleTotal: number
  zhongchengPrefShareLifecycle: number
  rigidLifecycle: number
  profitLifecycle: number
}

export type ConsolidatedResult = {
  totalCourseStudents: number
  coachingClientCount: number
  coachingOneYearStores: number
  coachingThreeYearStores: number

  coursePeriod: CoursePeriodResult[]
  courseLifecycle: CourseLifecycleResult[]

  coachingPeriod: CoachingPeriodResult[]
  coachingLifecycle: CoachingLifecycleResult[]

  /** 课程：首次开课合并当期利润 */
  courseMergedProfitFirstOpen: number
  /** 课程：复开课合并当期利润 */
  courseMergedProfitRepeatOpen: number
  /** 课程：全周期合并利润 */
  courseMergedProfitLifecycle: number

  /** 陪跑：全周期不含税总营收 */
  coachingRevenueExclLifecycleTotal: number
  /** 陪跑：当期不含税总营收 */
  coachingRevenueExclCurrentTotal: number
  coachingZhongchengLifecycle: number
  coachingRigidLifecycle: number
  coachingInternalTotalLifecycle: number
  coachingProfitLifecycle: number

  /** 全周期合并（课程+陪跑） */
  mergedRevenueExclLifecycle: number
  mergedZhongchengLifecycle: number
  mergedRigidLifecycle: number
  mergedProfitBeforeSplit: number
  boyaShareOfProfit: number
  suizhiShareOfProfit: number

  /** 指标 */
  grossMarginLifecycle: number
  avgProfitPerStudent: number
  avgProfitPerCoachingStore: number
}

function buildCourseLines(params: ModelParams): CourseLine[] {
  return [
    {
      key: 'groupBuy',
      label: '中成文商团购课',
      headcount: params.groupBuyHeadcount,
      priceTaxIncl: params.groupBuyPriceTaxIncl,
      courseDays: params.groupBuyCourseDays,
      currentRecognitionRatio: params.groupBuyCurrentRevenueRatio,
      certificatePerHead: 0,
    },
    {
      key: 'retail',
      label: '中成文商散客报名课（含北大证书）',
      headcount: params.retailHeadcount,
      priceTaxIncl: params.retailPriceTaxIncl,
      courseDays: params.retailCourseDays,
      currentRecognitionRatio: 1,
      certificatePerHead: params.certificateCostRetailPerHead,
    },
    {
      key: 'thinkTank',
      label: '中成文商智库定制课（含全球智库证书）',
      headcount: params.thinkTankHeadcount,
      priceTaxIncl: params.thinkTankPriceTaxIncl,
      courseDays: params.thinkTankCourseDays,
      currentRecognitionRatio: 1,
      certificatePerHead: params.certificateCostThinkTankPerHead,
    },
  ]
}

export function computeModel(params: ModelParams): ConsolidatedResult {
  const courseLines = buildCourseLines(params)
  const totalCourseStudents = courseLines.reduce((sum, line) => sum + line.headcount, 0)

  const coachingClientCount = Math.ceil(totalCourseStudents * params.coachingConversionRate)
  const coachingOneYearStores = Math.round(coachingClientCount * params.coachingOneYearShare)
  const coachingThreeYearStores = Math.max(0, coachingClientCount - coachingOneYearStores)

  const coursePeriod: CoursePeriodResult[] = courseLines.map((line) => {
    const revenueExclFullPerHead = revenueExclFromTaxIncl(line.priceTaxIncl, params.vatRate)
    const revenueExclCurrentPerHead = round2(revenueExclFullPerHead * line.currentRecognitionRatio)
    const revenueExclCurrentTotal = round2(revenueExclCurrentPerHead * line.headcount)
    const revenueTaxInclCurrentTotal = round2(
      line.priceTaxIncl * line.headcount * line.currentRecognitionRatio,
    )
    const revenueExclDeferredPerHead = round2(
      revenueExclFullPerHead * (1 - line.currentRecognitionRatio),
    )

    const zhongchengPrefShareTotal = round2(
      revenueExclFullPerHead * params.zhongchengCourseShareRate * line.headcount,
    )
    const boyaSuizhiAssignableCurrent = round2(revenueExclCurrentTotal - zhongchengPrefShareTotal)

    const lecturerCost = round2(params.lecturerDailyRate * line.courseDays)
    const firstOpenRdCost = round2(lecturerCost * params.firstOpenRdRateOfLecturer)
    const certificateTotal = round2(line.certificatePerHead * line.headcount)
    const surchargeTotal = surchargeFromRevenueExcl(
      revenueExclCurrentTotal,
      params.vatRate,
      params.surchargeOnVatRate,
    )

    const profitFirstOpen = round2(
      boyaSuizhiAssignableCurrent -
        lecturerCost -
        firstOpenRdCost -
        certificateTotal -
        surchargeTotal,
    )

    const repeatRdCost = round2(lecturerCost * params.repeatRdRateOfLecturer)
    const profitRepeatOpen = round2(
      boyaSuizhiAssignableCurrent - lecturerCost - repeatRdCost - certificateTotal - surchargeTotal,
    )

    return {
      line,
      revenueExclFullPerHead,
      revenueExclCurrentTotal,
      revenueTaxInclCurrentTotal,
      revenueExclDeferredPerHead,
      zhongchengPrefShareTotal,
      boyaSuizhiAssignableCurrent,
      lecturerCost,
      firstOpenRdCost,
      certificateTotal,
      surchargeTotal,
      profitFirstOpen,
      repeatRdCost,
      profitRepeatOpen,
    }
  })

  const courseLifecycle: CourseLifecycleResult[] = courseLines.map((line, index) => {
    const period = coursePeriod[index]!
    const revenueExclLifecycleTotal = round2(period.revenueExclFullPerHead * line.headcount)
    const zhongchengPrefShareLifecycle = round2(
      period.revenueExclFullPerHead * params.zhongchengCourseShareRate * line.headcount,
    )

    const lecturerCost = period.lecturerCost
    const firstOpenRdCost = period.firstOpenRdCost
    const certificateTotal = period.certificateTotal
    const surchargeTotal = period.surchargeTotal
    const rigidCostLifecycle = round2(
      lecturerCost + firstOpenRdCost + certificateTotal + surchargeTotal,
    )
    const profitLifecycle = round2(
      revenueExclLifecycleTotal - zhongchengPrefShareLifecycle - rigidCostLifecycle,
    )

    return {
      line,
      revenueExclLifecycleTotal,
      zhongchengPrefShareLifecycle,
      rigidCostLifecycle,
      profitLifecycle,
    }
  })

  const coachingSlices: CoachingPackageSlice[] = [
    {
      key: 'oneYear',
      label: '1年付套餐',
      storeCount: coachingOneYearStores,
      priceTaxInclPerStore: params.coachingOneYearPriceTaxIncl,
      currentRecognitionRatio: 1,
    },
    {
      key: 'threeYear',
      label: '3年付套餐（付2年送1年）',
      storeCount: coachingThreeYearStores,
      priceTaxInclPerStore: params.coachingThreeYearPriceTaxIncl,
      currentRecognitionRatio: params.coachingThreeYearFirstYearRevenueRatio,
    },
  ]

  const coachingPeriod: CoachingPeriodResult[] = coachingSlices.map((slice) => {
    const revenueExclFullPerStore = revenueExclFromTaxIncl(slice.priceTaxInclPerStore, params.vatRate)
    const revenueExclCurrentPerStore = round2(
      revenueExclFullPerStore * slice.currentRecognitionRatio,
    )
    const revenueExclCurrentTotal = round2(revenueExclCurrentPerStore * slice.storeCount)
    const revenueTaxInclCurrentTotal = round2(
      slice.priceTaxInclPerStore * slice.storeCount * slice.currentRecognitionRatio,
    )
    const revenueExclDeferredPerStore = round2(
      revenueExclFullPerStore * (1 - slice.currentRecognitionRatio),
    )

    const zhongchengPrefShareTotal = round2(
      revenueExclCurrentTotal * params.zhongchengCoachingShareRate,
    )
    const boyaSuizhiAssignable = round2(revenueExclCurrentTotal - zhongchengPrefShareTotal)

    const hardwareTotal = round2(params.hardwareCostPerStoreTaxIncl * slice.storeCount)
    const referralAccrualTotal = round2(revenueExclCurrentTotal * params.referralAccrualRate)
    const surchargeTotal = surchargeFromRevenueExcl(
      revenueExclCurrentTotal,
      params.vatRate,
      params.surchargeOnVatRate,
    )

    const rigidTotal = round2(hardwareTotal + referralAccrualTotal + surchargeTotal)
    const internalPool = round2(boyaSuizhiAssignable - rigidTotal)
    const internalSales = round2(internalPool * params.coachingInternalSalesShare)
    const internalAcquisition = round2(internalPool * params.coachingInternalAcquisitionShare)
    const internalDelivery = round2(internalPool * params.coachingInternalDeliveryShare)

    return {
      slice,
      revenueExclCurrentPerStore,
      revenueExclCurrentTotal,
      revenueTaxInclCurrentTotal,
      revenueExclDeferredPerStore,
      zhongchengPrefShareTotal,
      boyaSuizhiAssignable,
      hardwareTotal,
      referralAccrualTotal,
      surchargeTotal,
      rigidTotal,
      internalPool,
      internalSales,
      internalAcquisition,
      internalDelivery,
      profitCurrent: 0,
    }
  })

  const coachingLifecycle: CoachingLifecycleResult[] = coachingSlices.map((slice) => {
    const revenueExclFullPerStore = revenueExclFromTaxIncl(slice.priceTaxInclPerStore, params.vatRate)
    const revenueExclLifecyclePerStore = revenueExclFullPerStore
    const revenueExclLifecycleTotal = round2(revenueExclLifecyclePerStore * slice.storeCount)
    const zhongchengPrefShareLifecycle = round2(
      revenueExclLifecycleTotal * params.zhongchengCoachingShareRate,
    )

    const hardwareTotal = round2(params.hardwareCostPerStoreTaxIncl * slice.storeCount)
    const referralAccrualTotal = round2(revenueExclLifecycleTotal * params.referralAccrualRate)
    const surchargeLifecycle = surchargeFromRevenueExcl(
      revenueExclLifecycleTotal,
      params.vatRate,
      params.surchargeOnVatRate,
    )
    const rigidLifecycle = round2(hardwareTotal + referralAccrualTotal + surchargeLifecycle)

    const internalPoolLifecycle = round2(revenueExclLifecycleTotal - zhongchengPrefShareLifecycle - rigidLifecycle)
    const internalTotalLifecycle = round2(
      internalPoolLifecycle * (params.coachingInternalSalesShare +
        params.coachingInternalAcquisitionShare +
        params.coachingInternalDeliveryShare),
    )
    const profitLifecycle = round2(
      revenueExclLifecycleTotal - zhongchengPrefShareLifecycle - rigidLifecycle - internalTotalLifecycle,
    )

    return {
      slice,
      revenueExclLifecyclePerStore,
      revenueExclLifecycleTotal,
      zhongchengPrefShareLifecycle,
      rigidLifecycle,
      profitLifecycle,
    }
  })

  const courseMergedProfitFirstOpen = round2(
    coursePeriod.reduce((sum, row) => sum + row.profitFirstOpen, 0),
  )
  const courseMergedProfitRepeatOpen = round2(
    coursePeriod.reduce((sum, row) => sum + row.profitRepeatOpen, 0),
  )
  const courseMergedProfitLifecycle = round2(
    courseLifecycle.reduce((sum, row) => sum + row.profitLifecycle, 0),
  )

  const coachingRevenueExclLifecycleTotal = round2(
    coachingLifecycle.reduce((sum, row) => sum + row.revenueExclLifecycleTotal, 0),
  )
  const coachingRevenueExclCurrentTotal = round2(
    coachingPeriod.reduce((sum, row) => sum + row.revenueExclCurrentTotal, 0),
  )
  const coachingZhongchengLifecycle = round2(
    coachingLifecycle.reduce((sum, row) => sum + row.zhongchengPrefShareLifecycle, 0),
  )
  const coachingRigidLifecycle = round2(
    coachingLifecycle.reduce((sum, row) => sum + row.rigidLifecycle, 0),
  )
  const coachingInternalTotalLifecycle = round2(
    coachingLifecycle.reduce((sum, row) => {
      const internalPool = round2(
        row.revenueExclLifecycleTotal - row.zhongchengPrefShareLifecycle - row.rigidLifecycle,
      )
      return sum + internalPool
    }, 0),
  )
  const coachingProfitLifecycle = round2(
    coachingLifecycle.reduce((sum, row) => sum + row.profitLifecycle, 0),
  )

  const mergedRevenueExclLifecycle = round2(
    courseLifecycle.reduce((sum, row) => sum + row.revenueExclLifecycleTotal, 0) +
      coachingRevenueExclLifecycleTotal,
  )
  const mergedZhongchengLifecycle = round2(
    courseLifecycle.reduce((sum, row) => sum + row.zhongchengPrefShareLifecycle, 0) +
      coachingZhongchengLifecycle,
  )

  const courseRigidLifecycle = round2(
    courseLifecycle.reduce((sum, row) => sum + row.rigidCostLifecycle, 0),
  )
  const mergedRigidLifecycle = round2(courseRigidLifecycle + coachingRigidLifecycle + coachingInternalTotalLifecycle)

  const mergedProfitBeforeSplit = round2(mergedRevenueExclLifecycle - mergedZhongchengLifecycle - mergedRigidLifecycle)

  const boyaShareOfProfit = round2(mergedProfitBeforeSplit * params.boyaFinalProfitShare)
  const suizhiShareOfProfit = round2(mergedProfitBeforeSplit * params.suizhiFinalProfitShare)

  const grossMarginLifecycle =
    mergedRevenueExclLifecycle > 0
      ? round2((mergedProfitBeforeSplit / mergedRevenueExclLifecycle) * 100)
      : 0

  const avgProfitPerStudent =
    totalCourseStudents > 0 ? round2(mergedProfitBeforeSplit / totalCourseStudents) : 0

  const avgProfitPerCoachingStore =
    coachingClientCount > 0 ? round2(mergedProfitBeforeSplit / coachingClientCount) : 0

  return {
    totalCourseStudents,
    coachingClientCount,
    coachingOneYearStores,
    coachingThreeYearStores,
    coursePeriod,
    courseLifecycle,
    coachingPeriod,
    coachingLifecycle,
    courseMergedProfitFirstOpen,
    courseMergedProfitRepeatOpen,
    courseMergedProfitLifecycle,
    coachingRevenueExclLifecycleTotal,
    coachingRevenueExclCurrentTotal,
    coachingZhongchengLifecycle,
    coachingRigidLifecycle,
    coachingInternalTotalLifecycle,
    coachingProfitLifecycle,
    mergedRevenueExclLifecycle,
    mergedZhongchengLifecycle,
    mergedRigidLifecycle,
    mergedProfitBeforeSplit,
    boyaShareOfProfit,
    suizhiShareOfProfit,
    grossMarginLifecycle,
    avgProfitPerStudent,
    avgProfitPerCoachingStore,
  }
}
