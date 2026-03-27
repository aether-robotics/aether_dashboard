#include "../include/fk_engine.h"
#include "model.h"
#include "math_utils.h"
#include <unordered_map>
#include <string>
#include <vector>
#include <cstring>

/* forward declarations from parsers */
RobotModel* parse_sdf(const char* xml);
RobotModel* parse_urdf(const char* xml);

/* ── FK DFS ───────────────────────────────────────────────────────────────── */

static void fk_dfs(const RobotModel&                            mdl,
                   int                                           link_idx,
                   const Mat4&                                   T_world_parent,
                   const std::unordered_map<std::string, float>& angles,
                   std::vector<Mat4>&                            out) {
    out[link_idx] = T_world_parent;

    const Link& lk = mdl.links[link_idx];
    for (int ji : lk.child_joint_indices) {
        const Joint& jnt = mdl.joints[ji];

        /* fixed offset from parent origin to child origin at q=0 */
        Mat4 T = mat4_mul(T_world_parent, jnt.T_parent_joint);

        /* apply joint angle if actuated */
        if (jnt.type == JointType::REVOLUTE || jnt.type == JointType::CONTINUOUS) {
            float q = 0.0f;
            auto it = angles.find(jnt.name);
            if (it != angles.end()) q = it->second;
            T = mat4_mul(T, mat4_rotate_axis_angle(jnt.axis, q));
        } else if (jnt.type == JointType::PRISMATIC) {
            float d = 0.0f;
            auto it = angles.find(jnt.name);
            if (it != angles.end()) d = it->second;
            /* translate along axis */
            Mat4 Td = mat4_identity();
            Td[12] = jnt.axis[0] * d;
            Td[13] = jnt.axis[1] * d;
            Td[14] = jnt.axis[2] * d;
            T = mat4_mul(T, Td);
        }

        auto it_child = mdl.link_index.find(jnt.child_link);
        if (it_child != mdl.link_index.end())
            fk_dfs(mdl, it_child->second, T, angles, out);
    }
}

/* ── C API ────────────────────────────────────────────────────────────────── */

FkHandle fk_load_model(const char* xml, int format) {
    if (!xml) return nullptr;
    RobotModel* mdl = (format == 0) ? parse_sdf(xml) : parse_urdf(xml);
    return static_cast<FkHandle>(mdl);
}

void fk_destroy(FkHandle h) {
    delete static_cast<RobotModel*>(h);
}

int fk_link_count(FkHandle h) {
    if (!h) return 0;
    return static_cast<int>(static_cast<RobotModel*>(h)->links.size());
}

void fk_get_link_names(FkHandle h, const char** out_names) {
    if (!h || !out_names) return;
    auto* mdl = static_cast<RobotModel*>(h);
    for (int i = 0; i < static_cast<int>(mdl->links.size()); ++i)
        out_names[i] = mdl->links[i].name.c_str();
}

int fk_visual_count(FkHandle h, int link_idx) {
    if (!h) return 0;
    auto* mdl = static_cast<RobotModel*>(h);
    if (link_idx < 0 || link_idx >= static_cast<int>(mdl->links.size())) return 0;
    return static_cast<int>(mdl->links[link_idx].visuals.size());
}

const char* fk_visual_uri(FkHandle h, int link_idx, int visual_idx) {
    if (!h) return nullptr;
    auto* mdl = static_cast<RobotModel*>(h);
    if (link_idx < 0 || link_idx >= static_cast<int>(mdl->links.size())) return nullptr;
    const auto& vis = mdl->links[link_idx].visuals;
    if (visual_idx < 0 || visual_idx >= static_cast<int>(vis.size())) return nullptr;
    return vis[visual_idx].uri.c_str();
}

