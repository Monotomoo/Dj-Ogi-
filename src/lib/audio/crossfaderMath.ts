/**
 * Equal-power crossfade curve.
 * Avoids the perceived volume dip at center that linear crossfade produces.
 *
 * @param position 0 = full A, 0.5 = center, 1 = full B
 * @param baseVolumeA base volume for deck A (0-100)
 * @param baseVolumeB base volume for deck B (0-100)
 */
export function equalPowerCrossfade(
  position: number,
  baseVolumeA: number,
  baseVolumeB: number
): { volumeA: number; volumeB: number } {
  const angle = position * Math.PI / 2
  return {
    volumeA: baseVolumeA * Math.cos(angle),
    volumeB: baseVolumeB * Math.sin(angle),
  }
}
