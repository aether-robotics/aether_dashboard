#pragma once
#include <array>
#include <cmath>
#include <cstring>

using Mat4 = std::array<float, 16>;
using Vec3 = std::array<float, 3>;

/*
 * Column-major storage: m[col * 4 + row]
 *
 *  m[0]  m[4]  m[8]  m[12]   <- row 0
 *  m[1]  m[5]  m[9]  m[13]   <- row 1
 *  m[2]  m[6]  m[10] m[14]   <- row 2
 *  m[3]  m[7]  m[11] m[15]   <- row 3
 *                ^translation in col 3, rows 0-2
 *
 * This layout matches Three.js Matrix4.elements directly.
 */

inline Mat4 mat4_identity() {
    Mat4 m{};
    m[0] = m[5] = m[10] = m[15] = 1.0f;
    return m;
}

/* C = A * B  (column-major 4x4) */
inline Mat4 mat4_mul(const Mat4& A, const Mat4& B) {
    Mat4 C{};
    for (int col = 0; col < 4; ++col)
        for (int row = 0; row < 4; ++row) {
            float s = 0.0f;
            for (int k = 0; k < 4; ++k)
                s += A[k * 4 + row] * B[col * 4 + k];
            C[col * 4 + row] = s;
        }
    return C;
}

/*
 * Build a rigid-body transform from position + RPY angles.
 * Rotation convention: extrinsic XYZ = R = Rz(yaw) * Ry(pitch) * Rx(roll)
 * This matches both SDF 1.6 and URDF <origin rpy="roll pitch yaw">.
 */
inline Mat4 mat4_from_pose(float x, float y, float z,
                            float roll, float pitch, float yaw) {
    float cr = std::cos(roll),  sr = std::sin(roll);
    float cp = std::cos(pitch), sp = std::sin(pitch);
    float cy = std::cos(yaw),   sy = std::sin(yaw);

    Mat4 m{};
    /* column 0 */
    m[0]  =  cy * cp;
    m[1]  =  sy * cp;
    m[2]  = -sp;
    m[3]  =  0.0f;
    /* column 1 */
    m[4]  =  cy * sp * sr - sy * cr;
    m[5]  =  sy * sp * sr + cy * cr;
    m[6]  =  cp * sr;
    m[7]  =  0.0f;
    /* column 2 */
    m[8]  =  cy * sp * cr + sy * sr;
    m[9]  =  sy * sp * cr - cy * sr;
    m[10] =  cp * cr;
    m[11] =  0.0f;
    /* column 3 – translation */
    m[12] = x;
    m[13] = y;
    m[14] = z;
    m[15] = 1.0f;
    return m;
}

/*
 * Rotation around an arbitrary unit axis by angle theta (Rodrigues' formula).
 * The translation block remains zero.
 */
inline Mat4 mat4_rotate_axis_angle(const Vec3& axis, float theta) {
    float c = std::cos(theta), s = std::sin(theta), t = 1.0f - c;
    float ax = axis[0], ay = axis[1], az = axis[2];

    Mat4 m{};
    /* column 0 */
    m[0]  = t * ax * ax + c;
    m[1]  = t * ax * ay + s * az;
    m[2]  = t * ax * az - s * ay;
    m[3]  = 0.0f;
    /* column 1 */
    m[4]  = t * ax * ay - s * az;
    m[5]  = t * ay * ay + c;
    m[6]  = t * ay * az + s * ax;
    m[7]  = 0.0f;
    /* column 2 */
    m[8]  = t * ax * az + s * ay;
    m[9]  = t * ay * az - s * ax;
    m[10] = t * az * az + c;
    m[11] = 0.0f;
    /* column 3 */
    m[12] = m[13] = m[14] = 0.0f;
    m[15] = 1.0f;
    return m;
}

/*
 * Inverse of a rigid-body transform (rotation + translation only).
 * T^{-1} = [ R^T  | -R^T * t ]
 *           [  0   |    1     ]
 */
inline Mat4 mat4_rigid_inverse(const Mat4& T) {
    Mat4 inv{};
    /* transpose rotation block */
    for (int r = 0; r < 3; ++r)
        for (int c = 0; c < 3; ++c)
            inv[c * 4 + r] = T[r * 4 + c];
    /* -R^T * t */
    for (int r = 0; r < 3; ++r) {
        float v = 0.0f;
        for (int k = 0; k < 3; ++k)
            v -= inv[k * 4 + r] * T[12 + k];
        inv[12 + r] = v;
    }
    inv[15] = 1.0f;
    return inv;
}
