/** 可调测算参数（与业务说明表字段对齐） */
export type ModelParams = {
  /** 中成文商团购课报名人数 */
  groupBuyHeadcount: number
  /** 团购课含税单价（元/人） */
  groupBuyPriceTaxIncl: number
  /** 团购课上课天数 */
  groupBuyCourseDays: number
  /** 团购课当期确认营收比例（不含税口径，余下递延） */
  groupBuyCurrentRevenueRatio: number

  /** 散客课报名人数 */
  retailHeadcount: number
  retailPriceTaxIncl: number
  retailCourseDays: number

  /** 智库定制课报名人数 */
  thinkTankHeadcount: number
  thinkTankPriceTaxIncl: number
  thinkTankCourseDays: number

  /** 陪跑转化率（按课程总报名人数） */
  coachingConversionRate: number
  /** 1年付客户占比（余下为3年付） */
  coachingOneYearShare: number
  /** 1年付含税单价（元/店） */
  coachingOneYearPriceTaxIncl: number
  /** 3年付含税实收（付2年送1年，元/店） */
  coachingThreeYearPriceTaxIncl: number
  /** 3年付首年确认营收比例（权责发生制分摊） */
  coachingThreeYearFirstYearRevenueRatio: number

  /** 单店硬件成本 */
  hardwareCostPerStoreTaxIncl: number
  /** 转介绍激励计提（占陪跑不含税营收比例） */
  referralAccrualRate: number

  /** 中成伟业：课程前置分成（占全额不含税营收） */
  zhongchengCourseShareRate: number
  /** 中成伟业：陪跑前置分成（占当期确认不含税营收） */
  zhongchengCoachingShareRate: number

  /** 陪跑剩余可分配额：销售/获客/交付 */
  coachingInternalSalesShare: number
  coachingInternalAcquisitionShare: number
  coachingInternalDeliveryShare: number

  /** 博雅 / 岁知社 最终净利润分配 */
  boyaFinalProfitShare: number
  suizhiFinalProfitShare: number

  /** 增值税税率 */
  vatRate: number
  /** 附加税：占增值税额比例 */
  surchargeOnVatRate: number
  /** 企业所得税税率（展示用，合并利润后计提） */
  corporateIncomeTaxRate: number

  /** 讲师保底（元/天） */
  lecturerDailyRate: number
  /** 首次开课研发计提：占当期讲师费比例 */
  firstOpenRdRateOfLecturer: number
  /** 复开课研发计提：占当期讲师费比例 */
  repeatRdRateOfLecturer: number

  /** 散客证书合作（元/人） */
  certificateCostRetailPerHead: number
  /** 智库证书合作（元/人） */
  certificateCostThinkTankPerHead: number
}

export const defaultModelParams: ModelParams = {
  groupBuyHeadcount: 30,
  groupBuyPriceTaxIncl: 49800,
  groupBuyCourseDays: 5,
  groupBuyCurrentRevenueRatio: 0.2,

  retailHeadcount: 5,
  retailPriceTaxIncl: 19800,
  retailCourseDays: 5,

  thinkTankHeadcount: 100,
  thinkTankPriceTaxIncl: 6980,
  thinkTankCourseDays: 2,

  coachingConversionRate: 0.3,
  coachingOneYearShare: 0.7,
  coachingOneYearPriceTaxIncl: 120_000,
  coachingThreeYearPriceTaxIncl: 240_000,
  coachingThreeYearFirstYearRevenueRatio: 1 / 3,

  hardwareCostPerStoreTaxIncl: 10_000,
  referralAccrualRate: 0.05,

  zhongchengCourseShareRate: 0.5,
  zhongchengCoachingShareRate: 0.15,

  coachingInternalSalesShare: 0.4,
  coachingInternalAcquisitionShare: 0.3,
  coachingInternalDeliveryShare: 0.3,

  boyaFinalProfitShare: 0.5,
  suizhiFinalProfitShare: 0.5,

  vatRate: 0.06,
  surchargeOnVatRate: 0.12,
  corporateIncomeTaxRate: 0.25,

  lecturerDailyRate: 10_000,
  firstOpenRdRateOfLecturer: 1,
  repeatRdRateOfLecturer: 0.25,

  certificateCostRetailPerHead: 500,
  certificateCostThinkTankPerHead: 200,
}
