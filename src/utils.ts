/**
 * Clamps a number within specified lower and upper bounds.
 * 
 * Ensures the input number falls within the specified range, converting
 * invalid inputs (NaN) to safe defaults. Based on Lodash implementation
 * with additional NaN safety checks for gesture calculations.
 * 
 * @param number - The number to clamp
 * @param lower - The lower bound (defaults to 0 if NaN)
 * @param upper - The upper bound (defaults to 0 if NaN)
 * 
 * @returns Clamped number within [lower, upper] bounds, or original if NaN
 * 
 * @complexity O(1) - Constant time numeric operations
 * @callFlow
 * - Converts inputs to numbers with unary plus operator
 * - Validates bounds and replaces NaN with safe defaults
 * - Clamps number to upper bound, then lower bound
 * - Returns original number if input was NaN
 * 
 * @example
 * ```typescript
 * clamp(10, 0, 5)   // Returns 5
 * clamp(-5, 0, 10)  // Returns 0
 * clamp(NaN, 0, 10) // Returns NaN
 * ```
 */
// stolen from lodash
export function clamp(number: number, lower: number, upper: number) {
  number = +number
  lower = +lower
  upper = +upper
  lower = lower === lower ? lower : 0
  upper = upper === upper ? upper : 0
  if (number === number) {
    number = number <= upper ? number : upper
    number = number >= lower ? number : lower
  }
  return number
}

/**
 * Removes NaN values from an array efficiently using Set operations.
 * 
 * This utility function leverages JavaScript's Set behavior with NaN to
 * efficiently filter out invalid numeric values while also deduplicating
 * the array. Useful for cleaning up snap point arrays and gesture calculations.
 * 
 * @param arr - Array potentially containing NaN values
 * 
 * @returns New array with NaN values removed and duplicates eliminated
 * 
 * @complexity O(n) - Linear time for Set creation and array conversion
 * @callFlow
 * - Creates Set from input array (deduplicates automatically)
 * - Explicitly deletes NaN using Set.delete() method
 * - Converts Set back to array using spread operator
 * 
 * @example
 * ```typescript
 * deleteNaN([1, NaN, 2, NaN, 3])     // Returns [1, 2, 3]
 * deleteNaN([NaN, NaN])              // Returns []
 * deleteNaN([1, 1, 2, 2])            // Returns [1, 2] (also deduplicates)
 * ```
 */
// Mwahaha easiest way to filter out NaN I ever saw! >:3
export function deleteNaN(arr) {
  const set = new Set(arr)
  set.delete(NaN)
  return [...set]
}

/**
 * Rounds a number to the nearest integer with strict NaN validation.
 * 
 * This function provides safe rounding for snap point calculations while
 * enforcing data integrity by throwing descriptive errors for invalid inputs.
 * Critical for preventing layout corruption from invalid numeric values.
 * 
 * @param unrounded - Number to round and validate
 * 
 * @returns Rounded integer value
 * @throws {TypeError} When input is NaN, with helpful debugging message
 * 
 * @complexity O(1) - Constant time validation and rounding
 * @callFlow
 * - Rounds input using Math.round()
 * - Validates input is not NaN
 * - Throws descriptive error for debugging invalid snap point configurations
 * - Returns rounded integer for layout calculations
 * 
 * @example
 * ```typescript
 * roundAndCheckForNaN(4.7)   // Returns 5
 * roundAndCheckForNaN(4.2)   // Returns 4
 * roundAndCheckForNaN(NaN)   // Throws TypeError with debugging message
 * ```
 */
export function roundAndCheckForNaN(unrounded) {
  const rounded = Math.round(unrounded)
  if (Number.isNaN(unrounded)) {
    throw new TypeError(
      'Found a NaN! Check your snapPoints / defaultSnap / snapTo '
    )
  }

  return rounded
}

/**
 * Validates, sanitizes, and processes snap points for bottom sheet positioning.
 * 
 * This function handles the complete snap point processing pipeline: validation,
 * rounding, clamping to bounds, deduplication, and extraction of min/max values.
 * Essential for ensuring reliable snap point behavior and preventing layout errors.
 * 
 * @param unsafeSnaps - Raw snap points (single number or array)
 * @param maxHeight - Maximum allowed height for clamping snap points
 * 
 * @returns Processed snap point configuration object
 * @returns snapPoints - Validated, deduplicated array of snap points
 * @returns minSnap - Minimum snap point value
 * @returns maxSnap - Maximum snap point value
 * 
 * @throws {TypeError} When snap points array is empty
 * @throws {TypeError} When calculated min/max snap values are NaN
 * 
 * @complexity O(n log n) - Due to Set operations and min/max calculations
 * @callFlow
 * - Normalizes input to array format
 * - Rounds and validates each snap point
 * - Validates array is not empty
 * - Clamps snap points to [0, maxHeight] bounds
 * - Deduplicates using Set to prevent duplicate positions
 * - Extracts and validates min/max values
 * - Returns structured configuration object
 * 
 * @example
 * ```typescript
 * processSnapPoints([100, 200, 100], 500)
 * // Returns: { snapPoints: [100, 200], minSnap: 100, maxSnap: 200 }
 * 
 * processSnapPoints(150, 300)  
 * // Returns: { snapPoints: [150], minSnap: 150, maxSnap: 150 }
 * ```
 */
// Validate, sanitize, round and dedupe snap points, as well as extracting the minSnap and maxSnap points
export function processSnapPoints(unsafeSnaps: number | number[], maxHeight) {
  const safeSnaps = (Array.isArray(unsafeSnaps) ? unsafeSnaps : [unsafeSnaps]).map(roundAndCheckForNaN)
  
  // Ensure snap points array is not empty to prevent invalid state
  if (safeSnaps.length === 0) {
    throw new TypeError('snapPoints cannot be an empty array. At least one snap point is required.')
  }

  const snapPointsDedupedSet = safeSnaps.reduce((acc, snapPoint) => {
    acc.add(clamp(snapPoint, 0, maxHeight))
    return acc
  }, new Set<number>())

  const snapPoints = Array.from(snapPointsDedupedSet)

  const minSnap = Math.min(...snapPoints)
  if (Number.isNaN(minSnap)) {
    throw new TypeError('minSnap is NaN')
  }
  const maxSnap = Math.max(...snapPoints)
  if (Number.isNaN(maxSnap)) {
    throw new TypeError('maxSnap is NaN')
  }

  return {
    snapPoints,
    minSnap,
    maxSnap,
  }
}

/**
 * Debug mode detection constant for development environments.
 * 
 * Enables debug mode when running in development with '?debug' URL parameter.
 * Safely handles both browser and server-side rendering environments by
 * checking for window availability before accessing location properties.
 * 
 * @constant
 * @type {boolean}
 * 
 * @complexity O(1) - Single environment and URL check
 * @callFlow
 * - Checks if running in development environment
 * - Verifies window object exists (browser environment)
 * - Examines URL search parameters for '?debug' flag
 * - Returns false for server-side rendering or production
 * 
 * @example
 * ```typescript
 * // URL: http://localhost:3000?debug
 * console.log(debugging) // true (in development)
 * 
 * // URL: http://localhost:3000
 * console.log(debugging) // false
 * 
 * // Production environment
 * console.log(debugging) // false
 * ```
 */
export const debugging =
  process.env.NODE_ENV === 'development' && typeof window !== 'undefined'
    ? window.location.search === '?debug'
    : false
