/** Column-major 4x4 float32 matrix — matches Three.js Matrix4.elements layout */
export type Mat4 = Float32Array

export interface FkVisual {
  /** URI as stored in the model file, e.g. "meshes/base_link.dae" */
  uri: string
  /** Visual pose in the link's local frame (column-major 4x4) */
  localMatrix: Mat4
}

export interface FkLink {
  name: string
  visuals: FkVisual[]
}

export interface FkJoint {
  name:       string
  /** "fixed" | "revolute" | "continuous" | "prismatic" */
  type:       string
  parentLink: string
  childLink:  string
  /** Rotation / translation axis in parent frame */
  axis:       [number, number, number]
  /** inv(T_world_parent_zero) * T_world_child_zero — column-major 4×4, ROS Z-up */
  transform:  Mat4
}

export interface FkLinkTransform {
  name: string
  /** World-frame transform of this link (column-major 4x4, ROS Z-up frame) */
  matrix: Mat4
}

export type ModelFormat = 'sdf' | 'urdf'

export interface FkEngineInstance {
  /** Static model structure — links and their visual descriptions */
  links:    FkLink[]
  /** All joints in the model */
  joints:   FkJoint[]
  rootLink: string
  /**
   * Compute FK for the given joint angles.
   * Returns one transform per link in the same order as `links`.
   */
  computeFk(jointAngles: Map<string, number>): FkLinkTransform[]
  destroy(): void
}
