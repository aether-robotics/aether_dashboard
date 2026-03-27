#pragma once

#ifdef __cplusplus
extern "C" {
#endif

/* Opaque handle to a loaded robot model */
typedef void* FkHandle;

/*
 * Load a robot model from in-memory XML text.
 *   xml    – null-terminated XML string (SDF or URDF)
 *   format – 0 = SDF, 1 = URDF
 * Returns NULL on parse failure.
 */
FkHandle fk_load_model(const char* xml, int format);

/* Free all resources associated with a handle */
void fk_destroy(FkHandle h);

/* Number of links in the model */
int fk_link_count(FkHandle h);

/*
 * Fill out_names[0..link_count-1] with pointers to link name strings.
 * The pointers remain valid for the lifetime of the handle.
 */
void fk_get_link_names(FkHandle h, const char** out_names);

/* Number of visuals attached to link at index link_idx */
int fk_visual_count(FkHandle h, int link_idx);

/*
 * URI of visual visual_idx on link link_idx.
 * Pointer valid for the lifetime of the handle.
 */
const char* fk_visual_uri(FkHandle h, int link_idx, int visual_idx);

/*
 * Column-major 4x4 float32 matrix describing the visual's pose
 * in its link's local frame.
 * out_16 must point to at least 16 floats.
 */
void fk_visual_local_matrix(FkHandle h, int link_idx, int visual_idx, float* out_16);

/*
 * Compute forward kinematics and write one 4x4 column-major matrix
 * per link into out_matrices (must be link_count * 16 floats).
 *
 *   joint_names   – array of joint_count C strings
 *   joint_angles  – array of joint_count floats (radians / metres)
 *   joint_count   – number of joints provided
 *   out_matrices  – output buffer: link_count * 16 floats
 *
 * Links not reachable from provided joints keep identity * default pose.
 * The matrix order matches fk_get_link_names().
 */
void fk_compute(FkHandle       h,
                const char**   joint_names,
                const float*   joint_angles,
                int            joint_count,
                float*         out_matrices);

/* ── joint inspection ─────────────────────────────────────────────────────── */

/* Root link name (valid for the lifetime of the handle) */
const char* fk_root_link(FkHandle h);

/* Total number of joints */
int fk_joint_count(FkHandle h);

/* Joint name pointer (valid for the lifetime of the handle) */
const char* fk_joint_name(FkHandle h, int joint_idx);

/* Joint type string: "fixed" | "revolute" | "continuous" | "prismatic" */
const char* fk_joint_type(FkHandle h, int joint_idx);

/* Parent and child link name pointers (valid for the lifetime of the handle) */
const char* fk_joint_parent_link(FkHandle h, int joint_idx);
const char* fk_joint_child_link(FkHandle h, int joint_idx);

/* Rotation/translation axis — writes 3 floats into out_3 */
void fk_joint_axis(FkHandle h, int joint_idx, float* out_3);

/*
 * Fixed offset transform: inv(T_world_parent_zero) * T_world_child_zero.
 * Column-major 4x4 float32, ROS Z-up frame — same convention as fk_compute output.
 * Writes 16 floats into out_16.
 */
void fk_joint_transform(FkHandle h, int joint_idx, float* out_16);

#ifdef __cplusplus
}
#endif
