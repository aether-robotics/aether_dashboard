#pragma once
#include "math_utils.h"
#include <string>
#include <vector>
#include <unordered_map>

enum class JointType { FIXED, REVOLUTE, PRISMATIC, CONTINUOUS };

struct Visual {
    std::string uri;            /* mesh URI as written in file, e.g. "meshes/base_link.dae" */
    Mat4        local_matrix;   /* pose relative to the link's origin */
};

struct Link {
    std::string        name;
    int                parent_joint_idx = -1;
    std::vector<int>   child_joint_indices;
    std::vector<Visual> visuals;
};

struct Joint {
    std::string name;
    std::string parent_link;
    std::string child_link;
    JointType   type    = JointType::FIXED;
    Vec3        axis    = {1.0f, 0.0f, 0.0f};
    Mat4        T_parent_joint;   /* fixed offset: inv(T_world_parent_zero) * T_world_child_zero */
    float       lower   = -1e16f;
    float       upper   =  1e16f;
};

struct RobotModel {
    std::string              name;
    std::string              root_link;
    std::vector<Link>        links;
    std::vector<Joint>       joints;
    std::unordered_map<std::string, int> link_index;
    std::unordered_map<std::string, int> joint_index;
};