void fk_visual_local_matrix(FkHandle h, int link_idx, int visual_idx, float* out_16) {
    if (!h || !out_16) return;
    auto* mdl = static_cast<RobotModel*>(h);
    if (link_idx < 0 || link_idx >= static_cast<int>(mdl->links.size())) return;
    const auto& vis = mdl->links[link_idx].visuals;
    if (visual_idx < 0 || visual_idx >= static_cast<int>(vis.size())) return;
    memcpy(out_16, vis[visual_idx].local_matrix.data(), 16 * sizeof(float));
}

const char* fk_root_link(FkHandle h) {
    if (!h) return nullptr;
    return static_cast<RobotModel*>(h)->root_link.c_str();
}

int fk_joint_count(FkHandle h) {
    if (!h) return 0;
    return static_cast<int>(static_cast<RobotModel*>(h)->joints.size());
}

const char* fk_joint_name(FkHandle h, int ji) {
    if (!h) return nullptr;
    auto* mdl = static_cast<RobotModel*>(h);
    if (ji < 0 || ji >= static_cast<int>(mdl->joints.size())) return nullptr;
    return mdl->joints[ji].name.c_str();
}

const char* fk_joint_type(FkHandle h, int ji) {
    if (!h) return nullptr;
    auto* mdl = static_cast<RobotModel*>(h);
    if (ji < 0 || ji >= static_cast<int>(mdl->joints.size())) return nullptr;
    switch (mdl->joints[ji].type) {
        case JointType::FIXED:      return "fixed";
        case JointType::REVOLUTE:   return "revolute";
        case JointType::CONTINUOUS: return "continuous";
        case JointType::PRISMATIC:  return "prismatic";
        default:                    return "unknown";
    }
}

const char* fk_joint_parent_link(FkHandle h, int ji) {
    if (!h) return nullptr;
    auto* mdl = static_cast<RobotModel*>(h);
    if (ji < 0 || ji >= static_cast<int>(mdl->joints.size())) return nullptr;
    return mdl->joints[ji].parent_link.c_str();
}

const char* fk_joint_child_link(FkHandle h, int ji) {
    if (!h) return nullptr;
    auto* mdl = static_cast<RobotModel*>(h);
    if (ji < 0 || ji >= static_cast<int>(mdl->joints.size())) return nullptr;
    return mdl->joints[ji].child_link.c_str();
}

void fk_joint_axis(FkHandle h, int ji, float* out_3) {
    if (!h || !out_3) return;
    auto* mdl = static_cast<RobotModel*>(h);
    if (ji < 0 || ji >= static_cast<int>(mdl->joints.size())) return;
    const Vec3& ax = mdl->joints[ji].axis;
    out_3[0] = ax[0]; out_3[1] = ax[1]; out_3[2] = ax[2];
}

void fk_joint_transform(FkHandle h, int ji, float* out_16) {
    if (!h || !out_16) return;
    auto* mdl = static_cast<RobotModel*>(h);
    if (ji < 0 || ji >= static_cast<int>(mdl->joints.size())) return;
    memcpy(out_16, mdl->joints[ji].T_parent_joint.data(), 16 * sizeof(float));
}

void fk_compute(FkHandle      h,
                const char**  joint_names,
                const float*  joint_angles,
                int           joint_count,
                float*        out_matrices) {
    if (!h || !out_matrices) return;
    auto* mdl = static_cast<RobotModel*>(h);
    int n = static_cast<int>(mdl->links.size());

    /* build name→angle map */
    std::unordered_map<std::string, float> angles;
    if (joint_names && joint_angles) {
        for (int i = 0; i < joint_count; ++i)
            if (joint_names[i])
                angles[joint_names[i]] = joint_angles[i];
    }

    /* run DFS from root */
    std::vector<Mat4> result(n, mat4_identity());
    auto it_root = mdl->link_index.find(mdl->root_link);
    if (it_root != mdl->link_index.end())
        fk_dfs(*mdl, it_root->second, mat4_identity(), angles, result);

    /* copy to output buffer */
    for (int i = 0; i < n; ++i)
        memcpy(out_matrices + i * 16, result[i].data(), 16 * sizeof(float));
}
