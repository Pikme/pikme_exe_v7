/**
 * Statistical Analysis Service
 * Performs statistical significance testing on A/B test results
 */

export interface ExperimentMetrics {
  variantName: string;
  sampleSize: number;
  conversions: number;
  clicks: number;
  impressions: number;
}

export interface StatisticalResult {
  isSignificant: boolean;
  pValue: number;
  confidenceLevel: number;
  effectSize: number;
  winner?: string;
  recommendation: string;
}

/**
 * Calculate chi-square statistic for two proportions
 * Used to test if conversion rates are significantly different
 */
export function calculateChiSquare(
  control: ExperimentMetrics,
  treatment: ExperimentMetrics
): StatisticalResult {
  const controlConversionRate = control.conversions / control.sampleSize;
  const treatmentConversionRate = treatment.conversions / treatment.sampleSize;

  // Pooled conversion rate
  const pooledConversions = control.conversions + treatment.conversions;
  const pooledSampleSize = control.sampleSize + treatment.sampleSize;
  const pooledRate = pooledConversions / pooledSampleSize;

  // Expected conversions
  const controlExpected = control.sampleSize * pooledRate;
  const treatmentExpected = treatment.sampleSize * pooledRate;

  // Chi-square calculation
  const chiSquare =
    Math.pow(control.conversions - controlExpected, 2) / controlExpected +
    Math.pow(treatment.conversions - treatmentExpected, 2) / treatmentExpected;

  // P-value approximation using chi-square distribution (1 degree of freedom)
  // Critical value for 95% confidence: 3.841
  // Critical value for 99% confidence: 6.635
  const pValue = chiSquareToP(chiSquare);
  const isSignificant = chiSquare > 3.841; // 95% confidence level

  // Effect size (Cohen's h)
  const h = 2 * (Math.asin(Math.sqrt(treatmentConversionRate)) - Math.asin(Math.sqrt(controlConversionRate)));
  const effectSize = Math.abs(h);

  // Determine winner
  let winner: string | undefined;
  let recommendation = "";

  if (isSignificant) {
    if (treatmentConversionRate > controlConversionRate) {
      winner = treatment.variantName;
      const improvement = ((treatmentConversionRate - controlConversionRate) / controlConversionRate) * 100;
      recommendation = `Treatment variant shows ${improvement.toFixed(2)}% improvement with 95% confidence. Ready to promote to 100%.`;
    } else {
      winner = control.variantName;
      const improvement = ((controlConversionRate - treatmentConversionRate) / treatmentConversionRate) * 100;
      recommendation = `Control variant is performing ${improvement.toFixed(2)}% better. Treatment should be rolled back.`;
    }
  } else {
    const sampleNeeded = calculateRequiredSampleSize(controlConversionRate, treatmentConversionRate);
    recommendation = `Not statistically significant yet. Approximately ${Math.ceil(sampleNeeded)} total samples needed for 95% confidence.`;
  }

  return {
    isSignificant,
    pValue,
    confidenceLevel: 0.95,
    effectSize,
    winner,
    recommendation,
  };
}

/**
 * Convert chi-square statistic to p-value
 * Simplified approximation for 1 degree of freedom
 */
function chiSquareToP(chiSquare: number): number {
  // Simplified p-value calculation
  // For chi-square with 1 df: p ≈ 0.05 when χ² ≈ 3.841
  if (chiSquare >= 10.83) return 0.001;
  if (chiSquare >= 6.635) return 0.01;
  if (chiSquare >= 3.841) return 0.05;
  if (chiSquare >= 2.706) return 0.1;
  return 0.5;
}

/**
 * Calculate required sample size for statistical significance
 * Using power analysis (80% power, 95% confidence)
 */
export function calculateRequiredSampleSize(
  controlRate: number,
  treatmentRate: number,
  power: number = 0.8,
  alpha: number = 0.05
): number {
  // Simplified Cochran's formula for sample size
  const p1 = controlRate;
  const p2 = treatmentRate;
  const pooledP = (p1 + p2) / 2;

  // Z-scores
  const zAlpha = 1.96; // 95% confidence (two-tailed)
  const zBeta = 0.84; // 80% power

  const numerator = Math.pow(zAlpha + zBeta, 2) * (pooledP * (1 - pooledP) * 2);
  const denominator = Math.pow(p1 - p2, 2);

  return numerator / denominator;
}

/**
 * Analyze multiple variants for best performer
 */
export function analyzeMultipleVariants(
  variants: ExperimentMetrics[]
): {
  bestVariant: string;
  isSignificant: boolean;
  recommendation: string;
} {
  if (variants.length < 2) {
    return {
      bestVariant: variants[0].variantName,
      isSignificant: false,
      recommendation: "Need at least 2 variants for comparison",
    };
  }

  // Compare treatment variants against control (first variant)
  const control = variants[0];
  const treatments = variants.slice(1);

  let bestTreatment = treatments[0];
  let bestResult = calculateChiSquare(control, treatments[0]);

  for (let i = 1; i < treatments.length; i++) {
    const result = calculateChiSquare(control, treatments[i]);
    const treatmentRate = treatments[i].conversions / treatments[i].sampleSize;
    const bestRate = bestTreatment.conversions / bestTreatment.sampleSize;

    if (treatmentRate > bestRate) {
      bestTreatment = treatments[i];
      bestResult = result;
    }
  }

  return {
    bestVariant: bestResult.winner || control.variantName,
    isSignificant: bestResult.isSignificant,
    recommendation: bestResult.recommendation,
  };
}

/**
 * Calculate confidence interval for conversion rate
 */
export function calculateConfidenceInterval(
  conversions: number,
  sampleSize: number,
  confidenceLevel: number = 0.95
): {
  lower: number;
  upper: number;
  rate: number;
} {
  const rate = conversions / sampleSize;

  // Z-score for 95% confidence
  const z = confidenceLevel === 0.95 ? 1.96 : 2.576;

  const marginOfError = z * Math.sqrt((rate * (1 - rate)) / sampleSize);

  return {
    rate,
    lower: Math.max(0, rate - marginOfError),
    upper: Math.min(1, rate + marginOfError),
  };
}
